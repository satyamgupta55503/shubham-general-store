const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Follow-Up — tracks every touchpoint/interaction with a client or enquiry.
 * Supports multi-channel (phone, email, whatsapp, meeting, chat).
 * Email log embedded so sent emails are permanently tied to follow-ups.
 */
const followUpSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },

    // ── Who is this follow-up for? ───────────────────────────────
    client:      { type: String, ref: 'CrmClient',  default: null },
    enquiry:     { type: String, ref: 'CrmEnquiry', default: null },
    project:     { type: String, ref: 'CrmProject', default: null },
    quotation:   { type: String, ref: 'CrmQuotation', default: null },

    // Snapshot fields so data is preserved even if linked record is deleted
    contact_name:  { type: String, required: true, maxLength: 200 },
    contact_email: { type: String, default: '', maxLength: 200 },
    contact_phone: { type: String, default: '', maxLength: 20 },

    // ── Follow-up details ────────────────────────────────────────
    title:       { type: String, required: true, maxLength: 300 }, // short label
    channel: {
      type: String,
      enum: ['phone', 'email', 'whatsapp', 'meeting', 'chat', 'linkedin', 'other'],
      default: 'phone',
    },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'contacted', 'no_response', 'won', 'lost', 'postponed'],
      default: 'scheduled',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },

    follow_up_date: { type: Date, default: null },   // next scheduled follow-up date
    last_contacted: { type: Date, default: null },   // when was last contact made

    remarks:    { type: String, default: '', maxLength: 2000 },   // notes / what happened
    next_steps: { type: String, default: '', maxLength: 1000 },   // what to do next

    // ── Value tracking ───────────────────────────────────────────
    deal_value: { type: Number, default: 0 },

    // ── Email log ────────────────────────────────────────────────
    email_logs: [
      {
        sent_at:   { type: Date, default: Date.now },
        to:        { type: String },
        subject:   { type: String },
        body:      { type: String },
        status:    { type: String, enum: ['sent', 'failed'], default: 'sent' },
        sent_by:   { type: String, ref: 'CrmUser' },
        sent_by_name: { type: String },
      }
    ],

    // ── Reminder ─────────────────────────────────────────────────
    reminder_date: { type: Date, default: null },
    reminder_sent: { type: Boolean, default: false },

    // ── Tags / labels ────────────────────────────────────────────
    tags: [{ type: String, maxLength: 50 }],

    // ── Meta ─────────────────────────────────────────────────────
    created_by: { type: String, ref: 'CrmUser', default: null },
    assigned_to: { type: String, ref: 'CrmUser', default: null },
    assigned_to_name: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_followups',
  }
);

// ── Indexes ──────────────────────────────────────────────────────
followUpSchema.index({ client: 1 });
followUpSchema.index({ status: 1 });
followUpSchema.index({ follow_up_date: 1 });
followUpSchema.index({ created_by: 1 });
followUpSchema.index({ assigned_to: 1 });

followUpSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmFollowUp || mongoose.model('CrmFollowUp', followUpSchema);
