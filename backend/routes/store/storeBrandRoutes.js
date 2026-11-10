const express      = require("express");
const router       = express.Router();
const ctrl         = require("../../controllers/store/storeBrandController");
const adminProtect = require("../../middleware/authMiddleware");

// Public
router.get("/",            ctrl.getAllBrands);
router.get("/admin/all",   adminProtect, ctrl.adminGetAllBrands);
router.get("/:slug",       ctrl.getBrandBySlug);

// Admin (CMS login)
router.post  ("/admin",     adminProtect, ctrl.createBrand);
router.put   ("/admin/:id", adminProtect, ctrl.updateBrand);
router.delete("/admin/:id", adminProtect, ctrl.deleteBrand);

module.exports = router;
