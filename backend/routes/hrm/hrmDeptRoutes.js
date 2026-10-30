const router = require('express').Router();
const ctrl = require('../../controllers/hrm/hrmDeptController');
const { hrmAuth, hrmAdminOnly, hrmManagerOrAbove, hrmAnyRole } = require('../../middleware/hrmAuth');

router.use(hrmAuth);

// Departments
router.get('/departments',        hrmAnyRole,        ctrl.listDepts);
router.post('/departments',       hrmAdminOnly,      ctrl.createDept);
router.patch('/departments/:id',  hrmAdminOnly,      ctrl.updateDept);
router.delete('/departments/:id', hrmAdminOnly,      ctrl.deleteDept);

// Designations
router.get('/designations',        hrmAnyRole,        ctrl.listDesigs);
router.post('/designations',       hrmAdminOnly,      ctrl.createDesig);
router.patch('/designations/:id',  hrmAdminOnly,      ctrl.updateDesig);
router.delete('/designations/:id', hrmAdminOnly,      ctrl.deleteDesig);

module.exports = router;
