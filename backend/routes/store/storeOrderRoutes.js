const express  = require("express");
const router   = express.Router();
const ctrl     = require("../../controllers/store/storeOrderController");
const adminProtect              = require("../../middleware/authMiddleware");
const { protect }               = require("../../middleware/customerAuth");

// Customer
router.post("/",              protect, ctrl.placeOrder);
router.get ("/my",            protect, ctrl.getMyOrders);
router.get ("/my/:id",        protect, ctrl.getMyOrder);
router.post("/my/:id/cancel", protect, ctrl.cancelOrder);

// Admin
router.get("/admin/all",         adminProtect, ctrl.adminGetOrders);
router.get("/admin/dashboard",   adminProtect, ctrl.adminDashboard);
router.get("/admin/:id",         adminProtect, ctrl.adminGetOrder);
router.put("/admin/:id/status",  adminProtect, ctrl.adminUpdateStatus);
router.put("/admin/:id/payment", adminProtect, ctrl.adminUpdatePayment);

module.exports = router;
