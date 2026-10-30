const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmDashboardController');
const { crmAuth } = require('../../middleware/crmAuth');

router.get('/stats', crmAuth, ctrl.stats);

module.exports = router;
