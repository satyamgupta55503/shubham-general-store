const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * CrmLedger (Khata) — one document per client.
 * Superadmin/owner maintains jama (payment received) + baaki (amount due)
 * with optional item details (saman, quantity, unit, rate). Full date+time audit.
 *
 * balanceAfter: running outstanding balance AFTER this entry.
 *   +ve = client owes money (baaki)   |   0 = settled
 */

const CrmLedgerEntrySchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },

    // ── Type ──
    type: {
      type: String,
      enum: ["baaki", "jama"],   // baaki = due (debit) | jama = payment received (credit)
      required: true,
    },

    amount:       { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, default: 0 },   // running balance after this entry

    // ── Optional item details (saman / quantity / unit / rate) ──
    item:         { type: String, default: "" },   // e.g. "Rice", "Cement bag"
    quantity:     { type: Number, default: null }, // optional
    unit:         { type: String, default: "" },   // e.g. kg, bag, piece, L
    rate:         { type: Number, default: null }, // optional per-unit rate

    // ── Note / reference ──
    note:         { type: String, default: "" },
    reference:    { type: String, default: "" },   // e.g. UPI txn id, cash, bill no
    paymentMode:  { type: String, enum: ["cash", "upi", "bank", "cheque", "online", "adjustment", ""], default: "" },

    // ── Date + time (admin can backdate; defaults to now) ──
    entryDate:    { type: Date, default: Date.now },

    // ── Audit ──
    createdBy:     { type: String, ref: "CrmUser", default: null },
    createdByName: { type: String, default: "" },
    createdByRole: { type: String, default: "" },

    // Soft delete (keep audit trail)
    isDeleted:    { type: Boolean, default: false },
    deletedBy:    { type: String, default: "" },
    deletedAt:    { type: Date, default: null },
  },
  { _id: false, timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const CrmLedgerSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },

    // Link to a CRM client (optional) OR a free-text client name
    client:       { type: String, ref: "CrmClient", default: null },
    clientName:   { type: String, required: true },   // always store a display name
    clientPhone:  { type: String, default: "" },

    entries:      [CrmLedgerEntrySchema],

    // Denormalised totals (recomputed on change)
    totalBaaki:   { type: Number, default: 0 },
    totalJama:    { type: Number, default: 0 },
    balance:      { type: Number, default: 0 },   // current outstanding
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "crm_ledgers",
  }
);

/** Recompute chronological running balances + totals */
CrmLedgerSchema.methods.recompute = function () {
  let running = 0, totalBaaki = 0, totalJama = 0;
  const sorted = [...this.entries]
    .filter(e => !e.isDeleted)
    .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate) || new Date(a.created_at) - new Date(b.created_at));

  for (const e of sorted) {
    if (e.type === "baaki") { running += e.amount; totalBaaki += e.amount; }
    else                    { running -= e.amount; totalJama  += e.amount; }
    e.balanceAfter = running;
  }
  this.totalBaaki = totalBaaki;
  this.totalJama  = totalJama;
  this.balance    = running;
  return this;
};

CrmLedgerSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmLedger || mongoose.model("CrmLedger", CrmLedgerSchema);
