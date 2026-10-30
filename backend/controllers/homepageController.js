const PageContent = require("../models/Homepage");

// Create Homepage Content
exports.createPageContent = async (req, res) => {
  try {
    const existingPage = await PageContent.findOne({
      pageName: req.body.pageName || "Homepage",
    });

    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: "Page content already exists",
      });
    }

    const pageContent = await PageContent.create(req.body);

    res.status(201).json({
      success: true,
      data: pageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Homepage Content
exports.getPageContent = async (req, res) => {
  try {
    const pageContent = await PageContent.findOne({
      pageName: "Homepage",
    });

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: "Page content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pageContent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Pages
exports.getAllPageContents = async (req, res) => {
  try {
    const pages = await PageContent.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pages.length,
      data: pages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Page By ID
exports.getPageContentById = async (req, res) => {
  try {
    const page = await PageContent.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Page Content
exports.updatePageContent = async (req, res) => {
  try {
    const page = await PageContent.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Mongoose standard to return the updated document
        runValidators: true,
      }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Page updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Homepage Directly
exports.updateHomepageContent = async (req, res) => {
  try {
    const page = await PageContent.findOneAndUpdate(
      { pageName: "Homepage" },
      req.body,
      {
        new: true, // Mongoose standard to return the updated document
        runValidators: true,
      }
    );

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Homepage content not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Homepage updated successfully",
      data: page,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Page Content
exports.deletePageContent = async (req, res) => {
  try {
    const page = await PageContent.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};