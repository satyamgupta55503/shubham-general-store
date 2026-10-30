const HrmHistory = require('../../models/hrm/HrmHistory');

exports.list = async (req, res) => {
  try {
    const { entity_type, entity_id, action, portal, limit=100, page=1 } = req.query;
    const filter = {};
    if (entity_type) filter.entity_type = entity_type;
    if (entity_id)   filter.entity_id   = entity_id;
    if (action)      filter.action      = action;
    if (portal)      filter.portal      = portal;
    const skip = (Number(page)-1)*Number(limit);
    const [logs, total] = await Promise.all([
      HrmHistory.find(filter).sort({ created_at:-1 }).skip(skip).limit(Number(limit)).lean(),
      HrmHistory.countDocuments(filter),
    ]);
    res.json({ logs: logs.map(l=>({...l,id:l._id})), total, page:Number(page), pages:Math.ceil(total/Number(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete a single history log
exports.deleteOne = async (req, res) => {
  try {
    await HrmHistory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Delete all logs (with optional filters — e.g. clear all, or clear by entity_type)
exports.deleteAll = async (req, res) => {
  try {
    const { entity_type, action } = req.body;
    const filter = {};
    if (entity_type) filter.entity_type = entity_type;
    if (action)      filter.action      = action;
    const result = await HrmHistory.deleteMany(filter);
    res.json({ deleted: result.deletedCount, message: `${result.deletedCount} record(s) deleted` });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
