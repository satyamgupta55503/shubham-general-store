const GroceryCategory = require("../../models/store/GroceryCategory");

// ─── PUBLIC ──────────────────────────────────────────────────────────────────

// GET /api/store/categories — all active categories (with optional parent filter)
exports.getAllCategories = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.parent === "root") filter.parent = null;
    const cats = await GroceryCategory.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .select("-__v");
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/categories/:slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const cat = await GroceryCategory.findOne({ slug: req.params.slug, isActive: true })
      .populate("parent", "name slug");
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/store/admin/categories
exports.adminGetAllCategories = async (req, res) => {
  try {
    const cats = await GroceryCategory.find()
      .populate("parent", "name slug")
      .sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, data: cats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, description, image, icon, color, parent, sortOrder, isActive, isFeatured, metaTitle, metaDesc } = req.body;
    const exists = await GroceryCategory.findOne({ slug });
    if (exists) return res.status(400).json({ success: false, message: "Slug already exists" });
    const cat = await GroceryCategory.create({ name, slug, description, image, icon, color, parent: parent || null, sortOrder, isActive, isFeatured, metaTitle, metaDesc });
    res.status(201).json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const cat = await GroceryCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    // Don't orphan products: a category that still has products can't be deleted
    const Product = require("../../models/store/Product");
    const inUse = await Product.countDocuments({ category: req.params.id });
    if (inUse > 0) {
      return res.status(400).json({
        success: false,
        message: `${inUse} product(s) still use this category. Move or delete them first, or just mark the category inactive.`,
      });
    }
    const cat = await GroceryCategory.findByIdAndDelete(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
