const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      enum: ["home", "about", "services", "portfolio", "workshops", "blog", "faq", "contact", "quote", "navbar", "footer"],
      required: true,
    },
    order: { type: Number, default: 0 },
    miniTitle: { type: String, default: "" },
    title: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    paragraph: { type: String, default: "" },
    contentPosition: { type: String, default: "center" }, // top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
    backgroundImage: { type: String, default: "" },
    bgColor: { type: String, default: "" },
    bgGradient: { type: String, default: "" },
    linkUrl: { type: String, default: "" },
    linkText: { type: String, default: "" },
    overlayOpacity: { type: Number, default: 0.5 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slide", slideSchema);
