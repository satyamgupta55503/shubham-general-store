const Category = require("../models/Category");

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.json(categories);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(category);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);

    res.json({
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).json(error);
  }
};