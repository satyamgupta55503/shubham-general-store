const CrmSettings = require('../../models/crm/CrmSettings');
const CrmHistory  = require('../../models/crm/CrmHistory');

const SETTINGS_ID = 'crm_settings';

// ── Get settings ──────────────────────────────────────────────────────────────
exports.get = async (req, res) => {
  try {
    let s = await CrmSettings.findById(SETTINGS_ID);
    if (!s) s = await CrmSettings.create({ _id: SETTINGS_ID });
    const obj = s.toJSON();
    // Never send raw SMTP pass to frontend — mask it
    if (obj.smtp_pass) obj.smtp_pass = '••••••••';
    res.json(obj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Update settings ───────────────────────────────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { _id, __v, created_at, ...updates } = req.body;

    // If smtp_pass is masked placeholder, remove it (don't overwrite real pass)
    if (updates.smtp_pass === '••••••••' || updates.smtp_pass === '') {
      delete updates.smtp_pass;
    }

    // Snapshot before for diff
    const before = await CrmSettings.findById(SETTINGS_ID);

    const s = await CrmSettings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );

    // Log the change
    const changes = CrmHistory.computeDiff(before?.toObject(), s.toObject());
    if (changes.length > 0) {
      await CrmHistory.create({
        actor:        req.crmUser._id,
        actor_name:   req.crmUser.full_name,
        actor_role:   req.crmUser.role,
        action:       'updated',
        entity_type:  'settings',
        entity_id:    SETTINGS_ID,
        entity_label: 'CRM Settings',
        description:  `Settings updated by ${req.crmUser.full_name} — ${changes.length} field(s) changed`,
        changes,
      });
    }

    const obj = s.toJSON();
    if (obj.smtp_pass) obj.smtp_pass = '••••••••';
    res.json(obj);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── Test SMTP connection ───────────────────────────────────────────────────────
exports.testSmtp = async (req, res) => {
  try {
    const { smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass, smtp_from_name, test_to } = req.body;

    const host = smtp_host || process.env.SMTP_HOST;
    const user = smtp_user || process.env.SMTP_USER;
    const port = smtp_port || process.env.SMTP_PORT || 587;

    if (!host || !user) {
      return res.status(400).json({ message: 'SMTP host and user are required' });
    }

    // Resolve password — use submitted (if not masked), else DB, else env
    let pass = smtp_pass;
    if (!pass || pass === '••••••••') {
      const stored = await CrmSettings.findById(SETTINGS_ID);
      pass = stored?.smtp_pass || process.env.SMTP_PASS || '';
    }

    let nodemailer;
    try { nodemailer = require('nodemailer'); } catch {
      return res.status(500).json({ message: 'nodemailer not installed. Run: npm install nodemailer' });
    }

    const transport = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: smtp_secure === true || smtp_secure === 'true',
      auth: { user, pass },
    });

    // Verify connection
    await transport.verify();

    // Send test email
    const toAddr = test_to || user;
    await transport.sendMail({
      from: `"${smtp_from_name || 'DigiKraft Social CRM'}" <${user}>`,
      to:   toAddr,
      subject: '✅ DigiKraft CRM — SMTP Test Successful',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <div style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:20px 24px;border-radius:10px 10px 0 0;">
            <h2 style="color:#fff;margin:0;font-size:18px;">DigiKraft Social CRM</h2>
          </div>
          <div style="background:#f9fafb;padding:28px 24px;border-radius:0 0 10px 10px;">
            <h3 style="color:#14532d;margin:0 0 12px;">✅ SMTP Connection Successful!</h3>
            <p style="color:#374151;font-size:14px;line-height:1.6;">
              Your email settings are configured correctly.<br/>
              You can now send emails from the CRM.
            </p>
            <div style="margin-top:16px;padding:12px 16px;background:#dcfce7;border-radius:8px;font-size:13px;color:#15803d;">
              <strong>Host:</strong> ${host}:${port}<br/>
              <strong>From:</strong> ${user}<br/>
              <strong>Test sent at:</strong> ${new Date().toLocaleString('en-IN')}
            </div>
          </div>
        </div>`,
    });

    await CrmHistory.create({
      actor: req.crmUser._id, actor_name: req.crmUser.full_name,
      action: 'email_sent', entity_type: 'settings', entity_id: SETTINGS_ID,
      entity_label: 'SMTP Test', description: `SMTP test email sent to ${toAddr}`,
    });

    res.json({ message: `Test email sent to ${toAddr}`, host, port });
  } catch (err) {
    res.status(400).json({ message: `SMTP Error: ${err.message}` });
  }
};

// ── Get settings history ──────────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const logs = await CrmHistory.find({ entity_type: 'settings' })
      .sort({ created_at: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Get full history for any entity (version control view) ────────────────────
exports.getEntityHistory = async (req, res) => {
  try {
    const { type, id } = req.params;
    const logs = await CrmHistory.find({ entity_type: type, entity_id: id })
      .sort({ created_at: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
