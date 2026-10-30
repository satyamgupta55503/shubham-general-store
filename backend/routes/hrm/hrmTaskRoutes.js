const router = require('express').Router();
const ctrl   = require('../../controllers/hrm/hrmTaskController');
const { hrmAuth, hrmAnyRole, hrmManagerOrAbove, hrmDeptScope } = require('../../middleware/hrmAuth');

router.use(hrmAuth, hrmDeptScope);

// Daily employee log (read)
router.get('/daily',            hrmAnyRole,        ctrl.listByDate);
router.get('/summary',          hrmAnyRole,        ctrl.teamSummary);
router.get('/employee-history', hrmAnyRole,        ctrl.employeeHistory);

// HR-assigned tasks CRUD
router.get('/assigned',         hrmAnyRole,        ctrl.listAssigned);
router.post('/assign',          hrmManagerOrAbove, ctrl.assignTask);
router.post('/bulk-assign',     hrmManagerOrAbove, ctrl.bulkAssign);
router.patch('/assigned/:id',   hrmManagerOrAbove, ctrl.updateAssigned);
router.delete('/assigned/:id',  hrmManagerOrAbove, ctrl.deleteAssigned);

// Comments (HR can comment on any task)
router.post('/:id/comment',     hrmAnyRole,        ctrl.addComment);

module.exports = router;
