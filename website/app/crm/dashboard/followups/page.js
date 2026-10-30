"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import CRM_API from "@/utils/crmApi";
import {
  Phone, Mail, MessageCircle, Video, Linkedin, MoreHorizontal,
  Plus, Search, RefreshCw, Filter, TrendingUp, TrendingDown,
  CheckCircle, Clock, AlertTriangle, XCircle, Calendar,
  ChevronDown, X, Send, Eye, Edit2, Trash2, BarChart2,
  Users, DollarSign, Activity, ArrowUpRight, Zap, Tag,
  MessageSquare, IndianRupee, Star,
} from "lucide-react";
import ExportButton from "@/components/crm/ExportButton";
import { FOLLOWUP_COLUMNS } from "@/utils/exportUtils";

/* ── constants ──────────────────────────────────────────── */
const CHANNELS = [
  { value:"phone",    label:"Phone",    icon:Phone,          color:"#0891b2" },
  { value:"email",    label:"Email",    icon:Mail,           color:"#7c3aed" },
  { value:"whatsapp", label:"WhatsApp", icon:MessageCircle,  color:"#16a34a" },
  { value:"meeting",  label:"Meeting",  icon:Video,          color:"#ea580c" },
  { value:"chat",     label:"Chat",     icon:MessageSquare,  color:"#2563eb" },
  { value:"linkedin", label:"LinkedIn", icon:Linkedin,       color:"#0a66c2" },
  { value:"other",    label:"Other",    icon:MoreHorizontal, color:"#64748b" },
];

const STATUSES = [
  { value:"scheduled",   label:"Scheduled",    color:"#2563eb", bg:"#dbeafe" },
  { value:"in_progress", label:"In Progress",  color:"#d97706", bg:"#fef3c7" },
  { value:"contacted",   label:"Contacted",    color:"#0891b2", bg:"#cffafe" },
  { value:"no_response", label:"No Response",  color:"#64748b", bg:"#f1f5f9" },
  { value:"postponed",   label:"Postponed",    color:"#7c3aed", bg:"#ede9fe" },
  { value:"won",         label:"Won ✓",        color:"#16a34a", bg:"#dcfce7" },
  { value:"lost",        label:"Lost ✗",       color:"#dc2626", bg:"#fee2e2" },
];

const PRIORITIES = [
  { value:"low",    label:"Low",    color:"#64748b", bg:"#f1f5f9" },
  { value:"medium", label:"Medium", color:"#d97706", bg:"#fef3c7" },
  { value:"high",   label:"High",   color:"#ea580c", bg:"#ffedd5" },
  { value:"urgent", label:"Urgent", color:"#dc2626", bg:"#fee2e2" },
];

const VIEWS = [
  { key:"all",      label:"All",      icon:Activity },
  { key:"overdue",  label:"Overdue",  icon:AlertTriangle },
  { key:"today",    label:"Today",    icon:Clock },
  { key:"upcoming", label:"Upcoming", icon:Calendar },
  { key:"won",      label:"Won",      icon:CheckCircle },
  { key:"lost",     label:"Lost",     icon:XCircle },
];

const fmt  = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtRelative = d => {
  if (!d) return null;
  const diff = Math.round((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `in ${diff}d`;
};

const getStatus = v => STATUSES.find(s => s.value === v) || STATUSES[0];
const getPriority = v => PRIORITIES.find(p => p.value === v) || PRIORITIES[1];
const getChannel  = v => CHANNELS.find(c => c.value === v)  || CHANNELS[6];

/* ── sub-components ─────────────────────────────────────── */
function Badge({ value, map }) {
  const item = map.find(i => i.value === value);
  if (!item) return null;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 9px", borderRadius:"20px", fontSize:"11px", fontWeight:"700", background:item.bg, color:item.color, whiteSpace:"nowrap" }}>
      {item.label}
    </span>
  );
}

function ChannelIcon({ value, size = 14 }) {
  const ch = getChannel(value);
  const Icon = ch.icon;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:"4px", fontSize:"12px", color:ch.color, fontWeight:"600" }}>
      <Icon size={size} /> {ch.label}
    </span>
  );
}

function PriorityDot({ value }) {
  const p = getPriority(value);
  return <span style={{ display:"inline-block", width:"8px", height:"8px", borderRadius:"50%", background:p.color, flexShrink:0 }} title={p.label} />;
}

function StatCard({ label, value, sub, icon:Icon, color, bg }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${bg}`, borderRadius:"12px", padding:"16px 18px", display:"flex", flexDirection:"column", gap:"10px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:".05em", margin:"0 0 5px" }}>{label}</p>
          <p style={{ fontSize:"26px", fontWeight:"800", color:"#0f172a", margin:0, lineHeight:1 }}>{value}</p>
        </div>
        <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon size={18} />
        </div>
      </div>
      {sub && <p style={{ fontSize:"11px", color:"#94a3b8", margin:0 }}>{sub}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL — Create / Edit Follow-Up
══════════════════════════════════════════ */
function FollowUpModal({ item, clients, onClose, onSave }) {
  const isEdit = !!item?._id;
  const [form, setForm] = useState({
    title: "", contact_name: "", contact_email: "", contact_phone: "",
    client: "", channel: "phone", status: "scheduled", priority: "medium",
    follow_up_date: "", last_contacted: "", remarks: "", next_steps: "",
    deal_value: "", tags: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (item) {
      setForm({
        title:          item.title || "",
        contact_name:   item.contact_name || "",
        contact_email:  item.contact_email || "",
        contact_phone:  item.contact_phone || "",
        client:         item.client?._id || item.client || "",
        channel:        item.channel || "phone",
        status:         item.status || "scheduled",
        priority:       item.priority || "medium",
        follow_up_date: item.follow_up_date ? item.follow_up_date.substring(0,10) : "",
        last_contacted: item.last_contacted ? item.last_contacted.substring(0,10) : "",
        remarks:        item.remarks || "",
        next_steps:     item.next_steps || "",
        deal_value:     item.deal_value || "",
        tags:           (item.tags || []).join(", "),
      });
    }
  }, [item]);

  // Auto-fill from client
  const handleClientChange = (cid) => {
    setForm(p => ({ ...p, client: cid }));
    if (cid) {
      const cl = clients.find(c => (c._id || c.id) === cid);
      if (cl) setForm(p => ({
        ...p, client: cid,
        contact_name:  p.contact_name || cl.full_name,
        contact_email: p.contact_email || cl.email || "",
        contact_phone: p.contact_phone || cl.phone || "",
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const payload = {
        ...form,
        deal_value: Number(form.deal_value) || 0,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        follow_up_date: form.follow_up_date || null,
        last_contacted: form.last_contacted || null,
      };
      if (!payload.client) delete payload.client;

      if (isEdit) {
        const { data } = await CRM_API.patch(`/followups/${item._id}`, payload);
        onSave(data, "edit");
      } else {
        const { data } = await CRM_API.post("/followups", payload);
        onSave(data, "create");
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const inp = { padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"13px", width:"100%", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
  const label = { fontSize:"11px", fontWeight:"700", color:"#374151", marginBottom:"4px", display:"block" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.5)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(3px)" }}>
      <div style={{ background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"680px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,.15)", animation:"modalIn .2s ease" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", borderBottom:"1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ fontSize:"17px", fontWeight:"800", color:"#0f172a", margin:0 }}>{isEdit ? "Edit Follow-Up" : "New Follow-Up"}</h2>
            <p style={{ fontSize:"12px", color:"#94a3b8", margin:"2px 0 0" }}>Track every client touchpoint</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"8px", width:"32px", height:"32px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding:"22px 24px", display:"flex", flexDirection:"column", gap:"16px" }}>
          {error && <div style={{ background:"#fee2e2", color:"#dc2626", padding:"10px 14px", borderRadius:"8px", fontSize:"13px" }}>{error}</div>}

          {/* Title */}
          <div>
            <label style={label}>Follow-Up Title <span style={{color:"#ef4444"}}>*</span></label>
            <input style={inp} value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Website proposal follow-up call" required />
          </div>

          {/* Client + Channel row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={label}>Link Client</label>
              <select style={inp} value={form.client} onChange={e=>handleClientChange(e.target.value)}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c._id||c.id} value={c._id||c.id}>{c.full_name}{c.company_name ? ` (${c.company_name})` : ""}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Channel <span style={{color:"#ef4444"}}>*</span></label>
              <select style={inp} value={form.channel} onChange={e=>setForm(p=>({...p,channel:e.target.value}))}>
                {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Contact details */}
          <div style={{ background:"#f8fafc", borderRadius:"10px", padding:"14px 16px" }}>
            <p style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 10px" }}>Contact Details</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"12px" }}>
              <div>
                <label style={label}>Name <span style={{color:"#ef4444"}}>*</span></label>
                <input style={inp} value={form.contact_name} onChange={e=>setForm(p=>({...p,contact_name:e.target.value}))} placeholder="Contact name" required />
              </div>
              <div>
                <label style={label}>Email</label>
                <input style={inp} type="email" value={form.contact_email} onChange={e=>setForm(p=>({...p,contact_email:e.target.value}))} placeholder="email@example.com" />
              </div>
              <div>
                <label style={label}>Phone</label>
                <input style={inp} value={form.contact_phone} onChange={e=>setForm(p=>({...p,contact_phone:e.target.value}))} placeholder="+91 xxxxx xxxxx" />
              </div>
            </div>
          </div>

          {/* Status + Priority + Deal Value */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"14px" }}>
            <div>
              <label style={label}>Status</label>
              <select style={inp} value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Priority</label>
              <select style={inp} value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label style={label}>Deal Value (₹)</label>
              <input style={inp} type="number" min="0" value={form.deal_value} onChange={e=>setForm(p=>({...p,deal_value:e.target.value}))} placeholder="0" />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            <div>
              <label style={label}>Next Follow-Up Date</label>
              <input style={inp} type="date" value={form.follow_up_date} onChange={e=>setForm(p=>({...p,follow_up_date:e.target.value}))} />
            </div>
            <div>
              <label style={label}>Last Contacted</label>
              <input style={inp} type="date" value={form.last_contacted} onChange={e=>setForm(p=>({...p,last_contacted:e.target.value}))} />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={label}>Remarks / What Happened</label>
            <textarea style={{...inp, minHeight:"80px", resize:"vertical"}} value={form.remarks} onChange={e=>setForm(p=>({...p,remarks:e.target.value}))} placeholder="What was discussed? Outcome of last contact..." />
          </div>

          {/* Next Steps */}
          <div>
            <label style={label}>Next Steps</label>
            <textarea style={{...inp, minHeight:"60px", resize:"vertical"}} value={form.next_steps} onChange={e=>setForm(p=>({...p,next_steps:e.target.value}))} placeholder="What needs to happen next?" />
          </div>

          {/* Tags */}
          <div>
            <label style={label}><Tag size={11} style={{marginRight:4}} />Tags (comma separated)</label>
            <input style={inp} value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="e.g. hot-lead, website, smm" />
          </div>

          {/* Footer */}
          <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px", paddingTop:"4px" }}>
            <button type="button" onClick={onClose} style={{ padding:"10px 20px", background:"#f1f5f9", border:"none", borderRadius:"9px", fontSize:"13px", fontWeight:"600", cursor:"pointer", color:"#374151" }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={{ padding:"10px 24px", background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:"9px", fontSize:"13px", fontWeight:"700", cursor:"pointer", color:"#fff", opacity:saving?0.7:1, display:"flex", alignItems:"center", gap:"6px" }}>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Follow-Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MODAL — Send Email
══════════════════════════════════════════ */
function EmailModal({ item, onClose, onSent }) {
  const [form, setForm] = useState({ to: item?.contact_email || "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [result, setResult]   = useState(null);

  const quickTemplates = [
    { label:"Follow-up reminder", subject:`Following up — ${item?.title}`, body:`Hi ${item?.contact_name},\n\nI wanted to follow up regarding our previous conversation about ${item?.title}.\n\nCould you please let me know if you are still interested? I would love to help you move forward.\n\nLooking forward to hearing from you.\n\nBest regards,\nSubham General Store Team` },
    { label:"Proposal sent",    subject:`Proposal for Your Review — Subham General Store`, body:`Hi ${item?.contact_name},\n\nThank you for your time. I have sent across our proposal for your review.\n\nPlease let me know if you have any questions or would like to schedule a call to discuss further.\n\nBest regards,\nSubham General Store Team` },
    { label:"Meeting request",  subject:`Meeting Request — Subham General Store`, body:`Hi ${item?.contact_name},\n\nI would love to schedule a quick call to discuss how Subham General Store can help grow your business.\n\nAre you available for a 20-minute call this week?\n\nBest regards,\nSubham General Store Team` },
  ];

  const handleSend = async () => {
    if (!form.to || !form.subject || !form.body) return;
    setSending(true);
    try {
      const { data } = await CRM_API.post(`/followups/${item._id}/email`, form);
      setResult({ type:"success", msg: data.message });
      onSent && onSent(data.log);
    } catch (err) {
      setResult({ type:"error", msg: err.response?.data?.message || "Send failed" });
    } finally { setSending(false); }
  };

  const inp = { padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:"8px", fontSize:"13px", width:"100%", outline:"none", fontFamily:"'Inter',sans-serif", boxSizing:"border-box" };
  const label = { fontSize:"11px", fontWeight:"700", color:"#374151", marginBottom:"4px", display:"block" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.5)", zIndex:2100, display:"flex", alignItems:"center", justifyContent:"center", padding:"16px", backdropFilter:"blur(3px)" }}>
      <div style={{ background:"#fff", borderRadius:"16px", width:"100%", maxWidth:"580px", maxHeight:"92vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,.15)", animation:"modalIn .2s ease" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", borderBottom:"1px solid #f1f5f9" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:"#ede9fe", color:"#7c3aed", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Mail size={16} />
            </div>
            <div>
              <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0f172a", margin:0 }}>Send Email</h2>
              <p style={{ fontSize:"11px", color:"#94a3b8", margin:0 }}>To: {item?.contact_name}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"8px", width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding:"20px 24px", display:"flex", flexDirection:"column", gap:"14px" }}>
          {/* Quick templates */}
          <div>
            <p style={{ fontSize:"11px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 8px" }}>Quick Templates</p>
            <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {quickTemplates.map((t,i) => (
                <button key={i} onClick={() => setForm(p=>({...p, subject:t.subject, body:t.body}))}
                  style={{ padding:"5px 10px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"6px", fontSize:"11px", fontWeight:"600", color:"#16a34a", cursor:"pointer" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {result && (
            <div style={{ padding:"10px 14px", borderRadius:"8px", fontSize:"13px", background: result.type==="success" ? "#dcfce7" : "#fee2e2", color: result.type==="success" ? "#16a34a" : "#dc2626" }}>
              {result.msg}
            </div>
          )}

          <div><label style={label}>To <span style={{color:"#ef4444"}}>*</span></label><input style={inp} type="email" value={form.to} onChange={e=>setForm(p=>({...p,to:e.target.value}))} placeholder="recipient@example.com" /></div>
          <div><label style={label}>Subject <span style={{color:"#ef4444"}}>*</span></label><input style={inp} value={form.subject} onChange={e=>setForm(p=>({...p,subject:e.target.value}))} placeholder="Email subject" /></div>
          <div>
            <label style={label}>Message <span style={{color:"#ef4444"}}>*</span></label>
            <textarea style={{...inp, minHeight:"160px", resize:"vertical"}} value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} placeholder="Write your email..." />
          </div>

          <div style={{ display:"flex", justifyContent:"flex-end", gap:"10px" }}>
            <button onClick={onClose} style={{ padding:"9px 18px", background:"#f1f5f9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Cancel</button>
            <button onClick={handleSend} disabled={sending || !form.to || !form.subject || !form.body}
              style={{ padding:"9px 20px", background:"linear-gradient(135deg,#7c3aed,#6d28d9)", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", opacity:(sending||!form.to||!form.subject||!form.body)?0.6:1 }}>
              <Send size={14} /> {sending ? "Sending…" : "Send Email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   DRAWER — View / Detail Panel
══════════════════════════════════════════ */
function DetailDrawer({ item, onClose, onEdit, onDelete, onEmail }) {
  if (!item) return null;
  const st = getStatus(item.status);
  const ch = getChannel(item.channel);
  const pr = getPriority(item.priority);
  const ChIcon = ch.icon;

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1900, display:"flex" }}>
      <div onClick={onClose} style={{ flex:1, background:"rgba(15,23,42,.35)", backdropFilter:"blur(2px)" }} />
      <div style={{ width:"min(460px,100vw)", background:"#fff", height:"100vh", overflowY:"auto", boxShadow:"-8px 0 40px rgba(0,0,0,.12)", animation:"drawerIn .25s cubic-bezier(.4,0,.2,1)", display:"flex", flexDirection:"column" }}>
        {/* Header */}
        <div style={{ padding:"18px 20px", borderBottom:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexShrink:0 }}>
          <div style={{ minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"6px" }}>
              <Badge value={item.status} map={STATUSES} />
              <Badge value={item.priority} map={PRIORITIES} />
            </div>
            <h2 style={{ fontSize:"16px", fontWeight:"800", color:"#0f172a", margin:"0 0 3px", lineHeight:1.3 }}>{item.title}</h2>
            <p style={{ fontSize:"12px", color:"#64748b", margin:0 }}>{fmtDate(item.created_at)}</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9", border:"none", borderRadius:"7px", width:"30px", height:"30px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"18px 20px", display:"flex", flexDirection:"column", gap:"18px" }}>
          {/* Contact info */}
          <div style={{ background:"#f8fafc", borderRadius:"10px", padding:"14px 16px" }}>
            <p style={{ fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 10px" }}>Contact</p>
            <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"9px", background:"linear-gradient(135deg,#dcfce7,#bbf7d0)", color:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"14px", flexShrink:0 }}>
                {item.contact_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontSize:"14px", fontWeight:"700", color:"#0f172a" }}>{item.contact_name}</div>
                {item.client?.company_name && <div style={{ fontSize:"11px", color:"#64748b" }}>{item.client.company_name}</div>}
              </div>
            </div>
            {item.contact_email && <div style={{ fontSize:"12px", color:"#4a5568", display:"flex", alignItems:"center", gap:"6px", marginBottom:"4px" }}><Mail size={12} style={{color:"#94a3b8"}} />{item.contact_email}</div>}
            {item.contact_phone && <div style={{ fontSize:"12px", color:"#4a5568", display:"flex", alignItems:"center", gap:"6px" }}><Phone size={12} style={{color:"#94a3b8"}} />{item.contact_phone}</div>}
          </div>

          {/* Meta grid */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            {[
              { label:"Channel",     value:<ChannelIcon value={item.channel} /> },
              { label:"Deal Value",  value: item.deal_value > 0 ? <span style={{fontWeight:"800",color:"#16a34a"}}>{fmt(item.deal_value)}</span> : "—" },
              { label:"Next Follow-up", value: item.follow_up_date ? <span style={{color: new Date(item.follow_up_date)<new Date()&&!["won","lost"].includes(item.status) ? "#dc2626":"#0f172a", fontWeight:"600"}}>{fmtDate(item.follow_up_date)}<br/><span style={{fontSize:"10px",color:"#94a3b8"}}>{fmtRelative(item.follow_up_date)}</span></span> : "—" },
              { label:"Last Contact",value: fmtDate(item.last_contacted) },
            ].map((row,i) => (
              <div key={i} style={{ background:"#f8fafc", borderRadius:"8px", padding:"10px 12px" }}>
                <p style={{ fontSize:"9.5px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 4px" }}>{row.label}</p>
                <div style={{ fontSize:"12px", color:"#1e293b" }}>{row.value}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {item.tags?.length > 0 && (
            <div>
              <p style={{ fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 6px" }}>Tags</p>
              <div style={{ display:"flex", gap:"5px", flexWrap:"wrap" }}>
                {item.tags.map((t,i) => <span key={i} style={{ padding:"2px 9px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"20px", fontSize:"11px", color:"#16a34a", fontWeight:"600" }}>#{t}</span>)}
              </div>
            </div>
          )}

          {/* Remarks */}
          {item.remarks && (
            <div>
              <p style={{ fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 6px" }}>Remarks</p>
              <p style={{ fontSize:"13px", color:"#374151", lineHeight:1.6, background:"#f8fafc", borderRadius:"8px", padding:"10px 12px", margin:0 }}>{item.remarks}</p>
            </div>
          )}

          {/* Next Steps */}
          {item.next_steps && (
            <div>
              <p style={{ fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 6px" }}>Next Steps</p>
              <p style={{ fontSize:"13px", color:"#374151", lineHeight:1.6, background:"#fff7ed", borderRadius:"8px", padding:"10px 12px", margin:0, border:"1px solid #fed7aa" }}>{item.next_steps}</p>
            </div>
          )}

          {/* Email log */}
          {item.email_logs?.length > 0 && (
            <div>
              <p style={{ fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 8px" }}>Email History ({item.email_logs.length})</p>
              {item.email_logs.slice().reverse().map((log, i) => (
                <div key={i} style={{ background:"#f8fafc", borderRadius:"8px", padding:"10px 12px", marginBottom:"6px", borderLeft:`3px solid ${log.status==="sent"?"#22c55e":"#ef4444"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"3px" }}>
                    <span style={{ fontSize:"12px", fontWeight:"700", color:"#1e293b" }}>{log.subject}</span>
                    <span style={{ fontSize:"10px", color: log.status==="sent"?"#16a34a":"#dc2626", fontWeight:"700" }}>{log.status}</span>
                  </div>
                  <div style={{ fontSize:"11px", color:"#64748b" }}>To: {log.to} · {fmtDate(log.sent_at)} · by {log.sent_by_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div style={{ padding:"14px 20px", borderTop:"1px solid #f1f5f9", display:"flex", gap:"8px", flexShrink:0 }}>
          <button onClick={() => onEmail(item)} style={{ flex:1, padding:"9px", background:"#ede9fe", border:"none", borderRadius:"8px", fontSize:"12px", fontWeight:"700", color:"#7c3aed", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px" }}>
            <Mail size={13} /> Email
          </button>
          <button onClick={() => onEdit(item)} style={{ flex:1, padding:"9px", background:"#f0fdf4", border:"none", borderRadius:"8px", fontSize:"12px", fontWeight:"700", color:"#16a34a", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px" }}>
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={() => onDelete(item)} style={{ flex:1, padding:"9px", background:"#fee2e2", border:"none", borderRadius:"8px", fontSize:"12px", fontWeight:"700", color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"5px" }}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function FollowUpsPage() {
  const [followups,  setFollowups]  = useState([]);
  const [stats,      setStats]      = useState(null);
  const [clients,    setClients]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const searchParams = useSearchParams();

  // UI state — initialise view from URL ?view= param (used by ReminderBanner deep-links)
  const [view,     setView]     = useState(() => searchParams.get("view") || "all");

  // Keep view in sync if URL param changes (e.g. back-button or banner link click)
  useEffect(() => {
    const v = searchParams.get("view");
    if (v) setView(v);
  }, [searchParams]);
  const [search,   setSearch]   = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");
  const [filterChannel,  setFilterChannel]  = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showStats,   setShowStats]   = useState(true);

  // Modals
  const [editItem,   setEditItem]   = useState(null);   // null=closed, {}=new, item=edit
  const [detailItem, setDetailItem] = useState(null);
  const [emailItem,  setEmailItem]  = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  const searchRef = useRef(null);

  /* ── fetch ── */
  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (view !== "all")    params.append("view",     view);
      if (search)            params.append("search",   search);
      if (filterStatus)      params.append("status",   filterStatus);
      if (filterChannel)     params.append("channel",  filterChannel);
      if (filterPriority)    params.append("priority", filterPriority);

      const [fuRes, stRes, clRes] = await Promise.all([
        CRM_API.get(`/followups?${params}`),
        CRM_API.get("/followups/stats"),
        clients.length ? Promise.resolve({ data: clients }) : CRM_API.get("/clients"),
      ]);
      setFollowups(fuRes.data);
      setStats(stRes.data);
      if (!clients.length) setClients(clRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setTimeout(() => setRefreshing(false), 500); }
  }, [view, search, filterStatus, filterChannel, filterPriority]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ── handlers ── */
  const handleSave = (item, type) => {
    setFollowups(prev =>
      type === "edit"
        ? prev.map(f => f._id === item._id ? item : f)
        : [item, ...prev]
    );
    fetchAll(true); // refresh stats
  };

  const handleDelete = async (id) => {
    try {
      await CRM_API.delete(`/followups/${id}`);
      setFollowups(prev => prev.filter(f => f._id !== id));
      setDetailItem(null);
      setDeleteId(null);
      fetchAll(true);
    } catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  const handleQuickStatus = async (id, status) => {
    try {
      const { data } = await CRM_API.patch(`/followups/${id}`, { status });
      setFollowups(prev => prev.map(f => f._id === id ? { ...f, status } : f));
      fetchAll(true);
    } catch {}
  };

  /* ── render ── */
  const totalActive = stats ? (stats.counts.total - stats.counts.won - stats.counts.lost) : 0;
  const convRate    = stats?.conversion_rate || 0;

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", animation:"fadeUp .2s ease" }}>

      {/* ══ Page header ══ */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px", flexWrap:"wrap", gap:"12px" }}>
        <div>
          <h1 style={{ fontSize:"22px", fontWeight:"800", color:"#0f172a", margin:"0 0 3px" }}>Follow-Ups</h1>
          <p style={{ fontSize:"13px", color:"#64748b", margin:0 }}>Track every client interaction · {followups.length} records</p>
        </div>
        <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
          <button onClick={() => fetchAll(true)} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 14px", background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:"8px", fontSize:"12px", fontWeight:"600", color:"#64748b", cursor:"pointer" }}>
            <RefreshCw size={13} style={{ animation: refreshing ? "spin .7s linear infinite" : "none" }} /> Refresh
          </button>
          <button onClick={() => setShowFilters(p=>!p)} style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 14px", background: showFilters ? "#f0fdf4":"#f8fafc", border:`1px solid ${showFilters?"#bbf7d0":"#e2e8f0"}`, borderRadius:"8px", fontSize:"12px", fontWeight:"600", color: showFilters?"#16a34a":"#64748b", cursor:"pointer" }}>
            <Filter size={13} /> Filters
          </button>
          <ExportButton data={followups} columns={FOLLOWUP_COLUMNS} type="FollowUps" />
          <button onClick={() => setEditItem({})} style={{ display:"flex", alignItems:"center", gap:"6px", padding:"8px 18px", background:"linear-gradient(135deg,#22c55e,#16a34a)", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer" }}>
            <Plus size={15} /> New Follow-Up
          </button>
        </div>
      </div>

      {/* ══ Stats bar (toggleable) ══ */}
      {showStats && stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:"12px", marginBottom:"20px" }}>
          <StatCard label="Total"       value={stats.counts.total}         icon={Activity}     color="#2563eb" bg="#dbeafe"  />
          <StatCard label="Overdue"     value={stats.counts.overdue}       icon={AlertTriangle} color="#dc2626" bg="#fee2e2" sub={stats.counts.overdue > 0 ? "Needs attention" : "All clear ✓"} />
          <StatCard label="Today"       value={stats.counts.today}         icon={Clock}        color="#d97706" bg="#fef3c7"  />
          <StatCard label="Won"         value={stats.counts.won}           icon={CheckCircle}  color="#16a34a" bg="#dcfce7" sub={`${convRate}% conv. rate`} />
          <StatCard label="Won Value"   value={`₹${(stats.won_deal_value/1000).toFixed(0)}K`} icon={IndianRupee} color="#0d9488" bg="#ccfbf1" />
          <StatCard label="Pipeline"    value={`₹${(stats.total_deal_value/1000).toFixed(0)}K`} icon={TrendingUp} color="#7c3aed" bg="#ede9fe" />
        </div>
      )}

      {/* ══ View tabs ══ */}
      <div style={{ display:"flex", gap:"4px", marginBottom:"16px", background:"#f8fafc", borderRadius:"10px", padding:"4px", overflow:"auto" }}>
        {VIEWS.map(v => {
          const active = view === v.key;
          const cnt = v.key === "overdue" ? stats?.counts.overdue
                    : v.key === "today"   ? stats?.counts.today
                    : v.key === "upcoming"? stats?.counts.upcoming
                    : v.key === "won"     ? stats?.counts.won
                    : v.key === "lost"    ? stats?.counts.lost
                    : stats?.counts.total;
          return (
            <button key={v.key} onClick={() => setView(v.key)}
              style={{
                display:"flex", alignItems:"center", gap:"5px",
                padding:"7px 14px", borderRadius:"7px", border:"none",
                fontSize:"12px", fontWeight:"600", cursor:"pointer", whiteSpace:"nowrap",
                background: active ? "#fff" : "transparent",
                color: active ? "#0f172a" : "#64748b",
                boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
                transition:"all .15s",
              }}>
              <v.icon size={13} />
              {v.label}
              {cnt != null && <span style={{ fontSize:"10px", fontWeight:"800", background: active ? "#22c55e20" : "#e2e8f0", color: active ? "#16a34a":"#94a3b8", padding:"1px 6px", borderRadius:"10px" }}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* ══ Search + Filters ══ */}
      <div style={{ display:"flex", gap:"10px", marginBottom: showFilters ? "12px" : "16px", flexWrap:"wrap" }}>
        <div style={{ flex:"1 1 220px", display:"flex", alignItems:"center", gap:"8px", background:"#fff", border:"1.5px solid #e2e8f0", borderRadius:"9px", padding:"8px 14px" }}>
          <Search size={15} style={{ color:"#94a3b8", flexShrink:0 }} />
          <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, title, tag…" style={{ border:"none", outline:"none", fontSize:"13px", width:"100%", color:"#1e293b", fontFamily:"inherit", background:"transparent" }} />
          {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"flex" }}><X size={13} /></button>}
        </div>
      </div>

      {showFilters && (
        <div style={{ display:"flex", gap:"10px", marginBottom:"16px", flexWrap:"wrap", background:"#f8fafc", borderRadius:"10px", padding:"12px 14px" }}>
          <select value={filterStatus}   onChange={e=>setFilterStatus(e.target.value)}   style={{ padding:"7px 10px", border:"1.5px solid #e2e8f0", borderRadius:"7px", fontSize:"12px", background:"#fff", fontFamily:"inherit", color:"#374151" }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterChannel}  onChange={e=>setFilterChannel(e.target.value)}  style={{ padding:"7px 10px", border:"1.5px solid #e2e8f0", borderRadius:"7px", fontSize:"12px", background:"#fff", fontFamily:"inherit", color:"#374151" }}>
            <option value="">All Channels</option>
            {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)} style={{ padding:"7px 10px", border:"1.5px solid #e2e8f0", borderRadius:"7px", fontSize:"12px", background:"#fff", fontFamily:"inherit", color:"#374151" }}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {(filterStatus || filterChannel || filterPriority) && (
            <button onClick={() => { setFilterStatus(""); setFilterChannel(""); setFilterPriority(""); }} style={{ padding:"7px 12px", background:"#fee2e2", border:"none", borderRadius:"7px", fontSize:"12px", fontWeight:"600", color:"#dc2626", cursor:"pointer" }}>
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* ══ Table ══ */}
      <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px", overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"13px" }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Contact","Title","Channel","Status","Priority","Next Date","Deal Value","Actions"].map(h => (
                  <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:"10.5px", fontWeight:"700", textTransform:"uppercase", letterSpacing:".05em", color:"#64748b", borderBottom:"1px solid #e2e8f0", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding:"48px", textAlign:"center" }}>
                  <div style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"32px", height:"32px", border:"3px solid #dcfce7", borderTopColor:"#22c55e", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                    <span style={{ fontSize:"13px", color:"#64748b" }}>Loading follow-ups…</span>
                  </div>
                </td></tr>
              ) : followups.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:"60px 20px", textAlign:"center" }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"52px", height:"52px", borderRadius:"14px", background:"#f0fdf4", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Activity size={24} style={{ color:"#22c55e" }} />
                    </div>
                    <p style={{ fontSize:"14px", fontWeight:"700", color:"#1e293b", margin:0 }}>No follow-ups found</p>
                    <p style={{ fontSize:"12px", color:"#94a3b8", margin:0 }}>Create your first follow-up to start tracking interactions</p>
                    <button onClick={() => setEditItem({})} style={{ marginTop:"4px", padding:"8px 18px", background:"#22c55e", border:"none", borderRadius:"8px", fontSize:"12px", fontWeight:"700", color:"#fff", cursor:"pointer" }}>
                      + New Follow-Up
                    </button>
                  </div>
                </td></tr>
              ) : followups.map((f, i) => {
                const overdue = f.follow_up_date && new Date(f.follow_up_date) < new Date() && !["won","lost"].includes(f.status);
                const today   = f.follow_up_date && new Date(f.follow_up_date).toDateString() === new Date().toDateString();
                return (
                  <tr key={f._id}
                    style={{ borderBottom:"1px solid #f8fafc", cursor:"pointer", transition:"background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    {/* Contact */}
                    <td style={{ padding:"12px 16px" }} onClick={() => setDetailItem(f)}>
                      <div style={{ display:"flex", alignItems:"center", gap:"9px" }}>
                        <PriorityDot value={f.priority} />
                        <div>
                          <div style={{ fontSize:"13px", fontWeight:"600", color:"#1e293b" }}>{f.contact_name}</div>
                          {f.contact_email && <div style={{ fontSize:"11px", color:"#94a3b8" }}>{f.contact_email}</div>}
                        </div>
                      </div>
                    </td>
                    {/* Title */}
                    <td style={{ padding:"12px 16px", maxWidth:"200px" }} onClick={() => setDetailItem(f)}>
                      <div style={{ fontSize:"13px", color:"#374151", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"180px" }}>{f.title}</div>
                      {f.client?.company_name && <div style={{ fontSize:"11px", color:"#94a3b8" }}>{f.client.company_name}</div>}
                    </td>
                    {/* Channel */}
                    <td style={{ padding:"12px 16px" }} onClick={() => setDetailItem(f)}>
                      <ChannelIcon value={f.channel} />
                    </td>
                    {/* Status */}
                    <td style={{ padding:"12px 16px" }}>
                      <select
                        value={f.status}
                        onChange={e => { e.stopPropagation(); handleQuickStatus(f._id, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        style={{ padding:"4px 8px", border:"1.5px solid #e2e8f0", borderRadius:"6px", fontSize:"11px", fontWeight:"700", background:"#fff", fontFamily:"inherit", color:"#374151", cursor:"pointer" }}>
                        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    {/* Priority */}
                    <td style={{ padding:"12px 16px" }} onClick={() => setDetailItem(f)}>
                      <Badge value={f.priority} map={PRIORITIES} />
                    </td>
                    {/* Next Date */}
                    <td style={{ padding:"12px 16px" }} onClick={() => setDetailItem(f)}>
                      {f.follow_up_date ? (
                        <div>
                          <div style={{ fontSize:"12px", fontWeight:"600", color: overdue ? "#dc2626" : today ? "#d97706" : "#1e293b" }}>
                            {fmtDate(f.follow_up_date)}
                          </div>
                          <div style={{ fontSize:"10px", color: overdue?"#ef4444":today?"#f59e0b":"#94a3b8", fontWeight:"600" }}>
                            {fmtRelative(f.follow_up_date)}
                          </div>
                        </div>
                      ) : <span style={{ color:"#cbd5e1" }}>—</span>}
                    </td>
                    {/* Deal Value */}
                    <td style={{ padding:"12px 16px" }} onClick={() => setDetailItem(f)}>
                      {f.deal_value > 0
                        ? <span style={{ fontSize:"13px", fontWeight:"700", color:"#16a34a" }}>{fmt(f.deal_value)}</span>
                        : <span style={{ color:"#cbd5e1" }}>—</span>}
                    </td>
                    {/* Actions */}
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:"5px" }}>
                        <button onClick={() => setDetailItem(f)} title="View" style={{ width:"28px", height:"28px", borderRadius:"6px", background:"#f8fafc", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#64748b" }}><Eye size={13} /></button>
                        <button onClick={() => setEmailItem(f)} title="Email" style={{ width:"28px", height:"28px", borderRadius:"6px", background:"#f5f3ff", border:"1px solid #ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#7c3aed" }}><Mail size={13} /></button>
                        <button onClick={() => setEditItem(f)} title="Edit" style={{ width:"28px", height:"28px", borderRadius:"6px", background:"#f0fdf4", border:"1px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#16a34a" }}><Edit2 size={13} /></button>
                        <button onClick={() => setDeleteId(f._id)} title="Delete" style={{ width:"28px", height:"28px", borderRadius:"6px", background:"#fff1f2", border:"1px solid #fecdd3", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#dc2626" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {followups.length > 0 && (
          <div style={{ padding:"11px 16px", borderTop:"1px solid #f1f5f9", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"8px" }}>
            <span style={{ fontSize:"12px", color:"#94a3b8" }}>{followups.length} follow-up{followups.length !== 1 ? "s" : ""}</span>
            <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
              {Object.entries(stats?.by_channel || {}).map(([ch, cnt]) => {
                const c = getChannel(ch);
                const Icon = c.icon;
                return <span key={ch} style={{ display:"flex", alignItems:"center", gap:"4px", fontSize:"11px", color:c.color, fontWeight:"600" }}><Icon size={11}/>{cnt}</span>;
              })}
            </div>
          </div>
        )}
      </div>

      {/* ══ Analytics section ══ */}
      {stats && followups.length > 0 && (
        <div style={{ marginTop:"24px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:"16px" }}>
          {/* Channel breakdown */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px", padding:"18px" }}>
            <p style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", margin:"0 0 14px", display:"flex", alignItems:"center", gap:"6px" }}>
              <BarChart2 size={14} style={{color:"#22c55e"}} /> Channel Breakdown
            </p>
            {Object.entries(stats.by_channel).sort((a,b)=>b[1]-a[1]).map(([ch, cnt]) => {
              const c = getChannel(ch);
              const pct = Math.round((cnt / stats.counts.total) * 100);
              return (
                <div key={ch} style={{ marginBottom:"10px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                    <ChannelIcon value={ch} size={12} />
                    <span style={{ fontSize:"11px", fontWeight:"700", color:"#0f172a" }}>{cnt} <span style={{color:"#94a3b8", fontWeight:"400"}}>({pct}%)</span></span>
                  </div>
                  <div style={{ background:"#f1f5f9", borderRadius:"4px", height:"5px" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:c.color, borderRadius:"4px", transition:"width .5s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Status breakdown */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px", padding:"18px" }}>
            <p style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", margin:"0 0 14px", display:"flex", alignItems:"center", gap:"6px" }}>
              <Activity size={14} style={{color:"#22c55e"}} /> Status Overview
            </p>
            {STATUSES.map(s => {
              const cnt = s.value === "overdue" ? stats.counts.overdue : (followups.filter(f=>f.status===s.value).length);
              if (!cnt) return null;
              const pct = Math.round((cnt / stats.counts.total) * 100);
              return (
                <div key={s.value} style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"8px" }}>
                  <span style={{ fontSize:"11px", fontWeight:"700", color:s.color, background:s.bg, padding:"1px 7px", borderRadius:"10px", minWidth:"90px", textAlign:"center" }}>{s.label}</span>
                  <div style={{ flex:1, background:"#f1f5f9", borderRadius:"4px", height:"5px" }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:s.color, borderRadius:"4px" }} />
                  </div>
                  <span style={{ fontSize:"11px", fontWeight:"700", color:"#1e293b", minWidth:"24px", textAlign:"right" }}>{cnt}</span>
                </div>
              );
            })}
          </div>

          {/* Priority + conversion */}
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px", padding:"18px" }}>
            <p style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a", margin:"0 0 14px", display:"flex", alignItems:"center", gap:"6px" }}>
              <Zap size={14} style={{color:"#22c55e"}} /> Key Insights
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <div style={{ background:"#f0fdf4", borderRadius:"9px", padding:"11px 13px" }}>
                <p style={{ fontSize:"10px", fontWeight:"700", color:"#16a34a", textTransform:"uppercase", margin:"0 0 3px" }}>Conversion Rate</p>
                <div style={{ display:"flex", alignItems:"baseline", gap:"4px" }}>
                  <span style={{ fontSize:"26px", fontWeight:"800", color:"#14532d" }}>{convRate}%</span>
                  <span style={{ fontSize:"11px", color:"#16a34a" }}>of closed deals</span>
                </div>
              </div>
              {PRIORITIES.map(p => {
                const cnt = followups.filter(f=>f.priority===p.value).length;
                if (!cnt) return null;
                return (
                  <div key={p.value} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"7px 10px", background:p.bg, borderRadius:"7px" }}>
                    <span style={{ fontSize:"12px", fontWeight:"600", color:p.color }}>{p.label} Priority</span>
                    <span style={{ fontSize:"13px", fontWeight:"800", color:p.color }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ Modals ══ */}
      {editItem !== null && (
        <FollowUpModal item={Object.keys(editItem).length ? editItem : null} clients={clients} onClose={() => setEditItem(null)} onSave={handleSave} />
      )}
      {emailItem && (
        <EmailModal item={emailItem} onClose={() => setEmailItem(null)} onSent={() => fetchAll(true)} />
      )}
      {detailItem && (
        <DetailDrawer item={detailItem} onClose={() => setDetailItem(null)} onEdit={item => { setDetailItem(null); setEditItem(item); }} onDelete={item => { setDetailItem(null); setDeleteId(item._id); }} onEmail={item => { setDetailItem(null); setEmailItem(item); }} />
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,.5)", zIndex:2200, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#fff", borderRadius:"14px", padding:"28px 28px 24px", maxWidth:"360px", width:"100%", textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,.15)" }}>
            <div style={{ width:"48px", height:"48px", borderRadius:"12px", background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
              <Trash2 size={22} style={{ color:"#dc2626" }} />
            </div>
            <h3 style={{ fontSize:"16px", fontWeight:"800", color:"#0f172a", margin:"0 0 6px" }}>Delete Follow-Up?</h3>
            <p style={{ fontSize:"13px", color:"#64748b", margin:"0 0 20px" }}>This action cannot be undone. All related email logs will also be deleted.</p>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setDeleteId(null)} style={{ flex:1, padding:"10px", background:"#f1f5f9", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"600", cursor:"pointer" }}>Cancel</button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex:1, padding:"10px", background:"#dc2626", border:"none", borderRadius:"8px", fontSize:"13px", fontWeight:"700", color:"#fff", cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp  { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
        @keyframes spin    { to { transform:rotate(360deg); } }
        @keyframes modalIn { from { opacity:0; transform:scale(.96); } to { opacity:1; transform:none; } }
        @keyframes drawerIn { from { transform:translateX(100%); } to { transform:none; } }
        @media(max-width:640px) {
          table td:nth-child(3), table td:nth-child(5), table th:nth-child(3), table th:nth-child(5) { display:none; }
        }
      `}</style>
    </div>
  );
}
