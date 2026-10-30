const CrmPortfolio = require('../../models/crm/CrmPortfolio');
const CrmClient = require('../../models/crm/CrmClient');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({ actor: req.crmUser._id, actor_name: req.crmUser.full_name, action, entity_type: 'portfolio', entity_id: id, entity_label: label, description: desc });
  } catch {}
};

exports.list = async (req, res) => {
  try {
    const { category, is_published } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (is_published !== undefined) filter.is_published = is_published === 'true';
    const items = await CrmPortfolio.find(filter).populate('client', 'full_name company_name').sort({ created_at: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const item = await CrmPortfolio.findById(req.params.id).populate('client');
    if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { client: clientId, ...rest } = req.body;
    let client_name_snapshot = '';
    if (clientId) {
      const client = await CrmClient.findById(clientId);
      client_name_snapshot = client?.full_name || '';
    }
    const item = await CrmPortfolio.create({ client: clientId || null, client_name_snapshot, ...rest });
    await log(req, 'created', item._id, item.title, `Created portfolio: ${item.title}`);
    await CrmNotification.create({ user: req.crmUser._id, event_type: 'portfolio_created', title: 'Portfolio Item Added', message: `"${item.title}" added to portfolio`, reference_id: item._id, reference_type: 'portfolio' });
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const item = await CrmPortfolio.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
    await log(req, 'updated', item._id, item.title, `Updated portfolio: ${item.title}`);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const item = await CrmPortfolio.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Portfolio item not found' });
    await log(req, 'deleted', item._id, item.title, `Deleted portfolio: ${item.title}`);
    res.json({ message: 'Portfolio item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
