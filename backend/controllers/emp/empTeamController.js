const HrmEmployee = require('../../models/hrm/HrmEmployee');
const HrmHoliday  = require('../../models/hrm/HrmHoliday');
const HrmAnnouncement = require('../../models/hrm/HrmAnnouncement');

// ── Team directory — colleagues in same dept + all active employees ─────────
exports.team = async (req, res) => {
  try {
    const emp  = req.empUser;
    const { search, department } = req.query;

    const filter = { status: { $in: ['active','probation'] }, _id: { $ne: emp._id } };
    if (department) filter.department = department;
    if (search) {
      filter.$or = [
        { full_name:  { $regex: search, $options: 'i' } },
        { work_email: { $regex: search, $options: 'i' } },
      ];
    }

    const members = await HrmEmployee.find(filter)
      .populate('department',  'name')
      .populate('designation', 'title')
      .select('full_name work_email phone employee_id department designation date_of_joining status profile_image')
      .sort({ department: 1, full_name: 1 })
      .lean();

    // Group by department
    const grouped = {};
    members.forEach(m => {
      const dName = m.department?.name || 'General';
      if (!grouped[dName]) grouped[dName] = [];
      grouped[dName].push({
        id:             m._id,
        full_name:      m.full_name,
        work_email:     m.work_email,
        phone:          m.phone || '',
        employee_id:    m.employee_id,
        department:     m.department?.name || '—',
        designation:    m.designation?.title || '—',
        date_of_joining: m.date_of_joining,
        status:         m.status,
        profile_image:  m.profile_image || null,
        initials:       m.full_name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase(),
      });
    });

    res.json({ total: members.length, grouped });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── EMP: get live holidays ────────────────────────────────────────────────────
exports.holidays = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const holidays = await HrmHoliday.find({ year, is_active: true }).sort({ date: 1 }).lean();
    res.json(holidays.map(h => ({ ...h, id: h._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── EMP: get live announcements ───────────────────────────────────────────────
exports.announcements = async (req, res) => {
  try {
    const now = new Date();
    const empId = req.empUser._id;
    const list = await HrmAnnouncement.find({
      is_active: true,
      $and: [
        { $or: [{ publish_at: null }, { publish_at: { $lte: now } }] },
        { $or: [{ expires_at: null }, { expires_at: { $gte: now } }] },
      ],
    }).sort({ priority: -1, created_at: -1 }).lean();

    res.json(list.map(a => ({ ...a, id: a._id, is_read: (a.read_by || []).includes(empId) })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── EMP: mark announcement read ───────────────────────────────────────────────
exports.markAnnouncementRead = async (req, res) => {
  try {
    const empId = req.empUser._id;
    await HrmAnnouncement.findByIdAndUpdate(req.params.id, { $addToSet: { read_by: empId } });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
