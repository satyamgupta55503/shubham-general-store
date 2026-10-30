const ServicesSection = require("../models/Services");

// Get Services Section
exports.getServicesSection = async (req, res) => {
  try {
    const services = await ServicesSection.findOne();

    if (!services) {
      return res.status(404).json({
        success: false,
        message: "Services section not found",
      });
    }

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create Services Section
exports.createServicesSection = async (req, res) => {
  try {
    const { sectionName, heading, services } = req.body;

    const existing = await ServicesSection.findOne();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Services section already exists",
      });
    }

    const newServicesSection = await ServicesSection.create({
      sectionName,
      heading,
      services,
    });

    res.status(201).json({
      success: true,
      message: "Services section created successfully",
      data: newServicesSection,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Services Section
exports.updateServicesSection = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedServices = await ServicesSection.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedServices) {
      return res.status(404).json({
        success: false,
        message: "Services section not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Services section updated successfully",
      data: updatedServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Services Section
exports.deleteServicesSection = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedServices = await ServicesSection.findByIdAndDelete(id);

    if (!deletedServices) {
      return res.status(404).json({
        success: false,
        message: "Services section not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Services section deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};