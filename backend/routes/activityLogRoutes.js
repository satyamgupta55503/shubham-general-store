const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getAllLogs, createLog, clearOldLogs } = require("../controllers/activityLogController");

router.get("/", auth, getAllLogs);
router.post("/", auth, createLog);
router.delete("/clear", auth, clearOldLogs);

module.exports = router;
