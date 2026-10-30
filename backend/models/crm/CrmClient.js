const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Client — businesses or individuals who hire DigiKraft Social
 * for digital-marketing services.
 */
const crmClientSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    full_name: { type: String, required: true, maxLength: 200 },
    company_name: { type: String, default: '', maxLength: 200 },
    email: { type: String, default: '' },
    phone: { type: String, required: true, maxLength: 15 },
    billing_address: { type: String, required: true },
    gstin: { type: String, default: '', maxLength: 15 },
    // Digital-marketing specific client types
    client_type: {
      type: String,
      enum: ['startup', 'sme', 'enterprise', 'ecommerce', 'agency', 'personal', 'ngo', 'other', ''],
      default: '',
    },
    client_type_other: { type: String, default: '', maxLength: 120 },
    // How they found us
    lead_source: {
      type: String,
      enum: ['instagram', 'facebook', 'google', 'linkedin', 'website', 'referral', 'cold_outreach', 'event', 'other', ''],
      default: '',
    },
    lead_source_other: { type: String, default: '', maxLength: 120 },
    city: { type: String, default: '', maxLength: 80 },
    state: { type: String, default: '', maxLength: 80 },
    country: { type: String, default: 'India', maxLength: 80 },
    website: { type: String, default: '' },
    social_handle: { type: String, default: '' }, // primary social handle
    notes: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_clients',
  }
);

crmClientSchema.virtual('projects', {
  ref: 'CrmProject',
  localField: '_id',
  foreignField: 'client',
});

crmClientSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmClient || mongoose.model('CrmClient', crmClientSchema);
