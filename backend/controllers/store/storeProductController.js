const Product  = require("../../models/store/Product");
const Customer = require("../../models/store/Customer");

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/store/products
exports.getProducts = async (req, res) => {
  try {
    const {
      category, search, minPrice, maxPrice,
      isFeatured, isBestSeller, isNewArrival, isOrganic, isVeg,
      sort = "createdAt", order = "desc",
      page = 1, limit = 20,
    } = req.query;

    const filter = { isActive: true };
    if (category)     filter.category    = category;
    if (isFeatured)   filter.isFeatured  = true;
    if (isBestSeller) filter.isBestSeller= true;
    if (isNewArrival) filter.isNewArrival= true;
    if (isOrganic)    filter.isOrganic   = true;
    if (isVeg !== undefined) filter.isVeg = isVeg === "true";

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sortObj = { [sort]: order === "asc" ? 1 : -1 };
    const skip    = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug color icon")
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .select("-reviews -__v"),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data:    products,
      pagination: {
        total,
        page:  Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/products/:slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate("category", "name slug color icon")
      .populate("reviews.customer", "name avatar");
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/products/suggest?q=...
// Amazon-style live search suggestions — fast partial (prefix/substring) match.
// Returns matching products (with slug, thumbnail, price, category) + matching categories.
exports.suggest = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (q.length < 1) return res.json({ success: true, data: { products: [], categories: [] } });

    // Escape regex special chars so user input can't break the query
    const safe = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const rx = new RegExp(safe, "i");

    const Category = require("../../models/store/GroceryCategory");

    const [products, categories] = await Promise.all([
      Product.find({
        isActive: true,
        $or: [{ name: rx }, { shortDesc: rx }, { brand: rx }, { tags: rx }],
      })
        .populate("category", "name slug")
        .sort({ isBestSeller: -1, isFeatured: -1 })
        .limit(8)
        .select("name slug thumbnail price salePrice category unit packSize stockQty"),
      Category.find({ isActive: true, name: rx })
        .sort({ sortOrder: 1 })
        .limit(4)
        .select("name slug color icon"),
    ]);

    res.json({ success: true, data: { products, categories } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/products/:slug/related
// "You may also like" — same category first, then fill with featured/best-sellers.
exports.getRelatedProducts = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 8, 20);
    const current = await Product.findOne({ slug: req.params.slug, isActive: true }).select("_id category");
    if (!current) return res.status(404).json({ success: false, message: "Product not found" });

    const selectFields = "-reviews -__v";
    const results = [];
    const seen = new Set([String(current._id)]);

    const pushUnique = (list) => {
      for (const p of list) {
        const id = String(p._id);
        if (seen.has(id)) continue;
        seen.add(id);
        results.push(p);
        if (results.length >= limit) break;
      }
    };

    // 1) Same category (excluding current)
    if (current.category) {
      const sameCat = await Product.find({
        category: current.category,
        isActive: true,
        _id: { $ne: current._id },
      })
        .populate("category", "name slug color icon")
        .sort({ isBestSeller: -1, isFeatured: -1, createdAt: -1 })
        .limit(limit)
        .select(selectFields);
      pushUnique(sameCat);
    }

    // 2) Fill remaining with featured / best-sellers from the whole store
    if (results.length < limit) {
      const fillers = await Product.find({
        isActive: true,
        _id: { $nin: Array.from(seen) },
        $or: [{ isFeatured: true }, { isBestSeller: true }, { isNewArrival: true }],
      })
        .populate("category", "name slug color icon")
        .sort({ createdAt: -1 })
        .limit(limit - results.length)
        .select(selectFields);
      pushUnique(fillers);
    }

    // 3) Still short? fill with any active products
    if (results.length < limit) {
      const anyProducts = await Product.find({
        isActive: true,
        _id: { $nin: Array.from(seen) },
      })
        .populate("category", "name slug color icon")
        .sort({ createdAt: -1 })
        .limit(limit - results.length)
        .select(selectFields);
      pushUnique(anyProducts);
    }

    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/products/:id/review  (customer must be logged in)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const customer = await Customer.findById(req.customer.id).select("name");
    const alreadyReviewed = product.reviews.find(r => r.customer.toString() === req.customer.id);
    if (alreadyReviewed) return res.status(400).json({ success: false, message: "Already reviewed" });

    product.reviews.push({ customer: req.customer.id, name: customer.name, rating, comment });

    // Recalculate avg
    const approved = product.reviews.filter(r => r.isApproved);
    product.numReviews = approved.length;
    product.avgRating  = approved.length
      ? approved.reduce((s, r) => s + r.rating, 0) / approved.length
      : 0;

    await product.save();
    res.status(201).json({ success: true, message: "Review submitted, pending approval" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/store/admin/products
exports.adminGetProducts = async (req, res) => {
  try {
    const { page = 1, limit = 30, search, category, isActive } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) filter.$text = { $search: search };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter).populate("category", "name slug").sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/admin/products
exports.createProduct = async (req, res) => {
  try {
    const exists = await Product.findOne({ slug: req.body.slug });
    if (exists) return res.status(400).json({ success: false, message: "Slug already exists" });
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/admin/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/products/:id/review/:reviewId/approve
exports.approveReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    review.isApproved = true;
    const approved = product.reviews.filter(r => r.isApproved);
    product.numReviews = approved.length;
    product.avgRating  = approved.reduce((s, r) => s + r.rating, 0) / approved.length;
    await product.save();
    res.json({ success: true, message: "Review approved" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
