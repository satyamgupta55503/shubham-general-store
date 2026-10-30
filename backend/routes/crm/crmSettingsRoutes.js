const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmSettingsController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.get('/',                          crmAuth, ctrl.get);
router.put('/',                          crmAuth, crmManagerOrAbove, ctrl.update);
router.patch('/',                        crmAuth, crmManagerOrAbove, ctrl.update);
router.post('/test-smtp',               crmAuth, crmManagerOrAbove, ctrl.testSmtp);
router.get('/history',                   crmAuth, ctrl.getHistory);
router.get('/history/:type/:id',         crmAuth, ctrl.getEntityHistory);

module.exports = router;
