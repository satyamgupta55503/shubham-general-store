const jwt         = require('jsonwebtoken');
const HrmEmployee = require('../models/hrm/HrmEmployee');

const getIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress || '';

// ── Core JWT guard for Employee Portal ───────────────────────────────────────
const empAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token = header.split(' ')[1];

    // ✅ Use portal-specific secret — EMP tokens signed with JWT_EMP_SECRET
    const secret = process.env.JWT_EMP_SECRET || process.env.JWT_SECRET;
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // ✅ Portal isolation — reject HRM/CRM tokens
    if (decoded.portal !== 'emp')
      return res.status(401).json({ message: 'Invalid portal token' });

    const employee = await HrmEmployee.findById(decoded.id)
      .populate('department',  'name')
      .populate('designation', 'title')
      .populate('reporting_manager', 'full_name work_email')
      .lean();

    if (!employee)           return res.status(401).json({ message: 'Employee not found' });
    if (!employee.is_active) return res.status(403).json({ message: 'Account disabled. Contact HR.' });

    // ✅ Brute-force lockout check
    if (employee.locked_until && new Date(employee.locked_until) > new Date())
      return res.status(423).json({ message: 'Account temporarily locked. Try later.' });

    // ✅ Token version check — logout all devices
    if (decoded.tv !== undefined && decoded.tv !== (employee.token_version || 0))
      return res.status(401).json({ message: 'Session expired. Please log in again.' });

    req.empUser  = employee;
    req.clientIP = getIP(req);
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Auth error' });
  }
};

const empSelf = (req, res, next) => next();

module.exports = { empAuth, empSelf };
