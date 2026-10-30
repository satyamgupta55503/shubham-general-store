const CrmInvoice = require('../../models/crm/CrmInvoice');
const CrmInvoiceItem = require('../../models/crm/CrmInvoiceItem');
const CrmProject = require('../../models/crm/CrmProject');
const CrmClient = require('../../models/crm/CrmClient');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');
const CrmSettings = require('../../models/crm/CrmSettings');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({ actor: req.crmUser._id, actor_name: req.crmUser.full_name, action, entity_type: 'invoice', entity_id: id, entity_label: label, description: desc });
  } catch {}
};

const getSettings = async () => {
  try { return await CrmSettings.findById('crm_settings') || {}; } catch { return {}; }
};

const genInvNumber = async (settings) => {
  const prefix = settings?.invoice_prefix || 'DKS-INV';
  const year   = new Date().getFullYear();
  const count  = await CrmInvoice.countDocuments();
  let seq = count + 1;
  let num = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  while (await CrmInvoice.exists({ invoice_number: num })) {
    seq++;
    num = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }
  return num;
};

const calcTotals = (items = [], cgstRate = 9, sgstRate = 9, igstRate = 0) => {
  const subtotal = items.reduce((s, i) => s + (Number(i.total_price) || (i.quantity || 1) * (i.unit_price || 0)), 0);
  const cgst = (subtotal * cgstRate) / 100;
  const sgst = (subtotal * sgstRate) / 100;
  const igst = (subtotal * igstRate) / 100;
  const totalTax = cgst + sgst + igst;
  return { subtotal, taxable_amount: subtotal, cgst_amount: cgst, sgst_amount: sgst, igst_amount: igst, total_tax: totalTax, grand_total: subtotal + totalTax };
};

exports.list = async (req, res) => {
  try {
    const { status, project, client } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // Filter by client: find all projects for this client, then filter invoices
    if (client) {
      const projects = await CrmProject.find({ client }).select('_id');
      filter.project = { $in: projects.map(p => p._id) };
    } else if (project) {
      filter.project = project;
    }

    const invoices = await CrmInvoice.find(filter)
      .populate('project', 'name client_name_snapshot')
      .populate('store_customer', 'name email phone customerType businessName')
      .sort({ invoice_date: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const inv = await CrmInvoice.findById(req.params.id)
      .populate('project')
      .populate('items')
      .populate('store_customer', 'name email phone customerType businessName');
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    res.json(inv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const settings = await getSettings();

    const {
      project: projectId,
      client_name_direct,
      items = [],
      cgst_rate  = settings.default_cgst_rate  ?? 9,
      sgst_rate  = settings.default_sgst_rate  ?? 9,
      igst_rate  = settings.default_igst_rate  ?? 0,
      hsn_sac    = settings.default_hsn_sac    || '998319',
      place_of_supply = settings.place_of_supply || 'Chhattisgarh',
      ...rest
    } = req.body;

    /* Auto-compute due_date from default_due_days if not provided */
    if (!rest.due_date && rest.invoice_date && settings.default_due_days) {
      const d = new Date(rest.invoice_date);
      d.setDate(d.getDate() + (settings.default_due_days || 30));
      rest.due_date = d.toISOString();
    }

    // Normalize empty store_customer → null (avoids ObjectId cast error)
    if (rest.store_customer === '' || rest.store_customer === undefined) rest.store_customer = null;

    const project = projectId ? await CrmProject.findById(projectId).populate('client') : null;
    const invoice_number = await genInvNumber(settings);
    const totals = calcTotals(items, cgst_rate, sgst_rate, igst_rate);

    const client = project?.client
      ? (typeof project.client === 'object' ? project.client : await CrmClient.findById(project.client))
      : null;

    const resolvedClientName = client?.full_name || client?.company_name || project?.client_name_snapshot || client_name_direct || '';

    /* ── Company + bank snapshot from settings ── */
    const companySn = {
      company_name_snapshot:    settings.company_name    || '',
      company_address_snapshot: settings.company_address || '',
      company_city_snapshot:    settings.company_city    || '',
      company_state_snapshot:   settings.company_state   || '',
      company_gstin_snapshot:   settings.gstin           || '',
      company_email_snapshot:   settings.company_email   || '',
      company_phone_snapshot:   settings.company_phone   || '',
      company_logo_snapshot:    settings.company_logo    || '',
      bank_name_snapshot:       settings.bank_name       || '',
      account_name_snapshot:    settings.account_name    || '',
      account_number_snapshot:  settings.account_number  || '',
      ifsc_code_snapshot:       settings.ifsc_code       || '',
      upi_id_snapshot:          settings.upi_id          || '',
      footer_text_snapshot:     settings.invoice_footer_text || '',
      payment_terms_snapshot:   settings.payment_terms_text  || '',
    };

    const invoice = await CrmInvoice.create({
      project: projectId || null, invoice_number,
      project_name_snapshot:   project?.name || '',
      client_name_snapshot:    resolvedClientName,
      client_gstin_snapshot:   client?.gstin || '',
      client_address_snapshot: client?.billing_address || '',
      client_state_snapshot:   client?.state || '',
      billing_address:         client?.billing_address || '',
      cgst_rate, sgst_rate, igst_rate,
      hsn_sac, place_of_supply,
      ...companySn, ...totals, ...rest,
    });
    if (items.length) {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        await CrmInvoiceItem.create({ invoice: invoice._id, description: it.description, quantity: it.quantity || 1, unit_price: it.unit_price || 0, total_price: (it.quantity || 1) * (it.unit_price || 0), sort_order: i });
      }
    }
    await log(req, 'created', invoice._id, invoice.invoice_number, `Created invoice ${invoice.invoice_number}`);
    await CrmNotification.create({ user: req.crmUser._id, event_type: 'invoice_created', title: 'New Invoice Created', message: `${invoice.invoice_number} — ₹${totals.grand_total.toLocaleString('en-IN')}`, reference_id: invoice._id, reference_type: 'invoice' });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { items, cgst_rate, sgst_rate, igst_rate, ...rest } = req.body;
    if (rest.store_customer === '') rest.store_customer = null;
    const old = await CrmInvoice.findById(req.params.id);
    const updates = { ...rest };
    if (items) {
      const totals = calcTotals(items, cgst_rate ?? old.cgst_rate, sgst_rate ?? old.sgst_rate, igst_rate ?? old.igst_rate);
      Object.assign(updates, { cgst_rate, sgst_rate, igst_rate, ...totals });
      await CrmInvoiceItem.deleteMany({ invoice: req.params.id });
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        await CrmInvoiceItem.create({ invoice: req.params.id, description: it.description, quantity: it.quantity || 1, unit_price: it.unit_price || 0, total_price: (it.quantity || 1) * (it.unit_price || 0), sort_order: i });
      }
    }
    const invoice = await CrmInvoice.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const action = old?.status !== invoice.status ? 'status_changed' : 'updated';
    await log(req, action, invoice._id, invoice.invoice_number, `${action} invoice`);
    if (invoice.status === 'paid') {
      await CrmNotification.create({ user: req.crmUser._id, event_type: 'invoice_paid', title: 'Invoice Paid', message: `${invoice.invoice_number} marked as paid`, reference_id: invoice._id, reference_type: 'invoice' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const inv = await CrmInvoice.findByIdAndDelete(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    await CrmInvoiceItem.deleteMany({ invoice: req.params.id });
    await log(req, 'deleted', inv._id, inv.invoice_number, 'Deleted invoice');
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/crm/invoices/:id/send — send this invoice to the linked store customer
exports.sendToCustomer = async (req, res) => {
  try {
    const { subject = '', message = '' } = req.body;
    if (!subject.trim()) return res.status(400).json({ message: 'Subject is required' });

    const inv = await CrmInvoice.findById(req.params.id);
    if (!inv) return res.status(404).json({ message: 'Invoice not found' });
    if (!inv.store_customer)
      return res.status(400).json({ message: 'Link this invoice to a store customer first' });

    const sentByName = req.crmUser.full_name || 'CRM';
    inv.send = { sent: true, subject, message, sentAt: new Date(), sentByName };
    inv.sendLog = inv.sendLog || [];
    inv.sendLog.push({ subject, message, sentAt: new Date(), sentByName });
    // When an invoice is sent, mark it 'issued' if still a draft
    if (inv.status === 'draft') inv.status = 'issued';
    await inv.save();

    await log(req, 'sent', inv._id, inv.invoice_number, `Sent to customer: ${subject}`);
    await CrmNotification.create({
      user: req.crmUser._id, event_type: 'invoice_sent', title: 'Invoice Sent',
      message: `${inv.invoice_number} sent to customer — "${subject}"`,
      reference_id: inv._id, reference_type: 'invoice',
    });

    res.json({ success: true, data: inv });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
