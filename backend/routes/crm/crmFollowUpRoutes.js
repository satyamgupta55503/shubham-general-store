const router = require('express').Router();
const ctrl   = require('../../controllers/crm/crmFollowUpController');
const { crmAuth, crmManagerOrAbove } = require('../../middleware/crmAuth');

router.use(crmAuth);

// Stats (before /:id to avoid conflict)
router.get('/stats',        ctrl.stats);

// Bulk update
router.patch('/bulk',       crmManagerOrAbove, ctrl.bulkUpdate);

// CRUD
router.get('/',             ctrl.list);
router.get('/:id',          ctrl.getOne);
router.post('/',            ctrl.create);
router.patch('/:id',        ctrl.update);
router.put('/:id',          ctrl.update);
router.delete('/:id',       crmManagerOrAbove, ctrl.remove);

// Email action
router.post('/:id/email',   ctrl.sendEmail);

module.exports = router;
