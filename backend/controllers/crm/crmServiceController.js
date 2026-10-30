const CrmService = require('../../models/crm/CrmService');
const CrmHistory = require('../../models/crm/CrmHistory');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({
      actor: req.crmUser._id, actor_name: req.crmUser.full_name,
      action, entity_type: 'service', entity_id: id, entity_label: label, description: desc,
    });
  } catch { /* non-critical */ }
};

exports.list = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    const services = await CrmService.find(filter).sort({ created_at: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const service = await CrmService.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const service = await CrmService.create({ ...req.body, created_by: req.crmUser._id });
    await log(req, 'created', service._id, service.name, `Created service: ${service.name}`);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const service = await CrmService.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await log(req, 'updated', service._id, service.name, `Updated service: ${service.name}`);
    res.json(service);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const service = await CrmService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    await log(req, 'deleted', service._id, service.name, `Deleted service: ${service.name}`);
    res.json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
