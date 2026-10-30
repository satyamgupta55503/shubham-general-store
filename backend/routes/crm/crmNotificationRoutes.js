const router = require('express').Router();
const ctrl = require('../../controllers/crm/crmNotificationController');
const { crmAuth } = require('../../middleware/crmAuth');

router.use(crmAuth);
router.get('/', ctrl.list);
router.post('/mark-all-read', ctrl.markRead);
router.patch('/:id/read', ctrl.markOneRead);
router.delete('/:id', ctrl.remove);

module.exports = router;
