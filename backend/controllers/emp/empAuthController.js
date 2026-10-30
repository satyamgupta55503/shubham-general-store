const jwt         = require('jsonwebtoken');
const HrmEmployee = require('../../models/hrm/HrmEmployee');
const HrmHistory  = require('../../models/hrm/HrmHistory');
const HrmSettings = require('../../models/hrm/HrmSettings');

const signToken = (emp) =>
  jwt.sign(
    { id: emp._id, portal: 'emp', tv: emp.token_version || 0 },
    process.env.JWT_EMP_SECRET || process.env.JWT_SECRET,  // ✅ portal-specific secret
    { expiresIn: '12h' }
  );

const log = async (actorId, actorName, action, desc='', ip='') => {
  try { await HrmHistory.create({ actor:actorId, actor_name:actorName, action, entity_type:'employee', entity_id:actorId, entity_label:actorName, description:desc, ip_address:ip, portal:'emp' }); } catch {}
};

exports.login = async (req, res) => {
  try {
    const { work_email, password } = req.body;
    if (!work_email || !password)
      return res.status(400).json({ message: 'work_email and password required' });

    const settings = await HrmSettings.findById('hrm_settings').lean() || {};
    const maxAttempts = settings.max_login_attempts || 5;
    const lockMin     = settings.lockout_duration_minutes || 30;

    const emp = await HrmEmployee.findOne({ work_email: work_email.toLowerCase().trim() })
      .populate('department','name').populate('designation','title')
      .populate('reporting_manager','full_name work_email');

    if (!emp) return res.status(401).json({ message: 'Invalid credentials' });
    if (!emp.is_active) return res.status(403).json({ message: 'Account disabled. Contact HR.' });
    if (!['active','probation'].includes(emp.status))
      return res.status(403).json({ message: 'Account not active' });
    if (emp.locked_until && new Date(emp.locked_until) > new Date())
      return res.status(423).json({ message: `Account locked until ${new Date(emp.locked_until).toLocaleTimeString()}` });

    const ok = await emp.check_password(password);
    if (!ok) {
      const attempts = (emp.login_attempts || 0) + 1;
      const update   = { login_attempts: attempts };
      if (attempts >= maxAttempts) update.locked_until = new Date(Date.now() + lockMin * 60000);
      await HrmEmployee.updateOne({ _id: emp._id }, update);
      return res.status(401).json({ message: attempts >= maxAttempts ? `Account locked for ${lockMin} min` : 'Invalid credentials' });
    }

    await HrmEmployee.updateOne({ _id:emp._id }, { login_attempts:0, locked_until:null, last_login:new Date() });

    const token  = signToken(emp);
    const empObj = emp.toJSON();
    // Never send sensitive fields to frontend
    delete empObj.aadhaar_number; delete empObj.account_number;
    delete empObj.pan_number;     delete empObj.pf_number;

    await log(emp._id, emp.full_name, 'login', 'EMP portal login', req.ip);
    res.json({ token, employee: empObj });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.me = (req, res) => {
  const emp = { ...req.empUser };
  delete emp.password; delete emp.login_attempts; delete emp.locked_until;
  delete emp.aadhaar_number; delete emp.account_number; delete emp.pan_number;
  res.json({ ...emp, id: emp._id });
};

exports.verify = (req, res) => {
  if (!req.empUser?.is_active) return res.status(401).json({ valid:false });
  res.json({ valid:true, employee_id:req.empUser.employee_id, status:req.empUser.status });
};

exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!new_password || new_password.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    const emp = await HrmEmployee.findById(req.empUser._id);
    if (!(await emp.check_password(old_password)))
      return res.status(400).json({ message: 'Current password incorrect' });
    emp.password = new_password;
    await emp.save();
    await log(emp._id, emp.full_name, 'password_changed', 'Password changed via EMP portal');
    res.json({ message: 'Password updated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateProfile = async (req, res) => {
  try {
    // Employee can only update limited fields
    const allowed = ['phone','personal_email','current_address','emergency_contact_name','emergency_contact_phone'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const emp = await HrmEmployee.findByIdAndUpdate(req.empUser._id, updates, { new:true })
      .populate('department','name').populate('designation','title');
    const obj = emp.toJSON();
    delete obj.aadhaar_number; delete obj.account_number; delete obj.pan_number;
    res.json(obj);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Upload Profile Photo ──────────────────────────────────────────────────────
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fs   = require('fs');
    const path = require('path');

    // Delete old profile image if exists
    const existing = await HrmEmployee.findById(req.empUser._id).select('profile_image').lean();
    if (existing?.profile_image) {
      const oldPath = path.join(__dirname, '..', '..', existing.profile_image);
      if (fs.existsSync(oldPath)) fs.unlink(oldPath, () => {});
    }

    const imagePath = `uploads/avatars/${req.file.filename}`;
    const emp = await HrmEmployee.findByIdAndUpdate(
      req.empUser._id,
      { profile_image: imagePath },
      { new: true }
    ).populate('department', 'name').populate('designation', 'title');

    const obj = emp.toJSON();
    delete obj.aadhaar_number; delete obj.account_number; delete obj.pan_number;
    res.json({ message: 'Profile photo updated', profile_image: imagePath, employee: obj });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Delete Profile Photo ──────────────────────────────────────────────────────
exports.deleteProfileImage = async (req, res) => {
  try {
    const fs   = require('fs');
    const path = require('path');

    const existing = await HrmEmployee.findById(req.empUser._id).select('profile_image').lean();
    if (existing?.profile_image) {
      const filePath = path.join(__dirname, '..', '..', existing.profile_image);
      if (fs.existsSync(filePath)) fs.unlink(filePath, () => {});
    }

    await HrmEmployee.findByIdAndUpdate(req.empUser._id, { profile_image: null });
    res.json({ message: 'Profile photo removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Logout all devices ────────────────────────────────────────────────────────
exports.logoutAll = async (req, res) => {
  try {
    await HrmEmployee.updateOne({ _id: req.empUser._id }, { $inc: { token_version: 1 } });
    await log(req.empUser._id, req.empUser.full_name, 'logout', 'Logged out — all devices invalidated', req.ip);
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
