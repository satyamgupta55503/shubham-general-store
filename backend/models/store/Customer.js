const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const AddressSchema = new mongoose.Schema({
  label:     { type: String, default: "Home" },   // Home / Work / Shop / Other
  fullName:  { type: String, required: true },
  phone:     { type: String, required: true },
  line1:     { type: String, required: true },
  line2:     { type: String, default: "" },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const CustomerSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:     { type: String, default: "" },
    password:  { type: String, required: true, select: false },

    // ── Customer type (retail = footkar | wholesale = thok) ──
    customerType: {
      type: String,
      enum: ["retail", "wholesale"],
      default: "retail",
      index: true,
    },

    // ── Wholesale / business details (only for thok buyers) ──
    businessName:    { type: String, default: "" },
    gstin:           { type: String, default: "" },
    businessType:    { type: String, default: "" },   // e.g. kirana, restaurant, reseller
    businessAddress: { type: String, default: "" },

    // Wholesale accounts require admin approval before they can order at thok rates
    isApproved:      { type: Boolean, default: true }, // retail = auto true; wholesale set false on signup
    approvedBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt:      { type: Date, default: null },

    // ── Credit / Ledger (wholesale udhaar system) ──
    creditLimit:        { type: Number, default: 0 },   // max allowed outstanding (0 = no credit)
    outstandingBalance: { type: Number, default: 0 },   // current baaki (due). +ve = customer owes store

    // Profile
    avatar:    { type: String, default: "" },
    dob:       { type: Date, default: null },
    gender:    { type: String, enum: ["male", "female", "other", ""], default: "" },

    // Addresses
    addresses: [AddressSchema],

    // Wishlist — product IDs
    wishlist:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // Status
    isActive:        { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailOtp:        { type: String, default: null },
    emailOtpExp:     { type: Date,   default: null },

    // Password reset
    resetToken:    { type: String, default: null },
    resetTokenExp: { type: Date,   default: null },

    // Wallet / loyalty (future use)
    walletBalance: { type: Number, default: 0 },
    loyaltyPoints: { type: Number, default: 0 },

    // Metadata
    totalOrders:   { type: Number, default: 0 },
    totalSpent:    { type: Number, default: 0 },
    lastOrderAt:   { type: Date,   default: null },
  },
  { timestamps: true }
);

// Hash password before save (async hook — no next() needed)
CustomerSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
CustomerSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("Customer", CustomerSchema);
