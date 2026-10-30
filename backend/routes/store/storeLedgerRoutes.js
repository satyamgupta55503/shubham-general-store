const express      = require("express");
const router       = express.Router();
const ctrl         = require("../../controllers/store/storeLedgerController");
const adminProtect = require("../../middleware/authMiddleware");
const rbac         = require("../../middleware/rbac");
const { protect: customerProtect } = require("../../middleware/customerAuth");

// ── CUSTOMER (self-view, read-only, transparent) ──
router.get("/my", customerProtect, ctrl.getMyLedger);

// ── ADMIN ──
// Read — any admin role
router.get("/admin",                adminProtect, ctrl.adminLedgerOverview);
router.get("/admin/:customerId",    adminProtect, ctrl.adminGetLedger);

// Write — only superadmin + admin (RBAC)
router.post  ("/admin/:customerId/entry",           adminProtect, rbac("superadmin", "admin"), ctrl.adminAddEntry);
router.put   ("/admin/:customerId/entry/:entryId",  adminProtect, rbac("superadmin", "admin"), ctrl.adminUpdateEntry);
router.delete("/admin/:customerId/entry/:entryId",  adminProtect, rbac("superadmin", "admin"), ctrl.adminDeleteEntry);

module.exports = router;
