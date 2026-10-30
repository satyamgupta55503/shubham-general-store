const mongoose = require('mongoose');

// ==========================================
// 1. SYSTEM CONTACT INFO CONFIG SCHEMA
// ==========================================
const contactInfoSchema = new mongoose.Schema({
  address: {
    type: String,
    required: [true, 'Physical address text is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Official business email is required'],
    trim: true,
    lowercase: true
  },
  mapLink: {
    type: String,
    required: [true, 'Google Map embed or absolute location link is required'],
    trim: true
  },
  imageLink:{
    type:String,
    required:true
  }
}, { timestamps: true });

module.exports = mongoose.model('ContactInfo', contactInfoSchema);