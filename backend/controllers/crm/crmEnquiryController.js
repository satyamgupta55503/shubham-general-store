const CrmEnquiry = require('../../models/crm/CrmEnquiry');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({ actor: req.crmUser._id, actor_name: req.crmUser.full_name, action, entity_type: 'enquiry', entity_id: id, entity_label: label, description: desc });
  } catch {}
};

exports.list = async (req, res) => {
  try {
    const { status, source, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { client_name: { $regex: search, $options: 'i' } },
        { mobile_number: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const enquiries = await CrmEnquiry.find(filter).populate('created_by', 'full_name').sort({ enquiry_date: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const e = await CrmEnquiry.findById(req.params.id).populate('created_by', 'full_name');
    if (!e) return res.status(404).json({ message: 'Enquiry not found' });
    res.json(e);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const enq = await CrmEnquiry.create({ ...req.body, created_by: req.crmUser._id, source: req.body.source || 'manual' });
    await log(req, 'created', enq._id, enq.client_name, `New enquiry from: ${enq.client_name}`);
    await CrmNotification.create({ user: req.crmUser._id, event_type: 'enquiry_received', title: 'New Enquiry', message: `Enquiry from ${enq.client_name} — ${enq.mobile_number}`, reference_id: enq._id, reference_type: 'enquiry' });
    res.status(201).json(enq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const enq = await CrmEnquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!enq) return res.status(404).json({ message: 'Enquiry not found' });
    await log(req, 'status_changed', enq._id, enq.client_name, `Updated enquiry: ${enq.client_name}`);
    res.json(enq);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const enq = await CrmEnquiry.findByIdAndDelete(req.params.id);
    if (!enq) return res.status(404).json({ message: 'Enquiry not found' });
    await log(req, 'deleted', enq._id, enq.client_name, `Deleted enquiry: ${enq.client_name}`);
    res.json({ message: 'Enquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
