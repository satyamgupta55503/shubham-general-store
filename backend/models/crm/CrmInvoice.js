const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmInvoiceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    project: { type: String, ref: 'CrmProject', required: true },
    quotation: { type: String, ref: 'CrmQuotation', default: null },
    // Optional link to a Subham Store customer account — when set, this invoice
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
    sendLog: [
      {
        subject:    { type: String, default: '' },
        message:    { type: String, default: '' },
        sentAt:     { type: Date,   default: Date.now },
        sentByName: { type: String, default: '' },
      },
    ],
    invoice_number: { type: String, required: true, unique: true },
    invoice_type: {
      type: String,
      enum: ['full', 'advance', 'milestone', 'final', 'monthly_retainer'],
      default: 'full',
    },
    invoice_date: { type: Date, required: true },
    due_date: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'issued', 'partial', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
    },
    milestone_label: { type: String, default: '' },
    // Financials
    subtotal: { type: Number, default: 0 },
    taxable_amount: { type: Number, default: 0 },
    cgst_rate: { type: Number, default: 0 },
    sgst_rate: { type: Number, default: 0 },
    igst_rate: { type: Number, default: 0 },
    cgst_amount: { type: Number, default: 0 },
    sgst_amount: { type: Number, default: 0 },
    igst_amount: { type: Number, default: 0 },
    total_tax: { type: Number, default: 0 },
    grand_total: { type: Number, default: 0 },
    amount_paid: { type: Number, default: 0 },
    balance_due: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    // Snapshots
    client_name_snapshot:   { type: String, default: '' },
    client_gstin_snapshot:  { type: String, default: '' },  // client ka GSTIN — GST tab dikhao jab ho
    client_address_snapshot:{ type: String, default: '' },
    client_state_snapshot:  { type: String, default: '' },
    project_name_snapshot:  { type: String, default: '' },
    billing_address:        { type: String, default: '' },
    // GST & compliance
    place_of_supply:  { type: String, default: 'Chhattisgarh' },
    hsn_sac:          { type: String, default: '998319' },  // default: IT/digital services
    rounding_off:     { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_invoices',
  }
);

crmInvoiceSchema.virtual('items', {
  ref: 'CrmInvoiceItem',
  localField: '_id',
  foreignField: 'invoice',
});

crmInvoiceSchema.methods.update_balance = async function () {
  const CrmPayment = mongoose.model('CrmPayment');
  const result = await CrmPayment.aggregate([
    { $match: { invoice: this._id } },
    { $group: { _id: null, total: { $sum: '$amount_paid' } } },
  ]);
  const paid = result.length > 0 ? result[0].total : 0;
  const balance = this.grand_total - paid;
  let newStatus = this.status;
  if (['issued', 'partial', 'paid', 'overdue'].includes(this.status)) {
    if (balance <= 0) newStatus = 'paid';
    else if (paid > 0) newStatus = 'partial';
    else newStatus = 'issued';
  }
  await mongoose.model('CrmInvoice').updateOne(
    { _id: this._id },
    { $set: { amount_paid: paid, balance_due: Math.max(0, balance), status: newStatus } }
  );
  this.amount_paid = paid;
  this.balance_due = Math.max(0, balance);
  this.status = newStatus;
};

crmInvoiceSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmInvoice || mongoose.model('CrmInvoice', crmInvoiceSchema);
