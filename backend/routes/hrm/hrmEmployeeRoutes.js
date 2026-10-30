const router = require('express').Router();
const ctrl = require('../../controllers/hrm/hrmEmployeeController');
const upload = require('../../middleware/hrmUpload');
const { hrmAuth, hrmManagerOrAbove, hrmDeptScope, hrmAnyRole } = require('../../middleware/hrmAuth');

router.use(hrmAuth, hrmDeptScope);

router.get('/',            hrmAnyRole,         ctrl.list);
router.get('/:id',         hrmAnyRole,         ctrl.getOne);
router.post('/',           hrmManagerOrAbove,  ctrl.create);
router.patch('/:id',       hrmAnyRole,         ctrl.update);
router.put('/:id/deactivate', hrmManagerOrAbove, ctrl.deactivate);
router.post('/:id/reset-password', hrmManagerOrAbove, ctrl.resetPassword);
// ✅ Photo upload / delete (HR side)
router.post('/:id/photo',  hrmManagerOrAbove, upload.single('photo'), ctrl.uploadPhoto);
router.delete('/:id/photo',hrmManagerOrAbove, ctrl.deletePhoto);

module.exports = router;
