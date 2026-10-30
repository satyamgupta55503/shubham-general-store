const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmInvoiceItemSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    invoice: { type: String, ref: 'CrmInvoice', required: true },
    description: { type: String, required: true, maxLength: 500 },
    quantity: { type: Number, default: 1 },
    unit_price: { type: Number, default: 0 },
    total_price: { type: Number, default: 0 },
    sort_order: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_invoice_items',
  }
);

crmInvoiceItemSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmInvoiceItem || mongoose.model('CrmInvoiceItem', crmInvoiceItemSchema);
