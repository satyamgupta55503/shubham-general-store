const router = require('express').Router();
const ctrl   = require('../../controllers/hrm/hrmHolidayController');
const { hrmAuth, hrmManagerOrAbove, hrmAnyRole } = require('../../middleware/hrmAuth');

router.use(hrmAuth);

router.get('/',            hrmAnyRole,        ctrl.list);
router.post('/',           hrmManagerOrAbove, ctrl.create);
router.patch('/:id',       hrmManagerOrAbove, ctrl.update);
router.delete('/:id',      hrmManagerOrAbove, ctrl.remove);
router.post('/import-preset', hrmManagerOrAbove, ctrl.importPreset);

module.exports = router;
