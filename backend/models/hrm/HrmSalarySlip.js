const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const componentSchema = new mongoose.Schema({
  code:   { type: String },
  name:   { type: String },
  amount: { type: Number, default: 0 },
  type:   { type: String, enum: ['earning', 'deduction'] },
}, { _id: false });

const hrmSalarySlipSchema = new mongoose.Schema({
  _id:      { type: String, default: uuidv4 },
  payroll:  { type: String, ref: 'HrmPayroll', required: true },
  employee: { type: String, ref: 'HrmEmployee', required: true },
  month:    { type: Number, required: true },
  year:     { type: Number, required: true },
  pay_period: { type: String, default: '' },

  // Employee snapshot (so slip is accurate even if profile changes)
  employee_snapshot: {
    full_name:   { type: String, default: '' },
    employee_id: { type: String, default: '' },
    department:  { type: String, default: '' },
    designation: { type: String, default: '' },
    work_email:  { type: String, default: '' },
    uan_number:  { type: String, default: '' },
    pan_number:  { type: String, default: '' },
    bank_name:   { type: String, default: '' },
    account_number: { type: String, default: '' },
    ifsc_code:   { type: String, default: '' },
    date_of_joining: { type: String, default: '' },
  },

  // Attendance for month
  working_days: { type: Number, default: 26 },
  present_days: { type: Number, default: 0 },
  lwp_days:     { type: Number, default: 0 },

  // Salary components
  earnings:   [componentSchema],
  deductions: [componentSchema],

  gross_salary:      { type: Number, default: 0 },
  total_deductions:  { type: Number, default: 0 },
  net_salary:        { type: Number, default: 0 },
  lwp_deduction:     { type: Number, default: 0 },

  // One-time items
  bonus:   { type: Number, default: 0 },
  arrears: { type: Number, default: 0 },
  advance_deduction: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['generated', 'sent', 'downloaded'],
    default: 'generated',
  },

  generated_at: { type: Date, default: Date.now },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_salary_slips',
});

hrmSalarySlipSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

hrmSalarySlipSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmSalarySlip || mongoose.model('HrmSalarySlip', hrmSalarySlipSchema);
