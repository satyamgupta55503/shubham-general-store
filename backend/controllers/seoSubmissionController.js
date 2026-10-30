const mongoose = require("mongoose");
const SeoSubmission = require("../models/SeoSubmission");

// =======================
// CREATE SUBMISSION (Public)
// =======================

exports.createSubmission = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !url.trim()) {
      return res.status(400).json({ message: "URL is required" });
    }

    const submission = await SeoSubmission.create({
      url: url.trim(),
      status: "pending",
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// GET ALL SUBMISSIONS (Admin)
// =======================

exports.getAllSubmissions = async (req, res) => {
  try {
    const submissions = await SeoSubmission.find().sort({ createdAt: -1 });
    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch submissions", error: error.message });
  }
};

// =======================
// GET SUBMISSION BY ID (Admin)
// =======================

exports.getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const submission = await SeoSubmission.findById(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================
// UPDATE SUBMISSION (Admin)
// =======================

exports.updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    // Strip immutable fields from the update payload
    const updateData = { ...req.body };
    delete updateData.url;
    delete updateData._id;

    const submission = await SeoSubmission.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// =======================
// DELETE SUBMISSION (Admin)
// =======================

exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const submission = await SeoSubmission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    res.status(200).json({ success: true, message: "Submission deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
