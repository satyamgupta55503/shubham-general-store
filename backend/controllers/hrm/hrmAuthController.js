const jwt          = require('jsonwebtoken');
const rateLimit    = require('express-rate-limit');
const HrmUser      = require('../../models/hrm/HrmUser');
const HrmHistory   = require('../../models/hrm/HrmHistory');
const HrmNotification = require('../../models/hrm/HrmNotification');
const HrmSettings  = require('../../models/hrm/HrmSettings');

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, portal: 'hrm', tv: user.token_version || 0 },
    process.env.JWT_HRM_SECRET || process.env.JWT_SECRET,  // ✅ portal-specific secret
    { expiresIn: '8h' }
  );

const log = async (actorId, actorName, action, entityType, entityId, entityLabel, desc = '', ip = '') => {
  try { await HrmHistory.create({ actor: actorId, actor_name: actorName, action, entity_type: entityType, entity_id: entityId, entity_label: entityLabel, description: desc, ip_address: ip }); } catch {}
};

const notify = async (recipientId, eventType, title, message, refId, refType) => {
  try { await HrmNotification.create({ recipient: recipientId, event_type: eventType, title, message, reference_id: refId, reference_type: refType }); } catch {}
};

const getSettings = async () => {
  try {
    return await HrmSettings.findById('hrm_settings').lean() || {};
  } catch { return {}; }
};

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;
    if (!full_name || !email || !password)
      return res.status(400).json({ message: 'full_name, email, and password are required' });

    // Input sanitisation
    const emailClean = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean))
      return res.status(400).json({ message: 'Invalid email format' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });

    const exists = await HrmUser.findOne({ email: emailClean });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await HrmUser.create({ full_name: full_name.trim(), email: emailClean, password, phone: phone || '' });
    await log(user._id, user.full_name, 'created', 'user', user._id, user.full_name, 'Self-registered — awaiting approval');
    res.status(201).json({ message: 'Registration successful. Awaiting HR Admin approval.', id: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const settings = await getSettings();
    const maxAttempts = settings.max_login_attempts || 5;
    const lockMinutes = settings.lockout_duration_minutes || 30;

    const user = await HrmUser.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Lockout check
    if (user.locked_until && new Date(user.locked_until) > new Date())
      return res.status(423).json({ message: `Account locked. Try after ${new Date(user.locked_until).toLocaleTimeString()}` });

    if (!user.is_active)
      return res.status(403).json({ message: 'Account pending approval by HR Admin' });

    const ok = await user.check_password(password);
    if (!ok) {
      const attempts = (user.login_attempts || 0) + 1;
      const update = { login_attempts: attempts };
      if (attempts >= maxAttempts) update.locked_until = new Date(Date.now() + lockMinutes * 60000);
      await HrmUser.updateOne({ _id: user._id }, update);
      return res.status(401).json({ message: attempts >= maxAttempts ? `Account locked for ${lockMinutes} minutes` : 'Invalid credentials' });
    }

    // Reset attempts
    await HrmUser.updateOne({ _id: user._id }, { login_attempts: 0, locked_until: null, last_login: new Date() });

    const token = signToken(user);
    await log(user._id, user.full_name, 'login', 'user', user._id, user.full_name, 'HRM portal login', req.ip);
    res.json({ token, role: user.role, full_name: user.full_name, id: user._id, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Me ────────────────────────────────────────────────────────────────────────
exports.me = (req, res) => {
  const u = { ...req.hrmUser };
  delete u.password; delete u.login_attempts; delete u.locked_until;
  res.json({ ...u, id: u._id });
};

// ── Update profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['full_name', 'phone'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await HrmUser.findByIdAndUpdate(req.hrmUser._id, updates, { new: true });
    res.json(user.toJSON());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Change password ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!new_password || new_password.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    const user = await HrmUser.findById(req.hrmUser._id);
    if (!(await user.check_password(old_password)))
      return res.status(400).json({ message: 'Current password incorrect' });
    user.password = new_password;
    await user.save();
    await log(user._id, user.full_name, 'password_changed', 'user', user._id, user.full_name);
    res.json({ message: 'Password updated successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Verify (keep-alive) ───────────────────────────────────────────────────────
exports.verify = async (req, res) => {
  const user = await HrmUser.findById(req.hrmUser._id).lean();
  if (!user || !user.is_active) return res.status(401).json({ valid: false });
  res.json({ valid: true, role: user.role, page_access: user.page_access });
};

// ── Logout ────────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    await log(req.hrmUser._id, req.hrmUser.full_name, 'logout', 'user', req.hrmUser._id, req.hrmUser.full_name, 'HRM logout', req.ip);
    res.json({ message: 'Logged out' });
  } catch { res.json({ message: 'Logged out' }); }
};

// ── Pending users ─────────────────────────────────────────────────────────────
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await HrmUser.find({ is_active: false }).sort({ created_at: -1 }).lean();
    res.json(users.map(u => ({ ...u, id: u._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await HrmUser.find({ is_active: true }).sort({ created_at: -1 }).lean();
    res.json(users.map(u => ({ ...u, id: u._id })));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, page_access } = req.body;
    const user = await HrmUser.findByIdAndUpdate(userId, {
      is_active: true, role: role || 'hr_manager',
      page_access: page_access || [],
      access_granted_by: req.hrmUser._id,
      access_granted_at: new Date(),
    }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await log(req.hrmUser._id, req.hrmUser.full_name, 'access_granted', 'user', user._id, user.full_name, `Approved — role: ${user.role}`);
    res.json({ message: 'User approved', user: user.toJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await HrmUser.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await log(req.hrmUser._id, req.hrmUser.full_name, 'deleted', 'user', userId, user?.full_name || '', 'Registration rejected');
    res.json({ message: 'Rejected and removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await HrmUser.findByIdAndUpdate(userId, { is_active: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await log(req.hrmUser._id, req.hrmUser.full_name, 'access_revoked', 'user', user._id, user.full_name, 'Access deactivated');
    res.json({ message: 'User deactivated', user: user.toJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const allowed = ['role', 'page_access', 'full_name', 'phone', 'department'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await HrmUser.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toJSON());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Logout all devices ────────────────────────────────────────────────────────
exports.logoutAll = async (req, res) => {
  try {
    await HrmUser.updateOne({ _id: req.hrmUser._id }, { $inc: { token_version: 1 } });
    await log(req.hrmUser._id, req.hrmUser.full_name, 'logout', 'user', req.hrmUser._id, req.hrmUser.full_name, 'Logged out — all devices invalidated');
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
