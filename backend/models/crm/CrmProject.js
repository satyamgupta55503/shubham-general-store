const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Project — a digital-marketing engagement for a client.
 * Services are many-to-many (array of CrmService refs).
 */
const crmProjectSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    client: { type: String, ref: 'CrmClient', required: true },
    name: { type: String, required: true, maxLength: 200 },
    // Which DM services are included
    services: [{ type: String, ref: 'CrmService' }],
    project_type: {
      type: String,
      enum: ['retainer', 'one_time', 'campaign', 'audit', 'consultation', 'other'],
      default: 'retainer',
    },
    budget_range: { type: String, default: '' },
    start_date: { type: Date, default: null },
    expected_end_date: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'on_hold', 'completed', 'cancelled'],
      default: 'active',
    },
    notes: { type: String, default: '' },
    // Snapshot
    client_name_snapshot: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_projects',
  }
);

crmProjectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmProject || mongoose.model('CrmProject', crmProjectSchema);
