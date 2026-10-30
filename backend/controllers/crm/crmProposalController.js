const CrmProposal = require('../../models/crm/CrmProposal');
const CrmProject = require('../../models/crm/CrmProject');
const CrmClient = require('../../models/crm/CrmClient');
const CrmHistory = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');
const CrmSettings = require('../../models/crm/CrmSettings');

const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({ actor: req.crmUser._id, actor_name: req.crmUser.full_name, action, entity_type: 'proposal', entity_id: id, entity_label: label, description: desc });
  } catch {}
};

const getSettings = async () => {
  try { return await CrmSettings.findById('crm_settings') || {}; } catch { return {}; }
};

const genPropNumber = async (settings) => {
  const prefix = settings?.proposal_prefix || 'DKS-PROP';
  const year   = new Date().getFullYear();
  const count  = await CrmProposal.countDocuments();
  let seq = count + 1;
  let num = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  while (await CrmProposal.exists({ prop_number: num })) {
    seq++;
    num = `${prefix}-${year}-${String(seq).padStart(4, '0')}`;
  }
  return num;
};

exports.list = async (req, res) => {
  try {
    const { status, project, client } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // Filter by client: find all projects for this client, then filter proposals
    if (client) {
      const projects = await CrmProject.find({ client }).select('_id');
      filter.project = { $in: projects.map(p => p._id) };
    } else if (project) {
      filter.project = project;
    }

    const proposals = await CrmProposal.find(filter).populate('project', 'name client_name_snapshot').populate('services', 'name').sort({ created_at: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const p = await CrmProposal.findById(req.params.id).populate('project').populate('services');
    if (!p) return res.status(404).json({ message: 'Proposal not found' });
    res.json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const settings = await getSettings();
    const { project: projectId, client_name_direct, ...rest } = req.body;

    const project = projectId ? await CrmProject.findById(projectId).populate('client') : null;
    const prop_number = await genPropNumber(settings);

    const client = project?.client
      ? (typeof project.client === 'object' ? project.client : await CrmClient.findById(project.client))
      : null;
    const resolvedClientName = client?.full_name || client?.company_name || project?.client_name_snapshot || client_name_direct || '';

    /* ── Company snapshot from settings (no bank for proposals) ── */
    const companySn = {
      company_name_snapshot:    settings.company_name    || '',
      company_address_snapshot: settings.company_address || '',
      company_city_snapshot:    settings.company_city    || '',
      company_state_snapshot:   settings.company_state   || '',
      company_gstin_snapshot:   settings.gstin           || '',
      company_email_snapshot:   settings.company_email   || '',
      company_phone_snapshot:   settings.company_phone   || '',
      company_logo_snapshot:    settings.company_logo    || '',
      /* Include bank details so proposal [id] view can optionally show them */
      bank_name_snapshot:      settings.bank_name       || '',
      account_name_snapshot:   settings.account_name    || '',
      account_number_snapshot: settings.account_number  || '',
      ifsc_code_snapshot:      settings.ifsc_code       || '',
      upi_id_snapshot:         settings.upi_id          || '',
      signature_name_snapshot: settings.signature_name  || '',
    };

    const proposal = await CrmProposal.create({
      project: projectId || null,
      prop_number,
      project_name_snapshot: project?.name || '',
      client_name_snapshot:  resolvedClientName,
      client_gstin_snapshot: client?.gstin || '',
      client_address_snapshot: client?.billing_address || '',
      ...companySn, ...rest,
    });
    await log(req, 'created', proposal._id, proposal.title, `Created proposal: ${proposal.prop_number}`);
    await CrmNotification.create({ user: req.crmUser._id, event_type: 'proposal_created', title: 'New Proposal Created', message: `${proposal.prop_number} — ${proposal.title}`, reference_id: proposal._id, reference_type: 'proposal' });
    res.status(201).json(proposal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const old = await CrmProposal.findById(req.params.id);
    const proposal = await CrmProposal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!proposal) return res.status(404).json({ message: 'Proposal not found' });
    const action = old?.status !== proposal.status ? 'status_changed' : 'updated';
    await log(req, action, proposal._id, proposal.prop_number, `${action} proposal`);
    if (proposal.status === 'accepted') {
      await CrmNotification.create({ user: req.crmUser._id, event_type: 'proposal_accepted', title: 'Proposal Accepted', message: `${proposal.prop_number} was accepted`, reference_id: proposal._id, reference_type: 'proposal' });
    }
    res.json(proposal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const p = await CrmProposal.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: 'Proposal not found' });
    await log(req, 'deleted', p._id, p.prop_number, 'Deleted proposal');
    res.json({ message: 'Proposal deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
