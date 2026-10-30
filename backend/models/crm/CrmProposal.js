const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const crmProposalSchema = new mongoose.Schema(
  {
    _id: { type: String, default: uuidv4 },
    project: { type: String, ref: 'CrmProject', required: true },
    prop_number: { type: String, required: true, unique: true },
    title: { type: String, required: true, maxLength: 300 },
    content: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected'],
      default: 'draft',
    },
    valid_until: { type: Date, default: null },
    notes: { type: String, default: '' },
    services: [{ type: String, ref: 'CrmService' }],
    // Snapshot
    client_name_snapshot:    { type: String, default: '' },
    client_gstin_snapshot:   { type: String, default: '' },
    client_address_snapshot: { type: String, default: '' },
    project_name_snapshot:   { type: String, default: '' },
    // GST & compliance
    place_of_supply: { type: String, default: 'Chhattisgarh' },
    hsn_sac:         { type: String, default: '998319' },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    collection: 'crm_proposals',
  }
);

crmProposalSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  },
});

module.exports = mongoose.models.CrmProposal || mongoose.model('CrmProposal', crmProposalSchema);
