"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Building2, Landmark, Receipt, Save, CheckCircle, AlertCircle,
  Settings, User, FileText, Mail, Bell, Clock, Send, Eye, EyeOff,
  Shield, History, RefreshCw, ChevronRight, Activity, Download,
  ExternalLink, Zap, ToggleLeft, ToggleRight,
} from "lucide-react";
import CRM_API from "@/utils/crmApi";

/* ── Style helpers ── */
const card       = { background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden", marginBottom:20 };
const cardHeader = { display:"flex", alignItems:"center", gap:10, padding:"14px 20px", borderBottom:"1px solid #f1f5f9", background:"#f8fafc" };
const cardBody   = { padding:"22px 20px" };
const grid2  = { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:14, marginBottom:14 };
const grid3  = { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))", gap:14, marginBottom:14 };
const lbl    = { display:"block", fontSize:11, fontWeight:700, color:"#374151", marginBottom:5, letterSpacing:".02em" };
const inp    = { width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, outline:"none", fontFamily:"inherit", boxSizing:"border-box", transition:"border-color .15s" };

function SectionHeader({ icon, title, subtitle, color="#22c55e", bg="#f0fdf4" }) {
  return (
    <div style={cardHeader}>
      <div style={{ padding:8, background:bg, borderRadius:8, color }}>{icon}</div>
      <div>
        <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize:11, color:"#64748b", margin:"2px 0 0" }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label: lbl2, hint, children, required }) {
  return (
    <div>
      <label style={lbl}>{lbl2}{required && <span style={{color:"#ef4444",marginLeft:2}}>*</span>}</label>
      {children}
      {hint && <p style={{ fontSize:10, color:"#94a3b8", margin:"3px 0 0" }}>{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label: lbl2 }) {
  return (
    <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", userSelect:"none" }}>
      <div onClick={() => onChange(!checked)}
        style={{ width:40, height:22, borderRadius:11, background: checked ? "#22c55e":"#d1d5db", position:"relative", transition:"background .2s", cursor:"pointer", flexShrink:0 }}>
        <div style={{ position:"absolute", top:3, left: checked ? 21:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left .2s", boxShadow:"0 1px 3px rgba(0,0,0,.2)" }} />
      </div>
      <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>{lbl2}</span>
    </label>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function CrmSettingsPage() {
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [tab,     setTab]     = useState("company");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await CRM_API.get("/settings");
      setForm(data);
    } catch { setError("Failed to load settings."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const { data } = await CRM_API.put("/settings", form);
      setForm(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setError(e.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  /* field binders */
  const F  = k => ({ value: form?.[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })), onFocus: e => e.target.style.borderColor="#22c55e", onBlur: e => e.target.style.borderColor="#e2e8f0" });
  const Fn = k => ({ ...F(k), type:"number", min:"0", value: form?.[k] ?? 0, onChange: e => setForm(p => ({ ...p, [k]: Number(e.target.value) })) });

  const TABS = [
    { key:"company", label:"Company",     icon:<Building2 size={13}/> },
    { key:"gst",     label:"GST / Tax",   icon:<Receipt size={13}/> },
    { key:"bank",    label:"Bank Details",icon:<Landmark size={13}/> },
    { key:"invoice", label:"Invoice",     icon:<FileText size={13}/> },
    { key:"email",   label:"Email / SMTP",icon:<Mail size={13}/>, highlight:true },
    { key:"reminders",label:"Reminders",  icon:<Bell size={13}/> },
    { key:"history", label:"Audit Log",   icon:<History size={13}/> },
    { key:"profile", label:"My Profile",  icon:<User size={13}/> },
  ];

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"40vh" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36, height:36, border:"3px solid #dcfce7", borderTopColor:"#22c55e", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 12px" }}/>
        <p style={{ color:"#64748b", fontSize:14, margin:0 }}>Loading settings…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", maxWidth:900, animation:"fadeIn .2s ease" }}>

      {/* Page Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:"0 0 3px" }}>CRM Settings</h1>
          <p style={{ fontSize:13, color:"#64748b", margin:0 }}>Configure company info, email, billing, reminders and more</p>
        </div>
        {tab !== "history" && tab !== "profile" && (
          <button onClick={handleSave} disabled={saving || !form}
            style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 22px", background: saving?"#86efac":"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:9, fontSize:13, fontWeight:700, cursor: saving?"not-allowed":"pointer" }}>
            {saving ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/> Saving…</> :
             saved  ? <><CheckCircle size={14}/> Saved!</> :
                      <><Save size={14}/> Save Changes</>}
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fee2e2", color:"#dc2626", padding:"11px 15px", borderRadius:9, fontSize:13, marginBottom:16, border:"1px solid #fecaca" }}><AlertCircle size={14}/> {error}</div>}
      {saved && <div style={{ display:"flex", alignItems:"center", gap:8, background:"#dcfce7", color:"#15803d", padding:"11px 15px", borderRadius:9, fontSize:13, marginBottom:16, border:"1px solid #bbf7d0" }}><CheckCircle size={14}/> Settings saved successfully!</div>}

      {/* Tab Bar */}
      <div style={{ display:"flex", gap:2, background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:4, marginBottom:22, flexWrap:"wrap" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              display:"flex", alignItems:"center", gap:6, padding:"7px 14px",
              borderRadius:8, border:"none", fontSize:12, fontWeight:600,
              cursor:"pointer", whiteSpace:"nowrap",
              background: tab===t.key ? (t.highlight ? "linear-gradient(135deg,#7c3aed,#6d28d9)" : "#22c55e") : "transparent",
              color: tab===t.key ? "#fff" : "#64748b",
              transition:"all .15s",
            }}>
            {t.icon} {t.label}
            {t.highlight && tab!==t.key && <span style={{ fontSize:9, background:"#7c3aed", color:"#fff", padding:"1px 5px", borderRadius:10, marginLeft:2 }}>NEW</span>}
          </button>
        ))}
      </div>

      {form && (
        <form onSubmit={handleSave}>

          {/* ── COMPANY ── */}
          {tab==="company" && (
            <div style={card}>
              <SectionHeader icon={<Building2 size={15}/>} title="Company Information" subtitle="Shown on all invoices, proposals and emails"/>
              <div style={cardBody}>
                <div style={{...grid2, gridTemplateColumns:"1fr"}}><Field label="Company Name" required><input {...F("company_name")} required style={inp}/></Field></div>
                <div style={grid2}>
                  <Field label="Email"><input {...F("company_email")} type="email" style={inp}/></Field>
                  <Field label="Phone"><input {...F("company_phone")} style={inp}/></Field>
                  <Field label="Website"><input {...F("company_website")} style={inp}/></Field>
                </div>
                <div style={{...grid2, gridTemplateColumns:"1fr", marginBottom:14}}><Field label="Street Address"><input {...F("company_address")} style={inp}/></Field></div>
                <div style={grid3}>
                  <Field label="City"><input {...F("company_city")} style={inp}/></Field>
                  <Field label="State"><input {...F("company_state")} style={inp}/></Field>
                  <Field label="Pincode"><input {...F("company_pincode")} style={inp}/></Field>
                  <Field label="Country"><input {...F("company_country")} style={inp}/></Field>
                </div>
                <div style={{ marginTop:12, padding:"13px 16px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", fontSize:12, color:"#374151", lineHeight:1.8 }}>
                  <strong>Preview:</strong><br/>
                  <span style={{color:"#0f172a", fontWeight:600}}>{form.company_name}</span><br/>
                  {form.company_address}<br/>
                  {[form.company_city, form.company_state].filter(Boolean).join(", ")} – {form.company_pincode}<br/>
                  {form.company_phone} | {form.company_email}
                </div>
              </div>
            </div>
          )}

          {/* ── GST ── */}
          {tab==="gst" && (
            <div style={card}>
              <SectionHeader icon={<Receipt size={15}/>} title="GST & Tax Settings" subtitle="Defaults auto-fill on new invoices"/>
              <div style={cardBody}>
                <div style={grid2}>
                  <Field label="GSTIN"><input {...F("gstin")} style={{...inp,textTransform:"uppercase",letterSpacing:".04em"}}/></Field>
                  <Field label="State Code"><input {...F("state_code")} style={inp}/></Field>
                  <Field label="Place of Supply"><input {...F("place_of_supply")} style={inp}/></Field>
                  <Field label="HSN/SAC Code"><input {...F("default_hsn_sac")} style={inp}/></Field>
                </div>
                <div style={grid3}>
                  <Field label="CGST %"><input {...Fn("default_cgst_rate")} style={inp}/></Field>
                  <Field label="SGST %"><input {...Fn("default_sgst_rate")} style={inp}/></Field>
                  <Field label="IGST %"><input {...Fn("default_igst_rate")} style={inp}/></Field>
                </div>
                <div style={{ padding:"12px 16px", background:"#f0fdf4", borderRadius:8, border:"1px solid #bbf7d0", fontSize:12, color:"#15803d" }}>
                  ℹ️ CGST + SGST for intra-state ({form.place_of_supply}). IGST for inter-state.
                </div>
              </div>
            </div>
          )}

          {/* ── BANK ── */}
          {tab==="bank" && (
            <div style={card}>
              <SectionHeader icon={<Landmark size={15}/>} title="Bank Account Details" subtitle="Shown in payment section of every invoice"/>
              <div style={cardBody}>
                <div style={grid2}>
                  <Field label="Bank Name"><input {...F("bank_name")} style={inp}/></Field>
                  <Field label="Account Holder"><input {...F("account_name")} style={inp}/></Field>
                  <Field label="Account Number"><input {...F("account_number")} style={{...inp,fontFamily:"monospace",letterSpacing:".06em"}}/></Field>
                  <Field label="IFSC Code"><input {...F("ifsc_code")} style={{...inp,textTransform:"uppercase"}}/></Field>
                  <Field label="Branch"><input {...F("branch")} style={inp}/></Field>
                  <Field label="UPI ID"><input {...F("upi_id")} style={inp}/></Field>
                </div>
                <div style={{ padding:"13px 16px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", fontSize:12, color:"#374151", lineHeight:2 }}>
                  <strong>Bank:</strong> {form.bank_name} &nbsp;|&nbsp; <strong>A/C:</strong> {form.account_number} &nbsp;|&nbsp; <strong>IFSC:</strong> {form.ifsc_code}<br/>
                  <strong>UPI:</strong> {form.upi_id}
                </div>
              </div>
            </div>
          )}

          {/* ── INVOICE ── */}
          {tab==="invoice" && (
            <div style={card}>
              <SectionHeader icon={<FileText size={15}/>} title="Invoice & Numbering" subtitle="Prefixes and payment terms"/>
              <div style={cardBody}>
                <div style={grid3}>
                  <Field label="Invoice Prefix" hint="e.g. DKS-INV-2026-0001"><input {...F("invoice_prefix")} style={inp}/></Field>
                  <Field label="Quotation Prefix" hint="e.g. DKS-Q-2026-0001"><input {...F("quotation_prefix")} style={inp}/></Field>
                  <Field label="Proposal Prefix" hint="e.g. DKS-PROP-2026-0001"><input {...F("proposal_prefix")} style={inp}/></Field>
                </div>
                <div style={{...grid2, marginTop:8}}>
                  <Field label="Default Due Days" hint="Days from invoice date"><input {...Fn("default_due_days")} style={inp}/></Field>
                  <Field label="Late Fee % / month"><input {...Fn("late_fee_percent")} step="0.1" style={inp}/></Field>
                </div>
                <Field label="Invoice Footer"><input {...F("invoice_footer_text")} style={inp}/></Field>
                <div style={{marginTop:14}}>
                  <Field label="Signatory Name"><input {...F("signature_name")} placeholder="Authorized Signatory" style={inp}/></Field>
                </div>
                <div style={{marginTop:14}}>
                  <Field label="Custom Payment Terms">
                    <textarea {...F("payment_terms_text")} rows={4} placeholder="Leave blank for default…" style={{...inp,resize:"vertical",minHeight:80}}/>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ── EMAIL / SMTP ── */}
          {tab==="email" && <SmtpTab form={form} setForm={setForm} onSave={handleSave} saving={saving} />}

          {/* ── REMINDERS ── */}
          {tab==="reminders" && (
            <div>
              <div style={card}>
                <SectionHeader icon={<Bell size={15}/>} title="Follow-Up Reminders" subtitle="Auto-remind before follow-up dates are due" color="#d97706" bg="#fef3c7"/>
                <div style={cardBody}>
                  <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                    <Toggle checked={!!form.reminder_enabled} onChange={v=>setForm(p=>({...p,reminder_enabled:v}))} label="Enable follow-up reminders" />
                    <Toggle checked={!!form.reminder_browser_enabled} onChange={v=>setForm(p=>({...p,reminder_browser_enabled:v}))} label="Show reminders on dashboard" />
                    <Toggle checked={!!form.reminder_email_enabled} onChange={v=>setForm(p=>({...p,reminder_email_enabled:v}))} label="Send reminder emails (requires SMTP)" />
                    <div style={{ maxWidth:280 }}>
                      <Field label="Remind N days before due date" hint="e.g. 1 = remind 1 day before">
                        <input {...Fn("reminder_days_before")} min="0" max="30" style={inp}/>
                      </Field>
                    </div>
                  </div>
                </div>
              </div>

              <div style={card}>
                <SectionHeader icon={<ExternalLink size={15}/>} title="Google Sheets Export" subtitle="Export data to Google Sheets for analysis" color="#0891b2" bg="#ecfeff"/>
                <div style={cardBody}>
                  <Toggle checked={!!form.google_sheets_enabled} onChange={v=>setForm(p=>({...p,google_sheets_enabled:v}))} label="Enable Google Sheets export" />
                  <div style={{marginTop:14}}>
                    <Field label="Google Spreadsheet ID" hint="Found in the Sheets URL: docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit">
                      <input {...F("google_sheets_id")} placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms" style={inp}/>
                    </Field>
                  </div>
                  <div style={{ marginTop:14, padding:"12px 16px", background:"#ecfeff", borderRadius:8, border:"1px solid #a5f3fc", fontSize:12, color:"#0891b2", lineHeight:1.8 }}>
                    <strong>ℹ️ How to set up:</strong><br/>
                    1. Create a Google Sheet and share it with edit access<br/>
                    2. Copy the Spreadsheet ID from the URL<br/>
                    3. Use the Export buttons on Quotations / Invoices / Proposals pages to export CSV<br/>
                    4. Or click "Open in Sheets" to view exported data
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>
      )}

      {/* ── HISTORY (not in form) ── */}
      {tab==="history" && <HistoryTab />}

      {/* ── PROFILE (not in form) ── */}
      {tab==="profile" && <ProfileSection />}

      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   SMTP TAB
══════════════════════════════════════════ */
function SmtpTab({ form, setForm, onSave, saving }) {
  const [showPass,    setShowPass]    = useState(false);
  const [testing,     setTesting]     = useState(false);
  const [testTo,      setTestTo]      = useState("");
  const [testResult,  setTestResult]  = useState(null);

  const F = k => ({
    value: form?.[k] ?? "",
    onChange: e => setForm(p => ({ ...p, [k]: e.target.value })),
    onFocus: e => e.target.style.borderColor = "#7c3aed",
    onBlur:  e => e.target.style.borderColor = "#e2e8f0",
  });

  const handleTest = async () => {
    setTesting(true); setTestResult(null);
    try {
      const payload = {
        smtp_host:      form.smtp_host,
        smtp_port:      form.smtp_port || 587,
        smtp_secure:    form.smtp_secure,
        smtp_user:      form.smtp_user,
        smtp_pass:      form.smtp_pass,
        smtp_from_name: form.smtp_from_name,
        test_to:        testTo || form.smtp_user || form.company_email,
      };
      const { data } = await CRM_API.post("/settings/test-smtp", payload);
      setTestResult({ ok: true, msg: data.message });
    } catch (err) {
      setTestResult({ ok: false, msg: err.response?.data?.message || "Connection failed" });
    } finally { setTesting(false); }
  };

  const presets = [
    { label:"Gmail",   host:"smtp.gmail.com",     port:587, secure:false, hint:"Use App Password (not regular password)" },
    { label:"Outlook", host:"smtp-mail.outlook.com", port:587, secure:false, hint:"Use your Outlook password" },
    { label:"Yahoo",   host:"smtp.mail.yahoo.com",  port:465, secure:true,  hint:"Use App Password" },
    { label:"Custom",  host:"",                    port:587, secure:false, hint:"Enter your SMTP server details" },
  ];

  return (
    <div>
      {/* Provider Presets */}
      <div style={card}>
        <SectionHeader icon={<Zap size={15}/>} title="Quick Setup" subtitle="Select your email provider to auto-fill SMTP settings" color="#7c3aed" bg="#f5f3ff"/>
        <div style={{ padding:"16px 20px" }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {presets.map(p => (
              <button key={p.label} type="button"
                onClick={() => { if (p.host) setForm(f => ({ ...f, smtp_host: p.host, smtp_port: p.port, smtp_secure: p.secure })); }}
                style={{ padding:"8px 16px", background: form?.smtp_host===p.host ? "#7c3aed":"#f5f3ff", color: form?.smtp_host===p.host ? "#fff":"#7c3aed", border:"1.5px solid #ddd6fe", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", transition:"all .15s" }}>
                {p.label}
              </button>
            ))}
          </div>
          {presets.find(p=>p.host===form?.smtp_host) && (
            <p style={{ fontSize:11, color:"#7c3aed", margin:"8px 0 0", background:"#f5f3ff", padding:"6px 10px", borderRadius:6 }}>
              💡 {presets.find(p=>p.host===form?.smtp_host)?.hint}
            </p>
          )}
        </div>
      </div>

      {/* SMTP Config */}
      <div style={card}>
        <SectionHeader icon={<Mail size={15}/>} title="SMTP Configuration" subtitle="Outgoing email server settings" color="#7c3aed" bg="#f5f3ff"/>
        <div style={cardBody}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 120px", gap:14, marginBottom:14 }}>
            <Field label="SMTP Host" required><input {...F("smtp_host")} placeholder="smtp.gmail.com" style={inp}/></Field>
            <Field label="Port"><input value={form?.smtp_port||587} type="number" onChange={e=>setForm(p=>({...p,smtp_port:Number(e.target.value)}))} style={inp}/></Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <Field label="SMTP Username (Email)" required><input {...F("smtp_user")} type="email" placeholder="you@gmail.com" style={inp}/></Field>
            <Field label="SMTP Password" required>
              <div style={{ position:"relative" }}>
                <input {...F("smtp_pass")} type={showPass?"text":"password"} placeholder="App password or email password" style={{...inp,paddingRight:44}}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}>
                  {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <Field label="From Name"><input {...F("smtp_from_name")} placeholder="Subham General Store CRM" style={inp}/></Field>
            <Field label="From Email"><input {...F("smtp_from_email")} type="email" placeholder="noreply@subhamstore.com" style={inp}/></Field>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
              <input type="checkbox" checked={!!form?.smtp_secure} onChange={e=>setForm(p=>({...p,smtp_secure:e.target.checked}))} style={{width:16,height:16}}/>
              <span style={{ fontSize:13, color:"#374151" }}>Use SSL/TLS (port 465) — turn OFF for STARTTLS (port 587)</span>
            </label>
          </div>

          <div style={{ display:"flex", gap:10, alignItems:"flex-start", flexWrap:"wrap" }}>
            <button type="button" onClick={onSave} disabled={saving}
              style={{ padding:"9px 18px", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
              <Save size={13}/> {saving?"Saving…":"Save SMTP Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Email signature */}
      <div style={card}>
        <SectionHeader icon={<FileText size={15}/>} title="Email Signature" subtitle="Appended to all outgoing CRM emails" color="#7c3aed" bg="#f5f3ff"/>
        <div style={cardBody}>
          <textarea {...F("email_signature")} rows={5} placeholder="Best regards,&#10;Subham General Store Team&#10;+91 XXXXXXXXXX | subhamstore.com" style={{...inp,resize:"vertical",minHeight:100,width:"100%"}}/>
          <p style={{ fontSize:11, color:"#94a3b8", margin:"5px 0 0" }}>Plain text. Will be appended below all email messages.</p>
        </div>
      </div>

      {/* Test Connection */}
      <div style={card}>
        <SectionHeader icon={<Send size={15}/>} title="Test Email Connection" subtitle="Verify SMTP settings by sending a test email" color="#7c3aed" bg="#f5f3ff"/>
        <div style={cardBody}>
          {testResult && (
            <div style={{ padding:"11px 15px", borderRadius:8, marginBottom:14, fontSize:13,
              background: testResult.ok ? "#dcfce7":"#fee2e2",
              color:      testResult.ok ? "#16a34a":"#dc2626",
              border:     testResult.ok ? "1px solid #bbf7d0":"1px solid #fecaca",
              display:"flex", alignItems:"center", gap:8 }}>
              {testResult.ok ? <CheckCircle size={15}/> : <AlertCircle size={15}/>}
              {testResult.msg}
            </div>
          )}

          <div style={{ display:"flex", gap:10, alignItems:"flex-end", flexWrap:"wrap" }}>
            <div style={{ flex:"1 1 240px" }}>
              <label style={lbl}>Send test email to</label>
              <input type="email" value={testTo} onChange={e=>setTestTo(e.target.value)} placeholder={form?.smtp_user || "test@example.com"} style={inp}
                onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            </div>
            <button type="button" onClick={handleTest} disabled={testing || !form?.smtp_host}
              style={{ padding:"9px 20px", background: testing||!form?.smtp_host ? "#d1d5db":"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor: testing||!form?.smtp_host?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6 }}>
              {testing ? <><span style={{width:13,height:13,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block"}}/> Testing…</> : <><Send size={13}/> Send Test</>}
            </button>
          </div>

          {!form?.smtp_host && (
            <p style={{ fontSize:11, color:"#f59e0b", margin:"8px 0 0" }}>⚠️ Configure SMTP host and credentials above before testing.</p>
          )}

          <div style={{ marginTop:16, padding:"12px 15px", background:"#f8fafc", borderRadius:8, border:"1px solid #e2e8f0", fontSize:12, color:"#64748b", lineHeight:1.8 }}>
            <strong>Gmail setup steps:</strong><br/>
            1. Enable 2-factor authentication on your Google account<br/>
            2. Go to Google Account → Security → App passwords<br/>
            3. Create an app password for "Mail" on "Other device"<br/>
            4. Use that 16-char password here (not your regular Google password)<br/>
            <a href="https://support.google.com/accounts/answer/185833" target="_blank" rel="noreferrer" style={{ color:"#7c3aed", fontWeight:600 }}>→ Google App Passwords Guide ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   HISTORY / AUDIT LOG TAB
══════════════════════════════════════════ */
function HistoryTab() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [filter,  setFilter]  = useState({ entity_type:"", action:"", search:"" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:20 });
      if (filter.entity_type) params.append("entity_type", filter.entity_type);
      if (filter.action)      params.append("action",      filter.action);
      if (filter.search)      params.append("search",      filter.search);
      const { data } = await CRM_API.get(`/history?${params}`);
      setLogs(data.logs || []); setTotal(data.total || 0);
    } catch {}
    finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  const ACTION_COLORS = {
    created:    "#22c55e", updated:      "#2563eb", deleted:   "#dc2626",
    status_changed:"#d97706", email_sent:"#7c3aed", exported:"#0891b2",
    login:      "#64748b", payment_received:"#16a34a",
  };

  const fmtTs = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}) : "—";

  return (
    <div>
      <div style={card}>
        <SectionHeader icon={<History size={15}/>} title="Activity Audit Log" subtitle="Full version-controlled history of all CRM changes" color="#2563eb" bg="#dbeafe"/>
        <div style={{ padding:"12px 18px", borderBottom:"1px solid #f1f5f9", display:"flex", gap:8, flexWrap:"wrap" }}>
          <input value={filter.search} onChange={e=>{setFilter(p=>({...p,search:e.target.value}));setPage(1);}} placeholder="Search descriptions…"
            style={{...inp,width:220,padding:"7px 11px"}} onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
          <select value={filter.entity_type} onChange={e=>{setFilter(p=>({...p,entity_type:e.target.value}));setPage(1);}}
            style={{...inp,width:"auto",padding:"7px 10px"}}>
            <option value="">All Entities</option>
            {["client","project","invoice","quotation","proposal","payment","enquiry","followup","settings","user"].map(e=><option key={e} value={e}>{e}</option>)}
          </select>
          <select value={filter.action} onChange={e=>{setFilter(p=>({...p,action:e.target.value}));setPage(1);}}
            style={{...inp,width:"auto",padding:"7px 10px"}}>
            <option value="">All Actions</option>
            {["created","updated","deleted","status_changed","email_sent","payment_received","exported","login"].map(a=><option key={a} value={a}>{a}</option>)}
          </select>
          <button onClick={load} style={{padding:"7px 12px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:7,cursor:"pointer",color:"#64748b",display:"flex",alignItems:"center",gap:4,fontSize:12}}>
            <RefreshCw size={12}/> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{padding:40,textAlign:"center"}}><div style={{width:28,height:28,border:"3px solid #dbeafe",borderTopColor:"#2563eb",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto"}}/></div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:"#f8fafc"}}>
                  {["Timestamp","Actor","Action","Entity","Description","Changes"].map(h=>(
                    <th key={h} style={{padding:"9px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.length===0 ? (
                  <tr><td colSpan={6} style={{padding:40,textAlign:"center",color:"#94a3b8",fontSize:13}}>No history records yet</td></tr>
                ) : logs.map((log,i)=>(
                  <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                    <td style={{padding:"10px 14px",color:"#64748b",whiteSpace:"nowrap"}}>
                      <div style={{fontSize:12,color:"#1e293b",fontWeight:500}}>{fmtTs(log.created_at)}</div>
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{log.actor_name||"System"}</div>
                      {log.actor_role&&<div style={{fontSize:10,color:"#94a3b8",textTransform:"capitalize"}}>{log.actor_role}</div>}
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:(ACTION_COLORS[log.action]||"#64748b")+"20",color:ACTION_COLORS[log.action]||"#64748b"}}>
                        {log.action?.replace(/_/g," ")}
                      </span>
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#374151",textTransform:"capitalize"}}>{log.entity_type}</div>
                      {log.entity_label&&<div style={{fontSize:10,color:"#94a3b8"}}>{log.entity_label}</div>}
                    </td>
                    <td style={{padding:"10px 14px",maxWidth:240}}>
                      <div style={{fontSize:12,color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{log.description||"—"}</div>
                    </td>
                    <td style={{padding:"10px 14px"}}>
                      {log.changes?.length>0 ? (
                        <details>
                          <summary style={{fontSize:11,fontWeight:700,color:"#2563eb",cursor:"pointer"}}>{log.changes.length} field{log.changes.length>1?"s":""} changed</summary>
                          <div style={{marginTop:6,display:"flex",flexDirection:"column",gap:3}}>
                            {log.changes.map((c,j)=>(
                              <div key={j} style={{fontSize:10,background:"#f8fafc",borderRadius:5,padding:"4px 8px"}}>
                                <span style={{fontWeight:700,color:"#1e293b"}}>{c.label}: </span>
                                <span style={{color:"#dc2626",textDecoration:"line-through"}}>{String(c.old_value||"—").substring(0,30)}</span>
                                <span style={{color:"#94a3b8"}}> → </span>
                                <span style={{color:"#16a34a"}}>{String(c.new_value||"—").substring(0,30)}</span>
                              </div>
                            ))}
                          </div>
                        </details>
                      ) : <span style={{color:"#cbd5e1"}}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 20 && (
          <div style={{padding:"12px 18px",borderTop:"1px solid #f1f5f9",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:12,color:"#64748b"}}>{total} total records · Page {page} of {Math.ceil(total/20)}</span>
            <div style={{display:"flex",gap:6}}>
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{padding:"5px 12px",background:page===1?"#f1f5f9":"#fff",border:"1px solid #e2e8f0",borderRadius:6,cursor:page===1?"not-allowed":"pointer",fontSize:12,color:"#374151"}}>← Prev</button>
              <button disabled={page>=Math.ceil(total/20)} onClick={()=>setPage(p=>p+1)} style={{padding:"5px 12px",background:page>=Math.ceil(total/20)?"#f1f5f9":"#fff",border:"1px solid #e2e8f0",borderRadius:6,cursor:page>=Math.ceil(total/20)?"not-allowed":"pointer",fontSize:12,color:"#374151"}}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   PROFILE SECTION
══════════════════════════════════════════ */
function ProfileSection() {
  const [user, setUser]         = useState(null);
  const [nameForm, setNameForm] = useState({ full_name:"", phone:"" });
  const [pwForm, setPwForm]     = useState({ old_password:"", new_password:"", confirm_password:"" });
  const [nameSaving, setNameSaving] = useState(false);
  const [pwSaving,   setPwSaving]   = useState(false);
  const [nameMsg, setNameMsg]   = useState("");
  const [pwMsg,   setPwMsg]     = useState("");
  const [pwErr,   setPwErr]     = useState("");
  const [showPws, setShowPws]   = useState({});

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("crm_user")||"{}");
      if (u.full_name) { setUser(u); setNameForm({ full_name:u.full_name, phone:u.phone||"" }); }
    } catch {}
  }, []);

  const saveName = async e => {
    e.preventDefault(); setNameSaving(true); setNameMsg("");
    try {
      const { data } = await CRM_API.patch("/auth/me", nameForm);
      localStorage.setItem("crm_user", JSON.stringify({ ...user, ...data }));
      setUser(p=>({...p,...data})); setNameMsg("Profile updated!");
      setTimeout(()=>setNameMsg(""),3000);
    } catch { setNameMsg("Update failed."); }
    finally { setNameSaving(false); }
  };

  const savePw = async e => {
    e.preventDefault(); setPwErr(""); setPwMsg("");
    if (pwForm.new_password !== pwForm.confirm_password) { setPwErr("Passwords don't match."); return; }
    if (pwForm.new_password.length < 6) { setPwErr("Min 6 characters."); return; }
    setPwSaving(true);
    try {
      await CRM_API.post("/auth/me/change-password",{ old_password:pwForm.old_password, new_password:pwForm.new_password });
      setPwForm({ old_password:"", new_password:"", confirm_password:"" });
      setPwMsg("Password changed!"); setTimeout(()=>setPwMsg(""),3000);
    } catch(e){ setPwErr(e.response?.data?.message||"Change failed."); }
    finally { setPwSaving(false); }
  };

  const initials = user?.full_name?.[0]?.toUpperCase()||"U";

  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      {/* Avatar card */}
      <div style={card}>
        <SectionHeader icon={<User size={15}/>} title="My Profile" subtitle="Update your name and contact info"/>
        <div style={cardBody}>
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20}}>
            <div style={{width:54,height:54,borderRadius:"50%",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",fontSize:20,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{initials}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:"#0f172a"}}>{user?.full_name||"—"}</div>
              <div style={{fontSize:12,color:"#64748b",textTransform:"capitalize"}}>{user?.role} · {user?.email}</div>
            </div>
          </div>
          <form onSubmit={saveName} style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="Full Name"><input value={nameForm.full_name} onChange={e=>setNameForm(p=>({...p,full_name:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></Field>
              <Field label="Phone"><input value={nameForm.phone} onChange={e=>setNameForm(p=>({...p,phone:e.target.value}))} style={inp} onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/></Field>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button type="submit" disabled={nameSaving} style={{padding:"8px 18px",background:nameSaving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:nameSaving?"not-allowed":"pointer"}}>
                {nameSaving?"Saving…":"Update Profile"}
              </button>
              {nameMsg && <span style={{fontSize:13,color:"#15803d",fontWeight:600}}>✓ {nameMsg}</span>}
            </div>
          </form>
        </div>
      </div>

      {/* Change password */}
      <div style={card}>
        <SectionHeader icon={<Shield size={15}/>} title="Change Password" subtitle="Use a strong password with letters, numbers and symbols" color="#ea580c" bg="#fff7ed"/>
        <div style={cardBody}>
          <form onSubmit={savePw} style={{display:"flex",flexDirection:"column",gap:12}}>
            {pwErr && <div style={{background:"#fee2e2",color:"#dc2626",padding:"9px 13px",borderRadius:8,fontSize:13}}>{pwErr}</div>}
            <Field label="Current Password">
              <div style={{position:"relative"}}>
                <input type={showPws.old?"text":"password"} value={pwForm.old_password} onChange={e=>setPwForm(p=>({...p,old_password:e.target.value}))} required style={{...inp,paddingRight:42}} onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                <button type="button" onClick={()=>setShowPws(p=>({...p,old:!p.old}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}}>{showPws.old?<EyeOff size={13}/>:<Eye size={13}/>}</button>
              </div>
            </Field>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field label="New Password">
                <div style={{position:"relative"}}>
                  <input type={showPws.new?"text":"password"} value={pwForm.new_password} onChange={e=>setPwForm(p=>({...p,new_password:e.target.value}))} required minLength={6} style={{...inp,paddingRight:42}} onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  <button type="button" onClick={()=>setShowPws(p=>({...p,new:!p.new}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}}>{showPws.new?<EyeOff size={13}/>:<Eye size={13}/>}</button>
                </div>
              </Field>
              <Field label="Confirm Password">
                <div style={{position:"relative"}}>
                  <input type={showPws.conf?"text":"password"} value={pwForm.confirm_password} onChange={e=>setPwForm(p=>({...p,confirm_password:e.target.value}))} required style={{...inp,paddingRight:42}} onFocus={e=>e.target.style.borderColor="#22c55e"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  <button type="button" onClick={()=>setShowPws(p=>({...p,conf:!p.conf}))} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"#94a3b8"}}>{showPws.conf?<EyeOff size={13}/>:<Eye size={13}/>}</button>
                </div>
              </Field>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <button type="submit" disabled={pwSaving} style={{padding:"8px 18px",background:pwSaving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:pwSaving?"not-allowed":"pointer"}}>
                {pwSaving?"Changing…":"Change Password"}
              </button>
              {pwMsg && <span style={{fontSize:13,color:"#15803d",fontWeight:600}}>✓ {pwMsg}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
