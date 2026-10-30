const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM History / Activity Log — full audit trail with field-level diffs.
 * Every create/update/delete on any CRM entity gets logged here.
 * The `changes` array stores before/after values per field (version control).
 */
const crmHistorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },

    // ── Who did it ────────────────────────────────────────────────
    actor:      { type: String, ref: 'CrmUser', default: null },
    actor_name: { type: String, default: 'System' },
    actor_role: { type: String, default: '' },
    ip_address: { type: String, default: '' },

    // ── What happened ─────────────────────────────────────────────
    action: {
      type: String,
      enum: [
        'created', 'updated', 'deleted',
        'status_changed', 'payment_received', 'sent', 'approved', 'rejected',
        'login', 'logout', 'access_granted', 'access_revoked',
        'email_sent', 'exported', 'reminder_sent',
        'followup_created', 'followup_won', 'followup_lost',
      ],
      required: true,
    },

    // ── What entity ───────────────────────────────────────────────
    entity_type: {
      type: String,
      enum: [
        'client', 'project', 'service', 'proposal', 'quotation',
        'invoice', 'payment', 'portfolio', 'enquiry', 'user',
        'followup', 'settings', 'reminder',
      ],
      required: true,
    },
    entity_id:    { type: String, default: null },
    entity_label: { type: String, default: '' },   // e.g. "Technology Lead"
    description:  { type: String, default: '' },   // human readable summary

    // ── Version control: field-level changes ──────────────────────
    // Each entry: { field, old_value, new_value }
    changes: [
      {
        field:     { type: String },
        label:     { type: String },   // human-readable field name
        old_value: { type: mongoose.Schema.Types.Mixed },
        new_value: { type: mongoose.Schema.Types.Mixed },
      }
    ],

    // ── Snapshot of full entity at time of change ─────────────────
    // Stored for critical entities (invoices, quotations) for rollback reference
    snapshot: { type: mongoose.Schema.Types.Mixed, default: null },

    // ── Extra metadata ────────────────────────────────────────────
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    created_at: { type: Date, default: Date.now },
  },
  {
    collection: 'crm_history',
  }
);

crmHistorySchema.index({ created_at: -1 });
crmHistorySchema.index({ entity_type: 1, entity_id: 1 });
crmHistorySchema.index({ actor: 1 });
crmHistorySchema.index({ action: 1 });

crmHistorySchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmHistory || mongoose.model('CrmHistory', crmHistorySchema);

/* ── Helper: compute field-level diff between two objects ── */
module.exports.computeDiff = function(before, after, fieldLabels = {}) {
  const changes = [];
  if (!before || !after) return changes;

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const skip = new Set(['_id','id','__v','created_at','updated_at','created_by']);

  allKeys.forEach(key => {
    if (skip.has(key)) return;
    const oldVal = before[key];
    const newVal = after[key];
    const oldStr = JSON.stringify(oldVal);
    const newStr = JSON.stringify(newVal);
    if (oldStr !== newStr) {
      changes.push({
        field:     key,
        label:     fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        old_value: oldVal,
        new_value: newVal,
      });
    }
  });

  return changes;
};
