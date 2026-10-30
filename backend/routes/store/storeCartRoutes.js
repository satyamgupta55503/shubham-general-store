const express  = require("express");
const router   = express.Router();
const ctrl     = require("../../controllers/store/storeCartController");
const { optionalAuth, protect } = require("../../middleware/customerAuth");

router.use(optionalAuth);   // attach customer if logged in, allow guests

router.get   ("/",               ctrl.getCart);
router.post  ("/add",            ctrl.addToCart);
router.put   ("/update",         ctrl.updateCartItem);
router.delete("/item/:itemId",   ctrl.removeFromCart);
router.delete("/clear",          ctrl.clearCart);
router.post  ("/merge",          protect, ctrl.mergeCart);

module.exports = router;
