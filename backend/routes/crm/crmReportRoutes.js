const router = require('express').Router();
const ctrl   = require('../../controllers/crm/crmReportController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.use(crmAuth);
router.get('/',           crmManagerOrAbove, ctrl.full);       // GET /api/crm/reports
router.get('/reminders',  ctrl.reminders);                     // GET /api/crm/reports/reminders

module.exports = router;
