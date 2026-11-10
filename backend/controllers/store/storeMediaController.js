const { uploadToCloud, deleteFromCloud } = require("../../middleware/mediaUpload");

// Folders admins may upload into (whitelist so callers can't pick arbitrary paths)
const FOLDERS = {
  products:   "subham-store/products",
  categories: "subham-store/categories",
  homepage:   "subham-store/homepage",
  documents:  "subham-store/documents",
  videos:     "subham-store/videos",
  general:    "subham-store/general",
};

// POST /api/store/media/upload?folder=products   (admin) — field: "file" or "files"
exports.upload = async (req, res) => {
  try {
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];
    if (!files.length) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    const folder = FOLDERS[req.query.folder] || FOLDERS.general;

    const results = [];
    for (const f of files) {
      results.push(await uploadToCloud(f, folder));
    }

    res.status(201).json({
      success: true,
      data: results.length === 1 ? results[0] : results,
      // convenience for single uploads
      url: results[0].url,
    });
  } catch (err) {
    const status = /not configured/i.test(err.message) ? 503 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/media   body: { public_id, resource_type }  (admin)
exports.remove = async (req, res) => {
  const { public_id, resource_type = "image" } = req.body || {};
  if (!public_id) return res.status(400).json({ success: false, message: "public_id required" });
  const ok = await deleteFromCloud(public_id, resource_type);
  res.json({ success: ok, message: ok ? "Deleted" : "Could not delete" });
};
