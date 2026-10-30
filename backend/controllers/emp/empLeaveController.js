const HrmLeave     = require('../../models/hrm/HrmLeave');
const HrmLeaveType = require('../../models/hrm/HrmLeaveType');
const HrmEmployee  = require('../../models/hrm/HrmEmployee');

exports.apply = async (req, res) => {
  try {
    const { leave_type, from_date, to_date, days, reason, session, attachment } = req.body;
    if (!leave_type || !from_date || !to_date || !days || !reason)
      return res.status(400).json({ message: 'leave_type, from_date, to_date, days and reason required' });

    const type = await HrmLeaveType.findById(leave_type).select('name code annual_quota').lean();
    if (!type) return res.status(400).json({ message: 'Invalid leave type' });

    // Check balance
    const code = type.code?.toLowerCase();
    const emp  = await HrmEmployee.findById(req.empUser._id).select('leave_balance full_name').lean();
    if (['el','sl','cl','ol'].includes(code)) {
      const balance = emp.leave_balance?.[code] || 0;
      if (balance < Number(days)) return res.status(400).json({ message: `Insufficient ${type.name} balance. Available: ${balance} days` });
    }

    const leave = await HrmLeave.create({
      employee: req.empUser._id,
      leave_type, leave_type_code: type.code,
      from_date: new Date(from_date), to_date: new Date(to_date),
      days: Number(days), reason, session: session||'full_day',
      attachment: attachment||'',
      status: 'pending',
      employee_name_snapshot: req.empUser.full_name,
    });
    res.status(201).json({ ...leave.toObject(), id:leave._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.myLeaves = async (req, res) => {
  try {
    const { status, year } = req.query;
    const filter = { employee: req.empUser._id };
    if (status) filter.status = status;
    if (year) {
      filter.from_date = { $gte:new Date(Number(year),0,1), $lte:new Date(Number(year),11,31) };
    }
    const leaves = await HrmLeave.find(filter)
      .populate('leave_type','name code')
      .sort({ applied_on:-1 }).lean();
    res.json(leaves.map(l=>({ ...l, id:l._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.cancel = async (req, res) => {
  try {
    const leave = await HrmLeave.findOne({ _id:req.params.id, employee:req.empUser._id });
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be cancelled' });
    leave.status = 'cancelled';
    await leave.save();
    res.json({ ...leave.toObject(), id:leave._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.balance = async (req, res) => {
  try {
    const emp = await HrmEmployee.findById(req.empUser._id).select('leave_balance').lean();
    res.json(emp.leave_balance);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.types = async (_req, res) => {
  try {
    const types = await HrmLeaveType.find({ is_active:true }).sort({ code:1 }).lean();
    res.json(types.map(t=>({ ...t, id:t._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
