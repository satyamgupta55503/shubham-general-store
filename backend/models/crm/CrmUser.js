const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM User — separate from the CMS User model.
 * Roles: owner | manager | accountant | executive (like designer in TDS)
 * Uses collection 'crm_users' so it never collides with existing 'users' (CMS).
 */
const crmUserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    full_name: { type: String, required: true, maxLength: 200 },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'manager', 'accountant', 'executive'],
      default: 'executive',
    },
    phone: { type: String, default: '', maxLength: 20 },
    profile_image: { type: String, default: null },
    is_active: { type: Boolean, default: false }, // manager must approve
    page_access: { type: [String], default: [] },
    access_granted_by: { type: String, ref: 'CrmUser', default: null },
    access_granted_at: { type: Date, default: null },
    // ✅ Brute-force lockout fields (matching HRM/EMP pattern)
    login_attempts: { type: Number, default: 0 },
    locked_until:   { type: Date,   default: null },
    last_login:     { type: Date,   default: null },
    // ✅ Token version — increment on logout to invalidate ALL active sessions
    token_version:  { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_users',
  }
);

// Hash password on save
crmUserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

crmUserSchema.methods.check_password = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

crmUserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmUser || mongoose.model('CrmUser', crmUserSchema);
