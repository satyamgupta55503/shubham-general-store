const HrmDepartment  = require('../../models/hrm/HrmDepartment');
const HrmDesignation = require('../../models/hrm/HrmDesignation');
const HrmEmployee    = require('../../models/hrm/HrmEmployee');
const HrmHistory     = require('../../models/hrm/HrmHistory');

const log = async (req, action, entity, id, label) => {
  try { await HrmHistory.create({ actor: req.hrmUser._id, actor_name: req.hrmUser.full_name, action, entity_type: entity, entity_id: id, entity_label: label }); } catch {}
};

// ── Departments ───────────────────────────────────────────────────────────────
exports.listDepts = async (req, res) => {
  try {
    const depts = await HrmDepartment.find({ is_active: true })
      .populate('hod', 'full_name work_email')
      .sort({ name: 1 }).lean();

    // Attach employee count
    const counts = await HrmEmployee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(counts.map(c => [c._id, c.count]));
    depts.forEach(d => { d.id = d._id; d.employee_count = countMap[d._id] || 0; });
    res.json(depts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createDept = async (req, res) => {
  try {
    const { name, description, hod } = req.body;
    if (!name) return res.status(400).json({ message: 'Department name required' });
    const dept = await HrmDepartment.create({ name: name.trim(), description: description || '', hod: hod || null });
    await log(req, 'created', 'department', dept._id, dept.name);
    res.status(201).json({ ...dept.toObject(), id: dept._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateDept = async (req, res) => {
  try {
    const dept = await HrmDepartment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    await log(req, 'updated', 'department', dept._id, dept.name);
    res.json({ ...dept.toObject(), id: dept._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteDept = async (req, res) => {
  try {
    const count = await HrmEmployee.countDocuments({ department: req.params.id, status: 'active' });
    if (count > 0) return res.status(400).json({ message: `Cannot delete — ${count} active employees in this department` });
    await HrmDepartment.findByIdAndUpdate(req.params.id, { is_active: false });
    res.json({ message: 'Department deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Designations ─────────────────────────────────────────────────────────────
exports.listDesigs = async (req, res) => {
  try {
    const { department } = req.query;
    const filter = { is_active: true };
    if (department) filter.department = department;
    const desigs = await HrmDesignation.find(filter)
      .populate('department', 'name').sort({ title: 1 }).lean();
    desigs.forEach(d => { d.id = d._id; });
    res.json(desigs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createDesig = async (req, res) => {
  try {
    const { title, department, level, description } = req.body;
    if (!title) return res.status(400).json({ message: 'Designation title required' });
    const desig = await HrmDesignation.create({ title: title.trim(), department: department || null, level: level || 'junior', description: description || '' });
    await log(req, 'created', 'designation', desig._id, desig.title);
    res.status(201).json({ ...desig.toObject(), id: desig._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateDesig = async (req, res) => {
  try {
    const desig = await HrmDesignation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!desig) return res.status(404).json({ message: 'Designation not found' });
    res.json({ ...desig.toObject(), id: desig._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteDesig = async (req, res) => {
  try {
    await HrmDesignation.findByIdAndUpdate(req.params.id, { is_active: false });
    res.json({ message: 'Designation deactivated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
