const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * HrmHoliday — Company holiday calendar.
 * Collection: hrm_holidays
 */
const hrmHolidaySchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  name:        { type: String, required: true, trim: true, maxLength: 200 },
  date:        { type: Date,   required: true },
  type: {
    type: String,
    enum: ['national', 'optional', 'regional', 'company'],
    default: 'national',
  },
  description: { type: String, default: '' },
  is_active:   { type: Boolean, default: true },
  year:        { type: Number, required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_holidays',
});

hrmHolidaySchema.index({ year: 1, date: 1 });

hrmHolidaySchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmHoliday || mongoose.model('HrmHoliday', hrmHolidaySchema);
