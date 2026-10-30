const mongoose = require('mongoose');


const individualServiceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  listOfWorks: {
    type: [String], // Array of strings for the bullet points
    default: []
  }
});

// Main Services Section Schema
const servicesSectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    default: "Services",
    trim: true
  },
  heading: {
    type: String,
    required: true,
    trim: true
  },
  services: [individualServiceSchema] // Array of 4 services
}, { 
  timestamps: true // createdAt aur updatedAt automatically handle karega
});

module.exports = mongoose.model('ServicesSection', servicesSectionSchema);

