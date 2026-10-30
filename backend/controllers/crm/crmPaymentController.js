const CrmPayment      = require('../../models/crm/CrmPayment');
const CrmInvoice      = require('../../models/crm/CrmInvoice');
const CrmHistory      = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({
      actor: req.crmUser._id, actor_name: req.crmUser.full_name,
      action, entity_type: 'payment', entity_id: id,
      entity_label: label, description: desc,
    });
  } catch {}
};

/* ── LIST ── */
exports.list = async (req, res) => {
  try {
    const { invoice } = req.query;
    const filter = invoice ? { invoice } : {};
    const payments = await CrmPayment.find(filter)
      .populate('invoice', 'invoice_number grand_total client_name_snapshot amount_paid balance_due')
      .sort({ payment_date: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── CREATE ── */
exports.create = async (req, res) => {
  try {
    const {
      invoice: invoiceId,
      client_name_direct,
      description,
      amount_paid,
      payment_date,      // full ISO string from frontend (includes time)
      payment_mode,
      reference_number,
      notes,
    } = req.body;

    if (!amount_paid || Number(amount_paid) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero.' });
    }

    // ── Auto-timestamp: if no date sent, use NOW (full datetime) ──────────────
    const paymentDatetime = payment_date ? new Date(payment_date) : new Date();

    let invoice = null;
    let labelStr = '';

    if (invoiceId) {
      // ── Invoice-linked payment ───────────────────────────────────────────────
      invoice = await CrmInvoice.findById(invoiceId);
      if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
      labelStr = invoice.invoice_number;
    } else {
      // ── No-invoice (direct) payment ─────────────────────────────────────────
      if (!client_name_direct?.trim()) {
        return res.status(400).json({ message: 'Client name is required when no invoice is selected.' });
      }
      labelStr = client_name_direct.trim();
    }

    const payment = await CrmPayment.create({
      invoice:            invoiceId || null,
      client_name_direct: client_name_direct?.trim() || '',
      description:        description || '',
      amount_paid:        Number(amount_paid),
      payment_date:       paymentDatetime,
      payment_mode:       payment_mode || 'upi',
      reference_number:   reference_number || '',
      notes:              notes || '',
    });

    await log(req, 'payment_received', payment._id, labelStr,
      `₹${amount_paid} received${invoice ? ` against ${invoice.invoice_number}` : ` from ${labelStr}`}`);

    await CrmNotification.create({
      user:           req.crmUser._id,
      event_type:     'payment_received',
      title:          'Payment Received',
      message:        `₹${Number(amount_paid).toLocaleString('en-IN')} received${invoice ? ` for ${invoice.invoice_number}` : ` from ${labelStr}`}`,
      reference_id:   payment._id,
      reference_type: 'payment',
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ── DELETE ── */
exports.remove = async (req, res) => {
  try {
    const payment = await CrmPayment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await log(req, 'deleted', payment._id,
      payment.invoice ? `Invoice payment` : payment.client_name_direct,
      'Deleted payment record');
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
