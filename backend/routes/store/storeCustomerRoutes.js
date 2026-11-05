const express  = require("express");
const router   = express.Router();
const ctrl     = require("../../controllers/store/storeCustomerController");
const adminProtect              = require("../../middleware/authMiddleware");
const rbac                      = require("../../middleware/rbac");
const { protect }               = require("../../middleware/customerAuth");
const { crmAuth }               = require("../../middleware/crmAuth");

// Auth (public)
router.post("/register", ctrl.register);
router.post("/login",    ctrl.login);

// Customer self (protected)
router.get ("/me",                            protect, ctrl.getMe);
router.put ("/me",                            protect, ctrl.updateMe);
router.put ("/me/password",                   protect, ctrl.changePassword);
router.post("/me/addresses",                  protect, ctrl.addAddress);
router.put ("/me/addresses/:addrId",          protect, ctrl.updateAddress);
router.delete("/me/addresses/:addrId",        protect, ctrl.deleteAddress);
router.post("/me/wishlist/:productId",        protect, ctrl.toggleWishlist);
router.get ("/me/quotations",                 protect, ctrl.getMyQuotations);
router.get ("/me/quotations/:id",             protect, ctrl.getMyQuotation);
router.get ("/me/invoices",                   protect, ctrl.getMyInvoices);
router.get ("/me/invoices/:id",               protect, ctrl.getMyInvoice);
router.get ("/me/order-sheets",               protect, ctrl.getMyOrderSheets);
router.get ("/me/order-sheets/:id",           protect, ctrl.getMyOrderSheet);

// CRM integration — selector list of store customers (CRM auth)
router.get ("/crm/list",                      crmAuth, ctrl.crmListCustomers);

// Admin — read (any admin)
router.get("/admin/all",                      adminProtect, ctrl.adminGetCustomers);
router.get("/admin/pending",                  adminProtect, ctrl.adminGetPendingWholesale);
router.get("/admin/sent-documents",           adminProtect, ctrl.adminGetSentDocuments);
router.get("/admin/:id",                      adminProtect, ctrl.adminGetCustomer);

// Admin — write (superadmin + admin only via RBAC)
router.put   ("/admin/:id/status",            adminProtect, rbac("superadmin", "admin"), ctrl.adminToggleStatus);
router.put   ("/admin/:id/approve",           adminProtect, rbac("superadmin", "admin"), ctrl.adminApproveWholesale);
router.delete("/admin/:id/reject",            adminProtect, rbac("superadmin", "admin"), ctrl.adminRejectCustomer);
router.put   ("/admin/:id",                   adminProtect, rbac("superadmin", "admin"), ctrl.adminUpdateCustomer);

module.exports = router;
