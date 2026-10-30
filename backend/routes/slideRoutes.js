const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  getAllSlides,
  getSlideById,
  createSlide,
  updateSlide,
  deleteSlide,
  uploadBgImage,
} = require("../controllers/slideController");

// Public - get slides (for frontend rendering)
router.get("/", getAllSlides);
router.get("/:id", getSlideById);

// Protected - admin CRUD
router.post("/", auth, createSlide);
router.put("/:id", auth, updateSlide);
router.delete("/:id", auth, deleteSlide);
router.put("/:id/image", auth, upload.single("backgroundImage"), uploadBgImage);

module.exports = router;
