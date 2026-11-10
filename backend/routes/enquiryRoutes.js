const express = require("express");
const router = express.Router();
const { rateLimit } = require("express-rate-limit");
const adminProtect = require("../middleware/authMiddleware");
const {
  sendEnquiry,
  getAllEnquiries,
  deleteEnquiry,
} = require("../controllers/enquiryController");

// Public form submissions: max 6 per 15 minutes per IP (stops spam / flooding)
const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 6,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many messages from this device. Please try again in a few minutes." },
});

// POST /api/enquiry/send  → public (rate-limited)
router.post("/send", submitLimiter, sendEnquiry);

// GET /api/enquiry/send   → CMS admins only (contains customers' contact details)
router.get("/send", adminProtect, getAllEnquiries);

// DELETE /api/enquiry/delete/:id → CMS admins only
router.delete("/delete/:id", adminProtect, deleteEnquiry);

module.exports = router;
