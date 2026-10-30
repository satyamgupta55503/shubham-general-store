const Cart     = require("../../models/store/Cart");
const Product  = require("../../models/store/Product");
const Customer = require("../../models/store/Customer");

const getCartFilter = (req) =>
  req.customer ? { customer: req.customer.id } : { sessionId: req.headers["x-session-id"] };

// Resolve the effective unit price for a product for THIS request's customer
async function resolvePrice(req, product) {
  let isWholesale = false;
  if (req.customer) {
    const cust = await Customer.findById(req.customer.id).select("customerType isApproved");
    isWholesale = cust?.customerType === "wholesale" && cust?.isApproved && product.isWholesaleAvailable;
  }
  if (isWholesale) {
    return product.wholesaleSalePrice ?? product.wholesalePrice ?? product.salePrice ?? product.price;
  }
  return product.salePrice ?? product.price;
}

// GET /api/store/cart
exports.getCart = async (req, res) => {
  try {
    const filter = getCartFilter(req);
    if (!filter.customer && !filter.sessionId)
      return res.json({ success: true, data: { items: [], subtotal: 0 } });

    let cart = await Cart.findOne(filter).populate("items.product", "name thumbnail price salePrice isActive stockQty");
    if (!cart) return res.json({ success: true, data: { items: [], subtotal: 0 } });

    // Remove inactive/deleted products
    cart.items = cart.items.filter(i => i.product && i.product.isActive);
    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

    res.json({ success: true, data: { ...cart.toObject(), subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/cart/add
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (product.trackStock && product.stockQty < quantity)
      return res.status(400).json({ success: false, message: "Insufficient stock" });

    const filter = getCartFilter(req);
    if (!filter.customer && !filter.sessionId)
      return res.status(400).json({ success: false, message: "Session ID required for guest cart" });

    let cart = await Cart.findOne(filter);
    if (!cart) cart = new Cart(filter);

    const effectivePrice = await resolvePrice(req, product);
    const existingItem   = cart.items.find(i => i.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
      existingItem.price     = effectivePrice;
    } else {
      cart.items.push({
        product:   product._id,
        name:      product.name,
        thumbnail: product.thumbnail,
        price:     effectivePrice,
        quantity:  Number(quantity),
        unit:      product.unit,
        packSize:  product.packSize,
      });
    }

    // Extend guest cart expiry
    if (!filter.customer) {
      cart.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    await cart.save();
    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ success: true, data: { ...cart.toObject(), subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/cart/update
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const filter = getCartFilter(req);
    const cart   = await Cart.findOne(filter);
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });

    if (quantity <= 0) {
      cart.items.pull(itemId);
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();
    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ success: true, data: { ...cart.toObject(), subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/cart/item/:itemId
exports.removeFromCart = async (req, res) => {
  try {
    const filter = getCartFilter(req);
    const cart   = await Cart.findOne(filter);
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.items.pull(req.params.itemId);
    await cart.save();
    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    res.json({ success: true, data: { ...cart.toObject(), subtotal } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/cart/clear
exports.clearCart = async (req, res) => {
  try {
    const filter = getCartFilter(req);
    await Cart.findOneAndDelete(filter);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/cart/merge  — merge guest cart into logged-in customer cart
exports.mergeCart = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId || !req.customer)
      return res.status(400).json({ success: false, message: "sessionId and login required" });

    const guestCart = await Cart.findOne({ sessionId });
    if (!guestCart) return res.json({ success: true, message: "No guest cart to merge" });

    let custCart = await Cart.findOne({ customer: req.customer.id });
    if (!custCart) {
      guestCart.customer  = req.customer.id;
      guestCart.sessionId = null;
      await guestCart.save();
      return res.json({ success: true, message: "Cart merged" });
    }

    guestCart.items.forEach(gi => {
      const existing = custCart.items.find(ci => ci.product.toString() === gi.product.toString());
      if (existing) {
        existing.quantity += gi.quantity;
      } else {
        custCart.items.push(gi);
      }
    });

    await custCart.save();
    await guestCart.deleteOne();
    res.json({ success: true, message: "Cart merged" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
