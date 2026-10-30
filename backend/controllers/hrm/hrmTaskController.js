const HrmDailyTask = require('../../models/hrm/HrmDailyTask');
const HrmEmployee  = require('../../models/hrm/HrmEmployee');

const dayRange = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const s = new Date(d); s.setHours(0,0,0,0);
  const e = new Date(d); e.setHours(23,59,59,999);
  return { start: s, end: e };
};

// ── HR: Daily log — all employees tasks for a date ────────────────────────────
exports.listByDate = async (req, res) => {
  try {
    const { date, department } = req.query;
    const { start, end } = dayRange(date);
    const empFilter = { status: { $in: ['active','probation'] } };
    if (req.deptScope)  empFilter.department = req.deptScope;
    if (department)     empFilter.department = department;

    const employees = await HrmEmployee.find(empFilter)
      .populate('department','name').populate('designation','title')
      .select('full_name employee_id department designation').lean();

    const tasks = await HrmDailyTask.find({
      employee: { $in: employees.map(e=>e._id) },
      is_assigned: false,
      date: { $gte: start, $lte: end },
    }).sort({ start_time:1 }).lean();

    const taskMap = {};
    tasks.forEach(t => { if(!taskMap[t.employee]) taskMap[t.employee]=[]; taskMap[t.employee].push({...t,id:t._id}); });

    const result = employees.map(emp => ({
      employee: { id:emp._id, full_name:emp.full_name, employee_id:emp.employee_id, department:emp.department?.name||'—', designation:emp.designation?.title||'—' },
      tasks:   taskMap[emp._id]||[],
      summary: {
        total:       (taskMap[emp._id]||[]).length,
        done:        (taskMap[emp._id]||[]).filter(t=>t.status==='done').length,
        in_progress: (taskMap[emp._id]||[]).filter(t=>t.status==='in_progress').length,
        todo:        (taskMap[emp._id]||[]).filter(t=>t.status==='todo').length,
        blocked:     (taskMap[emp._id]||[]).filter(t=>t.status==='blocked').length,
        total_hours: +((taskMap[emp._id]||[]).reduce((s,t)=>s+(t.duration_minutes||0),0)/60).toFixed(1),
      },
    }));

    const totals = { submitted: result.filter(r=>r.tasks.length>0).length, total_employees: employees.length, total_tasks: tasks.length, total_done: tasks.filter(t=>t.status==='done').length, total_hours: +(tasks.reduce((s,t)=>s+(t.duration_minutes||0),0)/60).toFixed(1) };
    res.json({ date: start, totals, employees: result });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── HR: Assign task to employee ───────────────────────────────────────────────
exports.assignTask = async (req, res) => {
  try {
    const { employee_id, title, description, category, priority, due_date, date, estimated_hours, project_name, project_tag } = req.body;
    if (!employee_id || !title) return res.status(400).json({ message: 'employee_id and title required' });

    const emp = await HrmEmployee.findById(employee_id).lean();
    if (!emp) return res.status(404).json({ message: 'Employee not found' });

    const taskDate = date ? new Date(date) : new Date(); taskDate.setHours(0,0,0,0);
    const task = await HrmDailyTask.create({
      employee:         employee_id,
      is_assigned:      true,
      assigned_by:      req.hrmUser._id,
      assigned_by_name: req.hrmUser.full_name,
      date:             taskDate,
      title:            title.trim(),
      description:      description||'',
      category:         category||'other',
      priority:         priority||'medium',
      due_date:         due_date ? new Date(due_date) : null,
      estimated_hours:  Number(estimated_hours)||0,
      project_name:     project_name||'',
      project_tag:      project_tag||'',
      status:           'todo',
    });
    res.status(201).json(task.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── HR: Bulk assign same task to multiple employees ───────────────────────────
exports.bulkAssign = async (req, res) => {
  try {
    const { employee_ids, title, description, category, priority, due_date, date, estimated_hours, project_name, project_tag } = req.body;
    if (!employee_ids?.length || !title) return res.status(400).json({ message: 'employee_ids[] and title required' });

    const taskDate = date ? new Date(date) : new Date(); taskDate.setHours(0,0,0,0);
    const docs = employee_ids.map(eid => ({
      employee: eid, is_assigned: true,
      assigned_by: req.hrmUser._id, assigned_by_name: req.hrmUser.full_name,
      date: taskDate, title: title.trim(),
      description: description||'', category: category||'other',
      priority: priority||'medium',
      due_date: due_date ? new Date(due_date) : null,
      estimated_hours: Number(estimated_hours)||0,
      project_name: project_name||'', project_tag: project_tag||'',
      status: 'todo',
    }));
    const tasks = await HrmDailyTask.insertMany(docs);
    res.status(201).json({ assigned: tasks.length, tasks: tasks.map(t=>t.toJSON()) });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── HR: View all assigned tasks (with filters) ────────────────────────────────
exports.listAssigned = async (req, res) => {
  try {
    const { employee_id, department, status, priority, project_tag, overdue } = req.query;
    const filter = { is_assigned: true };

    if (req.deptScope) {
      const empIds = await HrmEmployee.find({ department: req.deptScope }).distinct('_id');
      filter.employee = { $in: empIds };
    }
    if (employee_id) filter.employee = employee_id;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (project_tag) filter.project_tag = { $regex: project_tag, $options:'i' };
    if (overdue === 'true') filter.is_overdue = true;
    if (department && !req.deptScope) {
      const empIds = await HrmEmployee.find({ department }).distinct('_id');
      filter.employee = { $in: empIds };
    }

    const tasks = await HrmDailyTask.find(filter)
      .populate('employee','full_name employee_id department')
      .sort({ is_overdue:-1, priority:-1, due_date:1, created_at:-1 })
      .lean();

    res.json(tasks.map(t => ({ ...t, id: t._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── HR: Update assigned task ──────────────────────────────────────────────────
exports.updateAssigned = async (req, res) => {
  try {
    const task = await HrmDailyTask.findOne({ _id: req.params.id, is_assigned: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const fields = ['title','description','category','priority','status','due_date','estimated_hours','project_name','project_tag','hr_note','is_approved'];
    fields.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    if (req.body.is_approved !== undefined) { task.approved_by = req.hrmUser.full_name; task.approved_at = new Date(); }
    await task.save();
    res.json(task.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── HR: Delete assigned task ──────────────────────────────────────────────────
exports.deleteAssigned = async (req, res) => {
  try {
    await HrmDailyTask.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── HR: Add comment on any task ───────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });
    const task = await HrmDailyTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.comments.push({
      author_id:   req.hrmUser._id,
      author_name: req.hrmUser.full_name,
      author_role: 'hr',
      text: text.trim(),
    });
    await task.save();
    res.json(task.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── HR: Employee history (own + assigned) ────────────────────────────────────
exports.employeeHistory = async (req, res) => {
  try {
    const { employee_id, from, to } = req.query;
    if (!employee_id) return res.status(400).json({ message: 'employee_id required' });
    const start = from ? new Date(from) : (() => { const d=new Date(); d.setDate(d.getDate()-29); d.setHours(0,0,0,0); return d; })();
    const end   = to   ? new Date(to)   : (() => { const d=new Date(); d.setHours(23,59,59,999); return d; })();

    const [own, assigned] = await Promise.all([
      HrmDailyTask.find({ employee:employee_id, is_assigned:false, date:{$gte:start,$lte:end} }).sort({date:-1,start_time:1}).lean(),
      HrmDailyTask.find({ employee:employee_id, is_assigned:true,  created_at:{$gte:start,$lte:end} }).sort({created_at:-1}).lean(),
    ]);

    const groupByDate = (arr) => {
      const g = {};
      arr.forEach(t => { const k=new Date(t.date||t.created_at).toISOString().split('T')[0]; if(!g[k])g[k]=[]; g[k].push({...t,id:t._id}); });
      return g;
    };

    res.json({ own: { total:own.length, grouped:groupByDate(own) }, assigned: { total:assigned.length, tasks:assigned.map(t=>({...t,id:t._id})) } });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── HR: Team summary for date ─────────────────────────────────────────────────
exports.teamSummary = async (req, res) => {
  try {
    const { date } = req.query;
    const { start, end } = dayRange(date);
    const empFilter = { status: { $in:['active','probation'] } };
    if (req.deptScope) empFilter.department = req.deptScope;
    const employees = await HrmEmployee.find(empFilter).select('full_name employee_id department').lean();
    const [ownTasks, assignedTotal, overdue] = await Promise.all([
      HrmDailyTask.find({ employee:{$in:employees.map(e=>e._id)}, is_assigned:false, date:{$gte:start,$lte:end} }).lean(),
      HrmDailyTask.countDocuments({ employee:{$in:employees.map(e=>e._id)}, is_assigned:true, status:{$in:['todo','in_progress','blocked']} }),
      HrmDailyTask.countDocuments({ employee:{$in:employees.map(e=>e._id)}, is_assigned:true, is_overdue:true }),
    ]);
    const withTasks = new Set(ownTasks.map(t=>String(t.employee))).size;
    res.json({
      date: start,
      total_employees: employees.length,
      submitted_today: withTasks,
      no_submission:   employees.length - withTasks,
      total_own_tasks: ownTasks.length,
      total_done:      ownTasks.filter(t=>t.status==='done').length,
      total_hours:     +(ownTasks.reduce((s,t)=>s+(t.duration_minutes||0),0)/60).toFixed(1),
      pending_assigned: assignedTotal,
      overdue_tasks:    overdue,
      completion_rate:  ownTasks.length ? Math.round((ownTasks.filter(t=>t.status==='done').length/ownTasks.length)*100) : 0,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
