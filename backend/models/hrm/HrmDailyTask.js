const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * HrmDailyTask — Employee daily work log + HR-assigned tasks.
 * Dual use:
 *   is_assigned: false → Employee khud add karta hai apna kaam
 *   is_assigned: true  → HR ne assign kiya hai employee ko
 * Collection: hrm_daily_tasks
 */

const commentSchema = new mongoose.Schema({
  _id:         { type: String, default: uuidv4 },
  author_id:   { type: String, required: true },
  author_name: { type: String, default: '' },
  author_role: { type: String, enum: ['hr','employee'], default: 'employee' },
  text:        { type: String, required: true, maxLength: 1000 },
  created_at:  { type: Date, default: Date.now },
}, { _id: false });

const hrmDailyTaskSchema = new mongoose.Schema({
  _id:      { type: String, default: uuidv4 },

  // ── Who owns / is assigned this task ───────────────────────────────────────
  employee:       { type: String, ref: 'HrmEmployee', required: true }, // assignee
  is_assigned:    { type: Boolean, default: false },   // true = HR assigned
  assigned_by:    { type: String, ref: 'HrmUser',  default: null }, // HRM user who assigned
  assigned_by_name: { type: String, default: '' },

  // ── Task details ────────────────────────────────────────────────────────────
  title:         { type: String, required: true, trim: true, maxLength: 300 },
  description:   { type: String, default: '', maxLength: 2000 },
  category: {
    type: String,
    enum: ['design','development','meeting','research','review','client','admin','other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low','medium','high','urgent'],
    default: 'medium',
  },

  // ── Time tracking ───────────────────────────────────────────────────────────
  date:             { type: Date, required: true },
  due_date:         { type: Date, default: null },   // HR can set deadline
  start_time:       { type: String, default: '' },   // "09:30" HH:MM
  end_time:         { type: String, default: '' },   // "11:00" HH:MM
  duration_minutes: { type: Number, default: 0 },    // auto-calculated
  estimated_hours:  { type: Number, default: 0 },    // HR sets estimate

  // ── Status ──────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['todo','in_progress','done','blocked','cancelled'],
    default: 'todo',
  },

  // ── Project tagging ─────────────────────────────────────────────────────────
  project_name: { type: String, default: '' },
  project_tag:  { type: String, default: '' }, // short code e.g. "DKSW"

  // ── Comments (both HR & employee can comment) ────────────────────────────────
  comments: { type: [commentSchema], default: [] },

  // ── HR review ───────────────────────────────────────────────────────────────
  hr_note:        { type: String, default: '' },   // HR internal note
  is_approved:    { type: Boolean, default: null }, // null=pending, true/false
  approved_by:    { type: String, default: '' },
  approved_at:    { type: Date,   default: null },

  // ── Flags ───────────────────────────────────────────────────────────────────
  is_overdue:   { type: Boolean, default: false },
  completed_at: { type: Date,   default: null },

}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  collection: 'hrm_daily_tasks',
});

hrmDailyTaskSchema.index({ employee: 1, date: -1 });
hrmDailyTaskSchema.index({ date: -1 });
hrmDailyTaskSchema.index({ is_assigned: 1, status: 1 });
hrmDailyTaskSchema.index({ assigned_by: 1, date: -1 });

// Auto-calc duration + completed_at + is_overdue
hrmDailyTaskSchema.pre('save', function () {
  if (this.start_time && this.end_time) {
    const [sh, sm] = this.start_time.split(':').map(Number);
    const [eh, em] = this.end_time.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    this.duration_minutes = Math.max(0, mins);
  }
  if (this.isModified('status')) {
    if (this.status === 'done' && !this.completed_at) this.completed_at = new Date();
    if (this.status !== 'done') this.completed_at = null;
  }
  if (this.due_date) {
    this.is_overdue = this.status !== 'done' && new Date(this.due_date) < new Date();
  }
});

hrmDailyTaskSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; delete ret._id; delete ret.__v; },
});

module.exports = mongoose.models.HrmDailyTask || mongoose.model('HrmDailyTask', hrmDailyTaskSchema);
