const SocialMessage = require("../models/SocialMessage");
const SocialIntegration = require("../models/SocialIntegration");

// Helper: get platform credentials
const getCredentials = async (platform) => {
  const integration = await SocialIntegration.findOne({ platform });
  return integration || null;
};

// ===================== WEBHOOKS (Public) =====================

// WhatsApp Webhook
exports.whatsappWebhook = async (req, res) => {
  try {
    // Webhook verification (GET)
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      const creds = await getCredentials("whatsapp");
      if (mode === "subscribe" && token === (creds?.apiKey || "verify_token")) {
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }

    // Incoming message
    const body = req.body;
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const msg = body.entry[0].changes[0].value.messages[0];
      const contact = body.entry[0].changes[0].value.contacts?.[0];
      await SocialMessage.create({
        platform: "whatsapp",
        chatId: msg.from,
        messageId: msg.id,
        from: { id: msg.from, name: contact?.profile?.name || msg.from, username: msg.from },
        text: msg.text?.body || "",
        type: "incoming",
        mediaType: msg.type !== "text" ? msg.type : null,
        timestamp: new Date(parseInt(msg.timestamp) * 1000),
      });
    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    res.status(200).json({ status: "ok" });
  }
};

// Facebook Webhook
exports.facebookWebhook = async (req, res) => {
  try {
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (mode === "subscribe" && token) {
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }

    const body = req.body;
    if (body.entry?.[0]?.messaging) {
      for (const event of body.entry[0].messaging) {
        if (event.message) {
          await SocialMessage.create({
            platform: "facebook",
            chatId: event.sender.id,
            messageId: event.message.mid,
            from: { id: event.sender.id, name: event.sender.id },
            text: event.message.text || "",
            type: "incoming",
            mediaType: event.message.attachments?.[0]?.type || null,
            mediaUrl: event.message.attachments?.[0]?.payload?.url || null,
            timestamp: new Date(event.timestamp),
          });
        }
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Facebook webhook error:", error);
    res.status(200).json({ status: "ok" });
  }
};

// Instagram Webhook
exports.instagramWebhook = async (req, res) => {
  try {
    if (req.method === "GET") {
      const mode = req.query["hub.mode"];
      const token = req.query["hub.verify_token"];
      const challenge = req.query["hub.challenge"];
      if (mode === "subscribe" && token) {
        return res.status(200).send(challenge);
      }
      return res.sendStatus(403);
    }

    const body = req.body;
    if (body.entry?.[0]?.messaging) {
      for (const event of body.entry[0].messaging) {
        if (event.message) {
          await SocialMessage.create({
            platform: "instagram",
            chatId: event.sender.id,
            messageId: event.message.mid,
            from: { id: event.sender.id, name: event.sender.id },
            text: event.message.text || "",
            type: "incoming",
            mediaType: event.message.attachments?.[0]?.type || null,
            mediaUrl: event.message.attachments?.[0]?.payload?.url || null,
            timestamp: new Date(event.timestamp),
          });
        }
      }
    }
    res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Instagram webhook error:", error);
    res.status(200).json({ status: "ok" });
  }
};

// ===================== ADMIN APIS (Protected) =====================

// Get all chats for a platform
exports.getChats = async (req, res) => {
  try {
    const { platform } = req.params;
    const chats = await SocialMessage.aggregate([
      { $match: { platform } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$text" },
          lastTimestamp: { $first: "$timestamp" },
          from: { $first: "$from" },
          unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$isRead", false] }, { $eq: ["$type", "incoming"] }] }, 1, 0] } },
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

// Get messages for a chat
exports.getChatMessages = async (req, res) => {
  try {
    const { platform, chatId } = req.params;
    const messages = await SocialMessage.find({ platform, chatId }).sort({ timestamp: 1 }).limit(200);
    await SocialMessage.updateMany({ platform, chatId, type: "incoming", isRead: false }, { isRead: true });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { platform } = req.params;
    const { chatId, text } = req.body;
    if (!chatId || !text) return res.status(400).json({ message: "chatId and text required" });

    const creds = await getCredentials(platform);
    if (!creds?.accessToken) return res.status(400).json({ message: `${platform} not connected` });

    let apiResponse;

    if (platform === "whatsapp") {
      const resp = await fetch(`https://graph.facebook.com/v18.0/${creds.phoneNumberId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${creds.accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to: chatId, type: "text", text: { body: text } }),
      });
      apiResponse = await resp.json();
      if (!apiResponse.messages) return res.status(400).json({ message: apiResponse.error?.message || "Send failed" });
    } else if (platform === "facebook") {
      const resp = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${creds.accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: { id: chatId }, message: { text } }),
      });
      apiResponse = await resp.json();
      if (!apiResponse.message_id && !apiResponse.recipient_id) return res.status(400).json({ message: apiResponse.error?.message || "Send failed" });
    } else if (platform === "instagram") {
      const resp = await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${creds.accessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: { id: chatId }, message: { text } }),
      });
      apiResponse = await resp.json();
      if (!apiResponse.message_id && !apiResponse.recipient_id) return res.status(400).json({ message: apiResponse.error?.message || "Send failed" });
    }

    // Save outgoing message
    const saved = await SocialMessage.create({
      platform, chatId, text, type: "outgoing", from: { id: "admin", name: "Admin" }, timestamp: new Date(),
    });

    res.status(200).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    await SocialMessage.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete entire chat
exports.deleteChat = async (req, res) => {
  try {
    const { platform, chatId } = req.params;
    await SocialMessage.deleteMany({ platform, chatId });
    res.status(200).json({ success: true, message: "Chat deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
