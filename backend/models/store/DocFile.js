const mongoose = require("mongoose");

/** DocFile — a PDF / Word / image stored on Cloudinary inside a DocFolder (folder=null → root). */
const DocFileSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true, maxlength: 120 },
    originalName:  { type: String, default: "" },
    folder:        { type: mongoose.Schema.Types.ObjectId, ref: "DocFolder", default: null },
    url:           { type: String, required: true },
    public_id:     { type: String, required: true },
    resource_type: { type: String, default: "raw" },
    format:        { type: String, default: "" },   // pdf, doc, docx, jpg, png, webp
    kind:          { type: String, default: "" },   // pdf | doc | image
    mimetype:      { type: String, default: "" },
    bytes:         { type: Number, default: 0 },
    uploadedBy:    { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, collection: "store_doc_files" }
);

DocFileSchema.index({ folder: 1, name: 1 });

module.exports = mongoose.model("DocFile", DocFileSchema);
