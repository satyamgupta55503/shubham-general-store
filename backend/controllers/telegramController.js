const TelegramMessage = require("../models/TelegramMessage");
const SocialIntegration = require("../models/SocialIntegration");

// Get bot token from DB
const getBotToken = async () => {
  const integration = await SocialIntegration.findOne({ platform: "telegram" });
  return integration?.accessToken || null;
};

// Webhook handler — receives messages from Telegram
exports.webhook = async (req, res) => {
  try {
    const update = req.body;

    if (update.message) {
      const msg = update.message;
      await TelegramMessage.create({
        chatId: String(msg.chat.id),
        messageId: msg.message_id,
        from: {
          id: msg.from.id,
          firstName: msg.from.first_name || "",
          lastName: msg.from.last_name || "",
          username: msg.from.username || "",
        },
        text: msg.text || "",
        type: "incoming",
        mediaType: msg.photo ? "photo" : msg.video ? "video" : msg.document ? "document" : msg.voice ? "voice" : null,
        timestamp: new Date(msg.date * 1000),
      });

      // Auto-reply if configured (simple echo for now)
      // Can be extended with keyword-based routing
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
};

// Get all chats (grouped by chatId, latest message first)
exports.getChats = async (req, res) => {
  try {
    const chats = await TelegramMessage.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" },
          from: { $first: "$from" },
          unreadCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$type", "incoming"] }] }, 1, 0] },
          },
          totalMessages: { $sum: 1 },
        },
      },
      { $sort: { lastTimestamp: -1 } },
    ]);

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a specific chat
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await TelegramMessage.find({ chatId }).sort({ timestamp: 1 }).limit(100);

    // Mark as read
    await TelegramMessage.updateMany({ chatId, type: "incoming", isRead: false }, { isRead: true });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ message: "chatId and text are required" });
    }

    const botToken = await getBotToken();
    if (!botToken) {
      return res.status(400).json({ message: "Telegram bot not connected. Add bot token in Integrations." });
    }

    // Send via Telegram API
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });

    const data = await response.json();

    if (!data.ok) {
      return res.status(400).json({ message: data.description || "Failed to send" });
    }

    // Save outgoing message
    const saved = await TelegramMessage.create({
      chatId: String(chatId),
      messageId: data.result.message_id,
      from: { id: data.result.from.id, firstName: "Bot", username: data.result.from.username || "" },
      text,
      type: "outgoing",
      timestamp: new Date(data.result.date * 1000),
    });

    res.status(200).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message from DB
exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    await TelegramMessage.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete entire chat
exports.deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await TelegramMessage.deleteMany({ chatId });
    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Setup webhook URL with Telegram
exports.setupWebhook = async (req, res) => {
  try {
    const { webhookUrl } = req.body;
    const botToken = await getBotToken();

    if (!botToken) {
      return res.status(400).json({ message: "No bot token found" });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `${webhookUrl}/api/telegram/webhook` }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get bot info
exports.getBotInfo = async (req, res) => {
  try {
    const botToken = await getBotToken();
    if (!botToken) {
      return res.status(400).json({ message: "No bot token" });
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
