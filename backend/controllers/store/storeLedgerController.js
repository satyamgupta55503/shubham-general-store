const Ledger   = require("../../models/store/Ledger");
const Customer = require("../../models/store/Customer");

/**
 * Ledger (Khata) controller
 * - Customer self-view (read-only, transparent)
 * - Admin CRUD on entries (RBAC: superadmin/admin can write; author read-only)
 * - System auto-entries (on order / payment) via exported helper
 */

// Ensure a ledger doc exists for a customer
async function getOrCreateLedger(customerId) {
  let ledger = await Ledger.findOne({ customer: customerId });
  if (!ledger) {
    const cust = await Customer.findById(customerId).select("name");
    ledger = await Ledger.create({
      customer: customerId,
      customerName: cust?.name || "",
      entries: [],
    });
  }
  return ledger;
}

/**
 * HELPER (exported) — add an entry programmatically (e.g. from order controller).
 * Keeps customer.outstandingBalance in sync.
 */
async function addLedgerEntry(customerId, {
  type, amount, note = "", reference = "", order = null, orderNumber = "",
  paymentMethod = "", source = "admin", createdBy = null, createdByName = "", createdByRole = "",
  entryDate = new Date(),
}) {
  const ledger = await getOrCreateLedger(customerId);
  ledger.entries.push({
    type, amount: Number(amount), note, reference, order, orderNumber,
    paymentMethod, source,
    createdByModel: source === "system" ? "System" : "User",
    createdBy, createdByName, createdByRole, entryDate,
    balanceAfter: 0, // recompute will fix
  });
  ledger.recompute();
  await ledger.save();

  // Sync customer's cached outstanding balance
  await Customer.findByIdAndUpdate(customerId, { outstandingBalance: ledger.balance });
  return ledger;
}

// ─── CUSTOMER SELF-VIEW ─────────────────────────────────────────────────────

// GET /api/store/ledger/my  — customer sees their own khata (transparent, read-only)
exports.getMyLedger = async (req, res) => {
  try {
    const ledger = await getOrCreateLedger(req.customer.id);
    const entries = ledger.entries
      .filter(e => !e.isDeleted)
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate)); // newest first for display

    res.json({
      success: true,
      data: {
        customerName: ledger.customerName,
        totalBaaki:   ledger.totalBaaki,
        totalJama:    ledger.totalJama,
        balance:      ledger.balance,
        entries: entries.map(e => ({
          _id: e._id, type: e.type, amount: e.amount, balanceAfter: e.balanceAfter,
          note: e.note, reference: e.reference, orderNumber: e.orderNumber,
          paymentMethod: e.paymentMethod, entryDate: e.entryDate, createdAt: e.createdAt,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// GET /api/store/admin/ledger/:customerId  — admin view full khata (incl. audit)
exports.adminGetLedger = async (req, res) => {
  try {
    const ledger = await getOrCreateLedger(req.params.customerId);
    const customer = await Customer.findById(req.params.customerId)
      .select("name email phone customerType businessName creditLimit");
    const entries = ledger.entries
      .filter(e => !e.isDeleted)
      .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));

    res.json({
      success: true,
      data: {
        customer,
        totalBaaki: ledger.totalBaaki,
        totalJama:  ledger.totalJama,
        balance:    ledger.balance,
        entries,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/admin/ledger/:customerId/entry  — add jama or baaki (RBAC: write)
exports.adminAddEntry = async (req, res) => {
  try {
    const { type, amount, note = "", reference = "", paymentMethod = "", entryDate } = req.body;

    if (!["baaki", "jama"].includes(type))
      return res.status(400).json({ success: false, message: "Type must be 'baaki' or 'jama'" });
    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ success: false, message: "Valid amount required" });

    const ledger = await addLedgerEntry(req.params.customerId, {
      type, amount, note, reference, paymentMethod,
      source: "admin",
      createdBy:     req.user?.id || null,
      createdByName: req.user?.name || req.user?.email || "Admin",
      createdByRole: req.user?.role || "admin",
      entryDate: entryDate ? new Date(entryDate) : new Date(),
    });

    res.status(201).json({ success: true, message: `${type === "jama" ? "Payment" : "Due"} recorded`, data: ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/ledger/:customerId/entry/:entryId  — edit entry (RBAC: write)
exports.adminUpdateEntry = async (req, res) => {
  try {
    const ledger = await Ledger.findOne({ customer: req.params.customerId });
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
    const entry = ledger.entries.id(req.params.entryId);
    if (!entry || entry.isDeleted) return res.status(404).json({ success: false, message: "Entry not found" });

    const { amount, note, reference, paymentMethod, type, entryDate } = req.body;
    if (amount !== undefined)        entry.amount = Number(amount);
    if (note !== undefined)          entry.note = note;
    if (reference !== undefined)     entry.reference = reference;
    if (paymentMethod !== undefined) entry.paymentMethod = paymentMethod;
    if (type && ["baaki", "jama"].includes(type)) entry.type = type;
    if (entryDate)                   entry.entryDate = new Date(entryDate);

    ledger.recompute();
    await ledger.save();
    await Customer.findByIdAndUpdate(req.params.customerId, { outstandingBalance: ledger.balance });

    res.json({ success: true, message: "Entry updated", data: ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/admin/ledger/:customerId/entry/:entryId  — soft delete (RBAC: write)
exports.adminDeleteEntry = async (req, res) => {
  try {
    const ledger = await Ledger.findOne({ customer: req.params.customerId });
    if (!ledger) return res.status(404).json({ success: false, message: "Ledger not found" });
    const entry = ledger.entries.id(req.params.entryId);
    if (!entry || entry.isDeleted) return res.status(404).json({ success: false, message: "Entry not found" });

    entry.isDeleted = true;
    entry.deletedBy = req.user?.name || req.user?.email || "Admin";
    entry.deletedAt = new Date();

    ledger.recompute();
    await ledger.save();
    await Customer.findByIdAndUpdate(req.params.customerId, { outstandingBalance: ledger.balance });

    res.json({ success: true, message: "Entry removed", data: ledger });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/admin/ledger  — overview: all customers with outstanding balance
exports.adminLedgerOverview = async (req, res) => {
  try {
    const { page = 1, limit = 30, search } = req.query;
    const filter = { customerType: "wholesale" };
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { businessName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ outstandingBalance: -1 }).skip(skip).limit(Number(limit))
        .select("name businessName phone email customerType creditLimit outstandingBalance"),
      Customer.countDocuments(filter),
    ]);

    const totalOutstanding = await Customer.aggregate([
      { $match: { customerType: "wholesale" } },
      { $group: { _id: null, total: { $sum: "$outstandingBalance" } } },
    ]);

    res.json({
      success: true,
      data: customers,
      totalOutstanding: totalOutstanding[0]?.total || 0,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Export helper for use in order controller
exports.addLedgerEntry = addLedgerEntry;
exports.getOrCreateLedger = getOrCreateLedger;
