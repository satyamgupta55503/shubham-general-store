const router = require('express').Router();
const ctrl   = require('../../controllers/hrm/hrmReportController');
const { hrmAuth, hrmManagerOrAbove } = require('../../middleware/hrmAuth');

router.use(hrmAuth, hrmManagerOrAbove);

router.get('/headcount',  ctrl.headcount);
router.get('/attendance', ctrl.attendance);
router.get('/leave',      ctrl.leave);
router.get('/payroll',    ctrl.payroll);

module.exports = router;
