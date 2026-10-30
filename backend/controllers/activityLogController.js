const ActivityLog = require("../models/ActivityLog");

// Get all logs (superadmin)
exports.getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, platform, userId } = req.query;
    const filter = {};
    if (platform) filter.platform = platform;
    if (userId) filter.userId = userId;

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ActivityLog.countDocuments(filter);

    res.status(200).json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create log entry
exports.createLog = async (req, res) => {
  try {
    const { action, platform, details, metadata } = req.body;
    const log = await ActivityLog.create({
      userId: req.user.id,
      userName: req.body.userName || "",
      userRole: req.body.userRole || "",
      action,
      platform: platform || "system",
      details: details || "",
      metadata: metadata || {},
      ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "",
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete logs older than X days
exports.clearOldLogs = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const result = await ActivityLog.deleteMany({ createdAt: { $lt: cutoff } });
    res.status(200).json({ success: true, deleted: result.deletedCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
