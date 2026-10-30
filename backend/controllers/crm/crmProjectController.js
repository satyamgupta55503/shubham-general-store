const CrmProject = require('../../models/crm/CrmProject');
const CrmClient = require('../../models/crm/CrmClient');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({ actor: req.crmUser._id, actor_name: req.crmUser.full_name, action, entity_type: 'project', entity_id: id, entity_label: label, description: desc });
  } catch {}
};

exports.list = async (req, res) => {
  try {
    const { status, client } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (client) filter.client = client;
    const projects = await CrmProject.find(filter).populate('client', 'full_name company_name').populate('services', 'name category').sort({ created_at: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await CrmProject.findById(req.params.id).populate('client').populate('services');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { client: clientId, ...rest } = req.body;
    const client = await CrmClient.findById(clientId);
    const project = await CrmProject.create({
      client: clientId,
      client_name_snapshot: client ? client.full_name : '',
      ...rest,
    });
    await log(req, 'created', project._id, project.name, `Created project: ${project.name}`);
    await CrmNotification.create({ user: req.crmUser._id, event_type: 'project_created', title: 'New Project Created', message: `Project "${project.name}" was created`, reference_id: project._id, reference_type: 'project' });
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const old = await CrmProject.findById(req.params.id);
    const project = await CrmProject.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const action = old?.status !== project.status ? 'status_changed' : 'updated';
    await log(req, action, project._id, project.name, `${action} project: ${project.name}`);
    if (action === 'status_changed') {
      await CrmNotification.create({ user: req.crmUser._id, event_type: 'project_status_changed', title: 'Project Status Updated', message: `"${project.name}" → ${project.status}`, reference_id: project._id, reference_type: 'project' });
    }
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const project = await CrmProject.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await log(req, 'deleted', project._id, project.name, `Deleted project: ${project.name}`);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
