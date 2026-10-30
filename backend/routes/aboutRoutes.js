const express = require("express");
const router = express.Router();
const {
  createAboutEntry,
  getAllAboutEntries,
  getAboutEntryById,
  updateAboutEntry,
  deleteAboutEntry,
} = require("../controllers/aboutControllers.js"); // Adjust the path to your controller

// Routes for /api/about
router.route("/")
  .post(createAboutEntry)
  .get(getAllAboutEntries);

// Routes for /api/about/:id
router.route("/:id")
  .get(getAboutEntryById)
  .put(updateAboutEntry)
  .delete(deleteAboutEntry);

module.exports = router;