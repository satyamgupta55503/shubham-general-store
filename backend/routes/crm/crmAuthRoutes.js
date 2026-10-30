const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmAuthController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

// ── Public ────────────────────────────────────────────────────────────────────
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);

// ── Protected ─────────────────────────────────────────────────────────────────
router.get('/me', crmAuth, ctrl.me);
router.patch('/me', crmAuth, ctrl.updateProfile);
router.post('/me/change-password', crmAuth, ctrl.changePassword);
router.get('/verify', crmAuth, ctrl.verify);
router.post('/logout', crmAuth, ctrl.logout);   // ✅ logout ALL devices

// ── Manager / Owner ───────────────────────────────────────────────────────────
router.get('/pending-users', crmAuth, crmManagerOrAbove, ctrl.getPendingUsers);
router.get('/users', crmAuth, crmManagerOrAbove, ctrl.getAllUsers);
router.put('/users/:userId/approve', crmAuth, crmManagerOrAbove, ctrl.approveUser);
router.delete('/users/:userId/reject', crmAuth, crmManagerOrAbove, ctrl.rejectUser);
router.put('/users/:userId/deactivate', crmAuth, crmManagerOrAbove, ctrl.deactivateUser);
router.patch('/users/:userId', crmAuth, crmManagerOrAbove, ctrl.updateUser);

module.exports = router;
