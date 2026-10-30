const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    customer:   { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    name:       { type: String, required: true },
    rating:     { type: Number, required: true, min: 1, max: 5 },
    comment:    { type: String, default: "" },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    shortDesc:   { type: String, default: "" },

    // ── Retail pricing (footkar) ──
    price:       { type: Number, required: true, min: 0 },   // MRP
    salePrice:   { type: Number, default: null },            // null = no sale
    costPrice:   { type: Number, default: 0 },               // for profit calc

    // ── Wholesale pricing (thok) ──
    isWholesaleAvailable: { type: Boolean, default: false }, // can thok buyers order this?
    wholesalePrice:       { type: Number, default: null },   // per-unit thok rate
    wholesaleSalePrice:   { type: Number, default: null },   // discounted thok rate
    moq:                  { type: Number, default: 1 },      // minimum order quantity for wholesale

    // Media
    images:      [{ type: String }],                    // array of image URLs
    thumbnail:   { type: String, default: "" },         // primary image

    // Classification
    category:    { type: mongoose.Schema.Types.ObjectId, ref: "GroceryCategory", required: true },
    brand:       { type: String, default: "" },
    tags:        [{ type: String }],

    // Inventory
    sku:         { type: String, default: "" },
    barcode:     { type: String, default: "" },
    stockQty:    { type: Number, default: 0, min: 0 },
    lowStockAt:  { type: Number, default: 10 },         // alert threshold
    trackStock:  { type: Boolean, default: true },

    // Unit info (grocery specific)
    unit:        { type: String, default: "piece", enum: ["kg", "g", "L", "ml", "piece", "pack", "dozen", "box"] },
    weight:      { type: Number, default: 0 },          // in grams
    packSize:    { type: String, default: "" },         // e.g. "500g", "1L"

    // Flags
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    isNewArrival:{ type: Boolean, default: false },
    isBestSeller:{ type: Boolean, default: false },
    isOrganic:   { type: Boolean, default: false },
    isVeg:       { type: Boolean, default: true },

    // Ratings summary (denormalised for performance)
    avgRating:   { type: Number, default: 0 },
    numReviews:  { type: Number, default: 0 },
    reviews:     [ReviewSchema],

    // SEO
    metaTitle:   { type: String, default: "" },
    metaDesc:    { type: String, default: "" },
  },
  { timestamps: true }
);

// slug already indexed via `unique: true` above
ProductSchema.index({ category: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isBestSeller: 1 });
ProductSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });

module.exports = mongoose.model("Product", ProductSchema);
