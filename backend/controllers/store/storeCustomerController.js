const Customer = require("../../models/store/Customer");
const jwt      = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_CUSTOMER_SECRET || process.env.JWT_SECRET;

const signToken = (id) =>
  jwt.sign({ id, role: "customer" }, JWT_SECRET, { expiresIn: "30d" });

// Shape the public customer object returned to the client
const publicCustomer = (c) => ({
  _id:                c._id,
  name:               c.name,
  email:              c.email,
  phone:              c.phone,
  avatar:             c.avatar,
  customerType:       c.customerType,
  businessName:       c.businessName,
  gstin:              c.gstin,
  isApproved:         c.isApproved,
  creditLimit:        c.creditLimit,
  outstandingBalance: c.outstandingBalance,
});

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// POST /api/store/customers/register
// ALL customers (retail + wholesale) register first, then wait for admin approval.
// No token is issued on register — they can only log in AFTER approval.
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      customerType = "retail",
      businessName, gstin, businessType, businessAddress,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email, and password are required" });

    const type = customerType === "wholesale" ? "wholesale" : "retail";

    // Wholesale needs business name
    if (type === "wholesale" && !businessName?.trim())
      return res.status(400).json({ success: false, message: "Business name is required for wholesale accounts" });

    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: "Email already registered" });

    await Customer.create({
      name, email, password, phone,
      customerType: type,
      businessName:    type === "wholesale" ? (businessName || "")    : "",
      gstin:           type === "wholesale" ? (gstin || "")           : "",
      businessType:    type === "wholesale" ? (businessType || "")    : "",
      businessAddress: type === "wholesale" ? (businessAddress || "") : "",
      // EVERY new customer needs admin approval before they can log in
      isApproved: false,
    });

    // No token — account is pending approval
    res.status(201).json({
      success: true,
      pendingApproval: true,
      message: "Registration successful! Your account is pending admin approval. You'll be able to log in once an admin approves it.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/customers/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const customer = await Customer.findOne({ email: email.toLowerCase() }).select("+password");
    if (!customer) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const match = await customer.comparePassword(password);
    if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Must be approved by admin before logging in
    if (!customer.isApproved)
      return res.status(403).json({ success: false, pendingApproval: true, message: "Your account is pending admin approval. Please wait for approval before logging in." });

    // Must not be suspended
    if (!customer.isActive)
      return res.status(403).json({ success: false, message: "Your account has been suspended. Please contact the store." });

    const token = signToken(customer._id);
    res.json({
      success: true,
      token,
      data: publicCustomer(customer),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me  (protected) — full profile incl. type, credit, balance
exports.getMe = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id)
      .select("-password -resetToken -resetTokenExp -emailOtp -emailOtpExp")
      .populate("wishlist", "name slug thumbnail price salePrice wholesalePrice");
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/customers/me  (protected)
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, dob, gender, avatar } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customer.id,
      { name, phone, dob, gender, avatar },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/customers/me/password  (protected)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.customer.id).select("+password");
    const match = await customer.comparePassword(oldPassword);
    if (!match) return res.status(400).json({ success: false, message: "Old password incorrect" });
    customer.password = newPassword;
    await customer.save();
    res.json({ success: true, message: "Password updated" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADDRESSES ────────────────────────────────────────────────────────────────

// POST /api/store/customers/me/addresses
exports.addAddress = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    // If this is the first address or isDefault is true, unset other defaults
    if (req.body.isDefault || customer.addresses.length === 0) {
      customer.addresses.forEach(a => (a.isDefault = false));
      req.body.isDefault = true;
    }
    customer.addresses.push(req.body);
    await customer.save();
    res.status(201).json({ success: true, data: customer.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/customers/me/addresses/:addrId
exports.updateAddress = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    const addr = customer.addresses.id(req.params.addrId);
    if (!addr) return res.status(404).json({ success: false, message: "Address not found" });
    if (req.body.isDefault) customer.addresses.forEach(a => (a.isDefault = false));
    Object.assign(addr, req.body);
    await customer.save();
    res.json({ success: true, data: customer.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/customers/me/addresses/:addrId
exports.deleteAddress = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    customer.addresses = customer.addresses.filter(a => a._id.toString() !== req.params.addrId);
    await customer.save();
    res.json({ success: true, data: customer.addresses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── WISHLIST ─────────────────────────────────────────────────────────────────

// POST /api/store/customers/me/wishlist/:productId
exports.toggleWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.id);
    const pid = req.params.productId;
    const idx = customer.wishlist.findIndex(id => id.toString() === pid);
    if (idx > -1) {
      customer.wishlist.splice(idx, 1);
    } else {
      customer.wishlist.push(pid);
    }
    await customer.save();
    res.json({ success: true, inWishlist: idx === -1, data: customer.wishlist });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/store/admin/customers  — supports ?type=retail|wholesale & ?approved=true|false
exports.adminGetCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 30, search, type, approved } = req.query;
    const filter = {};
    if (type === "retail" || type === "wholesale") filter.customerType = type;
    if (approved === "true")  filter.isApproved = true;
    if (approved === "false") filter.isApproved = false;
    if (search) filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { businessName: { $regex: search, $options: "i" } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select("-password"),
      Customer.countDocuments(filter),
    ]);
    res.json({ success: true, data: customers, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/admin/customers/pending  — ALL accounts (retail + wholesale) awaiting approval
exports.adminGetPendingWholesale = async (req, res) => {
  try {
    const customers = await Customer.find({ isApproved: false })
      .sort({ createdAt: -1 }).select("-password");
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/customers/:id/approve  — approve ANY customer (retail or wholesale)
exports.adminApproveWholesale = async (req, res) => {
  try {
    const { creditLimit } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    customer.isApproved = true;
    customer.isActive   = true;
    customer.approvedBy = req.user?.id || null;
    customer.approvedAt = new Date();
    // Credit limit only relevant for wholesale; set if provided
    if (customer.customerType === "wholesale" && creditLimit !== undefined) {
      customer.creditLimit = Number(creditLimit) || 0;
    }
    await customer.save();

    res.json({ success: true, message: `${customer.name} approved — they can now log in`, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/admin/customers/:id/reject  — reject (delete) a pending account
exports.adminRejectCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    if (customer.isApproved)
      return res.status(400).json({ success: false, message: "Cannot reject an already-approved account. Suspend it instead." });

    await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Registration rejected and removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/store/customers/admin/:id  — permanently delete a customer account
// Blocked when the customer has orders or an open khata balance, so sales and
// dues history is never lost (suspend those accounts instead).
exports.adminDeleteCustomer = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ success: false, message: "Invalid customer id" });

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });

    const Order  = require("../../models/store/Order");
    const Ledger = require("../../models/store/Ledger");
    const Cart   = require("../../models/store/Cart");

    const orderCount = await Order.countDocuments({ customer: id });
    if (orderCount > 0)
      return res.status(409).json({
        success: false,
        message: `This customer has ${orderCount} order(s). Delete is blocked to keep sales records - suspend the account instead.`,
      });

    const ledger = await Ledger.findOne({ customer: id });
    if (ledger && (ledger.entries?.length || 0) > 0)
      return res.status(409).json({
        success: false,
        message: "This customer has khata (ledger) entries. Delete is blocked to keep payment records - suspend the account instead.",
      });

    // Unlink CRM documents (they stay in CRM, just no longer shown in this profile)
    const unlink = { $set: { store_customer: null } };
    const crmModels = ["../../models/crm/CrmQuotation", "../../models/crm/CrmInvoice", "../../models/crm/CrmOrderSheet"];
    await Promise.all(crmModels.map((p) => require(p).updateMany({ store_customer: id }, unlink)));

    await Promise.all([
      Cart.deleteMany({ customer: id }),
      ledger ? Ledger.deleteOne({ _id: ledger._id }) : null,
    ]);
    await Customer.findByIdAndDelete(id);

    res.json({ success: true, message: "Customer deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/customers/:id  — admin edit customer (type, credit, business)
exports.adminUpdateCustomer = async (req, res) => {
  try {
    const allowed = ["customerType", "businessName", "gstin", "businessType", "businessAddress", "creditLimit", "isApproved", "name", "phone"];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const customer = await Customer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password");
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/admin/customers/:id
exports.adminGetCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/admin/customers/:id/status
exports.adminToggleStatus = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: "Customer not found" });
    customer.isActive = !customer.isActive;
    await customer.save();
    res.json({ success: true, isActive: customer.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CRM INTEGRATION ────────────────────────────────────────────────────────────

// GET /api/store/customers/crm/list  (crmAuth) — minimal list for the "link to customer" selector in CRM
exports.crmListCustomers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { name:  { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { businessName: { $regex: search, $options: "i" } },
    ];
    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .limit(500)
      .select("name email phone customerType businessName");
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me/quotations  (protected) — SENT quotations linked to this customer
exports.getMyQuotations = async (req, res) => {
  try {
    const CrmQuotation = require("../../models/crm/CrmQuotation");
    const quotes = await CrmQuotation.find({ store_customer: req.customer.id, "send.sent": true })
      .populate("items")
      .sort({ "send.sentAt": -1 });
    res.json({ success: true, data: quotes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me/invoices  (protected) — SENT invoices linked to this customer
exports.getMyInvoices = async (req, res) => {
  try {
    const CrmInvoice = require("../../models/crm/CrmInvoice");
    const invoices = await CrmInvoice.find({ store_customer: req.customer.id, "send.sent": true })
      .populate("items")
      .sort({ "send.sentAt": -1 });
    res.json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me/quotations/:id  (protected) — single sent quotation (for PDF page)
exports.getMyQuotation = async (req, res) => {
  try {
    const CrmQuotation = require("../../models/crm/CrmQuotation");
    const q = await CrmQuotation.findOne({ _id: req.params.id, store_customer: req.customer.id, "send.sent": true })
      .populate("items");
    if (!q) return res.status(404).json({ success: false, message: "Quotation not found" });
    res.json({ success: true, data: q });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me/invoices/:id  (protected) — single sent invoice (for PDF page)
exports.getMyInvoice = async (req, res) => {
  try {
    const CrmInvoice = require("../../models/crm/CrmInvoice");
    const inv = await CrmInvoice.findOne({ _id: req.params.id, store_customer: req.customer.id, "send.sent": true })
      .populate("items");
    if (!inv) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me/order-sheets  (protected) — SENT order sheets for this customer
exports.getMyOrderSheets = async (req, res) => {
  try {
    const CrmOrderSheet = require("../../models/crm/CrmOrderSheet");
    const sheets = await CrmOrderSheet.find({ store_customer: req.customer.id, "send.sent": true })
      .sort({ "send.sentAt": -1 });
    res.json({ success: true, data: sheets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/me/order-sheets/:id  (protected) — single sent order sheet
exports.getMyOrderSheet = async (req, res) => {
  try {
    const CrmOrderSheet = require("../../models/crm/CrmOrderSheet");
    const sheet = await CrmOrderSheet.findOne({ _id: req.params.id, store_customer: req.customer.id, "send.sent": true });
    if (!sheet) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: sheet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/store/customers/admin/sent-documents  (adminProtect) — all sent quotations + invoices + order sheets for CMS
exports.adminGetSentDocuments = async (req, res) => {
  try {
    const CrmQuotation  = require("../../models/crm/CrmQuotation");
    const CrmInvoice    = require("../../models/crm/CrmInvoice");
    const CrmOrderSheet = require("../../models/crm/CrmOrderSheet");

    const [quotes, invoices, orders] = await Promise.all([
      CrmQuotation.find({ "send.sent": true })
        .populate("store_customer", "name email phone customerType businessName")
        .sort({ "send.sentAt": -1 }),
      CrmInvoice.find({ "send.sent": true })
        .populate("store_customer", "name email phone customerType businessName")
        .sort({ "send.sentAt": -1 }),
      CrmOrderSheet.find({ "send.sent": true })
        .populate("store_customer", "name email phone customerType businessName")
        .sort({ "send.sentAt": -1 }),
    ]);

    const map = (d, kind) => ({
      _id: d._id,
      kind,
      number: kind === "quotation" ? d.quote_number : kind === "invoice" ? d.invoice_number : d.order_number,
      status: d.status,
      grandTotal: d.grand_total,
      customer: d.store_customer,
      subject: d.send?.subject || "",
      message: d.send?.message || "",
      sentAt: d.send?.sentAt || null,
      sentByName: d.send?.sentByName || "",
    });

    const docs = [
      ...quotes.map(q => map(q, "quotation")),
      ...invoices.map(i => map(i, "invoice")),
      ...orders.map(o => map(o, "order")),
    ].sort((a, b) => new Date(b.sentAt || 0) - new Date(a.sentAt || 0));

    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
