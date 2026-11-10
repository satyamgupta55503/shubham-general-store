const StoreHomepage = require("../../models/store/StoreHomepage");

// Default seed data used when no document exists yet (bilingual kirana content)
const DEFAULTS = require("../../config/storeHomepageDefaults");

// GET /api/store/homepage  (public)
exports.getHomepage = async (req, res) => {
  try {
    let doc = await StoreHomepage.findOne({ pageName: "StoreHomepage" });
    if (!doc) {
      doc = await StoreHomepage.create(DEFAULTS);  // auto-seed on first call
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/homepage/admin  (admin)
exports.updateHomepage = async (req, res) => {
  try {
    const doc = await StoreHomepage.findOneAndUpdate(
      { pageName: "StoreHomepage" },
      req.body,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: "Homepage updated", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/homepage/admin/upload  (admin) — single image upload
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }
    // Stored on Cloudinary → permanent HTTPS URL (survives server restarts)
    const { uploadToCloud } = require("../../middleware/mediaUpload");
    const result = await uploadToCloud(req.file, "subham-store/homepage");
    res.json({ success: true, path: result.url, url: result.url });
  } catch (err) {
    const status = /not configured/i.test(err.message) ? 503 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};
