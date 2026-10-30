const router = require('express').Router();
const histCtrl  = require('../../controllers/hrm/hrmHistoryController');
const notifCtrl = require('../../controllers/hrm/hrmNotificationController');
const settCtrl  = require('../../controllers/hrm/hrmSettingsController');
const dashCtrl  = require('../../controllers/hrm/hrmDashboardController');
const { hrmAuth, hrmAdminOnly, hrmAnyRole } = require('../../middleware/hrmAuth');

router.use(hrmAuth);

// Dashboard
router.get('/dashboard/stats', hrmAnyRole, dashCtrl.stats);

// History
router.get('/history',          hrmAnyRole,   histCtrl.list);
router.delete('/history/clear', hrmAdminOnly, histCtrl.deleteAll);   // Clear all (or filtered)
router.delete('/history/:id',   hrmAdminOnly, histCtrl.deleteOne);   // Delete single

// Notifications
router.get('/notifications',          hrmAnyRole, notifCtrl.list);
router.post('/notifications/mark-all-read', hrmAnyRole, notifCtrl.markRead);
router.patch('/notifications/:id/read',     hrmAnyRole, notifCtrl.markOne);

// Settings
router.get('/settings',    hrmAnyRole, settCtrl.get);
router.put('/settings',    hrmAdminOnly, settCtrl.update);
router.patch('/settings',  hrmAdminOnly, settCtrl.update);

module.exports = router;
