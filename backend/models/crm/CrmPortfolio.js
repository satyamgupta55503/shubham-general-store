const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Portfolio — DigiKraft Social's case studies / completed work gallery.
 * Separate from the website CMS portfolio (which is managed by existing CMS code).
 */
const crmPortfolioSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    client: { type: String, ref: 'CrmClient', default: null },
    title: { type: String, required: true, maxLength: 200 },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['seo', 'smm', 'ppc', 'content', 'web_design', 'branding', 'email', 'video', 'other'],
      default: 'other',
    },
    tags: [{ type: String }],
    cover_image: { type: String, default: '' },   // URL / upload path
    images: [{ type: String }],                   // gallery
    live_url: { type: String, default: '' },
    results_summary: { type: String, default: '' }, // key metrics achieved
    is_published: { type: Boolean, default: false },
    // Snapshot
    client_name_snapshot: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_portfolio',
  }
);

crmPortfolioSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmPortfolio || mongoose.model('CrmPortfolio', crmPortfolioSchema);
