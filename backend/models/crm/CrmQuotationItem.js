const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmQuotationItemSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    quotation: { type: String, ref: 'CrmQuotation', required: true },
    description: { type: String, required: true, maxLength: 500 },
    quantity: { type: Number, default: 1 },
    unit_price: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    sort_order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_quotation_items',
  }
);

crmQuotationItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmQuotationItem || mongoose.model('CrmQuotationItem', crmQuotationItemSchema);
