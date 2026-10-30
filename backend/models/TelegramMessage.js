const mongoose = require("mongoose");

const telegramMessageSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, index: true },
    messageId: { type: Number },
    from: {
      id: Number,
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      username: { type: String, default: "" },
    },
    text: { type: String, default: "" },
    type: { type: String, enum: ["incoming", "outgoing"], default: "incoming" },
    mediaType: { type: String, default: null }, // photo, video, document, voice
    mediaUrl: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TelegramMessage", telegramMessageSchema);
