const Post = require("../models/Post");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Helper to delete old images
const deleteImage = (filename) => {
  if (filename) {
    const filePath = path.join(__dirname, "../uploads", filename);
    fs.unlink(filePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        console.error("Error deleting image:", err);
      }
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    const post = await Post.findById(id)
      .populate("category")
      .populate("author", "name email");
      
    if (!post) return res.status(404).json({ message: "Post not found" });
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const post = await Post.create({
      ...req.body,
      image: req.file?.filename,
      author: req.user?.id, // Assumes auth middleware populates req.user
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("category")
      .populate("author", "name email");
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const existingPost = await Post.findById(req.params.id);
    if (!existingPost) return res.status(404).json({ message: "Post not found" });

    // Delete old image if a new one is uploaded
    if (req.file && existingPost.image) {
      deleteImage(existingPost.image);
    }

    // Prevent malicious reassignment of the post's author
    const updateData = { ...req.body };
    delete updateData.author; 

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { ...updateData, ...(req.file && { image: req.file.filename }) },
      { new: true }
    );
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    deleteImage(post.image);
    await post.deleteOne();
    res.json({ message: "Post and image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};