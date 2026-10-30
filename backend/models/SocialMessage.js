const mongoose = require("mongoose");

const socialMessageSchema = new mongoose.Schema(
  {
    platform: { type: String, enum: ["whatsapp", "facebook", "instagram"], required: true, index: true },
    chatId: { type: String, required: true, index: true },
    messageId: { type: String, default: "" },
    from: {
      id: { type: String, default: "" },
      name: { type: String, default: "" },
      username: { type: String, default: "" },
      profilePic: { type: String, default: "" },
    },
    text: { type: String, default: "" },
    type: { type: String, enum: ["incoming", "outgoing"], default: "incoming" },
    mediaType: { type: String, default: null },
    mediaUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

socialMessageSchema.index({ platform: 1, chatId: 1, timestamp: -1 });

module.exports = mongoose.model("SocialMessage", socialMessageSchema);
