const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  getAllIntegrations,
  getByPlatform,
  upsertIntegration,
  disconnectIntegration,
  deleteIntegration,
} = require("../controllers/socialIntegrationController");

// All routes protected (superadmin only from frontend)
router.get("/", auth, getAllIntegrations);
router.get("/:platform", auth, getByPlatform);
router.post("/", auth, upsertIntegration);
router.put("/:platform/disconnect", auth, disconnectIntegration);
router.delete("/:platform", auth, deleteIntegration);

module.exports = router;
