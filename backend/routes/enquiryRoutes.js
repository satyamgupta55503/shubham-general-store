const express = require("express");
const router = express.Router();
const {
  sendEnquiry,
  getAllEnquiries,
  deleteEnquiry,
} = require("../controllers/enquiryController");

// Matches: POST /api/email/send & GET /api/email/send
router.route("/send").post(sendEnquiry).get(getAllEnquiries);

// Matches: DELETE /api/email/delete/:id
router.route("/delete/:id").delete(deleteEnquiry);

module.exports = router;