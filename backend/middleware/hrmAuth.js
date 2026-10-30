const jwt     = require('jsonwebtoken');
const HrmUser = require('../models/hrm/HrmUser');

const getIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress || '';

// ── Core JWT guard ────────────────────────────────────────────────────────────
const hrmAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = header.split(' ')[1];

    // ✅ Use portal-specific secret — HRM tokens signed with JWT_HRM_SECRET
    const secret = process.env.JWT_HRM_SECRET || process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // ✅ Portal isolation — reject CRM/EMP tokens
    if (decoded.portal !== 'hrm')
      return res.status(401).json({ message: 'Invalid portal token' });

    const user = await HrmUser.findById(decoded.id).lean();
    if (!user)           return res.status(401).json({ message: 'User not found' });
    if (!user.is_active) return res.status(403).json({ message: 'Account pending approval' });

    // ✅ Brute-force lockout check
    if (user.locked_until && new Date(user.locked_until) > new Date())
      return res.status(423).json({ message: 'Account temporarily locked' });

    // ✅ Token version check — logout all devices
    if (decoded.tv !== undefined && decoded.tv !== (user.token_version || 0))
      return res.status(401).json({ message: 'Session expired. Please log in again.' });

    req.hrmUser  = user;
    req.clientIP = getIP(req);
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Auth error' });
  }
};

// ── Role guards ───────────────────────────────────────────────────────────────
const hrmAdminOnly = (req, res, next) => {
  if (req.hrmUser?.role !== 'hr_admin')
    return res.status(403).json({ message: 'HR Admin access required' });
  next();
};

const hrmManagerOrAbove = (req, res, next) => {
  if (!['hr_admin', 'hr_manager'].includes(req.hrmUser?.role))
    return res.status(403).json({ message: 'HR Manager or above required' });
  next();
};

const hrmAnyRole = (req, res, next) => next();

// ── Department scope guard ────────────────────────────────────────────────────
const hrmDeptScope = (req, res, next) => {
  req.deptScope = req.hrmUser?.role === 'dept_manager'
    ? req.hrmUser.department
    : null;
  next();
};

module.exports = { hrmAuth, hrmAdminOnly, hrmManagerOrAbove, hrmAnyRole, hrmDeptScope };
