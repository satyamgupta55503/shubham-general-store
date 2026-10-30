const express = require("express");
const router = express.Router();

const {
  createContactInfo,
  getContactInfo,
  getSingleContactInfo,
  updateContactInfo,
  deleteContactInfo,
} = require("../controllers/contactInfoController.js");

// Create & Get All
router.route("/")
  .post(createContactInfo)
  .get(getContactInfo);

// Get Single, Update, Delete
router.route("/:id")
  .get(getSingleContactInfo)
  .put(updateContactInfo)
  .delete(deleteContactInfo);
 
module.exports = router;