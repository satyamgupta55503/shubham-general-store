const Enquiry = require("../models/Enquiry");

// @desc    Submit a new contact enquiry
// @route   POST /api/email/send
exports.sendEnquiry = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newEnquiry = await Enquiry.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: "Message sent successfully!",
      data: newEnquiry,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error. Please try again.", error: error.message });
  }
};

// @desc    Get all enquiries for CMS
// @route   GET /api/email/send
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enquiries.", error: error.message });
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

    res.status(200).json({ message: "Enquiry deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting enquiry.", error: error.message });
  }
};