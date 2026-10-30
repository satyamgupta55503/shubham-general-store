const CrmClient = require('../../models/crm/CrmClient');
const CrmProject = require('../../models/crm/CrmProject');
const CrmInvoice = require('../../models/crm/CrmInvoice');
const CrmPayment = require('../../models/crm/CrmPayment');
const CrmEnquiry = require('../../models/crm/CrmEnquiry');
const CrmProposal = require('../../models/crm/CrmProposal');
const CrmQuotation = require('../../models/crm/CrmQuotation');
const CrmNotification = require('../../models/crm/CrmNotification');

exports.stats = async (req, res) => {
  try {
    const [
      totalClients, totalProjects, activeProjects, completedProjects,
      totalInvoices, paidInvoices, overdueInvoices, pendingInvoices,
      totalEnquiries, newEnquiries,
      totalProposals, acceptedProposals,
      totalQuotations, approvedQuotations,
    ] = await Promise.all([
      CrmClient.countDocuments(),
      CrmProject.countDocuments(),
      CrmProject.countDocuments({ status: 'active' }),
      CrmProject.countDocuments({ status: 'completed' }),
      CrmInvoice.countDocuments(),
      CrmInvoice.countDocuments({ status: 'paid' }),
      CrmInvoice.countDocuments({ status: 'overdue' }),
      CrmInvoice.countDocuments({ status: { $in: ['draft', 'issued', 'partial'] } }),
      CrmEnquiry.countDocuments(),
      CrmEnquiry.countDocuments({ status: 'new' }),
      CrmProposal.countDocuments(),
      CrmProposal.countDocuments({ status: 'accepted' }),
      CrmQuotation.countDocuments(),
      CrmQuotation.countDocuments({ status: 'approved' }),
    ]);

    // Revenue calculations
    const [revenueResult, totalReceivedResult] = await Promise.all([
      CrmInvoice.aggregate([
        { $match: { status: { $in: ['paid', 'partial'] } } },
        { $group: { _id: null, total: { $sum: '$grand_total' }, paid: { $sum: '$amount_paid' } } },
      ]),
      CrmPayment.aggregate([
        { $group: { _id: null, total: { $sum: '$amount_paid' } } },
      ]),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalReceived = totalReceivedResult[0]?.total || 0;
    const totalOutstanding = await CrmInvoice.aggregate([
      { $match: { status: { $in: ['issued', 'partial', 'overdue'] } } },
      { $group: { _id: null, total: { $sum: '$balance_due' } } },
    ]).then(r => r[0]?.total || 0);

    // Recent activity
    const [recentClients, recentInvoices, recentEnquiries] = await Promise.all([
      CrmClient.find().sort({ created_at: -1 }).limit(5).select('full_name company_name city created_at'),
      CrmInvoice.find().sort({ invoice_date: -1 }).limit(5).select('invoice_number client_name_snapshot grand_total status invoice_date'),
      CrmEnquiry.find().sort({ enquiry_date: -1 }).limit(5).select('client_name mobile_number status service_interest enquiry_date'),
    ]);

    // Monthly revenue chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const monthlyRevenue = await CrmPayment.aggregate([
      { $match: { payment_date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$payment_date' }, month: { $month: '$payment_date' } },
          total: { $sum: '$amount_paid' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const unreadNotifications = await CrmNotification.countDocuments({
      $or: [{ user: req.crmUser._id }, { user: null }],
      is_read: false,
    });

    res.json({
      counts: {
        clients: totalClients,
        projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
        invoices: { total: totalInvoices, paid: paidInvoices, overdue: overdueInvoices, pending: pendingInvoices },
        enquiries: { total: totalEnquiries, new: newEnquiries },
        proposals: { total: totalProposals, accepted: acceptedProposals },
        quotations: { total: totalQuotations, approved: approvedQuotations },
      },
      revenue: {
        total_billed: totalRevenue,
        total_received: totalReceived,
        outstanding: totalOutstanding,
      },
      recent: {
        clients: recentClients,
        invoices: recentInvoices,
        enquiries: recentEnquiries,
      },
      monthly_revenue: monthlyRevenue,
      unread_notifications: unreadNotifications,
    });
  } catch (err) {
    console.error('CRM Dashboard error:', err);
    res.status(500).json({ message: err.message });
  }
};
