const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Monthly payroll run record
const hrmPayrollSchema = new mongoose.Schema({
  _id:     { type: String, default: uuidv4 },
  month:   { type: Number, required: true },  // 1-12
  year:    { type: Number, required: true },
  pay_period: { type: String, default: '' },  // "October 2026"

  total_employees:  { type: Number, default: 0 },
  total_gross:      { type: Number, default: 0 },
  total_deductions: { type: Number, default: 0 },
  total_net:        { type: Number, default: 0 },
  total_pf:         { type: Number, default: 0 },
  total_esi:        { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['draft', 'processing', 'processed', 'paid'],
    default: 'draft',
  },

  processed_by: { type: String, ref: 'HrmUser', default: null },
  processed_at: { type: Date, default: null },
  paid_at:      { type: Date, default: null },
  notes:        { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_payrolls',
});

hrmPayrollSchema.index({ month: 1, year: 1 }, { unique: true });

hrmPayrollSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmPayroll || mongoose.model('HrmPayroll', hrmPayrollSchema);
