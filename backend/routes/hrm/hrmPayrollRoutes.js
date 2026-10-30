const router = require('express').Router();
const ctrl = require('../../controllers/hrm/hrmPayrollController');
const { hrmAuth, hrmManagerOrAbove } = require('../../middleware/hrmAuth');

router.use(hrmAuth, hrmManagerOrAbove);

// Specific string routes MUST come before param routes to avoid conflicts
router.get('/slips',                       ctrl.listSlips);
router.get('/slips/:id',                   ctrl.getSlip);
router.post('/preview',                    ctrl.preview);
router.post('/process',                    ctrl.process);

// Param routes last
router.get('/',                            ctrl.list);
router.get('/:month/:year',                ctrl.getOne);
router.patch('/:month/:year/mark-paid',    ctrl.markPaid);

module.exports = router;
