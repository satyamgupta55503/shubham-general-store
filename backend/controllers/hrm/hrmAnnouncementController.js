const HrmAnnouncement = require('../../models/hrm/HrmAnnouncement');

const isLive = (a) => {
  const now = Date.now();
  if (!a.is_active) return false;
  if (a.publish_at && new Date(a.publish_at).getTime() > now) return false;
  if (a.expires_at && new Date(a.expires_at).getTime() < now) return false;
  return true;
};

// ── HRM: list all (admin view — draft + live) ─────────────────────────────────
exports.listAll = async (req, res) => {
  try {
    const announcements = await HrmAnnouncement.find()
      .sort({ created_at: -1 }).lean();
    res.json(announcements.map(a => ({ ...a, id: a._id, is_live: isLive(a) })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── EMP: list live announcements (employee view) ──────────────────────────────
exports.listLive = async (req, res) => {
  try {
    const now = new Date();
    const announcements = await HrmAnnouncement.find({
      is_active: true,
      $or: [{ publish_at: null }, { publish_at: { $lte: now } }],
      $or: [{ expires_at: null }, { expires_at: { $gte: now } }],
    }).sort({ priority: -1, created_at: -1 }).lean();

    // mark read status for this employee
    const empId = req.empUser?._id;
    res.json(announcements.map(a => ({
      ...a, id: a._id,
      is_read: empId ? a.read_by?.includes(empId) : false,
    })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Create ────────────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { title, body, priority, publish_at, expires_at, target_departments } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'title and body required' });
    const a = await HrmAnnouncement.create({
      title, body,
      priority:    priority    || 'medium',
      publish_at:  publish_at  ? new Date(publish_at)  : null,
      expires_at:  expires_at  ? new Date(expires_at)  : null,
      target_departments: target_departments || [],
      created_by:      req.hrmUser?._id || null,
      created_by_name: req.hrmUser?.full_name || 'HR',
    });
    res.status(201).json(a.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Update ────────────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { title, body, priority, publish_at, expires_at, is_active, target_departments } = req.body;
    const update = {};
    if (title        !== undefined) update.title        = title;
    if (body         !== undefined) update.body         = body;
    if (priority     !== undefined) update.priority     = priority;
    if (is_active    !== undefined) update.is_active    = is_active;
    if (target_departments !== undefined) update.target_departments = target_departments;
    if (publish_at !== undefined) update.publish_at = publish_at ? new Date(publish_at) : null;
    if (expires_at !== undefined) update.expires_at = expires_at ? new Date(expires_at) : null;

    const a = await HrmAnnouncement.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!a) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ ...a.toJSON(), is_live: isLive(a.toJSON()) });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Delete ────────────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    await HrmAnnouncement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── EMP: mark read ────────────────────────────────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const empId = req.empUser._id;
    await HrmAnnouncement.findByIdAndUpdate(req.params.id, {
      $addToSet: { read_by: empId },
    });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
