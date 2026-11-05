const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmOrderSheetController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.use(crmAuth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getOne);
router.post('/', crmManagerOrAbove, ctrl.create);
router.post('/:id/send', crmManagerOrAbove, ctrl.sendToCustomer);
router.patch('/:id', crmManagerOrAbove, ctrl.update);
router.put('/:id', crmManagerOrAbove, ctrl.update);
router.delete('/:id', crmManagerOrAbove, ctrl.remove);

module.exports = router;
