const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmNotifSchema = new mongoose.Schema({
  _id:       { type: String, default: uuidv4 },
  recipient: { type: String, ref: 'HrmUser', default: null },  // null = broadcast
  event_type: {
    type: String,
    enum: [
      'employee_joined', 'employee_resigned', 'leave_applied', 'leave_approved',
      'leave_rejected', 'attendance_regularization', 'payroll_processed',
      'salary_slip_generated', 'user_created', 'access_granted', 'access_revoked',
    ],
    required: true,
  },
  title:   { type: String, required: true, maxLength: 200 },
  message: { type: String, required: true, maxLength: 500 },
  reference_id:   { type: String, default: null },
  reference_type: { type: String, default: null },
  is_read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
}, { collection: 'hrm_notifications' });

hrmNotifSchema.index({ recipient: 1, is_read: 1, created_at: -1 });

hrmNotifSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmNotification || mongoose.model('HrmNotification', hrmNotifSchema);
