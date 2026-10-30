const mongoose = require('mongoose');

const hrmSettingsSchema = new mongoose.Schema({
  _id: { type: String, default: 'hrm_settings' },

  // Company
  company_name:    { type: String, default: 'Digikraft Social' },
  company_email:   { type: String, default: 'hr@digikraftsocial.com' },
  company_phone:   { type: String, default: '9302279701' },
  company_address: { type: String, default: '270/1, Swami Vivekanand Ward, Raipur' },

  // Working hours
  working_hours_per_day: { type: Number, default: 9 },
  working_days_per_month: { type: Number, default: 26 },
  grace_period_minutes: { type: Number, default: 15 },
  standard_check_in:  { type: String, default: '09:30' },
  standard_check_out: { type: String, default: '18:30' },

  // Payroll config
  pf_employee_percent:  { type: Number, default: 12 },
  pf_employer_percent:  { type: Number, default: 12 },
  esi_employee_percent: { type: Number, default: 0.75 },
  esi_employer_percent: { type: Number, default: 3.25 },
  professional_tax:     { type: Number, default: 200 },
  pf_basic_ceiling:     { type: Number, default: 15000 },
  esi_gross_ceiling:    { type: Number, default: 21000 },
  salary_day:           { type: Number, default: 1 },  // day of next month

  // Leave policy
  leave_year_start_month: { type: Number, default: 4 },  // April
  auto_carry_forward:     { type: Boolean, default: false },
  max_carry_forward:      { type: Number, default: 15 },

  // Security
  max_login_attempts: { type: Number, default: 5 },
  lockout_duration_minutes: { type: Number, default: 30 },
  session_timeout_hours: { type: Number, default: 8 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_settings',
});

module.exports = mongoose.models.HrmSettings || mongoose.model('HrmSettings', hrmSettingsSchema);
