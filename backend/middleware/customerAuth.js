const jwt      = require("jsonwebtoken");
const Customer = require("../models/store/Customer");

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || process.env.JWT_SECRET;

// Protect customer routes — must be logged in
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Not authenticated" });

    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "customer")
      return res.status(403).json({ success: false, message: "Access denied" });

    const customer = await Customer.findById(decoded.id).select("_id isActive isApproved");
    if (!customer || !customer.isActive)
      return res.status(401).json({ success: false, message: "Account not active" });
    if (!customer.isApproved)
      return res.status(403).json({ success: false, pendingApproval: true, message: "Account pending admin approval" });

    req.customer = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// Attach customer if token present, but don't block if absent (for cart/products)
exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token   = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded.role === "customer") {
        req.customer = { id: decoded.id };
      }
    }
  } catch (_) {}
  next();
};
