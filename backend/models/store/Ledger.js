const mongoose = require("mongoose");

/**
 * Ledger (Khata) — one document per customer.
 * Tracks jama (credit / payment received) and baaki (debit / amount due).
 *
 * balanceAfter: running outstanding balance AFTER this entry.
 *   +ve = customer owes the store (baaki)
 *   0   = settled
 *
 * Every entry records WHO created it + WHEN (date + time via timestamps),
 * supporting a full audit trail + RBAC accountability.
 */

const LedgerEntrySchema = new mongoose.Schema(
  {
    // ── Type ──
    type: {
      type: String,
      enum: ["baaki", "jama"],   // baaki = debit (due added) | jama = credit (payment received)
      required: true,
    },

    amount:       { type: Number, required: true, min: 0 },
    balanceAfter: { type: Number, required: true },   // running balance after this entry

    // ── Description / reference ──
    note:         { type: String, default: "" },
    reference:    { type: String, default: "" },      // e.g. "Order SGS-000123", "UPI", "Cash"

    // Link to an order if this entry came from one
    order:        { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    orderNumber:  { type: String, default: "" },

    // ── Payment method (for jama entries) ──
    paymentMethod:{ type: String, enum: ["cash", "upi", "bank", "cheque", "online", "adjustment", ""], default: "" },

    // ── Audit / RBAC ──
    source:       { type: String, enum: ["system", "admin"], default: "admin" }, // system = auto (order), admin = manual
    createdByModel:{ type: String, enum: ["User", "System"], default: "User" },
    createdBy:    { type: mongoose.Schema.Types.ObjectId, refPath: "entries.createdByModel", default: null },
    createdByName:{ type: String, default: "" },
    createdByRole:{ type: String, default: "" },

    // Soft delete (keep audit trail even if reversed)
    isDeleted:    { type: Boolean, default: false },
    deletedBy:    { type: String, default: "" },
    deletedAt:    { type: Date, default: null },

    // Entry effective date (admin can backdate; defaults to now)
    entryDate:    { type: Date, default: Date.now },
  },
  { _id: true, timestamps: true }   // createdAt/updatedAt per entry
);

const LedgerSchema = new mongoose.Schema(
  {
    customer:     { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, unique: true, index: true },
    customerName: { type: String, default: "" },

    entries:      [LedgerEntrySchema],

    // Denormalised running totals (recomputed on every change)
    totalBaaki:   { type: Number, default: 0 },   // lifetime dues raised
    totalJama:    { type: Number, default: 0 },   // lifetime payments received
    balance:      { type: Number, default: 0 },   // current outstanding (totalBaaki - totalJama)
  },
  { timestamps: true }
);

/**
 * Recompute running balances + totals across all non-deleted entries.
 * Call after any mutation, then save.
 */
LedgerSchema.methods.recompute = function () {
  let running = 0, totalBaaki = 0, totalJama = 0;
  // Sort by entryDate then creation so running balance is chronological
  const sorted = [...this.entries]
    .filter(e => !e.isDeleted)
    .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate) || new Date(a.createdAt) - new Date(b.createdAt));

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

module.exports = mongoose.model("Ledger", LedgerSchema);
