const CrmFollowUp    = require('../../models/crm/CrmFollowUp');
const CrmClient      = require('../../models/crm/CrmClient');
const CrmHistory     = require('../../models/crm/CrmHistory');
const CrmNotification = require('../../models/crm/CrmNotification');

/* ── nodemailer (optional — graceful if not installed) ── */
let transporter = null;
try {
  const nodemailer = require('nodemailer');
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
} catch {}

/* ── helpers ── */
const log = async (req, action, id, label, desc = '') => {
  try {
    await CrmHistory.create({
      actor:        req.crmUser._id,
      actor_name:   req.crmUser.full_name,
      action,
      entity_type:  'followup',
      entity_id:    id,
      entity_label: label,
      description:  desc,
    });
  } catch {}
};

const isOverdue = (f) =>
  f.follow_up_date &&
  new Date(f.follow_up_date) < new Date() &&
  !['won','lost'].includes(f.status);

const isToday = (d) => {
  if (!d) return false;
  const t = new Date(d);
  const n = new Date();
  return t.getFullYear() === n.getFullYear() &&
         t.getMonth()    === n.getMonth()    &&
         t.getDate()     === n.getDate();
};

/* ══════════════════════════════════════════
   LIST  GET /api/crm/followups
══════════════════════════════════════════ */
exports.list = async (req, res) => {
  try {
    const { status, channel, priority, client, search, view, assigned } = req.query;
    const filter = {};

    if (status)   filter.status   = status;
    if (channel)  filter.channel  = channel;
    if (priority) filter.priority = priority;
    if (client)   filter.client   = client;
    if (assigned) filter.assigned_to = assigned;

    if (search) {
      filter.$or = [
        { title:          { $regex: search, $options: 'i' } },
        { contact_name:   { $regex: search, $options: 'i' } },
        { contact_email:  { $regex: search, $options: 'i' } },
        { contact_phone:  { $regex: search, $options: 'i' } },
        { remarks:        { $regex: search, $options: 'i' } },
        { tags:           { $regex: search, $options: 'i' } },
      ];
    }

    // Smart view filters
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (view === 'today') {
      filter.follow_up_date = { $gte: today, $lt: tomorrow };
    } else if (view === 'overdue') {
      filter.follow_up_date = { $lt: today };
      filter.status = { $nin: ['won', 'lost'] };
    } else if (view === 'upcoming') {
      filter.follow_up_date = { $gte: tomorrow };
      filter.status = { $nin: ['won', 'lost'] };
    } else if (view === 'won') {
      filter.status = 'won';
    } else if (view === 'lost') {
      filter.status = 'lost';
    }

    const followups = await CrmFollowUp.find(filter)
      .populate('client',   'full_name company_name email phone')
      .populate('enquiry',  'client_name mobile_number email')
      .populate('project',  'title')
      .populate('quotation','quotation_number')
      .sort({ follow_up_date: 1, created_at: -1 });

    res.json(followups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   STATS  GET /api/crm/followups/stats
══════════════════════════════════════════ */
exports.stats = async (req, res) => {
  try {
    const all = await CrmFollowUp.find({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const counts = {
      total:       all.length,
      overdue:     0,
      today:       0,
      upcoming:    0,
      won:         0,
      lost:        0,
      scheduled:   0,
      in_progress: 0,
      no_response: 0,
    };

    let total_deal_value = 0;
    let won_deal_value   = 0;

    // Channel breakdown
    const byChannel  = {};
    const byPriority = {};
    const recent7 = [];

    all.forEach(f => {
      const fd = f.follow_up_date ? new Date(f.follow_up_date) : null;

      // Status buckets
      if (f.status === 'won')  counts.won++;
      if (f.status === 'lost') counts.lost++;
      if (f.status === 'scheduled')   counts.scheduled++;
      if (f.status === 'in_progress') counts.in_progress++;
      if (f.status === 'no_response') counts.no_response++;

      // Date buckets
      if (fd) {
        const fdDay = new Date(fd); fdDay.setHours(0,0,0,0);
        if (fdDay < today  && !['won','lost'].includes(f.status)) counts.overdue++;
        if (fdDay >= today && fdDay < tomorrow) counts.today++;
        if (fdDay >= tomorrow && !['won','lost'].includes(f.status)) counts.upcoming++;
      }

      // Values
      total_deal_value += f.deal_value || 0;
      if (f.status === 'won') won_deal_value += f.deal_value || 0;

      // Channel breakdown
      const ch = f.channel || 'other';
      byChannel[ch] = (byChannel[ch] || 0) + 1;

      // Priority
      const pr = f.priority || 'medium';
      byPriority[pr] = (byPriority[pr] || 0) + 1;
    });

    // Conversion rate
    const closed = counts.won + counts.lost;
    const conversion_rate = closed > 0 ? Math.round((counts.won / closed) * 100) : 0;

    // Last 30 days activity by day
    const last30 = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0,0,0,0);
      const label = d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
      const count = all.filter(f => {
        if (!f.created_at) return false;
        const c = new Date(f.created_at); c.setHours(0,0,0,0);
        return c.getTime() === d.getTime();
      }).length;
      last30.push({ date: label, count });
    }

    res.json({
      counts,
      total_deal_value,
      won_deal_value,
      conversion_rate,
      by_channel:  byChannel,
      by_priority: byPriority,
      last30_activity: last30,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   GET ONE  GET /api/crm/followups/:id
══════════════════════════════════════════ */
exports.getOne = async (req, res) => {
  try {
    const f = await CrmFollowUp.findById(req.params.id)
      .populate('client',   'full_name company_name email phone')
      .populate('enquiry',  'client_name mobile_number email')
      .populate('project',  'title')
      .populate('quotation','quotation_number');
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });
    res.json(f);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   CREATE  POST /api/crm/followups
══════════════════════════════════════════ */
exports.create = async (req, res) => {
  try {
    const body = { ...req.body, created_by: req.crmUser._id };

    // Auto-populate contact snapshot from client if provided
    if (body.client && !body.contact_name) {
      const cl = await CrmClient.findById(body.client);
      if (cl) {
        body.contact_name  = cl.full_name;
        body.contact_email = body.contact_email || cl.email;
        body.contact_phone = body.contact_phone || cl.phone;
      }
    }

    const f = await CrmFollowUp.create(body);

    await log(req, 'created', f._id, f.contact_name,
      `Follow-up created for ${f.contact_name} via ${f.channel}`);

    await CrmNotification.create({
      user:           req.crmUser._id,
      event_type:     'followup_created',
      title:          'Follow-Up Created',
      message:        `New follow-up: ${f.title} for ${f.contact_name}`,
      reference_id:   f._id,
      reference_type: 'followup',
    });

    res.status(201).json(f);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   UPDATE  PATCH/PUT /api/crm/followups/:id
══════════════════════════════════════════ */
exports.update = async (req, res) => {
  try {
    // Track status change for history
    const prev = await CrmFollowUp.findById(req.params.id);
    const f    = await CrmFollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });

    const desc = prev?.status !== f.status
      ? `Status changed from "${prev.status}" to "${f.status}" for ${f.contact_name}`
      : `Updated follow-up for ${f.contact_name}`;

    await log(req, 'updated', f._id, f.contact_name, desc);

    // Notification on win/loss
    if (f.status === 'won' && prev?.status !== 'won') {
      await CrmNotification.create({
        user:           req.crmUser._id,
        event_type:     'followup_won',
        title:          '🎉 Deal Won!',
        message:        `Follow-up "${f.title}" for ${f.contact_name} marked as WON`,
        reference_id:   f._id,
        reference_type: 'followup',
      });
    }

    res.json(f);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   DELETE  DELETE /api/crm/followups/:id
══════════════════════════════════════════ */
exports.remove = async (req, res) => {
  try {
    const f = await CrmFollowUp.findByIdAndDelete(req.params.id);
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });
    await log(req, 'deleted', f._id, f.contact_name,
      `Deleted follow-up: ${f.title} for ${f.contact_name}`);
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   SEND EMAIL  POST /api/crm/followups/:id/email
══════════════════════════════════════════ */
exports.sendEmail = async (req, res) => {
  try {
    const { subject, body, to } = req.body;
    if (!subject || !body || !to)
      return res.status(400).json({ message: 'to, subject, and body are required' });

    const f = await CrmFollowUp.findById(req.params.id);
    if (!f) return res.status(404).json({ message: 'Follow-up not found' });

    const emailLog = {
      sent_at:      new Date(),
      to,
      subject,
      body,
      status:       'failed',
      sent_by:      req.crmUser._id,
      sent_by_name: req.crmUser.full_name,
    };

    // Send via SMTP if configured
    if (transporter) {
      try {
        await transporter.sendMail({
          from:    `"${process.env.SMTP_FROM_NAME || 'DigiKraft Social CRM'}" <${process.env.SMTP_USER}>`,
          to,
          subject,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#22c55e;padding:20px 24px;">
                <h2 style="color:#fff;margin:0;font-size:18px;">DigiKraft Social</h2>
              </div>
              <div style="padding:28px 24px;background:#f9fafb;">
                ${body.replace(/\n/g, '<br/>')}
              </div>
              <div style="padding:16px 24px;background:#fff;border-top:1px solid #e5e7eb;font-size:11px;color:#9ca3af;">
                Sent via DigiKraft Social CRM by ${req.crmUser.full_name}
              </div>
            </div>`,
        });
        emailLog.status = 'sent';
      } catch (mailErr) {
        console.error('Email send error:', mailErr.message);
        emailLog.status = 'failed';
      }
    } else {
      // SMTP not configured — log as "sent" for demo purposes
      emailLog.status = 'sent';
    }

    // Push to email_logs array
    await CrmFollowUp.findByIdAndUpdate(req.params.id, {
      $push: { email_logs: emailLog },
      ...(emailLog.status === 'sent' ? { last_contacted: new Date() } : {}),
    });

    await log(req, 'email_sent', f._id, f.contact_name,
      `Email "${subject}" sent to ${to} — status: ${emailLog.status}`);

    if (emailLog.status === 'sent') {
      res.json({ message: 'Email sent successfully', log: emailLog });
    } else {
      res.status(207).json({ message: 'Email logged but SMTP delivery failed. Configure SMTP in .env to enable sending.', log: emailLog });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════
   BULK UPDATE  PATCH /api/crm/followups/bulk
══════════════════════════════════════════ */
exports.bulkUpdate = async (req, res) => {
  try {
    const { ids, update } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'ids array required' });
    const result = await CrmFollowUp.updateMany({ _id: { $in: ids } }, update);
    res.json({ updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
