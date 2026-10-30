const Order    = require("../../models/store/Order");
const Cart     = require("../../models/store/Cart");
const Product  = require("../../models/store/Product");
const Customer = require("../../models/store/Customer");
const { addLedgerEntry } = require("./storeLedgerController");

// Pick the effective unit price for a product based on customer type
function effectiveUnitPrice(product, isWholesale) {
  if (isWholesale && product.isWholesaleAvailable) {
    return product.wholesaleSalePrice ?? product.wholesalePrice ?? product.salePrice ?? product.price;
  }
  return product.salePrice ?? product.price;
}

// ─── CUSTOMER ─────────────────────────────────────────────────────────────────

// POST /api/store/orders  — place order
exports.placeOrder = async (req, res) => {
  try {
    const {
      shippingAddress, paymentMethod = "cod",
      couponCode = "", customerNote = "",
    } = req.body;

    if (!shippingAddress) return res.status(400).json({ success: false, message: "Shipping address required" });

    // Load customer to determine pricing tier + credit
    const customer = await Customer.findById(req.customer.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const isWholesale = customer.customerType === "wholesale" && customer.isApproved;

    const cart = await Cart.findOne({ customer: req.customer.id })
      .populate("items.product", "price salePrice wholesalePrice wholesaleSalePrice isWholesaleAvailable moq stockQty trackStock name thumbnail unit packSize sku isActive");

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    // Validate stock + MOQ & build order items
    const orderItems = [];
    for (const ci of cart.items) {
      const p = ci.product;
      if (!p || !p.isActive) return res.status(400).json({ success: false, message: `Product ${ci.name} is unavailable` });
      if (p.trackStock && p.stockQty < ci.quantity)
        return res.status(400).json({ success: false, message: `Insufficient stock for ${ci.name}` });

      // Enforce MOQ for wholesale buyers on wholesale-enabled items
      if (isWholesale && p.isWholesaleAvailable && p.moq > 1 && ci.quantity < p.moq)
        return res.status(400).json({ success: false, message: `Minimum order quantity for ${p.name} is ${p.moq}` });

      const unitPrice = effectiveUnitPrice(p, isWholesale);
      orderItems.push({
        product:   p._id,
        name:      p.name,
        thumbnail: p.thumbnail,
        sku:       p.sku,
        price:     unitPrice,
        quantity:  ci.quantity,
        unit:      p.unit,
        packSize:  p.packSize,
        itemTotal: unitPrice * ci.quantity,
      });
    }

    const subtotal       = orderItems.reduce((s, i) => s + i.itemTotal, 0);
    // Wholesale: no shipping charge (bulk) | Retail: free above ₹499 else ₹40
    const shippingCharge = isWholesale ? 0 : (subtotal >= 499 ? 0 : 40);
    const discount       = cart.couponDiscount || 0;
    const totalAmount    = subtotal + shippingCharge - discount;

    // Credit-limit guard for wholesale on-credit (COD/credit) orders
    if (isWholesale && paymentMethod === "cod" && customer.creditLimit > 0) {
      const projected = (customer.outstandingBalance || 0) + totalAmount;
      if (projected > customer.creditLimit) {
        return res.status(400).json({
          success: false,
          message: `Credit limit exceeded. Limit: ₹${customer.creditLimit}, current due: ₹${customer.outstandingBalance}, this order: ₹${totalAmount}. Please clear dues first.`,
        });
      }
    }

    const order = await Order.create({
      customer:        req.customer.id,
      orderType:       isWholesale ? "wholesale" : "retail",
      items:           orderItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      discount,
      couponCode,
      totalAmount,
      paymentMethod,
      customerNote,
      statusHistory:   [{ status: "placed", note: `${isWholesale ? "Wholesale" : "Retail"} order placed by customer` }],
    });

    // Deduct stock
    for (const oi of orderItems) {
      await Product.findByIdAndUpdate(oi.product, { $inc: { stockQty: -oi.quantity } });
    }

    // Update customer stats
    await Customer.findByIdAndUpdate(req.customer.id, {
      $inc: { totalOrders: 1, totalSpent: totalAmount },
      lastOrderAt: new Date(),
    });

    // ── Ledger: wholesale COD/credit orders add a "baaki" (due) entry automatically ──
    if (isWholesale && paymentMethod === "cod") {
      await addLedgerEntry(req.customer.id, {
        type: "baaki",
        amount: totalAmount,
        note: `Order placed (on credit)`,
        reference: order.orderNumber,
        order: order._id,
        orderNumber: order.orderNumber,
        source: "system",
        createdByName: "System",
        entryDate: new Date(),
      });
    }

    // Clear cart
    await Cart.findOneAndDelete({ customer: req.customer.id });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/orders/my  — customer's own orders
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find({ customer: req.customer.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-__v"),
      Order.countDocuments({ customer: req.customer.id }),
    ]);
    res.json({ success: true, data: orders, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/orders/my/:id
exports.getMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.customer.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/orders/my/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, customer: req.customer.id });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (!["placed", "confirmed"].includes(order.orderStatus))
      return res.status(400).json({ success: false, message: "Order cannot be cancelled at this stage" });

    order.orderStatus  = "cancelled";
    order.cancelReason = req.body.reason || "";
    order.statusHistory.push({ status: "cancelled", note: `Cancelled by customer: ${req.body.reason || ""}` });

    // Restore stock
    for (const oi of order.items) {
      await Product.findByIdAndUpdate(oi.product, { $inc: { stockQty: oi.quantity } });
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/store/admin/orders  — supports ?type=retail|wholesale
exports.adminGetOrders = async (req, res) => {
  try {
    const { page = 1, limit = 30, status, paymentStatus, type, search } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (type === "retail" || type === "wholesale") filter.orderType = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("customer", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);
    res.json({ success: true, data: orders, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/admin/orders/:id
exports.adminGetOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email phone");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/orders/:id/status
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber, deliveryDate } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (deliveryDate)   order.deliveryDate   = deliveryDate;
    if (status === "delivered") order.deliveredAt = new Date();
    order.statusHistory.push({ status, note: note || "" });

    await order.save();
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/orders/:id/payment
exports.adminUpdatePayment = async (req, res) => {
  try {
    const { paymentStatus, paymentId, paymentMethod } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const wasPaid = order.paymentStatus === "paid";
    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;
    await order.save();

    // ── Ledger: wholesale order marked PAID → add a "jama" (payment) entry ──
    // (only if it wasn't already paid, to avoid double entries)
    if (order.orderType === "wholesale" && paymentStatus === "paid" && !wasPaid) {
      await addLedgerEntry(order.customer, {
        type: "jama",
        amount: order.totalAmount,
        note: "Payment received for order",
        reference: order.orderNumber,
        order: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: paymentMethod || "cash",
        source: "admin",
        createdBy:     req.user?.id || null,
        createdByName: req.user?.name || req.user?.email || "Admin",
        createdByRole: req.user?.role || "admin",
        entryDate: new Date(),
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/admin/dashboard  — quick stats
exports.adminDashboard = async (req, res) => {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      revenueAgg,
    ] = await Promise.all([
      Order.countDocuments(),
      require("../../models/store/Customer").countDocuments(),
      require("../../models/store/Product").countDocuments({ isActive: true }),
      Order.countDocuments({ orderStatus: { $in: ["placed", "confirmed", "processing"] } }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    res.json({
      success: true,
      data: {
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        totalRevenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
