const router      = require('express').Router();
const rateLimit   = require('express-rate-limit');
const authCtrl    = require('../../controllers/emp/empAuthController');
const dashCtrl    = require('../../controllers/emp/empDashboardController');
const attCtrl     = require('../../controllers/emp/empAttendanceController');
const leaveCtrl   = require('../../controllers/emp/empLeaveController');
const salaryCtrl  = require('../../controllers/emp/empSalaryController');
const notifCtrl   = require('../../controllers/emp/empNotificationController');
const teamCtrl    = require('../../controllers/emp/empTeamController');
const { empAuth } = require('../../middleware/empAuth');

const loginLimiter = rateLimit({
  windowMs: 15*60*1000, max:10, standardHeaders:true, legacyHeaders:false,
  message:{ message:'Too many login attempts. Try after 15 minutes.' },
});

const upload    = require('../../middleware/empUpload');

// ── Public ─────────────────────────────────────────────────────────────────────
router.post('/auth/login',  loginLimiter, authCtrl.login);

// ── Protected ──────────────────────────────────────────────────────────────────
router.get('/auth/me',              empAuth, authCtrl.me);
router.get('/auth/verify',          empAuth, authCtrl.verify);
router.post('/auth/logout',         empAuth, authCtrl.logoutAll);  // ✅ all devices
router.post('/auth/me/change-password', empAuth, authCtrl.changePassword);
router.patch('/auth/profile',       empAuth, authCtrl.updateProfile);

// Dashboard
router.get('/dashboard',            empAuth, dashCtrl.stats);

// Attendance
router.post('/attendance/checkin',  empAuth, attCtrl.checkIn);
router.post('/attendance/checkout', empAuth, attCtrl.checkOut);
router.get('/attendance/today',     empAuth, attCtrl.today);
router.get('/attendance/history',   empAuth, attCtrl.history);
router.post('/attendance/regularize',  empAuth, attCtrl.requestRegularization);
router.get('/attendance/regularizations', empAuth, attCtrl.myRegularizations);

// Leaves
router.post('/leaves',              empAuth, leaveCtrl.apply);
router.get('/leaves',               empAuth, leaveCtrl.myLeaves);
router.patch('/leaves/:id/cancel',  empAuth, leaveCtrl.cancel);
router.get('/leaves/balance',       empAuth, leaveCtrl.balance);
router.get('/leaves/types',         empAuth, leaveCtrl.types);

// Salary
router.get('/salary/slips',         empAuth, salaryCtrl.mySlips);
router.get('/salary/slips/:id',     empAuth, salaryCtrl.getSlip);
router.get('/salary/ctc',           empAuth, salaryCtrl.ctc);

// Notifications
router.get('/notifications',                 empAuth, notifCtrl.list);
router.post('/notifications/mark-all-read',  empAuth, notifCtrl.markRead);

// Team directory, Holidays, Announcements
router.get('/team',                          empAuth, teamCtrl.team);
router.get('/holidays',                      empAuth, teamCtrl.holidays);
router.get('/announcements',                 empAuth, teamCtrl.announcements);
router.patch('/announcements/:id/read',      empAuth, teamCtrl.markAnnouncementRead);

// Daily Task Log
const taskCtrl = require('../../controllers/emp/empTaskController');
router.get('/tasks',                     empAuth, taskCtrl.list);
router.get('/tasks/history',             empAuth, taskCtrl.history);
router.get('/tasks/summary',             empAuth, taskCtrl.summary);
router.get('/tasks/assigned',            empAuth, taskCtrl.assignedTasks);
router.get('/tasks/assigned-history',    empAuth, taskCtrl.assignedHistory);
router.post('/tasks',                    empAuth, taskCtrl.create);
router.patch('/tasks/:id',               empAuth, taskCtrl.update);
router.post('/tasks/:id/comment',        empAuth, taskCtrl.addComment);
router.delete('/tasks/:id',              empAuth, taskCtrl.remove);

module.exports = router;
