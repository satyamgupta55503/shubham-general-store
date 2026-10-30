const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * HrmEmployee — Company employees.
 * Dual-use: HRM portal (HR manages) + EMP portal (employee self-service).
 * Collection: hrm_employees
 */
const hrmEmployeeSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  employee_id: { type: String, unique: true },   // DKS-EMP-001 auto-generated

  // ── Identity ────────────────────────────────────────────────────────────────
  full_name:      { type: String, required: true, maxLength: 200 },
  personal_email: { type: String, default: '', lowercase: true, trim: true },
  work_email:     { type: String, default: '', lowercase: true, trim: true, unique: true, sparse: true },
  password:       { type: String, required: true },  // EMP portal login
  phone:          { type: String, default: '' },

  // ── Org Structure ───────────────────────────────────────────────────────────
  department:        { type: String, ref: 'HrmDepartment', default: null },
  designation:       { type: String, ref: 'HrmDesignation', default: null },
  reporting_manager: { type: String, ref: 'HrmEmployee', default: null },

  // ── Employment ──────────────────────────────────────────────────────────────
  date_of_joining: { type: Date, default: null },
  employment_type: {
    type: String,
    enum: ['full_time', 'part_time', 'intern', 'freelancer', 'contract'],
    default: 'full_time',
  },
  status: {
    type: String,
    enum: ['active', 'probation', 'notice_period', 'resigned', 'terminated'],
    default: 'active',
  },

  // ── Personal ────────────────────────────────────────────────────────────────
  date_of_birth:   { type: Date, default: null },
  gender:          { type: String, enum: ['male', 'female', 'other', ''], default: '' },
  blood_group:     { type: String, default: '' },
  aadhaar_number:  { type: String, default: '' },
  pan_number:      { type: String, default: '' },
  current_address: { type: String, default: '' },
  permanent_address: { type: String, default: '' },

  // ── Emergency ───────────────────────────────────────────────────────────────
  emergency_contact_name:  { type: String, default: '' },
  emergency_contact_phone: { type: String, default: '' },

  // ── Bank (salary transfer) ─────────────────────────────────────────────────
  bank_name:      { type: String, default: '' },
  account_number: { type: String, default: '' },
  ifsc_code:      { type: String, default: '' },
  upi_id:         { type: String, default: '' },

  // ── Compliance ──────────────────────────────────────────────────────────────
  pf_number:  { type: String, default: '' },
  esi_number: { type: String, default: '' },
  uan_number: { type: String, default: '' },

  // ── Salary ──────────────────────────────────────────────────────────────────
  current_ctc:     { type: Number, default: 0 },  // Annual
  current_basic:   { type: Number, default: 0 },  // Monthly

  // ── Profile ─────────────────────────────────────────────────────────────────
  profile_image: { type: String, default: null },

  // ── EMP Portal auth ─────────────────────────────────────────────────────────
  is_active:      { type: Boolean, default: true },
  last_login:     { type: Date, default: null },
  login_attempts: { type: Number, default: 0 },
  locked_until:   { type: Date, default: null },
  token_version:  { type: Number, default: 0 },   // ✅ logout all devices

  // ── Leave balances (embedded, updated when leave approved) ─────────────────
  leave_balance: {
    el: { type: Number, default: 12 },  // Earned Leave
    sl: { type: Number, default: 12 },  // Sick Leave
    cl: { type: Number, default: 8  },  // Casual Leave
    ol: { type: Number, default: 2  },  // Optional Leave
  },

  // ── Onboarding checklist ──────────────────────────────────────────────────
  onboarding: {
    welcome_email_sent: { type: Boolean, default: false },
    documents_collected: { type: Boolean, default: false },
    system_access_given: { type: Boolean, default: false },
    induction_completed: { type: Boolean, default: false },
    equipment_issued:    { type: Boolean, default: false },
  },

  notes: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_employees',
});

// Auto-generate employee_id before validate
hrmEmployeeSchema.pre('validate', async function () {
  if (!this.employee_id) {
    const count = await mongoose.model('HrmEmployee').countDocuments();
    this.employee_id = `DKS-EMP-${String(count + 1).padStart(3, '0')}`;
  }
});

hrmEmployeeSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

hrmEmployeeSchema.methods.check_password = function (entered) {
  return bcrypt.compare(entered, this.password);
};

hrmEmployeeSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id; delete ret._id; delete ret.password; delete ret.__v;
    delete ret.login_attempts; delete ret.locked_until;
  },
});

module.exports = mongoose.models.HrmEmployee || mongoose.model('HrmEmployee', hrmEmployeeSchema);
