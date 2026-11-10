const mongoose = require("mongoose");

/** DocFolder — a folder in the admin Documents module (nestable). parent=null → root. */
const DocFolderSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true, maxlength: 120 },
    parent:    { type: mongoose.Schema.Types.ObjectId, ref: "DocFolder", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true, collection: "store_doc_folders" }
);

DocFolderSchema.index({ parent: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("DocFolder", DocFolderSchema);
