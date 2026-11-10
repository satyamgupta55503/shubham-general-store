const multer = require("multer");
const { uploadToCloud } = require("./mediaUpload");

/**
 * Legacy image upload (admin user avatars, slides, blog posts).
 *
 * Drop-in replacement for the old disk storage: files are kept in memory,
 * sent to Cloudinary, and `req.file.filename` / `req.file.path` are set to the
 * permanent HTTPS URL. Existing controllers that save `req.file.filename`
 * keep working without changes — they now store a full URL instead of a name.
 */
const parser = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Only image files are allowed"));
  },
});

const single = (field) => (req, res, next) => {
  parser.single(field)(req, res, async (err) => {
    if (err) {
      const message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 10 MB)" : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) return next();
    try {
      const result = await uploadToCloud(req.file, "subham-store/general");
      req.file.filename = result.url;
      req.file.path = result.url;
      req.file.cloud = result;
      next();
    } catch (e) {
      const status = /not configured/i.test(e.message) ? 503 : 400;
      res.status(status).json({ success: false, message: e.message });
    }
  });
};

module.exports = { single };
