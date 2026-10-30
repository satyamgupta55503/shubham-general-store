const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * HrmUser — HR Portal staff accounts.
 * Roles: hr_admin | hr_manager | dept_manager
 * Collection: hrm_users  (never collides with users / crm_users)
 */
const hrmUserSchema = new mongoose.Schema({
  _id:       { type: String, default: uuidv4 },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  full_name: { type: String, required: true, maxLength: 200 },
  password:  { type: String, required: true },
  role: {
    type: String,
    enum: ['hr_admin', 'hr_manager', 'dept_manager'],
    default: 'hr_manager',
  },
  phone:          { type: String, default: '' },
  profile_image:  { type: String, default: null },
  department:     { type: String, default: '' }, // dept_manager: which dept they manage
  is_active:      { type: Boolean, default: false }, // admin approves
  page_access:    { type: [String], default: [] },
  access_granted_by: { type: String, ref: 'HrmUser', default: null },
  access_granted_at: { type: Date,   default: null },
  last_login:     { type: Date, default: null },
  login_attempts: { type: Number, default: 0 },   // brute-force protection
  locked_until:   { type: Date, default: null },
  token_version:  { type: Number, default: 0 },   // ✅ increment on logout = all devices
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_users',
});

hrmUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

hrmUserSchema.methods.check_password = function (entered) {
  return bcrypt.compare(entered, this.password);
};

hrmUserSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id; delete ret._id; delete ret.password; delete ret.__v;
    delete ret.login_attempts; delete ret.locked_until;
  },
});

module.exports = mongoose.models.HrmUser || mongoose.model('HrmUser', hrmUserSchema);
