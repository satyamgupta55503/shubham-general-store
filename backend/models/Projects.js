const mongoose = require("mongoose");

// Content Schema (Images ke liye reuse hoga)
const contentSchema = new mongoose.Schema({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
  },
});

const scopeOfWorkSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
});

const projectsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String, // Yahan pe category add kiya gaya hai
      // required: true, // Agar category mandatory rakhni hai toh isko uncomment karein
    },
    tags: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    type: {
      type: String,
      default: "image",
    },
    content: [contentSchema],
    
    // Naya Overview Section (with Multiple Images)
    overview: {
      description: {
        type: String,
      },
      images: [contentSchema], // Isme multiple images aa sakti hain (src aur alt ke saath)
    },

    client: {
      type: String,
    },
    projectType: {
      type: String,
    },
    year: {
      type: String,
    },
    previewUrl: {
      type: String,
    },
    description: {
      type: String,
    },
    scopeOfWork: [scopeOfWorkSchema],
    quote: {
      type: String,
    },
    quoteAuthor: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Projects", projectsSchema);