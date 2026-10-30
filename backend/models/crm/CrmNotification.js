const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmNotificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    user: { type: String, ref: 'CrmUser', default: null }, // null = broadcast to all
    event_type: {
      type: String,
      enum: [
        'client_created',
        'invoice_created', 'invoice_paid',
        'quotation_created', 'quotation_approved', 'quotation_rejected',
        'payment_received',
        'proposal_created', 'proposal_sent', 'proposal_accepted', 'proposal_rejected',
        'project_created', 'project_status_changed',
        'service_created',
        'portfolio_created',
        'enquiry_received',
        'user_created', 'access_granted', 'access_revoked',
      ],
      required: true,
    },
    title: { type: String, required: true, maxLength: 200 },
    message: { type: String, required: true, maxLength: 500 },
    reference_id: { type: String, default: null },
    reference_type: { type: String, default: null },
    is_read: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now },
  },
  {
    collection: 'crm_notifications',
  }
);

crmNotificationSchema.index({ user: 1, is_read: 1, created_at: -1 });

crmNotificationSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmNotification || mongoose.model('CrmNotification', crmNotificationSchema);
