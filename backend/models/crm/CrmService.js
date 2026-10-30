const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Master Service — digital-marketing service catalogue for DigiKraft Social.
 * e.g. SEO, Social Media Management, PPC, Content Marketing, Web Design…
 */
const crmServiceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true, maxLength: 200 },
    description: { type: String, default: '', maxLength: 2000 },
    category: {
      type: String,
      enum: ['seo', 'smm', 'ppc', 'content', 'web_design', 'email_marketing', 'branding', 'video', 'analytics', 'other'],
      default: 'other',
    },
    base_price: { type: Number, default: 0 },
    price_unit: {
      type: String,
      enum: ['monthly', 'one_time', 'per_post', 'per_hour', 'custom'],
      default: 'monthly',
    },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    created_by: { type: String, ref: 'CrmUser', required: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_services',
  }
);

crmServiceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmService || mongoose.model('CrmService', crmServiceSchema);
