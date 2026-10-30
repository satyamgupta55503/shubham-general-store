const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmHistoryController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.get('/',              crmAuth, crmManagerOrAbove, ctrl.list);
router.get('/entity/:type/:id', crmAuth, ctrl.entityHistory);  // per-entity version control
router.get('/stats',         crmAuth, crmManagerOrAbove, ctrl.stats);

module.exports = router;
