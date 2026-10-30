const HrmEmployee     = require('../../models/hrm/HrmEmployee');
const HrmAttendance   = require('../../models/hrm/HrmAttendance');
const HrmLeave        = require('../../models/hrm/HrmLeave');
const HrmPayroll      = require('../../models/hrm/HrmPayroll');
const HrmNotification = require('../../models/hrm/HrmNotification');

exports.stats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today); todayEnd.setHours(23, 59, 59, 999);

    const thisMonth = today.getMonth() + 1;
    const thisYear  = today.getFullYear();
    const monthStart = new Date(thisYear, thisMonth - 1, 1);

    const [
      totalEmployees, activeEmployees, onLeave, newJoinings,
      presentToday, lateToday, absentToday,
      pendingLeaves, thisMonthLeaves,
      currentPayroll,
      unreadNotif,
    ] = await Promise.all([
      HrmEmployee.countDocuments(),
      HrmEmployee.countDocuments({ status: 'active' }),
      HrmLeave.countDocuments({ status: 'approved', from_date: { $lte: todayEnd }, to_date: { $gte: today } }),
      HrmEmployee.countDocuments({ date_of_joining: { $gte: monthStart } }),
      HrmAttendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'present' }),
      HrmAttendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'late' }),
      HrmAttendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: 'absent' }),
      HrmLeave.countDocuments({ status: 'pending' }),
      HrmLeave.countDocuments({ applied_on: { $gte: monthStart } }),
      HrmPayroll.findOne({ month: thisMonth, year: thisYear }).lean(),
      HrmNotification.countDocuments({ $or: [{ recipient: req.hrmUser._id }, { recipient: null }], is_read: false }),
    ]);

    // Recent events
    const [recentEmployees, recentLeaves] = await Promise.all([
      HrmEmployee.find({ status: 'active' }).sort({ date_of_joining: -1 }).limit(5)
        .populate('department', 'name').populate('designation', 'title')
        .select('full_name employee_id department designation date_of_joining profile_image').lean(),
      HrmLeave.find({ status: 'pending' }).sort({ applied_on: -1 }).limit(5)
        .populate('employee', 'full_name employee_id profile_image')
        .populate('leave_type', 'name code').lean(),
    ]);

    // Department strength
    const deptStrength = await HrmEmployee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: { from: 'hrm_departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $project: { name: { $arrayElemAt: ['$dept.name', 0] }, count: 1 } },
    ]);

    // Attendance rate today
    const attendanceRate = totalEmployees > 0
      ? Math.round(((presentToday + lateToday) / totalEmployees) * 100)
      : 0;

    // Upcoming birthdays (next 7 days)
    const employees = await HrmEmployee.find({ status: 'active', date_of_birth: { $ne: null } })
      .select('full_name date_of_birth profile_image employee_id').lean();
    const upcomingBirthdays = employees.filter(e => {
      if (!e.date_of_birth) return false;
      const dob = new Date(e.date_of_birth);
      const next = new Date(today);
      next.setFullYear(today.getFullYear());
      next.setMonth(dob.getMonth());
      next.setDate(dob.getDate());
      if (next < today) next.setFullYear(today.getFullYear() + 1);
      return (next - today) / (1000 * 60 * 60 * 24) <= 7;
    }).slice(0, 5);

    res.json({
      counts: {
        total_employees: totalEmployees,
        active_employees: activeEmployees,
        on_leave_today: onLeave,
        new_joinings_this_month: newJoinings,
        present_today: presentToday,
        late_today: lateToday,
        absent_today: absentToday,
        pending_leaves: pendingLeaves,
        this_month_leaves: thisMonthLeaves,
      },
      attendance_rate: attendanceRate,
      payroll: currentPayroll || { status: 'not_started', month: thisMonth, year: thisYear },
      dept_strength: deptStrength,
      recent_employees: recentEmployees,
      recent_leave_requests: recentLeaves,
      upcoming_birthdays: upcomingBirthdays,
      unread_notifications: unreadNotif,
    });
  } catch (err) {
    console.error('HRM dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};
