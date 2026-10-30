const router = require('express').Router();
const ctrl   = require('../../controllers/hrm/hrmAnnouncementController');
const { hrmAuth, hrmManagerOrAbove, hrmAnyRole } = require('../../middleware/hrmAuth');

router.use(hrmAuth);

router.get('/',        hrmAnyRole,        ctrl.listAll);
router.post('/',       hrmManagerOrAbove, ctrl.create);
router.patch('/:id',   hrmManagerOrAbove, ctrl.update);
router.delete('/:id',  hrmManagerOrAbove, ctrl.remove);

module.exports = router;
