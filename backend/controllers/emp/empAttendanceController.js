const HrmAttendance     = require('../../models/hrm/HrmAttendance');
const HrmRegularization = require('../../models/hrm/HrmRegularization');

exports.checkIn = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);

    let record = await HrmAttendance.findOne({ employee:req.empUser._id, date:{ $gte:today, $lte:todayEnd } });
    if (record && record.check_in) return res.status(400).json({ message: 'Already checked in today' });

    const now = new Date();
    const status = (() => {
      const h = now.getHours(), m = now.getMinutes();
      const totalMin = h*60+m;
      if (totalMin <= 9*60+45) return 'present'; // before 9:45 AM
      if (totalMin <= 10*60)   return 'late';     // 9:45-10:00 = late
      if (totalMin <= 13*60)   return 'half_day'; // after 10, before 1pm = half day
      return 'late';
    })();

    const location = req.body.location || 'office';
    const deviceInfo = req.headers['user-agent']?.substring(0,100) || '';

    if (record) {
      record.check_in = now; record.status = status; record.check_in_location = location; record.device_info = deviceInfo; record.marked_by = 'self';
      await record.save();
    } else {
      record = await HrmAttendance.create({ employee:req.empUser._id, date:today, check_in:now, status, check_in_location:location, device_info:deviceInfo, marked_by:'self' });
    }
    res.json({ ...record.toObject(), id:record._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.checkOut = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);

    const record = await HrmAttendance.findOne({ employee:req.empUser._id, date:{ $gte:today, $lte:todayEnd } });
    if (!record || !record.check_in) return res.status(400).json({ message: 'No check-in found for today' });
    if (record.check_out) return res.status(400).json({ message: 'Already checked out today' });

    const now = new Date();
    const hours = (now - record.check_in) / (1000*60*60);
    record.check_out = now;
    record.work_hours = Math.round(hours * 100) / 100;
    record.check_out_location = req.body.location || 'office';
    if (hours >= 9 && record.status === 'late') record.status = 'late';
    else if (hours < 4.5) record.status = 'half_day';
    await record.save();
    res.json({ ...record.toObject(), id:record._id });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.today = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const todayEnd = new Date(today); todayEnd.setHours(23,59,59,999);
    const rec = await HrmAttendance.findOne({ employee:req.empUser._id, date:{ $gte:today, $lte:todayEnd } }).lean();
    res.json(rec ? { ...rec, id:rec._id } : null);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.history = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = Number(month)||(new Date().getMonth()+1), y = Number(year)||new Date().getFullYear();
    const start = new Date(y,m-1,1), end = new Date(y,m,0,23,59,59);
    const records = await HrmAttendance.find({ employee:req.empUser._id, date:{ $gte:start, $lte:end } }).sort({ date:1 }).lean();
    res.json(records.map(r=>({ ...r, id:r._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.requestRegularization = async (req, res) => {
  try {
    const { date, req_check_in, req_check_out, reason } = req.body;
    if (!date || !req_check_in || !req_check_out || !reason)
      return res.status(400).json({ message: 'date, req_check_in, req_check_out and reason required' });

    const existing = await HrmRegularization.findOne({ employee:req.empUser._id, date:new Date(date) });
    if (existing && existing.status === 'pending')
      return res.status(400).json({ message: 'Regularization request already pending for this date' });

    const reg = await HrmRegularization.create({ employee:req.empUser._id, date:new Date(date), req_check_in, req_check_out, reason });
    res.status(201).json({ ...reg.toObject(), id:reg._id });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.myRegularizations = async (req, res) => {
  try {
    const regs = await HrmRegularization.find({ employee:req.empUser._id }).sort({ created_at:-1 }).lean();
    res.json(regs.map(r=>({ ...r, id:r._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
