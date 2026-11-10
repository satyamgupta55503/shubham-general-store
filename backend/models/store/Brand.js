const mongoose = require("mongoose");

/**
 * Brand — a company whose products Subham General Store sells
 * (e.g. Sunder Biscuits, Nirma, Hulchal). A brand can mark the store as an
 * authorised dealer/distributor and has its own product lines
 * (e.g. Sunder → Biscuit, Namkeen, Chips…).
 *
 * Three ways products are grouped:
 *   1. Grocery category  (store-wide, e.g. "Biscuits & Cookies")  → Product.category
 *   2. Brand             (e.g. "Sunder")                           → Product.brandRef
 *   3. Brand product line (inside a brand, e.g. "Namkeen")         → Product.brandLine (line slug)
 */
const ProductLineSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image:       { type: String, default: "" },
    sortOrder:   { type: Number, default: 0 },
  },
  { _id: true }
);

const BrandSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    tagline:     { type: String, default: "" },
    description: { type: String, default: "" },
    logo:        { type: String, default: "" },   // Cloudinary URL
    banner:      { type: String, default: "" },   // Cloudinary URL (brand page header)
    color:       { type: String, default: "#16a34a" },
    website:     { type: String, default: "" },

    // Dealership
    isDealer:    { type: Boolean, default: true },          // store is an authorised dealer
    dealerType:  { type: String, default: "Authorised Dealer" }, // e.g. Distributor, Super Stockist
    dealerSince: { type: String, default: "" },             // free text, e.g. "2015"

    productLines: [ProductLineSchema],

    sortOrder:   { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },

    metaTitle:   { type: String, default: "" },
    metaDesc:    { type: String, default: "" },
  },
  { timestamps: true }
);

BrandSchema.index({ isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Brand", BrandSchema);
