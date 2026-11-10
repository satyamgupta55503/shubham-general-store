const mongoose = require("mongoose");

/**
 * StoreSettings — single document (key: "main") holding the store's public
 * business details and the editable content of the About / Careers / Contact pages.
 * Everything is optional: the website only shows what has been filled in.
 */
const OpeningSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true, maxlength: 120 },
    type:        { type: String, default: "Full-time", trim: true, maxlength: 40 },   // Full-time / Part-time / Internship
    location:    { type: String, default: "", trim: true, maxlength: 120 },
    experience:  { type: String, default: "", trim: true, maxlength: 60 },
    description: { type: String, default: "", trim: true, maxlength: 1500 },
    isActive:    { type: Boolean, default: true },
  },
  { _id: true }
);

const StoreSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },

    contact: {
      phone:    { type: String, default: "", trim: true, maxlength: 30 },
      whatsapp: { type: String, default: "", trim: true, maxlength: 30 },
      email:    { type: String, default: "", trim: true, maxlength: 160 },
      address:  { type: String, default: "", trim: true, maxlength: 400 },
      city:     { type: String, default: "", trim: true, maxlength: 80 },
      hours:    { type: String, default: "", trim: true, maxlength: 160 },
      mapUrl:   { type: String, default: "", trim: true, maxlength: 600 },   // map EMBED url (Google or OpenStreetMap)
      mapLink:  { type: String, default: "", trim: true, maxlength: 300 },   // "Open in Mappls / Google Maps" link
      digipin:  { type: String, default: "", trim: true, maxlength: 14 },    // India Post DIGIPIN, e.g. 2KM-9KK-3P98
    },

    social: {
      instagram: { type: String, default: "", trim: true, maxlength: 300 },
      facebook:  { type: String, default: "", trim: true, maxlength: 300 },
      youtube:   { type: String, default: "", trim: true, maxlength: 300 },
    },

    about: {
      headline: { type: String, default: "", trim: true, maxlength: 160 },
      story:    { type: String, default: "", trim: true, maxlength: 4000 },   // paragraphs separated by a blank line
      stats: [
        {
          value: { type: String, default: "", trim: true, maxlength: 20 },
          label: { type: String, default: "", trim: true, maxlength: 60 },
        },
      ],
    },

    careers: {
      intro:    { type: String, default: "", trim: true, maxlength: 600 },
      openings: [OpeningSchema],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StoreSettings || mongoose.model("StoreSettings", StoreSettingsSchema);
