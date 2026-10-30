const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * HrmAnnouncement — HR broadcast messages / notice board.
 * Visible to all employees and HRM staff.
 * Collection: hrm_announcements
 */
const hrmAnnouncementSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  title:       { type: String, required: true, trim: true, maxLength: 300 },
  body:        { type: String, required: true },
  priority:    { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  // Audience — empty means everyone
  target_departments: [{ type: String, ref: 'HrmDepartment' }],
  // Scheduling
  publish_at:  { type: Date, default: null },   // null = publish immediately
  expires_at:  { type: Date, default: null },   // null = never expires
  is_active:   { type: Boolean, default: true },
  // Author
  created_by:       { type: String, ref: 'HrmUser', default: null },
  created_by_name:  { type: String, default: 'HR' },
  // Read receipts
  read_by: [{ type: String, ref: 'HrmEmployee' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_announcements',
});

hrmAnnouncementSchema.index({ is_active: 1, publish_at: -1 });

hrmAnnouncementSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmAnnouncement || mongoose.model('HrmAnnouncement', hrmAnnouncementSchema);
