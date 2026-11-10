const express    = require("express");
const router     = express.Router();
const ctrl       = require("../../controllers/store/storeMediaController");
const media      = require("../../middleware/mediaUpload");
const adminProtect = require("../../middleware/authMiddleware");

// Admin only — upload one or many files (image / PDF / video) to Cloudinary
router.post("/upload",  adminProtect, media.array("files", 10), ctrl.upload);
router.post("/upload-one", adminProtect, media.single("file"), ctrl.upload);
router.delete("/",      adminProtect, ctrl.remove);

module.exports = router;
