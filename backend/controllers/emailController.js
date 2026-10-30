const Enquiry = require("../models/Enquiry");

// @desc    Create a new enquiry (Send form data)
// @route   POST /api/email/send
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Save into database
    const newEnquiry = await Enquiry.create({ name, email, message });

    // NOTE: Agar aapko sath me Nodemailer use karke actual email send karna ho, 
    // toh aap uska logic yahan add kar sakte hain.

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully!",
      data: newEnquiry,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not save enquiry.",
      error: error.message,
    });
  }
};

// @desc    Get all enquiries for CMS
// @route   GET /api/email/send
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return res.status(200).json(enquiries);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not fetch enquiries.",
      error: error.message,
    });
  }
};

// @desc    Delete an enquiry
// @route   DELETE /api/email/delete/:id
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.findByIdAndDelete(id);

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found." });
    }

    return res.status(200).json({ success: true, message: "Enquiry deleted successfully!" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error. Could not delete enquiry.",
      error: error.message,
    });
  }
};