const CrmOrderSheet = require('../../models/crm/CrmOrderSheet');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');
const Customer = require('../../models/store/Customer');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({
      actor: req.crmUser._id, actor_name: req.crmUser.full_name,
      action, entity_type: 'order_sheet', entity_id: id,
      entity_label: label, description: desc,
    });
  } catch {}
};

const genOrderNumber = async () => {
  const year = new Date().getFullYear();
  const count = await CrmOrderSheet.countDocuments();
  let seq = count + 1;
  let num = `SGS-ORD-${year}-${String(seq).padStart(4, '0')}`;
  while (await CrmOrderSheet.exists({ order_number: num })) {
    seq++;
    num = `SGS-ORD-${year}-${String(seq).padStart(4, '0')}`;
  }
  return num;
};

const cleanItems = (items = []) =>
  items
    .filter((i) => (i.name && i.name.trim()) || Number(i.quantity) || Number(i.price))
    .map((i) => ({
      name: (i.name || '').trim(),
      quantity: Number(i.quantity) || 0,
      quality: (i.quality || '').trim(),
      price: Number(i.price) || 0,
    }));

// GET /api/crm/order-sheets
exports.list = async (req, res) => {
  try {
    const { status, store_customer } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (store_customer) filter.store_customer = store_customer;
    const sheets = await CrmOrderSheet.find(filter)
      .populate('store_customer', 'name email phone customerType businessName')
      .sort({ created_at: -1 });
    res.json({ success: true, data: sheets });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/crm/order-sheets/:id
exports.getOne = async (req, res) => {
  try {
    const sheet = await CrmOrderSheet.findById(req.params.id)
      .populate('store_customer', 'name email phone customerType businessName');
    if (!sheet) return res.status(404).json({ success: false, message: 'Order sheet not found' });
    res.json({ success: true, data: sheet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/crm/order-sheets
exports.create = async (req, res) => {
  try {
    const { store_customer, items = [], notes = '' } = req.body;

    let customerName = '';
    if (store_customer) {
      const c = await Customer.findById(store_customer).select('name businessName');
      if (c) customerName = c.businessName || c.name || '';
    }

    const sheet = await CrmOrderSheet.create({
      order_number: await genOrderNumber(),
      store_customer: store_customer || null,
      customer_name_snapshot: customerName,
      items: cleanItems(items),
      notes,
      status: 'draft',
      created_by_name: req.crmUser.full_name || 'CRM',
    });

    await log(req, 'created', sheet._id, sheet.order_number, `Created order sheet ${sheet.order_number}`);
    res.status(201).json({ success: true, data: sheet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// PUT/PATCH /api/crm/order-sheets/:id  — blocked once locked (sent)
exports.update = async (req, res) => {
  try {
    const sheet = await CrmOrderSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ success: false, message: 'Order sheet not found' });
    if (sheet.locked)
      return res.status(403).json({ success: false, message: 'This order was sent to the customer and can no longer be edited.' });

    const { store_customer, items, notes } = req.body;

    if (store_customer !== undefined) {
      sheet.store_customer = store_customer || null;
      if (store_customer) {
        const c = await Customer.findById(store_customer).select('name businessName');
        sheet.customer_name_snapshot = c ? (c.businessName || c.name || '') : '';
      } else {
        sheet.customer_name_snapshot = '';
      }
    }
    if (items !== undefined) sheet.items = cleanItems(items);
    if (notes !== undefined) sheet.notes = notes;

    await sheet.save();
    await log(req, 'updated', sheet._id, sheet.order_number, 'Updated order sheet');
    res.json({ success: true, data: sheet });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE /api/crm/order-sheets/:id — blocked once sent/locked
exports.remove = async (req, res) => {
  try {
    const sheet = await CrmOrderSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ success: false, message: 'Order sheet not found' });
    if (sheet.locked || sheet.send?.sent)
      return res.status(403).json({ success: false, message: 'Sent orders cannot be deleted — they are permanent for transparency.' });

    await CrmOrderSheet.findByIdAndDelete(req.params.id);
    await log(req, 'deleted', sheet._id, sheet.order_number, 'Deleted draft order sheet');
    res.json({ success: true, message: 'Order sheet deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/crm/order-sheets/:id/send — send to customer + LOCK permanently
exports.sendToCustomer = async (req, res) => {
  try {
    const { subject = '', message = '' } = req.body;
    if (!subject.trim()) return res.status(400).json({ success: false, message: 'Subject is required' });

    const sheet = await CrmOrderSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ success: false, message: 'Order sheet not found' });
    if (!sheet.store_customer)
      return res.status(400).json({ success: false, message: 'Select a store customer before sending' });
    if (!sheet.items || sheet.items.length === 0)
      return res.status(400).json({ success: false, message: 'Add at least one order item before sending' });

    const sentByName = req.crmUser.full_name || 'CRM';
    sheet.send = { sent: true, subject, message, sentAt: new Date(), sentByName };
    sheet.status = 'sent';
    sheet.locked = true; // permanent — cannot be deleted/edited after this
    await sheet.save();

    await log(req, 'sent', sheet._id, sheet.order_number, `Sent order to customer: ${subject}`);
    await CrmNotification.create({
      user: req.crmUser._id, event_type: 'order_sent', title: 'Order Sent',
      message: `${sheet.order_number} sent to customer — "${subject}"`,
      reference_id: sheet._id, reference_type: 'order_sheet',
    });

    res.json({ success: true, data: sheet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
