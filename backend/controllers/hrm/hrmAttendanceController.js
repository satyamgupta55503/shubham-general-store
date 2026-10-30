const HrmAttendance      = require('../../models/hrm/HrmAttendance');
const HrmRegularization  = require('../../models/hrm/HrmRegularization');
const HrmEmployee        = require('../../models/hrm/HrmEmployee');
const HrmHistory         = require('../../models/hrm/HrmHistory');

const log = async (req, action, id, label, desc = '') => {
  try { await HrmHistory.create({ actor: req.hrmUser._id, actor_name: req.hrmUser.full_name, action, entity_type: 'attendance', entity_id: id, entity_label: label, description: desc }); } catch {}
};

// ── Daily attendance list ─────────────────────────────────────────────────────
exports.getDaily = async (req, res) => {
  try {
    const { date, department } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate); nextDay.setDate(nextDay.getDate() + 1);

    const empFilter = { status: 'active' };
    if (req.deptScope) empFilter.department = req.deptScope;
    if (department)    empFilter.department = department;

    const employees = await HrmEmployee.find(empFilter)
      .populate('department', 'name').populate('designation', 'title')
      .select('full_name employee_id department designation profile_image').lean();

    const records = await HrmAttendance.find({ date: { $gte: targetDate, $lt: nextDay } }).lean();
    const recMap  = Object.fromEntries(records.map(r => [r.employee, r]));

    const result = employees.map(emp => ({
      employee: { id: emp._id, full_name: emp.full_name, employee_id: emp.employee_id, department: emp.department, designation: emp.designation, profile_image: emp.profile_image },
      attendance: recMap[emp._id] ? { ...recMap[emp._id], id: recMap[emp._id]._id } : { status: 'absent', check_in: null, check_out: null, work_hours: 0 },
    }));

    // Summary stats
    const summary = { present: 0, late: 0, absent: 0, on_leave: 0, wfh: 0, total: result.length };
    result.forEach(r => {
      const s = r.attendance.status;
      if (s === 'present') summary.present++;
      else if (s === 'late') summary.late++;
      else if (s === 'on_leave') summary.on_leave++;
      else if (s === 'wfh') summary.wfh++;
      else summary.absent++;
    });

    res.json({ date: targetDate, records: result, summary });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Monthly attendance ────────────────────────────────────────────────────────
exports.getMonthly = async (req, res) => {
  try {
    const { month, year, employee_id, department } = req.query;
    const m = Number(month) || (new Date().getMonth() + 1);
    const y = Number(year)  || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate   = new Date(y, m, 0, 23, 59, 59, 999);

    const empFilter = { status: 'active' };
    if (req.deptScope) empFilter.department = req.deptScope;
    if (department)    empFilter.department = department;
    if (employee_id)   empFilter._id = employee_id;

    const employees = await HrmEmployee.find(empFilter)
      .populate('department', 'name').select('full_name employee_id department').lean();

    const records = await HrmAttendance.find({ date: { $gte: startDate, $lte: endDate } }).lean();
    const grouped = {};
    records.forEach(r => { if (!grouped[r.employee]) grouped[r.employee] = []; grouped[r.employee].push(r); });

    const working_days = await getWorkingDays(m, y);

    const result = employees.map(emp => {
      const recs = grouped[emp._id] || [];
      const present   = recs.filter(r => r.status === 'present').length;
      const late       = recs.filter(r => r.status === 'late').length;
      const absent     = recs.filter(r => r.status === 'absent').length;
      const on_leave   = recs.filter(r => r.status === 'on_leave').length;
      const half_day   = recs.filter(r => r.status === 'half_day').length;
      const wfh        = recs.filter(r => r.status === 'wfh').length;
      const lwp        = absent; // absent = LWP for payroll
      const total_work_hours = recs.reduce((s, r) => s + (r.work_hours || 0), 0);
      return {
        employee: { id: emp._id, full_name: emp.full_name, employee_id: emp.employee_id, department: emp.department },
        summary:  { working_days, present, late, absent, on_leave, half_day, wfh, lwp, total_work_hours },
        records:  recs.map(r => ({ ...r, id: r._id })),
      };
    });

    res.json({ month: m, year: y, working_days, report: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Utility — count working days (Mon-Fri) in month
async function getWorkingDays(month, year) {
  let count = 0;
  const days = new Date(year, month, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

// ── Manual attendance entry / override ───────────────────────────────────────
exports.manualEntry = async (req, res) => {
  try {
    const { employee, date, status, check_in, check_out, notes } = req.body;
    if (!employee || !date) return res.status(400).json({ message: 'employee and date required' });

    const d = new Date(date); d.setHours(0, 0, 0, 0);
    const checkInDate  = check_in  ? new Date(d.toDateString() + ' ' + check_in)  : null;
    const checkOutDate = check_out ? new Date(d.toDateString() + ' ' + check_out) : null;

    let work_hours = 0;
    if (checkInDate && checkOutDate) {
      work_hours = Math.max(0, (checkOutDate - checkInDate) / (1000 * 60 * 60));
    }

    const attendance = await HrmAttendance.findOneAndUpdate(
      { employee, date: d },
      { $set: { employee, date: d, status, check_in: checkInDate, check_out: checkOutDate, work_hours, marked_by: 'hr', notes: notes || '' } },
      { upsert: true, new: true }
    );
    await log(req, 'updated', attendance._id, `Attendance ${date}`, `Manual entry for employee`);
    res.json({ ...attendance.toObject(), id: attendance._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Regularization requests ────────────────────────────────────────────────────
exports.listRegularizations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const regs = await HrmRegularization.find(filter)
      .populate('employee', 'full_name employee_id profile_image')
      .sort({ created_at: -1 }).lean();
    res.json(regs.map(r => ({ ...r, id: r._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.reviewRegularization = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_note } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'status must be approved or rejected' });

    const reg = await HrmRegularization.findByIdAndUpdate(id, {
      status, rejection_note: rejection_note || '',
      reviewed_by: req.hrmUser._id, reviewed_at: new Date(),
    }, { new: true }).populate('employee', 'full_name employee_id');

    if (!reg) return res.status(404).json({ message: 'Request not found' });

    // If approved, update the attendance record
    if (status === 'approved') {
      const d = new Date(reg.date); d.setHours(0, 0, 0, 0);
      const checkIn  = new Date(d.toDateString() + ' ' + reg.req_check_in);
      const checkOut = new Date(d.toDateString() + ' ' + reg.req_check_out);
      const work_hours = Math.max(0, (checkOut - checkIn) / (1000 * 60 * 60));
      await HrmAttendance.findOneAndUpdate(
        { employee: reg.employee, date: d },
        { $set: { check_in: checkIn, check_out: checkOut, work_hours, status: 'present', regularization_requested: true, regularization_id: reg._id } },
        { upsert: true }
      );
    }
    await log(req, status === 'approved' ? 'approved' : 'rejected', reg._id, `Regularization ${reg.date?.toDateString()}`);
    res.json({ ...reg.toObject(), id: reg._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
