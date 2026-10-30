const jwt      = require('jsonwebtoken');
const CrmUser  = require('../../models/crm/CrmUser');
const CrmHistory = require('../../models/crm/CrmHistory');

const MAX_ATTEMPTS  = 5;
const LOCK_MINUTES  = 30;

// ── Helpers ───────────────────────────────────────────────────────────────────
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, portal: 'crm', tv: user.token_version || 0 },
    process.env.JWT_CRM_SECRET || process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

const logHistory = async (actor, actorName, action, entityType, entityId, entityLabel, desc = '') => {
  try {
    await CrmHistory.create({ actor, actor_name: actorName, action, entity_type: entityType, entity_id: entityId, entity_label: entityLabel, description: desc });
  } catch { /* non-critical */ }
};

const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// ── Register ──────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    // ✅ Input validation
    if (!full_name?.trim() || !email || !password)
      return res.status(400).json({ message: 'full_name, email, and password are required' });

    const emailClean = email.toLowerCase().trim();
    if (!isValidEmail(emailClean))
      return res.status(400).json({ message: 'Invalid email format' });
    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    if (full_name.trim().length > 200)
      return res.status(400).json({ message: 'Name too long' });

    const exists = await CrmUser.findOne({ email: emailClean });
    if (exists) return res.status(409).json({ message: 'Email already registered' });

    const user = await CrmUser.create({
      full_name: full_name.trim(),
      email: emailClean,
      password,
      phone: (phone || '').slice(0, 20),
    });
    res.status(201).json({ message: 'Registration successful. Awaiting manager approval.', id: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' }); // ✅ never leak internal error
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Input validation
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const emailClean = email.toLowerCase().trim();
    if (!isValidEmail(emailClean))
      return res.status(400).json({ message: 'Invalid email format' });

    const user = await CrmUser.findOne({ email: emailClean });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // ✅ Lockout check BEFORE password verification
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try after ${minutesLeft} minute(s).` });
    }

    if (!user.is_active)
      return res.status(403).json({ message: 'Account pending approval by manager' });

    const ok = await user.check_password(password);
    if (!ok) {
      // ✅ Increment attempt counter, lock if threshold reached
      const attempts = (user.login_attempts || 0) + 1;
      const update   = { login_attempts: attempts };
      if (attempts >= MAX_ATTEMPTS) {
        update.locked_until = new Date(Date.now() + LOCK_MINUTES * 60000);
      }
      await CrmUser.updateOne({ _id: user._id }, update);
      return res.status(401).json({
        message: attempts >= MAX_ATTEMPTS
          ? `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`
          : 'Invalid credentials',
      });
    }

    // ✅ Success — reset attempt counter
    await CrmUser.updateOne(
      { _id: user._id },
      { login_attempts: 0, locked_until: null, last_login: new Date() }
    );

    const token = signToken(user);
    await logHistory(user._id, user.full_name, 'login', 'user', user._id, user.full_name, 'CRM portal login');
    res.json({ token, role: user.role, full_name: user.full_name, id: user._id, user: user.toJSON() });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' }); // ✅ never leak internal error
  }
};

// ── Verify ────────────────────────────────────────────────────────────────────
exports.verify = async (req, res) => {
  const user = await CrmUser.findById(req.crmUser._id);
  if (!user || !user.is_active) return res.status(401).json({ valid: false });
  res.json({ valid: true, role: user.role, page_access: user.page_access });
};

// ── Me ────────────────────────────────────────────────────────────────────────
exports.me = async (req, res) => {
  res.json(req.crmUser.toJSON());
};

// ── Update Profile ────────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['full_name', 'phone'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await CrmUser.findByIdAndUpdate(req.crmUser._id, updates, { new: true });
    res.json(user.toJSON());
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// ── Change Password ───────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    // ✅ Validate new password strength
    if (!new_password || new_password.length < 8)
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    if (old_password === new_password)
      return res.status(400).json({ message: 'New password must be different from current' });

    const user = await CrmUser.findById(req.crmUser._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const ok = await user.check_password(old_password);
    if (!ok) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = new_password;
    await user.save();
    await logHistory(user._id, user.full_name, 'password_changed', 'user', user._id, user.full_name, 'Password changed');
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Password change failed' });
  }
};

// ── Pending Users ─────────────────────────────────────────────────────────────
exports.getPendingUsers = async (req, res) => {
  try {
    const users = await CrmUser.find({ is_active: false }).sort({ created_at: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await CrmUser.find({ is_active: true }).sort({ created_at: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Approve ───────────────────────────────────────────────────────────────────
exports.approveUser = async (req, res) => {
  try {
    const { userId }            = req.params;
    const { role, page_access } = req.body;
    const user = await CrmUser.findByIdAndUpdate(
      userId,
      {
        is_active:         true,
        role:              role || 'executive',
        page_access:       page_access || [],
        access_granted_by: req.crmUser._id,
        access_granted_at: new Date(),
        login_attempts:    0,  // ✅ reset on approve
        locked_until:      null,
      },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    await logHistory(req.crmUser._id, req.crmUser.full_name, 'access_granted', 'user', user._id, user.full_name, `Approved with role: ${user.role}`);
    res.json({ message: 'User approved', user: user.toJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Reject ────────────────────────────────────────────────────────────────────
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await CrmUser.findByIdAndDelete(userId);
    res.json({ message: 'User registration rejected and removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Deactivate ────────────────────────────────────────────────────────────────
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await CrmUser.findByIdAndUpdate(userId, { is_active: false }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    await logHistory(req.crmUser._id, req.crmUser.full_name, 'access_revoked', 'user', user._id, user.full_name, 'Access deactivated');
    res.json({ message: 'User deactivated', user: user.toJSON() });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Update User ───────────────────────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // ✅ Whitelist allowed fields — no operator injection
    const allowed = ['role', 'page_access', 'full_name', 'phone'];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await CrmUser.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user.toJSON());
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── Logout (ALL devices) ──────────────────────────────────────────────────────
// Increments token_version → ALL previously issued JWTs are instantly invalid
// Works across every device/browser simultaneously
exports.logout = async (req, res) => {
  try {
    await CrmUser.updateOne(
      { _id: req.crmUser._id },
      { $inc: { token_version: 1 } }
    );
    await logHistory(
      req.crmUser._id, req.crmUser.full_name,
      'logout', 'user', req.crmUser._id, req.crmUser.full_name,
      'Logged out — all devices invalidated'
    );
    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Logout failed' });
  }
};
