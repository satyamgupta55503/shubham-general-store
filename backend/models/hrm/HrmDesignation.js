const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const hrmDesigSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  title:       { type: String, required: true, maxLength: 150 },
  department:  { type: String, ref: 'HrmDepartment', default: null },
  level: {
    type: String,
    enum: ['intern', 'junior', 'mid', 'senior', 'lead', 'manager', 'director'],
    default: 'junior',
  },
  description: { type: String, default: '' },
  is_active:   { type: Boolean, default: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_designations',
});

hrmDesigSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmDesignation || mongoose.model('HrmDesignation', hrmDesigSchema);
