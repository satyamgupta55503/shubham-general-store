const router = require('express').Router();
const ctrl = require('../../controllers/hrm/hrmAttendanceController');
const { hrmAuth, hrmAnyRole, hrmDeptScope } = require('../../middleware/hrmAuth');

router.use(hrmAuth, hrmDeptScope);

router.get('/',                    hrmAnyRole, ctrl.getDaily);
router.post('/',                   hrmAnyRole, ctrl.manualEntry);
router.get('/monthly',             hrmAnyRole, ctrl.getMonthly);
router.get('/regularizations',     hrmAnyRole, ctrl.listRegularizations);
router.patch('/regularizations/:id', hrmAnyRole, ctrl.reviewRegularization);

module.exports = router;
