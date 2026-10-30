const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmHistorySchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  actor:       { type: String, default: null },
  actor_name:  { type: String, default: 'System' },
  portal:      { type: String, enum: ['hrm', 'emp'], default: 'hrm' },
  action: {
    type: String,
    enum: ['created','updated','deleted','approved','rejected','login','logout',
           'payroll_processed','salary_slip_generated','access_granted','access_revoked',
           'status_changed','password_changed'],
    required: true,
  },
  entity_type: {
    type: String,
    enum: ['employee','department','designation','attendance','leave','payroll',
           'salary_slip','user','regularization','settings'],
    required: true,
  },
  entity_id:    { type: String, default: null },
  entity_label: { type: String, default: '' },
  description:  { type: String, default: '' },
  ip_address:   { type: String, default: '' },
  created_at:   { type: Date, default: Date.now },
}, { collection: 'hrm_history' });

hrmHistorySchema.index({ created_at: -1 });
hrmHistorySchema.index({ entity_type: 1, entity_id: 1 });

hrmHistorySchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmHistory || mongoose.model('HrmHistory', hrmHistorySchema);
