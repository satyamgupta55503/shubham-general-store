const HrmEmployee   = require('../../models/hrm/HrmEmployee');
const HrmAttendance = require('../../models/hrm/HrmAttendance');
const HrmLeave      = require('../../models/hrm/HrmLeave');
const HrmPayroll    = require('../../models/hrm/HrmPayroll');
const HrmSalarySlip = require('../../models/hrm/HrmSalarySlip');

// ── Headcount Report ──────────────────────────────────────────────────────────
exports.headcount = async (req, res) => {
  try {
    const [total, active, probation, notice, resigned, terminated] = await Promise.all([
      HrmEmployee.countDocuments({}),
      HrmEmployee.countDocuments({ status: 'active' }),
      HrmEmployee.countDocuments({ status: 'probation' }),
      HrmEmployee.countDocuments({ status: 'notice_period' }),
      HrmEmployee.countDocuments({ status: 'resigned' }),
      HrmEmployee.countDocuments({ status: 'terminated' }),
    ]);

    // By dept
    const deptBreakdown = await HrmEmployee.aggregate([
      { $match: { status: { $in: ['active','probation'] } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'hrm_departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { dept_name: { $ifNull: [{ $arrayElemAt: ['$dept.name', 0] }, 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } },
    ]);

    // By type
    const typeBreakdown = await HrmEmployee.aggregate([
      { $match: { status: { $in: ['active','probation'] } } },
      { $group: { _id: '$employment_type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Monthly joinings last 12 months
    const twelveMonthsAgo = new Date(); twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11); twelveMonthsAgo.setDate(1);
    const monthlyJoinings = await HrmEmployee.aggregate([
      { $match: { date_of_joining: { $gte: twelveMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date_of_joining' }, month: { $month: '$date_of_joining' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({ total, active, probation, notice_period: notice, resigned, terminated, deptBreakdown, typeBreakdown, monthlyJoinings });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Attendance Summary Report ─────────────────────────────────────────────────
exports.attendance = async (req, res) => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year  = Number(req.query.year)  || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 0, 23, 59, 59);

    const employees = await HrmEmployee.find({ status: { $in: ['active','probation'] } })
      .populate('department', 'name').select('full_name employee_id department').lean();

    const records = await HrmAttendance.find({ date: { $gte: startDate, $lte: endDate } }).lean();

    const grouped = {};
    records.forEach(r => { if (!grouped[r.employee]) grouped[r.employee] = []; grouped[r.employee].push(r); });

    const report = employees.map(emp => {
      const recs    = grouped[emp._id] || [];
      const present = recs.filter(r => r.status === 'present').length;
      const late    = recs.filter(r => r.status === 'late').length;
      const absent  = recs.filter(r => r.status === 'absent').length;
      const leave   = recs.filter(r => r.status === 'on_leave').length;
      const wfh     = recs.filter(r => r.status === 'wfh').length;
      const hrs     = recs.reduce((s, r) => s + (r.work_hours || 0), 0);
      return { employee_id: emp.employee_id, full_name: emp.full_name, department: emp.department?.name || '—', present, late, absent, on_leave: leave, wfh, total_hours: Math.round(hrs * 10) / 10 };
    });

    // Totals
    const totals = report.reduce((acc, r) => ({
      present: acc.present + r.present, late: acc.late + r.late,
      absent:  acc.absent  + r.absent,  on_leave: acc.on_leave + r.on_leave,
      wfh: acc.wfh + r.wfh, total_hours: Math.round((acc.total_hours + r.total_hours) * 10) / 10,
    }), { present: 0, late: 0, absent: 0, on_leave: 0, wfh: 0, total_hours: 0 });

    res.json({ month, year, pay_period: `${new Date(year, month-1).toLocaleString('en-IN',{month:'long'})} ${year}`, employees: report, totals });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Leave Utilisation Report ──────────────────────────────────────────────────
exports.leave = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate   = new Date(year, 11, 31, 23, 59, 59);

    const leaves = await HrmLeave.find({ from_date: { $gte: startDate, $lte: endDate }, status: 'approved' })
      .populate('employee', 'full_name employee_id department')
      .populate('leave_type', 'code name').lean();

    // By type
    const byType = {};
    leaves.forEach(l => {
      const code = l.leave_type?.code || 'OTHER';
      if (!byType[code]) byType[code] = { code, name: l.leave_type?.name || code, total_days: 0, total_requests: 0 };
      byType[code].total_days += l.days || 0;
      byType[code].total_requests++;
    });

    // By month
    const byMonth = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, label: new Date(year, i).toLocaleString('en-IN', { month: 'short' }), days: 0, requests: 0 }));
    leaves.forEach(l => {
      const m = new Date(l.from_date).getMonth();
      byMonth[m].days += l.days || 0;
      byMonth[m].requests++;
    });

    res.json({ year, total_approved: leaves.length, total_days: leaves.reduce((s, l) => s + (l.days || 0), 0), byType: Object.values(byType), byMonth });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Payroll Cost Report ───────────────────────────────────────────────────────
exports.payroll = async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const payrolls = await HrmPayroll.find({ status: { $in: ['processed','paid'] } })
      .sort({ year: -1, month: -1 }).limit(months).lean();

    const totalSpent = payrolls.reduce((s, p) => s + (p.total_net || 0), 0);
    const avgNet     = payrolls.length ? Math.round(totalSpent / payrolls.length) : 0;

    res.json({ months: payrolls.length, total_paid: totalSpent, avg_monthly_net: avgNet, history: payrolls.map(p => ({ ...p, id: p._id })) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
