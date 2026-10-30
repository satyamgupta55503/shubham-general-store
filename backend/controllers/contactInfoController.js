const ContactInfo = require("../models/Contact");

// Create Contact Info
exports.createContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.create(req.body);

    res.status(201).json({
      success: true,
      message: "Contact information created successfully",
      data: contactInfo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Contact Info
exports.getContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.find();

    res.status(200).json({
      success: true,
      count: contactInfo.length,
      data: contactInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Contact Info
exports.getSingleContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findById(req.params.id);

    if (!contactInfo) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    res.status(200).json({
      success: true,
      data: contactInfo,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Contact Info
exports.updateContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!contactInfo) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact information updated successfully",
      data: contactInfo,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Contact Info
exports.deleteContactInfo = async (req, res) => {
  try {
    const contactInfo = await ContactInfo.findByIdAndDelete(req.params.id);

    if (!contactInfo) {
      return res.status(404).json({
        success: false,
        message: "Contact information not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact information deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};