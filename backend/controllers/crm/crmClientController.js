const CrmClient = require('../../models/crm/CrmClient');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');

const log = async (req, action, entity, id, label, desc = '') => {
  try {
    await CrmHistory.create({
      actor: req.crmUser._id, actor_name: req.crmUser.full_name,
      action, entity_type: entity, entity_id: id, entity_label: label, description: desc,
    });
  } catch { /* non-critical */ }
};

const notify = async (userId, eventType, title, message, refId, refType) => {
  try {
    await CrmNotification.create({ user: userId, event_type: eventType, title, message, reference_id: refId, reference_type: refType });
  } catch { /* non-critical */ }
};

// ── List ──────────────────────────────────────────────────────────────────────
exports.list = async (req, res) => {
  try {
    const { search, city, state, client_type, lead_source } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { company_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (state) filter.state = state;
    if (client_type) filter.client_type = client_type;
    if (lead_source) filter.lead_source = lead_source;
    const clients = await CrmClient.find(filter).sort({ created_at: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get Single ────────────────────────────────────────────────────────────────
exports.getOne = async (req, res) => {
  try {
    const client = await CrmClient.findById(req.params.id).populate('projects');
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Create ────────────────────────────────────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const client = await CrmClient.create(req.body);
    await log(req, 'created', 'client', client._id, client.full_name, `Created client: ${client.full_name}`);
    await notify(req.crmUser._id, 'client_created', 'New Client Added', `${client.full_name} was added to the CRM`, client._id, 'client');
    res.status(201).json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Update ────────────────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const client = await CrmClient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    await log(req, 'updated', 'client', client._id, client.full_name, `Updated client: ${client.full_name}`);
    res.json(client);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Delete ────────────────────────────────────────────────────────────────────
exports.remove = async (req, res) => {
  try {
    const client = await CrmClient.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    await log(req, 'deleted', 'client', client._id, client.full_name, `Deleted client: ${client.full_name}`);
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
