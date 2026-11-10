const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  product:      { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:         { type: String, required: true },
  thumbnail:    { type: String },
  sku:          { type: String },
  price:        { type: Number, required: true },    // unit price at order time
  quantity:     { type: Number, required: true, min: 1 },
  unit:         { type: String },
  packSize:     { type: String },
  itemTotal:    { type: Number, required: true },    // price * qty
}, { _id: true });

const ShippingAddressSchema = new mongoose.Schema({
  fullName:  { type: String, required: true },
  phone:     { type: String, required: true },
  line1:     { type: String, required: true },
  line2:     { type: String, default: "" },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema(
  {
    orderNumber:     { type: String, unique: true },     // auto-generated SGS-XXXXXX
    customer:        { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    orderType:       { type: String, enum: ["retail", "wholesale"], default: "retail", index: true },
    items:           [OrderItemSchema],
    shippingAddress: { type: ShippingAddressSchema, required: true },

    // Financials
    subtotal:        { type: Number, required: true },
    shippingCharge:  { type: Number, default: 0 },
    discount:        { type: Number, default: 0 },
    couponCode:      { type: String, default: "" },
    taxAmount:       { type: Number, default: 0 },
    totalAmount:     { type: Number, required: true },

    // Payment
    paymentMethod:   { type: String, enum: ["cod", "online", "upi"], default: "cod" },
    paymentStatus:   { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentId:       { type: String, default: "" },     // Razorpay / UPI ref

    // Order lifecycle
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "placed",
    },

    // Timeline (status history)
    statusHistory: [
      {
        status:  { type: String },
        note:    { type: String },
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    // Delivery
    deliveryDate:   { type: Date, default: null },
    deliveredAt:    { type: Date, default: null },
    trackingNumber: { type: String, default: "" },

    // Notes
    customerNote:   { type: String, default: "" },
    adminNote:      { type: String, default: "" },

    // Cancellation / Return
    cancelReason:  { type: String, default: "" },
    returnReason:  { type: String, default: "" },
    returnedAt:    { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-generate order number SGS-XXXXXX before validation
// (Mongoose 9: async hooks must not take/call `next`)
OrderSchema.pre("validate", async function () {
  if (!this.orderNumber) {
    const count = await mongoose.model("Order").countDocuments();
    this.orderNumber = `SGS-${String(count + 1).padStart(6, "0")}`;
  }
});

// orderNumber already indexed via `unique: true` above
OrderSchema.index({ customer: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("Order", OrderSchema);
