const CrmNotification = require('../../models/crm/CrmNotification');

exports.list = async (req, res) => {
  try {
    const { is_read, limit = 50 } = req.query;
    const filter = { $or: [{ user: req.crmUser._id }, { user: null }] };
    if (is_read !== undefined) filter.is_read = is_read === 'true';
    const notifications = await CrmNotification.find(filter).sort({ created_at: -1 }).limit(Number(limit));
    const unread_count = await CrmNotification.countDocuments({ $or: [{ user: req.crmUser._id }, { user: null }], is_read: false });
    res.json({ notifications, unread_count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    await CrmNotification.updateMany(
      { $or: [{ user: req.crmUser._id }, { user: null }], is_read: false },
      { $set: { is_read: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markOneRead = async (req, res) => {
  try {
    const n = await CrmNotification.findByIdAndUpdate(req.params.id, { is_read: true }, { new: true });
    if (!n) return res.status(404).json({ message: 'Notification not found' });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await CrmNotification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
