const express = require("express");
const router = express.Router();

const {
  getServicesSection,
  createServicesSection,
  updateServicesSection,
  deleteServicesSection,
} = require("../controllers/servicesController");

// Get Services Section
router.get("/", getServicesSection);

// Create Services Section
router.post("/", createServicesSection);

// Update Services Section
router.put("/:id", updateServicesSection);

// Delete Services Section
router.delete("/:id", deleteServicesSection);

module.exports = router;