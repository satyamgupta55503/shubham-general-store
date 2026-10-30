const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmPaymentController');
const { crmAuth, crmFinanceOrAbove, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.use(crmAuth, crmFinanceOrAbove);
router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.delete('/:id', crmManagerOrAbove, ctrl.remove);

module.exports = router;
