const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createSubmission,
  getAllSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
} = require("../controllers/seoSubmissionController");

// 1. Create a Submission (Public)
router.post("/", createSubmission);

// 2. Get All Submissions (Protected)
router.get("/", auth, getAllSubmissions);

// 3. Get Single Submission by ID (Protected)
router.get("/:id", auth, getSubmissionById);

// 4. Update a Submission (Protected)
router.put("/:id", auth, updateSubmission);

// 5. Delete a Submission (Protected)
router.delete("/:id", auth, deleteSubmission);

module.exports = router;
