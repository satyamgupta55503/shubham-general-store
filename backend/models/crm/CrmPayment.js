const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmPaymentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },

    // ── Linked invoice (optional — can record payment without invoice) ─────────
    invoice: { type: String, ref: 'CrmInvoice', default: null },

    // ── Direct (no-invoice) payment info ──────────────────────────────────────
    client_name_direct: { type: String, default: '' },  // used when no invoice linked
    description:        { type: String, default: '' },  // e.g. "Advance for project"

    // ── Payment details ────────────────────────────────────────────────────────
    amount_paid: {
      type: Number,
      required: true,
      min: [0.01, 'Payment amount must be greater than zero.'],
    },
    // Full datetime — stores both date and time of payment
    payment_date: { type: Date, required: true, default: Date.now },

    payment_mode: {
      type: String,
      enum: ['bank_transfer', 'cheque', 'cash', 'upi', 'neft', 'razorpay', 'paypal', 'other'],
      default: 'upi',
    },
    reference_number: { type: String, default: '' },
    notes:            { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_payments',
  }
);

// ── Auto-recalculate invoice balance after payment save/delete ────────────────
async function recalc(invoiceId) {
  if (!invoiceId) return;
  try {
    const inv = await mongoose.model('CrmInvoice').findById(invoiceId);
    if (inv) await inv.update_balance();
  } catch (e) {
    console.error('CRM payment balance recalc error:', e.message);
  }
}

crmPaymentSchema.post('save',            async (doc) => recalc(doc.invoice));
crmPaymentSchema.post('findOneAndDelete', async (doc) => { if (doc) recalc(doc.invoice); });

crmPaymentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmPayment || mongoose.model('CrmPayment', crmPaymentSchema);
