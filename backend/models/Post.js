const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: String,
    slug: String,
    content: String,
    image: String,
    author:String,
    metaTitle:String,
    metaTags:String,
    tags:String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Make sure Category model exists
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",    // Make sure User model exists
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);