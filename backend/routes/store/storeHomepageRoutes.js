const express  = require("express");
const router   = express.Router();
const ctrl     = require("../../controllers/store/storeHomepageController");
const adminProtect = require("../../middleware/authMiddleware");
const upload   = require("../../middleware/upload");

// Public — fetch homepage content
router.get("/", ctrl.getHomepage);

// Admin — update content
router.put("/admin", adminProtect, ctrl.updateHomepage);

// Admin — upload a single image (field name: "image")
router.post("/admin/upload", adminProtect, upload.single("image"), ctrl.uploadImage);

module.exports = router;
