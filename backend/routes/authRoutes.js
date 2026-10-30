const router = require("express").Router();
const upload = require("../middleware/upload");

const {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

// Auth Routes
router.post("/register", register);
router.post("/login", login);

// Verify user is still active (called by frontend every 30s)
router.get("/verify", require("../middleware/authMiddleware"), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(403).json({ valid: false, message: "User not found" });
    }
    res.json({ valid: true, role: user.role, name: user.name });
  } catch (error) {
    res.status(403).json({ valid: false, message: "Verification failed" });
  }
});

// CRUD Routes for Users
router.get("/", getAllUsers);          
router.get("/:id", getUserById);        
router.put("/:id", updateUser);
router.put("/:id/profile-image", upload.single("profileImage"), async (req, res) => {
  try {
    const User = require("../models/User");
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { profileImage: req.file.filename },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.delete("/:id", deleteUser);      

module.exports = router;