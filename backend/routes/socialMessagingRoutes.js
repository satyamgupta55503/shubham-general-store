const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  whatsappWebhook,
  facebookWebhook,
  instagramWebhook,
  getChats,
  getChatMessages,
  sendMessage,
  deleteMessage,
  deleteChat,
} = require("../controllers/socialMessagingController");

// Webhooks (public — platforms send updates here)
router.get("/whatsapp/webhook", whatsappWebhook);   // Verification
router.post("/whatsapp/webhook", whatsappWebhook);  // Messages
router.get("/facebook/webhook", facebookWebhook);
router.post("/facebook/webhook", facebookWebhook);
router.get("/instagram/webhook", instagramWebhook);
router.post("/instagram/webhook", instagramWebhook);

// Admin APIs (protected)
router.get("/:platform/chats", auth, getChats);
router.get("/:platform/chats/:chatId", auth, getChatMessages);
router.post("/:platform/send", auth, sendMessage);
router.delete("/messages/:id", auth, deleteMessage);
router.delete("/:platform/chats/:chatId", auth, deleteChat);

module.exports = router;
