const HrmDailyTask = require('../../models/hrm/HrmDailyTask');

const dayRange = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  const s = new Date(d); s.setHours(0,0,0,0);
  const e = new Date(d); e.setHours(23,59,59,999);
  return { start: s, end: e };
};

// ── My own tasks for a date ───────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const { date } = req.query;
    const { start, end } = dayRange(date);
    const tasks = await HrmDailyTask.find({
      employee: req.empUser._id, is_assigned: false,
      date: { $gte: start, $lte: end },
    }).sort({ start_time: 1, created_at: 1 }).lean();
    res.json(tasks.map(t => ({ ...t, id: t._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── HR-assigned tasks (all pending/active) ────────────────────────────────────
exports.assignedTasks = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { employee: req.empUser._id, is_assigned: true };
    if (status) filter.status = status;
    else filter.status = { $in: ['todo','in_progress','blocked'] }; // active ones by default
    const tasks = await HrmDailyTask.find(filter)
      .sort({ priority: -1, due_date: 1, created_at: -1 }).lean();
    res.json(tasks.map(t => ({ ...t, id: t._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── All HR-assigned tasks (including done) ────────────────────────────────────
exports.assignedHistory = async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : (() => { const d=new Date(); d.setDate(d.getDate()-29); d.setHours(0,0,0,0); return d; })();
    const end   = to   ? new Date(to)   : (() => { const d=new Date(); d.setHours(23,59,59,999); return d; })();
    const tasks = await HrmDailyTask.find({
      employee: req.empUser._id, is_assigned: true,
      created_at: { $gte: start, $lte: end },
    }).sort({ created_at: -1 }).lean();
    res.json(tasks.map(t => ({ ...t, id: t._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── History (own tasks, date range) ──────────────────────────────────────────
exports.history = async (req, res) => {
  try {
    const { from, to } = req.query;
    const start = from ? new Date(from) : (() => { const d=new Date(); d.setDate(d.getDate()-6); d.setHours(0,0,0,0); return d; })();
    const end   = to   ? new Date(to)   : (() => { const d=new Date(); d.setHours(23,59,59,999); return d; })();
    const tasks = await HrmDailyTask.find({
      employee: req.empUser._id, is_assigned: false,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1, start_time: 1 }).lean();
    const grouped = {};
    tasks.forEach(t => {
      const key = new Date(t.date).toISOString().split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push({ ...t, id: t._id });
    });
    res.json({ grouped, total: tasks.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Create own task ───────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { title, description, category, start_time, end_time, status, priority, project_name, project_tag, date, estimated_hours } = req.body;
    if (!title) return res.status(400).json({ message: 'title is required' });
    const { start } = dayRange(date);
    const task = await HrmDailyTask.create({
      employee: req.empUser._id, is_assigned: false,
      date: start, title: title.trim(),
      description: description||'', category: category||'other',
      start_time: start_time||'', end_time: end_time||'',
      status: status||'todo', priority: priority||'medium',
      project_name: project_name||'', project_tag: project_tag||'',
      estimated_hours: Number(estimated_hours)||0,
    });
    res.status(201).json(task.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Update task (own or HR-assigned status) ───────────────────────────────────
exports.update = async (req, res) => {
  try {
    const task = await HrmDailyTask.findOne({ _id: req.params.id, employee: req.empUser._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowed = ['title','description','category','start_time','end_time','status','priority','project_name','project_tag','estimated_hours'];
    // For HR-assigned tasks, only status, start/end time, and description editable by employee
    const empAllowed = task.is_assigned
      ? ['status','start_time','end_time','description']
      : allowed;
    empAllowed.forEach(f => { if (req.body[f] !== undefined) task[f] = req.body[f]; });
    await task.save();
    res.json(task.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Add comment (employee) ────────────────────────────────────────────────────
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text required' });
    const task = await HrmDailyTask.findOne({ _id: req.params.id, employee: req.empUser._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.comments.push({
      author_id:   req.empUser._id,
      author_name: req.empUser.full_name,
      author_role: 'employee',
      text: text.trim(),
    });
    await task.save();
    res.json(task.toJSON());
  } catch (err) { res.status(400).json({ message: err.message }); }
};

// ── Delete own task ───────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const task = await HrmDailyTask.findOneAndDelete({ _id: req.params.id, employee: req.empUser._id, is_assigned: false });
    if (!task) return res.status(404).json({ message: 'Task not found or cannot delete HR-assigned task' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Today's summary stats ─────────────────────────────────────────────────────
exports.summary = async (req, res) => {
  try {
    const { start, end } = dayRange(req.query.date);
    const [own, assigned] = await Promise.all([
      HrmDailyTask.find({ employee: req.empUser._id, is_assigned: false, date: { $gte: start, $lte: end } }).lean(),
      HrmDailyTask.find({ employee: req.empUser._id, is_assigned: true,  status: { $in:['todo','in_progress','blocked'] } }).lean(),
    ]);
    const calcStats = (arr) => ({
      total:       arr.length,
      done:        arr.filter(t=>t.status==='done').length,
      in_progress: arr.filter(t=>t.status==='in_progress').length,
      todo:        arr.filter(t=>t.status==='todo').length,
      blocked:     arr.filter(t=>t.status==='blocked').length,
      total_minutes: arr.reduce((s,t)=>s+(t.duration_minutes||0),0),
      total_hours:   +(arr.reduce((s,t)=>s+(t.duration_minutes||0),0)/60).toFixed(1),
    });
    res.json({
      own:      calcStats(own),
      assigned: { ...calcStats(assigned), overdue: assigned.filter(t=>t.is_overdue).length },
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
