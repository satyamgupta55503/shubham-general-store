const mongoose = require("mongoose");

const seoSubmissionSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "analyzed", "failed"],
      default: "pending",
    },
    performanceScore: {
      type: Number,
      default: null,
    },
    seoScore: {
      type: Number,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SeoSubmission", seoSubmissionSchema);
