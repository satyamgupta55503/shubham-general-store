const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmDeptSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  name:        { type: String, required: true, maxLength: 150 },
  description: { type: String, default: '' },
  hod:         { type: String, ref: 'HrmEmployee', default: null }, // Head of Dept
  is_active:   { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_departments',
});

hrmDeptSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmDepartment || mongoose.model('HrmDepartment', hrmDeptSchema);
