const CrmLedger  = require("../../models/crm/CrmLedger");
const CrmClient  = require("../../models/crm/CrmClient");
const CrmHistory = require("../../models/crm/CrmHistory");

const logHistory = async (req, action, label, desc = "") => {
  try {
    await CrmHistory.create({
      actor: req.crmUser._id, actor_name: req.crmUser.full_name,
      action, entity_type: "ledger", entity_id: label, entity_label: label, description: desc,
    });
  } catch { /* non-critical */ }
};

// GET /api/crm/ledger  — overview list of all ledgers with balances
exports.list = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { clientName:  { $regex: search, $options: "i" } },
      { clientPhone: { $regex: search, $options: "i" } },
    ];
    const ledgers = await CrmLedger.find(filter).sort({ updated_at: -1 });

    const totalOutstanding = ledgers.reduce((s, l) => s + (l.balance > 0 ? l.balance : 0), 0);

    res.json({
      success: true,
      data: ledgers.map(l => l.toJSON()),
      totalOutstanding,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/crm/ledger/:id  — single ledger with entries (newest first)
exports.getOne = async (req, res) => {
  try {
    const ledger = await CrmLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });

    const obj = ledger.toJSON();
    obj.entries = (obj.entries || [])
      .filter(e => !e.isDeleted)
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
    res.json({ success: true, data: obj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/crm/ledger  — create a new client ledger (owner)
exports.create = async (req, res) => {
  try {
    const { clientName, clientPhone = "", client = null } = req.body;
    if (!clientName?.trim())
      return res.status(400).json({ success: false, message: "Client name is required" });

    // If linked to an existing CRM client, prevent duplicate ledgers
    if (client) {
      const existing = await CrmLedger.findOne({ client });
      if (existing) return res.json({ success: true, data: existing.toJSON(), message: "Ledger already exists" });
    }

    const ledger = await CrmLedger.create({ clientName: clientName.trim(), clientPhone, client });
    await logHistory(req, "created", ledger.clientName, "Ledger created");
    res.status(201).json({ success: true, data: ledger.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/crm/ledger/:id/entry  — add jama / baaki entry (owner)
exports.addEntry = async (req, res) => {
  try {
    const {
      type, amount, item = "", quantity, unit = "", rate,
      note = "", reference = "", paymentMode = "", entryDate,
    } = req.body;

    if (!["baaki", "jama"].includes(type))
      return res.status(400).json({ success: false, message: "Type must be 'baaki' or 'jama'" });
    if (amount === undefined || Number(amount) < 0)
      return res.status(400).json({ success: false, message: "Valid amount required" });

    const ledger = await CrmLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });

    ledger.entries.push({
      type,
      amount: Number(amount),
      item, unit, note, reference, paymentMode,
      quantity: quantity !== undefined && quantity !== "" ? Number(quantity) : null,
      rate:     rate !== undefined && rate !== "" ? Number(rate) : null,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      createdBy:     req.crmUser._id,
      createdByName: req.crmUser.full_name,
      createdByRole: req.crmUser.role,
      balanceAfter: 0,
    });
    ledger.recompute();
    await ledger.save();

    await logHistory(req, type === "jama" ? "payment" : "due", ledger.clientName, `${type} ₹${amount}${item ? ` (${item})` : ""}`);
    res.status(201).json({ success: true, message: `${type === "jama" ? "Payment" : "Due"} recorded`, data: ledger.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/crm/ledger/:id/entry/:entryId  — edit entry (owner)
exports.updateEntry = async (req, res) => {
  try {
    const ledger = await CrmLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
    const entry = ledger.entries.find(e => e._id === req.params.entryId && !e.isDeleted);
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

    const f = req.body;
    if (f.type && ["baaki", "jama"].includes(f.type)) entry.type = f.type;
    if (f.amount !== undefined)      entry.amount = Number(f.amount);
    if (f.item !== undefined)        entry.item = f.item;
    if (f.quantity !== undefined)    entry.quantity = f.quantity === "" ? null : Number(f.quantity);
    if (f.unit !== undefined)        entry.unit = f.unit;
    if (f.rate !== undefined)        entry.rate = f.rate === "" ? null : Number(f.rate);
    if (f.note !== undefined)        entry.note = f.note;
    if (f.reference !== undefined)   entry.reference = f.reference;
    if (f.paymentMode !== undefined) entry.paymentMode = f.paymentMode;
    if (f.entryDate)                 entry.entryDate = new Date(f.entryDate);

    ledger.recompute();
    await ledger.save();
    res.json({ success: true, message: "Entry updated", data: ledger.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/crm/ledger/:id/entry/:entryId  — soft delete entry (owner)
exports.deleteEntry = async (req, res) => {
  try {
    const ledger = await CrmLedger.findById(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
    const entry = ledger.entries.find(e => e._id === req.params.entryId && !e.isDeleted);
    if (!entry) return res.status(404).json({ success: false, message: "Entry not found" });

    entry.isDeleted = true;
    entry.deletedBy = req.crmUser.full_name;
    entry.deletedAt = new Date();

    ledger.recompute();
    await ledger.save();
    res.json({ success: true, message: "Entry removed", data: ledger.toJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/crm/ledger/:id  — delete a whole ledger (owner)
exports.remove = async (req, res) => {
  try {
    const ledger = await CrmLedger.findByIdAndDelete(req.params.id);
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
    await logHistory(req, "deleted", ledger.clientName, "Ledger deleted");
    res.json({ success: true, message: "Ledger deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/crm/ledger/clients/available  — existing CRM clients (to link)
exports.availableClients = async (req, res) => {
  try {
    const clients = await CrmClient.find().select("full_name company_name phone").sort({ full_name: 1 });
    res.json({ success: true, data: clients.map(c => ({ id: c._id, name: c.full_name, company: c.company_name, phone: c.phone })) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
