const mongoose = require("mongoose");

const aboutPageSchema = new mongoose.Schema(
  {
    year: {
      type: String,
      required: true,
    },
    heading: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);
module.exports = mongoose.model("aboutPage", aboutPageSchema);