const SocialIntegration = require("../models/SocialIntegration");

// Get all integrations
exports.getAllIntegrations = async (req, res) => {
  try {
    const integrations = await SocialIntegration.find();
    res.status(200).json(integrations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single integration by platform
exports.getByPlatform = async (req, res) => {
  try {
    const integration = await SocialIntegration.findOne({ platform: req.params.platform });
    if (!integration) {
      return res.status(404).json({ message: "Integration not found" });
    }
    res.status(200).json(integration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or Update integration (upsert)
exports.upsertIntegration = async (req, res) => {
  try {
    const { platform, apiKey, phoneNumberId, pageId, accessToken, webhookSecret } = req.body;

    if (!platform) {
      return res.status(400).json({ message: "Platform is required" });
    }

    const updateData = {};
    if (apiKey !== undefined) updateData.apiKey = apiKey;
    if (phoneNumberId !== undefined) updateData.phoneNumberId = phoneNumberId;
    if (pageId !== undefined) updateData.pageId = pageId;
    if (accessToken !== undefined) updateData.accessToken = accessToken;
    if (webhookSecret !== undefined) updateData.webhookSecret = webhookSecret;

    // Check if at least one key is provided to mark as connected
    const hasKeys = apiKey || accessToken || phoneNumberId || pageId;
    updateData.isConnected = !!hasKeys;
    if (hasKeys) updateData.lastSyncedAt = new Date();

    const integration = await SocialIntegration.findOneAndUpdate(
      { platform },
      { $set: updateData, $setOnInsert: { platform } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: integration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disconnect (remove keys)
exports.disconnectIntegration = async (req, res) => {
  try {
    const integration = await SocialIntegration.findOneAndUpdate(
      { platform: req.params.platform },
      {
        $set: {
          apiKey: "",
          phoneNumberId: "",
          pageId: "",
          accessToken: "",
          webhookSecret: "",
          isConnected: false,
          lastSyncedAt: null,
        },
      },
      { new: true }
    );

    if (!integration) {
      return res.status(404).json({ message: "Integration not found" });
    }

    res.status(200).json({ success: true, message: "Disconnected", data: integration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete integration
exports.deleteIntegration = async (req, res) => {
  try {
    const result = await SocialIntegration.findOneAndDelete({ platform: req.params.platform });
    if (!result) {
      return res.status(404).json({ message: "Integration not found" });
    }
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
