const Brand   = require("../../models/store/Brand");
const Product = require("../../models/store/Product");

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/store/brands  — all active brands (optionally ?dealer=true, ?featured=true)
exports.getAllBrands = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.dealer === "true")   filter.isDealer = true;
    if (req.query.featured === "true") filter.isFeatured = true;
    const brands = await Brand.find(filter).sort({ sortOrder: 1, name: 1 }).select("-__v");
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/brands/:slug  — one brand + its product lines, each with a live product count
exports.getBrandBySlug = async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, isActive: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    // Count active products per line (and total) so the brand page can show numbers
    const counts = await Product.aggregate([
      { $match: { brandRef: brand._id, isActive: true } },
      { $group: { _id: "$brandLine", count: { $sum: 1 } } },
    ]);
    const byLine = {};
    let total = 0;
    counts.forEach(c => { byLine[c._id || ""] = c.count; total += c.count; });

    const data = brand.toObject();
    data.totalProducts = total;
    data.productLines = (data.productLines || [])
      .map(l => ({ ...l, productCount: byLine[l.slug] || 0 }))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

exports.adminGetAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: brands });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    if (await Brand.findOne({ slug: req.body.slug }))
      return res.status(400).json({ success: false, message: "Slug already exists" });
    const brand = await Brand.create(req.body);
    res.status(201).json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    // Unlink products from the deleted brand (keep the products themselves)
    await Product.updateMany({ brandRef: brand._id }, { $set: { brandRef: null, brandLine: "" } });
    res.json({ success: true, message: "Brand deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
