const HrmNotification = require('../../models/hrm/HrmNotification');

exports.list = async (req, res) => {
  try {
    const { is_read, limit=50 } = req.query;
    const filter = { $or: [{ recipient: req.empUser._id }, { recipient: null }] };
    if (is_read !== undefined) filter.is_read = is_read === 'true';
    const notifications = await HrmNotification.find(filter).sort({ created_at:-1 }).limit(Number(limit));
    const unread_count  = await HrmNotification.countDocuments({ $or:[{recipient:req.empUser._id},{recipient:null}], is_read:false });
    res.json({ notifications, unread_count });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await HrmNotification.updateMany({ $or:[{recipient:req.empUser._id},{recipient:null}], is_read:false }, { $set:{is_read:true} });
    res.json({ message: 'All marked as read' });
  } catch {}
};
