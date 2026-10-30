const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Enquiry — leads / enquiries specific to the DigiKraft Social CRM.
 * Note: website contact form enquiries go to the existing Enquiry (CMS) model.
 * CRM enquiries are manually logged or come from social/DM leads.
 */
const crmEnquirySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    client_name: { type: String, required: true, maxLength: 200 },
    mobile_number: { type: String, required: true, maxLength: 20 },
    email: { type: String, default: '', maxLength: 200 },
    address: { type: String, default: '' },
    enquiry_date: { type: Date, default: Date.now },
    service_interest: {
      type: String,
      enum: ['seo', 'smm', 'ppc', 'content', 'web_design', 'branding', 'email_marketing', 'video', 'full_package', 'other', ''],
      default: '',
    },
    budget_range: { type: String, default: '', maxLength: 100 },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['new', 'contacted', 'proposal_sent', 'converted', 'lost'],
      default: 'new',
    },
    source: {
      type: String,
      enum: ['manual', 'website', 'instagram', 'facebook', 'linkedin', 'referral', 'other'],
      default: 'manual',
    },
    created_by: { type: String, ref: 'CrmUser', default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_enquiries',
  }
);

crmEnquirySchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmEnquiry || mongoose.model('CrmEnquiry', crmEnquirySchema);
