const HrmLeave       = require('../../models/hrm/HrmLeave');
const HrmLeaveType   = require('../../models/hrm/HrmLeaveType');
const HrmEmployee    = require('../../models/hrm/HrmEmployee');
const HrmHistory     = require('../../models/hrm/HrmHistory');
const HrmNotification= require('../../models/hrm/HrmNotification');

const log = async (req, action, id, label, desc='') => {
  try { await HrmHistory.create({ actor:req.hrmUser._id, actor_name:req.hrmUser.full_name, action, entity_type:'leave', entity_id:id, entity_label:label, description:desc }); } catch {}
};

// ── Leave Types ────────────────────────────────────────────────────────────────
exports.listTypes = async (_req, res) => {
  try {
    const types = await HrmLeaveType.find().sort({ code: 1 }).lean();
    res.json(types.map(t => ({ ...t, id: t._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createType = async (req, res) => {
  try {
    const type = await HrmLeaveType.create(req.body);
    res.status(201).json({ ...type.toObject(), id: type._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateType = async (req, res) => {
  try {
    const type = await HrmLeaveType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) return res.status(404).json({ message: 'Leave type not found' });
    res.json({ ...type.toObject(), id: type._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Leave Requests ─────────────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const { status, department, employee_id, page=1, limit=50, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employee_id) filter.employee = employee_id;
    if (from || to) {
      filter.from_date = {};
      if (from) filter.from_date.$gte = new Date(from);
      if (to)   filter.from_date.$lte = new Date(to);
    }

    // Dept scope: only show employees of this dept
    if (req.deptScope || department) {
      const deptId = req.deptScope || department;
      const empIds = await HrmEmployee.find({ department: deptId }).distinct('_id');
      filter.employee = { $in: empIds };
    }

    const skip = (Number(page)-1) * Number(limit);
    const [leaves, total] = await Promise.all([
      HrmLeave.find(filter)
        .populate('employee','full_name employee_id profile_image')
        .populate('leave_type','name code')
        .sort({ applied_on: -1 }).skip(skip).limit(Number(limit)).lean(),
      HrmLeave.countDocuments(filter),
    ]);
    res.json({ leaves: leaves.map(l=>({...l,id:l._id})), total, page:Number(page), pages:Math.ceil(total/Number(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getOne = async (req, res) => {
  try {
    const leave = await HrmLeave.findById(req.params.id)
      .populate('employee','full_name employee_id')
      .populate('leave_type','name code annual_quota').lean();
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json({ ...leave, id: leave._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.review = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejection_note } = req.body;
    if (!['approved','rejected'].includes(status))
      return res.status(400).json({ message: 'status must be approved or rejected' });

    const leave = await HrmLeave.findById(id).populate('employee').populate('leave_type');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.status !== 'pending') return res.status(400).json({ message: 'Only pending leaves can be reviewed' });

    leave.status         = status;
    leave.rejection_note = rejection_note || '';
    leave.reviewed_by    = req.hrmUser._id;
    leave.reviewed_at    = new Date();
    await leave.save();

    // Update leave balance if approved
    if (status === 'approved') {
      const code = leave.leave_type?.code?.toLowerCase();
      if (code && ['el','sl','cl','ol'].includes(code)) {
        const balanceField = `leave_balance.${code}`;
        await HrmEmployee.findByIdAndUpdate(leave.employee._id, { $inc: { [balanceField]: -leave.days } });
      }
    }

    await log(req, status === 'approved' ? 'approved' : 'rejected', leave._id, `Leave ${leave.from_date?.toDateString()}`);
    await HrmNotification.create({
      recipient: null,
      event_type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
      title: `Leave ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `${leave.employee_name_snapshot}'s leave request has been ${status}`,
      reference_id: leave._id, reference_type: 'leave',
    });

    res.json({ ...leave.toObject(), id: leave._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Leave Balance ─────────────────────────────────────────────────────────────
exports.getBalance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const emp = await HrmEmployee.findById(employee_id).select('full_name employee_id leave_balance').lean();
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    res.json({ employee: { id: emp._id, full_name: emp.full_name, employee_id: emp.employee_id }, balance: emp.leave_balance });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.adjustBalance = async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { leave_type_code, days, reason } = req.body;
    const code = leave_type_code?.toLowerCase();
    if (!['el','sl','cl','ol'].includes(code)) return res.status(400).json({ message: 'Invalid leave type code' });
    const balanceField = `leave_balance.${code}`;
    const emp = await HrmEmployee.findByIdAndUpdate(employee_id, { $inc: { [balanceField]: Number(days) } }, { new: true }).select('full_name employee_id leave_balance');
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    await log(req, 'updated', employee_id, emp.full_name, `Leave balance adjusted: ${code} ${days > 0 ? '+' : ''}${days} (${reason})`);
    res.json({ employee: { id: emp._id, full_name: emp.full_name }, balance: emp.leave_balance });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Create leave (HR on behalf of employee) ────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { employee, leave_type, from_date, to_date, days, reason, session } = req.body;
    const emp  = await HrmEmployee.findById(employee).select('full_name').lean();
    const type = await HrmLeaveType.findById(leave_type).select('name code').lean();
    if (!emp || !type) return res.status(400).json({ message: 'Invalid employee or leave type' });

    const leave = await HrmLeave.create({
      employee, leave_type, from_date, to_date,
      days: Number(days), reason, session: session || 'full_day',
      leave_type_code: type.code,
      employee_name_snapshot: emp.full_name,
      status: 'pending',
    });
    await log(req, 'created', leave._id, `${emp.full_name} leave`, `Created leave request`);
    res.status(201).json({ ...leave.toObject(), id: leave._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};
