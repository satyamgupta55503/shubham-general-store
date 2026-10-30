const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "" },
    userRole: { type: String, default: "" },
    action: { type: String, required: true },
    platform: { type: String, default: "" }, // whatsapp, instagram, facebook, telegram, system
    details: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ActivityLog", activityLogSchema);
