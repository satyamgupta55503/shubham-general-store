const express      = require("express");
const router       = express.Router();
const ctrl         = require("../../controllers/store/storeDocumentController");
const adminProtect = require("../../middleware/authMiddleware");
const { docArray } = require("../../middleware/mediaUpload");

// All routes are admin-only
router.use(adminProtect);

// Folders
router.get   ("/folders",     ctrl.listFolders);
router.post  ("/folders",     ctrl.createFolder);
router.put   ("/folders/:id", ctrl.updateFolder);
router.delete("/folders/:id", ctrl.deleteFolder);

// Files
router.get   ("/files",     ctrl.listFiles);
router.post  ("/files",     docArray("files", 10), ctrl.uploadFiles);
router.put   ("/files/:id", ctrl.updateFile);
router.delete("/files/:id", ctrl.deleteFile);

module.exports = router;
