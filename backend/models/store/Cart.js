const mongoose = require("mongoose");

const CartItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:      { type: String },         // snapshot at add-time
  thumbnail: { type: String },
  price:     { type: Number },         // effective price at add-time
  quantity:  { type: Number, default: 1, min: 1 },
  unit:      { type: String },
  packSize:  { type: String },
}, { _id: true });

const CartSchema = new mongoose.Schema(
  {
    // One of these must be set
    customer:  { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
    sessionId: { type: String, default: null },   // for guest carts

    items:     [CartItemSchema],

    // Coupon applied
    couponCode:     { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },

    // Expiry for guest carts
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  },
  { timestamps: true }
);

CartSchema.index({ customer: 1 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for guest carts

module.exports = mongoose.model("Cart", CartSchema);
