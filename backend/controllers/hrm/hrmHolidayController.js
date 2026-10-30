const HrmHoliday = require('../../models/hrm/HrmHoliday');

// ── List holidays (with optional year filter) ─────────────────────────────────
exports.list = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const holidays = await HrmHoliday.find({ year, is_active: true })
      .sort({ date: 1 }).lean();
    res.json(holidays.map(h => ({ ...h, id: h._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Create holiday ────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { name, date, type, description } = req.body;
    if (!name || !date) return res.status(400).json({ message: 'name and date required' });
    const d = new Date(date);
    const year = d.getFullYear();
    const holiday = await HrmHoliday.create({ name, date: d, type: type || 'national', description: description || '', year });
    res.status(201).json({ ...holiday.toJSON() });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Update holiday ────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { name, date, type, description, is_active } = req.body;
    const update = {};
    if (name        !== undefined) update.name        = name;
    if (type        !== undefined) update.type        = type;
    if (description !== undefined) update.description = description;
    if (is_active   !== undefined) update.is_active   = is_active;
    if (date) {
      const d = new Date(date);
      update.date = d;
      update.year = d.getFullYear();
    }
    const holiday = await HrmHoliday.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!holiday) return res.status(404).json({ message: 'Holiday not found' });
    res.json(holiday.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Delete holiday ────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    await HrmHoliday.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Import preset holidays (India 2025 / 2026) ───────────────────────────────
exports.importPreset = async (req, res) => {
  try {
    const year = Number(req.body.year) || new Date().getFullYear();

    const presets = {
      2025: [
        { name: 'New Year\'s Day',        date: `${year}-01-01`, type: 'national' },
        { name: 'Republic Day',           date: `${year}-01-26`, type: 'national' },
        { name: 'Holi',                   date: `${year}-03-14`, type: 'national' },
        { name: 'Good Friday',            date: `${year}-04-18`, type: 'national' },
        { name: 'Ambedkar Jayanti',       date: `${year}-04-14`, type: 'national' },
        { name: 'Labour Day',             date: `${year}-05-01`, type: 'national' },
        { name: 'Independence Day',       date: `${year}-08-15`, type: 'national' },
        { name: 'Gandhi Jayanti',         date: `${year}-10-02`, type: 'national' },
        { name: 'Dussehra',               date: `${year}-10-02`, type: 'national' },
        { name: 'Diwali',                 date: `${year}-10-20`, type: 'national' },
        { name: 'Christmas Day',          date: `${year}-12-25`, type: 'national' },
      ],
      2026: [
        { name: 'New Year\'s Day',        date: `${year}-01-01`, type: 'national' },
        { name: 'Republic Day',           date: `${year}-01-26`, type: 'national' },
        { name: 'Holi',                   date: `${year}-03-03`, type: 'national' },
        { name: 'Good Friday',            date: `${year}-04-03`, type: 'national' },
        { name: 'Ambedkar Jayanti',       date: `${year}-04-14`, type: 'national' },
        { name: 'Labour Day',             date: `${year}-05-01`, type: 'national' },
        { name: 'Independence Day',       date: `${year}-08-15`, type: 'national' },
        { name: 'Gandhi Jayanti',         date: `${year}-10-02`, type: 'national' },
        { name: 'Dussehra',               date: `${year}-10-20`, type: 'national' },
        { name: 'Diwali',                 date: `${year}-11-08`, type: 'national' },
        { name: 'Christmas Day',          date: `${year}-12-25`, type: 'national' },
      ],
    };

    const list = presets[year] || presets[2026];
    // Remove existing for year then insert fresh
    await HrmHoliday.deleteMany({ year });
    const docs = await HrmHoliday.insertMany(
      list.map(h => ({ name: h.name, date: new Date(h.date), type: h.type, year, is_active: true }))
    );
    res.json({ inserted: docs.length, year });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
