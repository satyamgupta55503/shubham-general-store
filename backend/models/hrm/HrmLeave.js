const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmLeaveSchema = new mongoose.Schema({
  _id:        { type: String, default: uuidv4 },
  employee:   { type: String, ref: 'HrmEmployee', required: true },
  leave_type: { type: String, ref: 'HrmLeaveType', required: true },
  leave_type_code: { type: String, default: '' }, // snapshot

  from_date:  { type: Date, required: true },
  to_date:    { type: Date, required: true },
  days:       { type: Number, required: true },
  session:    { type: String, enum: ['full_day', 'first_half', 'second_half'], default: 'full_day' },

  reason:     { type: String, required: true, maxLength: 1000 },
  attachment: { type: String, default: '' },  // file URL

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending',
  },

  applied_on:     { type: Date, default: Date.now },
  reviewed_by:    { type: String, ref: 'HrmUser', default: null },
  reviewed_at:    { type: Date, default: null },
  rejection_note: { type: String, default: '' },

  // Snapshot fields
  employee_name_snapshot: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_leaves',
});

hrmLeaveSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmLeave || mongoose.model('HrmLeave', hrmLeaveSchema);
