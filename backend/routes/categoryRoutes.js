const router = require("express").Router();

const auth = require("../middleware/authMiddleware");

const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/", auth, createCategory);

router.get("/", getCategories);

router.put("/:id", auth, updateCategory);

router.delete("/:id", auth, deleteCategory);

module.exports = router;