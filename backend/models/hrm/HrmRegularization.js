const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmRegSchema = new mongoose.Schema({
  _id:       { type: String, default: uuidv4 },
  employee:  { type: String, ref: 'HrmEmployee', required: true },
  date:      { type: Date, required: true },
  req_check_in:  { type: String, required: true },  // HH:MM
  req_check_out: { type: String, required: true },
  reason:    { type: String, required: true, maxLength: 500 },
  status:    { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewed_by:    { type: String, ref: 'HrmUser', default: null },
  reviewed_at:    { type: Date, default: null },
  rejection_note: { type: String, default: '' },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_regularizations',
});

hrmRegSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmRegularization || mongoose.model('HrmRegularization', hrmRegSchema);
