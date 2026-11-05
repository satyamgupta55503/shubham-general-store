const express  = require("express");
const router   = express.Router();
const ctrl     = require("../../controllers/store/storeProductController");
const adminProtect               = require("../../middleware/authMiddleware");
const { protect: custProtect }   = require("../../middleware/customerAuth");

// Public
router.get("/",              ctrl.getProducts);
router.get("/suggest",       ctrl.suggest);          // Amazon-style live search (must precede /:slug)
router.get("/:slug/related", ctrl.getRelatedProducts);
router.get("/:slug",         ctrl.getProductBySlug);

// Customer — review
router.post("/:id/review", custProtect, ctrl.addReview);

// Admin
router.get   ("/admin/all",                   adminProtect, ctrl.adminGetProducts);
router.post  ("/admin",                       adminProtect, ctrl.createProduct);
router.put   ("/admin/:id",                   adminProtect, ctrl.updateProduct);
router.delete("/admin/:id",                   adminProtect, ctrl.deleteProduct);
router.put   ("/admin/:id/review/:reviewId/approve", adminProtect, ctrl.approveReview);

module.exports = router;
