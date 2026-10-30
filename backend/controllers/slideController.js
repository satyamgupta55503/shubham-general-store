const Slide = require("../models/Slide");

// Get all slides (optionally filter by page)
exports.getAllSlides = async (req, res) => {
  try {
    const filter = req.query.page ? { page: req.query.page } : {};
    const slides = await Slide.find(filter).sort({ page: 1, order: 1 });
    res.status(200).json(slides);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single slide
exports.getSlideById = async (req, res) => {
  try {
    const slide = await Slide.findById(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.status(200).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create slide
exports.createSlide = async (req, res) => {
  try {
    const slide = await Slide.create(req.body);
    res.status(201).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update slide
exports.updateSlide = async (req, res) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.status(200).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete slide
exports.deleteSlide = async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.status(200).json({ success: true, message: "Slide deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload background image
exports.uploadBgImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const slide = await Slide.findByIdAndUpdate(
      req.params.id,
      { backgroundImage: req.file.filename },
      { new: true }
    );
    if (!slide) return res.status(404).json({ message: "Slide not found" });
    res.status(200).json(slide);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
