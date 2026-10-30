const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmAttendanceSchema = new mongoose.Schema({
  _id:      { type: String, default: uuidv4 },
  employee: { type: String, ref: 'HrmEmployee', required: true },
  date:     { type: Date, required: true },

  check_in:   { type: Date, default: null },
  check_out:  { type: Date, default: null },
  work_hours: { type: Number, default: 0 },   // decimal hours

  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half_day', 'on_leave', 'wfh', 'holiday', 'weekly_off'],
    default: 'absent',
  },

  check_in_location:  { type: String, default: '' },  // 'office' | 'wfh' | GPS coords
  check_out_location: { type: String, default: '' },
  device_info:        { type: String, default: '' },   // browser/device fingerprint

  // Regularization
  regularization_requested: { type: Boolean, default: false },
  regularization_id: { type: String, ref: 'HrmRegularization', default: null },

  marked_by: { type: String, default: 'system' },  // 'self' | 'hr' | 'system'
  notes:     { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_attendance',
});

// Compound unique: one record per employee per day
hrmAttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

hrmAttendanceSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmAttendance || mongoose.model('HrmAttendance', hrmAttendanceSchema);
