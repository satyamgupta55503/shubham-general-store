const express      = require("express");
const router       = express.Router();
const ctrl         = require("../../controllers/store/storeSettingsController");
const adminProtect = require("../../middleware/authMiddleware");

router.get("/",       ctrl.getPublic);                       // public
router.get("/admin",  adminProtect, ctrl.getAdmin);          // CMS
router.put("/admin",  adminProtect, ctrl.update);            // CMS

module.exports = router;
