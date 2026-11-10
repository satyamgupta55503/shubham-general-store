const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

/**
 * CRM Order Sheet — a manual, editable order list created in CRM and sent
 * to a store customer. Once sent, it becomes locked (cannot be deleted/edited)
 * so it stays transparent and permanent for both the customer and the store.
 */
const orderItemSchema = new mongoose.Schema(
  {
    name:     { type: String, default: '' },   // saaman ka naam
    quantity: { type: Number, default: 1 },     // matra
    quality:  { type: String, default: '' },    // quality / grade
    price:    { type: Number, default: 0 },      // unit price
  },
  { _id: true }
);

const crmOrderSheetSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    order_number: { type: String, unique: true },

    // Linked store customer (required so it can appear in their profile)
    store_customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null, index: true },
    customer_name_snapshot: { type: String, default: '' },

    items: [orderItemSchema],
    notes: { type: String, default: '' },

    // Totals (auto-computed)
    total_quantity: { type: Number, default: 0 },
    grand_total:    { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'sent'],
      default: 'draft',
    },

    // Send / lock state — once sent, locked = true (no delete/edit)
    send: {
      sent:       { type: Boolean, default: false, index: true },
      subject:    { type: String,  default: '' },
      message:    { type: String,  default: '' },
      sentAt:     { type: Date,    default: null },
      sentByName: { type: String,  default: '' },
    },
    locked: { type: Boolean, default: false },

    created_by_name: { type: String, default: '' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_order_sheets',
  }
);

// Recompute totals before save
// (Mongoose 9: hooks must not take/call `next`)
crmOrderSheetSchema.pre('save', function () {
  const items = this.items || [];
  this.total_quantity = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  this.grand_total = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
});

crmOrderSheetSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmOrderSheet || mongoose.model('CrmOrderSheet', crmOrderSheetSchema);
