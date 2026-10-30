const express    = require("express");
const router     = express.Router();
const ctrl       = require("../../controllers/store/storeCategoryController");
const adminProtect = require("../../middleware/authMiddleware");

// Public
router.get("/",       ctrl.getAllCategories);
router.get("/:slug",  ctrl.getCategoryBySlug);

// Admin (CMS login required)
router.get   ("/admin/all",   adminProtect, ctrl.adminGetAllCategories);
router.post  ("/admin",       adminProtect, ctrl.createCategory);
router.put   ("/admin/:id",   adminProtect, ctrl.updateCategory);
router.delete("/admin/:id",   adminProtect, ctrl.deleteCategory);

module.exports = router;
