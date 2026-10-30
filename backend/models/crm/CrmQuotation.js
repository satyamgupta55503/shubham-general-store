const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmQuotationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    project: { type: String, ref: 'CrmProject', default: null },
    // Optional link to a Subham Store customer account — when set, this quotation
    // becomes visible in that customer's store profile. Null = CRM-only.
    store_customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    // "Send to Customer" state — only sent docs appear in the customer's store profile
    send: {
      sent:       { type: Boolean, default: false, index: true },
      subject:    { type: String,  default: '' },
      message:    { type: String,  default: '' },
      sentAt:     { type: Date,    default: null },
      sentByName: { type: String,  default: '' },
    },
    // Full history of every send (re-sends append here)
    sendLog: [
      {
        subject:    { type: String, default: '' },
        message:    { type: String, default: '' },
        sentAt:     { type: Date,   default: Date.now },
        sentByName: { type: String, default: '' },
      },
    ],
    quote_number: { type: String, required: true, unique: true },
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'sent', 'approved', 'rejected', 'superseded'],
      default: 'draft',
    },
    valid_until: { type: Date, default: null },
    // Financials
    subtotal: { type: Number, default: 0 },
    discount_type: { type: String, enum: ['fixed', 'percentage'], default: 'fixed' },
    discount_value: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    taxable_amount: { type: Number, default: 0 },
    cgst_rate: { type: Number, default: 9 },
    sgst_rate: { type: Number, default: 9 },
    igst_rate: { type: Number, default: 0 },
    cgst_amount: { type: Number, default: 0 },
    sgst_amount: { type: Number, default: 0 },
    igst_amount: { type: Number, default: 0 },
    total_tax: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    // Snapshots
    client_name_snapshot:    { type: String, default: '' },
    client_gstin_snapshot:   { type: String, default: '' },
    client_address_snapshot: { type: String, default: '' },
    client_state_snapshot:   { type: String, default: '' },
    project_name_snapshot:   { type: String, default: '' },
    billing_address:         { type: String, default: '' },
    // GST & compliance
    place_of_supply: { type: String, default: 'Chhattisgarh' },
    hsn_sac:         { type: String, default: '998319' },
    rounding_off:    { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_quotations',
  }
);

crmQuotationSchema.virtual('items', {
  ref: 'CrmQuotationItem',
  localField: '_id',
  foreignField: 'quotation',
});

crmQuotationSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmQuotation || mongoose.model('CrmQuotation', crmQuotationSchema);
