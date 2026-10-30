const mongoose = require("mongoose");

const socialIntegrationSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      enum: ["whatsapp", "facebook", "instagram", "telegram"],
      required: true,
      unique: true,
    },
    apiKey: {
      type: String,
      default: "",
    },
    phoneNumberId: {
      type: String,
      default: "",
    },
    pageId: {
      type: String,
      default: "",
    },
    accessToken: {
      type: String,
      default: "",
    },
    webhookSecret: {
      type: String,
      default: "",
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialIntegration", socialIntegrationSchema);
