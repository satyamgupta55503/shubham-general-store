const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
} = require("../controllers/postController");

// 1. Create a Post (Protected)
router.post(
  "/",
  auth,
  upload.single("image"),
  createPost
);

// 2. Get All Posts (Public)
router.get("/", getPosts);

// 3. Get Single Post Details by ID (Public)
router.get("/:id", getPostById);

// 4. Update a Post (Protected)
router.put(
  "/:id",
  auth,
  upload.single("image"),
  updatePost
);

// 5. Delete a Post (Protected)
router.delete("/:id", auth, deletePost);

module.exports = router;