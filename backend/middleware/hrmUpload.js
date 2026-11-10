const multer = require('multer');
const path   = require('path');

// Employee photo upload (HRM). Kept in memory and sent to Cloudinary by the
// controller, so nothing is written to the server disk.
const fileFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only JPG, JPEG, PNG, WEBP allowed'), false);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
});

module.exports = upload;
