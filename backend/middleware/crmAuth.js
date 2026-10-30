const jwt     = require('jsonwebtoken');
const CrmUser = require('../models/crm/CrmUser');

// ── Verify JWT ────────────────────────────────────────────────────────────────
const crmAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer '))
      return res.status(401).json({ message: 'No token provided' });

    const token  = header.split(' ')[1];
    // ✅ Portal-specific secret — CRM tokens signed with JWT_CRM_SECRET
    const secret = process.env.JWT_CRM_SECRET || process.env.JWT_SECRET;

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // ✅ Portal isolation — reject HRM/EMP tokens
    if (decoded.portal !== 'crm')
      return res.status(401).json({ message: 'Invalid portal token' });

    const user = await CrmUser.findById(decoded.id);
    if (!user)            return res.status(401).json({ message: 'User not found' });
    if (!user.is_active)  return res.status(403).json({ message: 'Account pending approval' });

    // ✅ Brute-force lockout check (CRM users also have lockout)
    if (user.locked_until && new Date(user.locked_until) > new Date())
      return res.status(423).json({ message: 'Account temporarily locked' });

    // ✅ Token version check — logout all devices invalidates old tokens
    if (decoded.tv !== undefined && decoded.tv !== (user.token_version || 0))
      return res.status(401).json({ message: 'Session expired. Please log in again.' });

    req.crmUser = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ── Role guards ───────────────────────────────────────────────────────────────
const crmOwnerOnly = (req, res, next) => {
  if (req.crmUser?.role !== 'owner')
    return res.status(403).json({ message: 'Owner access required' });
  next();
};

const crmManagerOrAbove = (req, res, next) => {
  if (!['owner', 'manager'].includes(req.crmUser?.role))
    return res.status(403).json({ message: 'Manager or Owner access required' });
  next();
};

const crmFinanceOrAbove = (req, res, next) => {
  if (!['owner', 'manager', 'accountant'].includes(req.crmUser?.role))
    return res.status(403).json({ message: 'Finance access required' });
  next();
};

module.exports = { crmAuth, crmOwnerOnly, crmManagerOrAbove, crmFinanceOrAbove };
