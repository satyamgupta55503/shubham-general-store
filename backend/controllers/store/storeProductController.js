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
