const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const ctrl = require('../../controllers/hrm/hrmAuthController');
const { hrmAuth, hrmAdminOnly, hrmManagerOrAbove } = require('../../middleware/hrmAuth');

// Rate limiter — max 10 login attempts per 15 min per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many login attempts. Try after 15 minutes.' },
});

// Public
router.post('/register', ctrl.register);
router.post('/login', loginLimiter, ctrl.login);

// Protected
router.get('/me',               hrmAuth, ctrl.me);
router.patch('/me',             hrmAuth, ctrl.updateProfile);
router.post('/me/change-password', hrmAuth, ctrl.changePassword);
router.get('/verify',           hrmAuth, ctrl.verify);
router.post('/logout',          hrmAuth, ctrl.logoutAll);  // ✅ all devices

// Manager+ — user management
router.get('/pending-users',          hrmAuth, hrmManagerOrAbove, ctrl.getPendingUsers);
router.get('/users',                  hrmAuth, hrmManagerOrAbove, ctrl.getAllUsers);
router.put('/users/:userId/approve',  hrmAuth, hrmAdminOnly,      ctrl.approveUser);
router.delete('/users/:userId/reject',hrmAuth, hrmAdminOnly,      ctrl.rejectUser);
router.put('/users/:userId/deactivate',hrmAuth,hrmAdminOnly,      ctrl.deactivateUser);
router.patch('/users/:userId',        hrmAuth, hrmAdminOnly,      ctrl.updateUser);

module.exports = router;
