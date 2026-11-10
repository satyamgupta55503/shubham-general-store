const mongoose = require("mongoose");

/**
 * Enquiry — messages from the public website.
 *   type "contact" → Contact page form
 *   type "career"  → Careers page job application
 *   type "dealer"  → dealership / bulk enquiry
 * (Old documents without a `type` are treated as "contact".)
 */
const EnquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: 160,
    },
    phone:   { type: String, default: "", trim: true, maxlength: 20 },
    subject: { type: String, default: "", trim: true, maxlength: 160 },
    type:    { type: String, enum: ["contact", "career", "dealer"], default: "contact", index: true },

    // Careers only
    position:   { type: String, default: "", trim: true, maxlength: 160 },
    experience: { type: String, default: "", trim: true, maxlength: 60 },
    resumeUrl:  { type: String, default: "", trim: true, maxlength: 500 },

    // A cover note is optional for job applications
    message: {
      type: String,
      required: [function () { return this.type !== "career"; }, "Message is required"],
      default: "",
      maxlength: 3000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", EnquirySchema);
