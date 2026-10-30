const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmProjectController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.use(crmAuth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.put('/:id', ctrl.update);
router.delete('/:id', crmManagerOrAbove, ctrl.remove);

module.exports = router;
