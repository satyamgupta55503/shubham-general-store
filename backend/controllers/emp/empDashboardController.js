const HrmAttendance  = require('../../models/hrm/HrmAttendance');
const HrmLeave       = require('../../models/hrm/HrmLeave');
const HrmSalarySlip  = require('../../models/hrm/HrmSalarySlip');
const HrmEmployee    = require('../../models/hrm/HrmEmployee');

exports.stats = async (req, res) => {
  try {
    const emp     = req.empUser;
    const today   = new Date(); today.setHours(0,0,0,0);
    const todayEnd= new Date(today); todayEnd.setHours(23,59,59,999);
    const thisMonth  = today.getMonth()+1;
    const thisYear   = today.getFullYear();
    const monthStart = new Date(thisYear, thisMonth-1, 1);

    // Today's attendance
    const todayAtt = await HrmAttendance.findOne({ employee:emp._id, date:{ $gte:today, $lte:todayEnd } }).lean();

    // This month stats
    const monthAtts = await HrmAttendance.find({ employee:emp._id, date:{ $gte:monthStart, $lte:todayEnd } }).lean();
    const present   = monthAtts.filter(a=>['present','late','wfh'].includes(a.status)).length;
    const absent    = monthAtts.filter(a=>a.status==='absent').length;
    const late      = monthAtts.filter(a=>a.status==='late').length;

    // Pending leaves
    const pendingLeaves = await HrmLeave.countDocuments({ employee:emp._id, status:'pending' });
    const approvedThisMonth = await HrmLeave.countDocuments({ employee:emp._id, status:'approved', applied_on:{ $gte:monthStart } });

    // Latest salary slip
    const latestSlip = await HrmSalarySlip.findOne({ employee:emp._id }).sort({ year:-1, month:-1 }).lean();

    // Team members (same dept, active)
    const teamCount = emp.department
      ? await HrmEmployee.countDocuments({ department:emp.department._id||emp.department, status:'active', _id:{ $ne:emp._id } })
      : 0;

    // Next payday
    const nextPayday = new Date(thisYear, thisMonth, 1); // 1st of next month

    res.json({
      employee: { id:emp._id, full_name:emp.full_name, employee_id:emp.employee_id, department:emp.department, designation:emp.designation, date_of_joining:emp.date_of_joining, status:emp.status, profile_image:emp.profile_image },
      today_attendance:  todayAtt ? { ...todayAtt, id:todayAtt._id } : null,
      month_summary: { present, absent, late },
      leave_balance: emp.leave_balance,
      pending_leaves:   pendingLeaves,
      approved_leaves_this_month: approvedThisMonth,
      latest_salary_slip: latestSlip ? { id:latestSlip._id, month:latestSlip.month, year:latestSlip.year, net_salary:latestSlip.net_salary, pay_period:latestSlip.pay_period } : null,
      team_count:  teamCount,
      next_payday: nextPayday,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
