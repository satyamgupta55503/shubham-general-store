const express = require("express");
const router = express.Router();

const {
  createPageContent,
  getPageContent,
  getAllPageContents,
  getPageContentById,
  updatePageContent,
  updateHomepageContent,
  deletePageContent,
} = require("../controllers/homepageController");

// ==========================================
// SPECIFIC ROUTES
// (Must be defined before generic /:id routes)
// ==========================================
router.get("/homepage", getPageContent);
router.put("/homepage", updateHomepageContent);

// ==========================================
// GENERIC CRUD ROUTES
// ==========================================
router.post("/", createPageContent);
router.get("/", getAllPageContents);
router.get("/:id", getPageContentById);
router.put("/:id", updatePageContent);
router.delete("/:id", deletePageContent);

module.exports = router;