const express = require("express");
const router  = express.Router();
const ctrl    = require("../../controllers/crm/crmLedgerController");
const { crmAuth, crmManagerOrAbove } = require("../../middleware/crmAuth");

// All ledger routes require CRM auth
router.use(crmAuth);

// Read — any CRM user
router.get("/",                   ctrl.list);
router.get("/clients/available",  ctrl.availableClients);
router.get("/:id",                ctrl.getOne);

// Write — manager or owner (superadmin-level access)
router.post  ("/",                        crmManagerOrAbove, ctrl.create);
router.post  ("/:id/entry",               crmManagerOrAbove, ctrl.addEntry);
router.put   ("/:id/entry/:entryId",      crmManagerOrAbove, ctrl.updateEntry);
router.delete("/:id/entry/:entryId",      crmManagerOrAbove, ctrl.deleteEntry);
router.delete("/:id",                     crmManagerOrAbove, ctrl.remove);

module.exports = router;
