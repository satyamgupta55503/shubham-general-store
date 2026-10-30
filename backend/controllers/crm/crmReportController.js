/**
 * CRM Reports Controller — deep analytics for revenue, pipeline, clients, activity.
 * Powers the /crm/dashboard/reports page.
 */
const CrmClient    = require('../../models/crm/CrmClient');
const CrmProject   = require('../../models/crm/CrmProject');
const CrmInvoice   = require('../../models/crm/CrmInvoice');
const CrmPayment   = require('../../models/crm/CrmPayment');
const CrmEnquiry   = require('../../models/crm/CrmEnquiry');
const CrmProposal  = require('../../models/crm/CrmProposal');
const CrmQuotation = require('../../models/crm/CrmQuotation');
const CrmFollowUp  = require('../../models/crm/CrmFollowUp');
const CrmHistory   = require('../../models/crm/CrmHistory');

/* ── helper: months array ── */
const last12Months = () => {
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) });
  }
  return months;
};

/* ══════════════════════════════════════════
   FULL REPORT   GET /api/crm/reports
══════════════════════════════════════════ */
exports.full = async (req, res) => {
  try {
    const { period = '12m' } = req.query;
    const months = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const since  = new Date();
    since.setMonth(since.getMonth() - months + 1);
    since.setDate(1); since.setHours(0, 0, 0, 0);

    const [
      /* Revenue & Billing */
      totalBilled, totalReceived, outstanding,
      invoiceByStatus, monthlyRevenue, monthlyBilled,

      /* Pipeline */
      enquiryByStatus, enquiryBySource,
      proposalByStatus, quotationByStatus,
      followupStats,

      /* Clients & Projects */
      clientsTotal, clientsNew,
      projectsTotal, projectsByStatus,
      topClients,

      /* Activity */
      activityByDay,
    ] = await Promise.all([

      /* ── Total billed (all invoices) ── */
      CrmInvoice.aggregate([{ $group: { _id: null, total: { $sum: '$grand_total' } } }])
        .then(r => r[0]?.total || 0),

      /* ── Total received (all payments) ── */
      CrmPayment.aggregate([{ $group: { _id: null, total: { $sum: '$amount_paid' } } }])
        .then(r => r[0]?.total || 0),

      /* ── Outstanding ── */
      CrmInvoice.aggregate([
        { $match: { status: { $in: ['issued', 'partial', 'overdue'] } } },
        { $group: { _id: null, total: { $sum: '$balance_due' } } },
      ]).then(r => r[0]?.total || 0),

      /* ── Invoice by status ── */
      CrmInvoice.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$grand_total' } } },
      ]),

      /* ── Monthly payments (received) ── */
      CrmPayment.aggregate([
        { $match: { payment_date: { $gte: since } } },
        { $group: {
          _id: { y: { $year: '$payment_date' }, m: { $month: '$payment_date' } },
          total: { $sum: '$amount_paid' }, count: { $sum: 1 },
        }},
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),

      /* ── Monthly invoiced ── */
      CrmInvoice.aggregate([
        { $match: { invoice_date: { $gte: since } } },
        { $group: {
          _id: { y: { $year: '$invoice_date' }, m: { $month: '$invoice_date' } },
          total: { $sum: '$grand_total' }, count: { $sum: 1 },
        }},
        { $sort: { '_id.y': 1, '_id.m': 1 } },
      ]),

      /* ── Enquiry by status ── */
      CrmEnquiry.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      /* ── Enquiry by source ── */
      CrmEnquiry.aggregate([
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      /* ── Proposals by status ── */
      CrmProposal.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      /* ── Quotations by status ── */
      CrmQuotation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      /* ── Follow-up quick stats ── */
      CrmFollowUp.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$deal_value' } } },
      ]),

      /* ── Total clients ── */
      CrmClient.countDocuments(),

      /* ── New clients in period ── */
      CrmClient.countDocuments({ created_at: { $gte: since } }),

      /* ── Total projects ── */
      CrmProject.countDocuments(),

      /* ── Projects by status ── */
      CrmProject.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      /* ── Top clients by invoice value ── */
      CrmInvoice.aggregate([
        { $group: { _id: '$client_name_snapshot', total_billed: { $sum: '$grand_total' }, invoice_count: { $sum: 1 } } },
        { $sort: { total_billed: -1 } },
        { $limit: 8 },
      ]),

      /* ── Activity by day (last 30 days) ── */
      CrmHistory.aggregate([
        { $match: { created_at: { $gte: (() => { const d = new Date(); d.setDate(d.getDate()-29); d.setHours(0,0,0,0); return d; })() } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$created_at' } },
          count: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
    ]);

    /* ── Assemble monthly chart data ── */
    const monthList = last12Months().slice(-months);
    const revenueChart = monthList.map(m => {
      const recv = monthlyRevenue.find(r => r._id.y === m.year && r._id.m === m.month);
      const bill = monthlyBilled.find(r => r._id.y === m.year && r._id.m === m.month);
      return {
        label:    m.label,
        received: recv?.total || 0,
        billed:   bill?.total || 0,
        invoices: bill?.count || 0,
        payments: recv?.count || 0,
      };
    });

    /* ── Activity heatmap ── */
    const actMap = {};
    activityByDay.forEach(d => { actMap[d._id] = d.count; });
    const actChart = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      actChart.push({ date: key, label, count: actMap[key] || 0 });
    }

    /* ── Follow-up pipeline value ── */
    const pipeline = {};
    followupStats.forEach(f => { pipeline[f._id] = { count: f.count, value: f.value }; });

    /* ── Conversion funnel ── */
    const enqTotal  = enquiryByStatus.reduce((s, e) => s + e.count, 0);
    const propTotal = proposalByStatus.reduce((s, p) => s + p.count, 0);
    const quotTotal = quotationByStatus.reduce((s, q) => s + q.count, 0);
    const invTotal  = invoiceByStatus.reduce((s, i) => s + i.count, 0);
    const wonTotal  = pipeline['won']?.count || 0;

    res.json({
      summary: {
        total_billed:   totalBilled,
        total_received: totalReceived,
        outstanding,
        collection_rate: totalBilled > 0 ? Math.round((totalReceived / totalBilled) * 100) : 0,
        clients_total: clientsTotal,
        clients_new:   clientsNew,
        projects_total: projectsTotal,
      },
      revenue_chart:     revenueChart,
      invoice_by_status: invoiceByStatus,
      enquiry_by_status: enquiryByStatus,
      enquiry_by_source: enquiryBySource,
      proposal_by_status:proposalByStatus,
      quotation_by_status: quotationByStatus,
      projects_by_status: projectsByStatus,
      followup_pipeline: pipeline,
      top_clients:       topClients,
      activity_chart:    actChart,
      conversion_funnel: [
        { stage: 'Enquiries',  count: enqTotal,  color: '#2563eb' },
        { stage: 'Proposals',  count: propTotal, color: '#7c3aed' },
        { stage: 'Quotations', count: quotTotal, color: '#d97706' },
        { stage: 'Invoices',   count: invTotal,  color: '#0891b2' },
        { stage: 'Won Deals',  count: wonTotal,  color: '#16a34a' },
      ],
    });
  } catch (err) {
    console.error('Reports error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   REMINDERS   GET /api/crm/reports/reminders
   Returns follow-ups due today + overdue (for banner)
══════════════════════════════════════════ */
exports.reminders = async (req, res) => {
  try {
    const CrmSettings = require('../../models/crm/CrmSettings');
    const settings = await CrmSettings.findById('crm_settings');

    /* If reminders are disabled globally, return empty (banner won't show) */
    if (settings && settings.reminder_enabled === false) {
      return res.json({ overdue: [], today: [], upcoming: [], reminder_days_before: 1, disabled: true });
    }

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const daysBefore = settings?.reminder_days_before || 1;
    const reminderDate = new Date(today);
    reminderDate.setDate(reminderDate.getDate() + daysBefore);

    const [overdue, dueToday, upcoming] = await Promise.all([
      CrmFollowUp.find({
        follow_up_date: { $lt: today },
        status: { $nin: ['won', 'lost'] },
      }).select('title contact_name channel priority follow_up_date status').limit(20),

      CrmFollowUp.find({
        follow_up_date: { $gte: today, $lt: tomorrow },
        status: { $nin: ['won', 'lost'] },
      }).select('title contact_name channel priority follow_up_date status').limit(20),

      CrmFollowUp.find({
        follow_up_date: { $gte: tomorrow, $lte: reminderDate },
        status: { $nin: ['won', 'lost'] },
      }).select('title contact_name channel priority follow_up_date status').limit(10),
    ]);

    res.json({ overdue, today: dueToday, upcoming, reminder_days_before: daysBefore, reminder_browser_enabled: settings?.reminder_browser_enabled !== false });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
