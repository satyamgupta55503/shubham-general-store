const AboutPage = require("../models/About.js"); // Adjust the path to your schema

// @desc    Create a new about entry
// @route   POST /api/about
const createAboutEntry = async (req, res) => {
  try {
    const { year, heading, description } = req.body;

    if (!year || !heading || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newEntry = await AboutPage.create({ year, heading, description });
    res.status(201).json(newEntry);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get all about entries
// @route   GET /api/about
const getAllAboutEntries = async (req, res) => {
  try {
    const entries = await AboutPage.find().sort({ year: -1 }); // Sorts by year descending
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get a single about entry by ID
// @route   GET /api/about/:id
const getAboutEntryById = async (req, res) => {
  try {
    const entry = await AboutPage.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found" });
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Update an about entry
// @route   PUT /api/about/:id
const updateAboutEntry = async (req, res) => {
  try {
    const { year, heading, description } = req.body;

    const updatedEntry = await AboutPage.findByIdAndUpdate(
      req.params.id,
      { year, heading, description },
      { new: true, runValidators: true } // returns the updated document & runs schema validation
    );

    if (!updatedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Delete an about entry
// @route   DELETE /api/about/:id
const deleteAboutEntry = async (req, res) => {
  try {
    const deletedEntry = await AboutPage.findByIdAndDelete(req.params.id);

    if (!deletedEntry) {
      return res.status(404).json({ message: "Entry not found" });
    }

    res.status(200).json({ message: "Entry deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createAboutEntry,
  getAllAboutEntries,
  getAboutEntryById,
  updateAboutEntry,
  deleteAboutEntry,
};