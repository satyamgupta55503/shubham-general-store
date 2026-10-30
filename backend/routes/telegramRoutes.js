const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  webhook,
  getChats,
  getChatMessages,
  sendMessage,
  deleteMessage,
  deleteChat,
  setupWebhook,
  getBotInfo,
} = require("../controllers/telegramController");

// Webhook (public — Telegram sends updates here)
router.post("/webhook", webhook);

// Protected routes (admin panel)
router.get("/chats", auth, getChats);
router.get("/chats/:chatId", auth, getChatMessages);
router.post("/send", auth, sendMessage);
router.delete("/messages/:id", auth, deleteMessage);
router.delete("/chats/:chatId", auth, deleteChat);
router.post("/setup-webhook", auth, setupWebhook);
router.get("/bot-info", auth, getBotInfo);

module.exports = router;
