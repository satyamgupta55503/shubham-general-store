const mongoose = require("mongoose");

const GroceryCategorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    image:       { type: String, default: "" },         // image URL
    icon:        { type: String, default: "" },         // emoji or icon name
    color:       { type: String, default: "#16a34a" },  // hex for UI
    parent:      { type: mongoose.Schema.Types.ObjectId, ref: "GroceryCategory", default: null },
    sortOrder:   { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
    isFeatured:  { type: Boolean, default: false },
    metaTitle:   { type: String, default: "" },
    metaDesc:    { type: String, default: "" },
  },
  { timestamps: true }
);

// slug already indexed via `unique: true` above — only add non-unique indexes here
GroceryCategorySchema.index({ parent: 1 });

module.exports = mongoose.model("GroceryCategory", GroceryCategorySchema);
