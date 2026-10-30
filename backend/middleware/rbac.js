/**
 * RBAC — role-based access control for CMS admin routes.
 * Use AFTER authMiddleware (which sets req.user = { id, role, ... }).
 *
 * Usage:
 *   const rbac = require("../middleware/rbac");
 *   router.post("/x", adminProtect, rbac("superadmin", "admin"), handler);
 */
module.exports = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }
  if (!allowedRoles.includes(role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires role: ${allowedRoles.join(" or ")}`,
    });
  }
  next();
};
