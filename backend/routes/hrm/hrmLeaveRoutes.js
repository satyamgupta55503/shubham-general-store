const router = require('express').Router();
const ctrl = require('../../controllers/hrm/hrmLeaveController');
const { hrmAuth, hrmAdminOnly, hrmManagerOrAbove, hrmAnyRole, hrmDeptScope } = require('../../middleware/hrmAuth');

router.use(hrmAuth, hrmDeptScope);

router.get('/',                          hrmAnyRole,        ctrl.list);
router.get('/:id',                       hrmAnyRole,        ctrl.getOne);
router.post('/',                         hrmAnyRole,        ctrl.create);
router.patch('/:id/review',              hrmAnyRole,        ctrl.review);
router.get('/balance/:employee_id',      hrmAnyRole,        ctrl.getBalance);
router.post('/balance/:employee_id/adjust', hrmManagerOrAbove, ctrl.adjustBalance);
router.get('/types',                     hrmAnyRole,        ctrl.listTypes);
router.post('/types',                    hrmAdminOnly,      ctrl.createType);
router.patch('/types/:id',               hrmAdminOnly,      ctrl.updateType);

module.exports = router;
