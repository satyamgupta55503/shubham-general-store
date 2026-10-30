const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmLeaveTypeSchema = new mongoose.Schema({
  _id:          { type: String, default: uuidv4 },
  code:         { type: String, required: true, uppercase: true, maxLength: 10 }, // EL, SL, CL
  name:         { type: String, required: true, maxLength: 100 },
  annual_quota: { type: Number, default: 12 },
  carry_forward:{ type: Boolean, default: false },
  max_carry:    { type: Number, default: 0 },
  encashable:   { type: Boolean, default: false },
  paid:         { type: Boolean, default: true },
  is_active:    { type: Boolean, default: true },
  description:  { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_leave_types',
});

hrmLeaveTypeSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmLeaveType || mongoose.model('HrmLeaveType', hrmLeaveTypeSchema);
