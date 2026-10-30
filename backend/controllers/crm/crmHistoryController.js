const CrmHistory = require('../../models/crm/CrmHistory');

/* ── Full list (paginated) ── */
exports.list = async (req, res) => {
  try {
    const { entity_type, entity_id, actor, action, search, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (entity_type) filter.entity_type = entity_type;
    if (entity_id)   filter.entity_id   = entity_id;
    if (actor)       filter.actor       = actor;
    if (action)      filter.action      = action;
    if (search) {
      filter.$or = [
        { description:    { $regex: search, $options: 'i' } },
        { actor_name:     { $regex: search, $options: 'i' } },
        { entity_label:   { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      CrmHistory.find(filter).sort({ created_at: -1 }).skip(skip).limit(Number(limit)),
      CrmHistory.countDocuments(filter),
    ]);
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Entity-level version control history ── */
exports.entityHistory = async (req, res) => {
  try {
    const { type, id } = req.params;
    const logs = await CrmHistory.find({ entity_type: type, entity_id: id })
      .sort({ created_at: -1 })
      .limit(200);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── Activity stats for reports ── */
exports.stats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));

    const [byAction, byEntity, byUser, recent] = await Promise.all([
      CrmHistory.aggregate([
        { $match: { created_at: { $gte: since } } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      CrmHistory.aggregate([
        { $match: { created_at: { $gte: since } } },
        { $group: { _id: '$entity_type', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      CrmHistory.aggregate([
        { $match: { created_at: { $gte: since } } },
        { $group: { _id: '$actor_name', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      CrmHistory.find({ created_at: { $gte: since } })
        .sort({ created_at: -1 })
        .limit(20),
    ]);

    res.json({ by_action: byAction, by_entity: byEntity, by_user: byUser, recent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
