const express = require("express");
const router = express.Router();
const {
  createEnquiry,
  getAllEnquiries,
  deleteEnquiry,
} = require("../controllers/emailController");

// /api/email/send handles both POST (Form Submit) and GET (Fetch for CMS)
router.route("/send").post(createEnquiry).get(getAllEnquiries);

// /api/email/delete/:id handles the deletion
router.route("/delete/:id").delete(deleteEnquiry);

module.exports = router;