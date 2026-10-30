"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Mail, Phone, MapPin, CreditCard, Building2,
  Briefcase, Plus, X, Edit2, Trash2, FileText, Receipt,
  Send, CheckCircle, RotateCcw, Eye, Calendar, Globe,
  Instagram, AlertCircle, Loader2, ExternalLink,
} from "lucide-react";
import CRM_API from "@/utils/crmApi";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt   = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const toISO = (d) => d ? d.split("T")[0] : "";

const STATUS_BADGE = {
  active:     ["#dcfce7","#15803d"],
  completed:  ["#dbeafe","#1d4ed8"],
  on_hold:    ["#fef9c3","#a16207"],
  cancelled:  ["#fee2e2","#dc2626"],
  draft:      ["#f1f5f9","#475569"],
  sent:       ["#dbeafe","#1d4ed8"],
  accepted:   ["#dcfce7","#15803d"],
  rejected:   ["#fee2e2","#dc2626"],
  approved:   ["#dcfce7","#15803d"],
  superseded: ["#f1f5f9","#94a3b8"],
  issued:     ["#dbeafe","#1d4ed8"],
  partial:    ["#ffedd5","#c2410c"],
  paid:       ["#dcfce7","#15803d"],
  overdue:    ["#fee2e2","#dc2626"],
};

function Badge({ status }) {
  const [bg, color] = STATUS_BADGE[status] || ["#f1f5f9","#475569"];
  return (
    <span style={{ display:"inline-flex", padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:700,
      textTransform:"capitalize", background:bg, color, whiteSpace:"nowrap" }}>
      {status?.replace(/_/g," ") || "—"}
    </span>
  );
}

// ── EMPTY forms ───────────────────────────────────────────────────────────────
const EMPTY_PROJECT  = { name:"", project_type:"retainer", budget_range:"", start_date:"", expected_end_date:"", status:"active", notes:"", services:[] };
const EMPTY_PROPOSAL = { project:"", title:"", content:"", status:"draft", valid_until:"", notes:"", services:[] };
const EMPTY_QUOTATION= { project:"", status:"draft", valid_until:"", discount_type:"fixed", discount_value:0, cgst_rate:9, sgst_rate:9, igst_rate:0, hsn_sac:"998319", place_of_supply:"Chhattisgarh", notes:""};
const EMPTY_INVOICE  = { project:"", invoice_type:"full", invoice_date:new Date().toISOString().split("T")[0], due_date:"", status:"draft", milestone_label:"", cgst_rate:9, sgst_rate:9, igst_rate:0, hsn_sac:"998319", place_of_supply:"Chhattisgarh", notes:""};
const EMPTY_ITEM     = { description:"", quantity:1, unit_price:0, total_price:0 };

// ── Shared modal shell ─────────────────────────────────────────────────────────
function Modal({ title, onClose, children, maxW=580 }) {
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:maxW,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.18)" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
          <h2 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>{title}</h2>
          <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}><X size={15}/></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Line items editor (reusable for quotation + invoice) ──────────────────────
function ItemsEditor({ items, onChange }) {
  const update = (i, k, v) => {
    const next = items.map((it,idx) => {
      if (idx!==i) return it;
      const u = { ...it, [k]: v };
      u.total_price = (Number(u.quantity)||1) * (Number(u.unit_price)||0);
      return u;
    });
    onChange(next);
  };
  const add    = () => onChange([...items, { ...EMPTY_ITEM }]);
  const remove = (i) => onChange(items.filter((_,idx)=>idx!==i));

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
        <label style={{ fontSize:12,fontWeight:700,color:"#374151" }}>Line Items</label>
        <button type="button" onClick={add} style={{ padding:"4px 12px",background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer" }}>+ Add Row</button>
      </div>
      <div style={{ border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden" }}>
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
          <thead>
            <tr style={{ background:"#f8fafc" }}>
              {["Description","Qty","Unit Price (₹)","Total (₹)",""].map(h=>(
                <th key={h} style={{ padding:"7px 10px",textAlign:"left",fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((it,i)=>(
              <tr key={i}>
                <td style={{ padding:"5px 8px" }}><input value={it.description} onChange={e=>update(i,"description",e.target.value)} placeholder="Service / deliverable" style={{ width:"100%",padding:"5px 8px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,outline:"none",fontFamily:"inherit" }}/></td>
                <td style={{ padding:"5px 8px",width:55 }}><input type="number" min="1" value={it.quantity} onChange={e=>update(i,"quantity",e.target.value)} style={{ width:"100%",padding:"5px 7px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,outline:"none",textAlign:"right",fontFamily:"inherit" }}/></td>
                <td style={{ padding:"5px 8px",width:110 }}><input type="number" min="0" value={it.unit_price} onChange={e=>update(i,"unit_price",e.target.value)} style={{ width:"100%",padding:"5px 7px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,outline:"none",textAlign:"right",fontFamily:"inherit" }}/></td>
                <td style={{ padding:"5px 8px",fontWeight:700,textAlign:"right",whiteSpace:"nowrap" }}>{fmt(it.total_price)}</td>
                <td style={{ padding:"5px 8px",width:28 }}>{items.length>1&&<button type="button" onClick={()=>remove(i)} style={{ background:"none",border:"none",color:"#dc2626",cursor:"pointer",padding:2 }}><X size={13}/></button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ textAlign:"right",marginTop:6,fontSize:12,color:"#64748b" }}>
        Subtotal: <strong style={{ color:"#0f172a" }}>{fmt(items.reduce((s,i)=>s+(Number(i.total_price)||0),0))}</strong>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────────────────────
export default function ClientDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [client,   setClient]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setActiveTab]= useState("projects");

  // lists
  const [projects,   setProjects]   = useState([]);
  const [proposals,  setProposals]  = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [invoices,   setInvoices]   = useState([]);
  const [services,   setServices]   = useState([]); // master services for dropdown

  // loading states (unused but kept for future use)
  const [_pLoad, _setPLoad]   = useState(false);
  const [_qLoad, _setQLoad]   = useState(false);
  const [_prLoad, _setPrLoad] = useState(false);
  const [_iLoad, _setILoad]   = useState(false);

  // modals
  const [modal,     setModal]     = useState(null); // "project"|"proposal"|"quotation"|"invoice"
  const [editing,   setEditing]   = useState(null); // id of doc being edited
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState("");

  // forms
  const [projForm,  setProjForm]  = useState(EMPTY_PROJECT);
  const [propForm,  setPropForm]  = useState(EMPTY_PROPOSAL);
  const [quoteForm, setQuoteForm] = useState(EMPTY_QUOTATION);
  const [quoteItems,setQuoteItems]= useState([{ ...EMPTY_ITEM }]);
  const [invForm,   setInvForm]   = useState(EMPTY_INVOICE);
  const [invItems,  setInvItems]  = useState([{ ...EMPTY_ITEM }]);

  // ── Load client ──────────────────────────────────────────────────────────────
  const loadClient = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await CRM_API.get(`/clients/${id}`);
      setClient(data);
    } catch { router.replace("/crm/dashboard/clients"); }
    finally { setLoading(false); }
  }, [id, router]);

  // ── Load data ────────────────────────────────────────────────────────────────
  const loadProjects   = useCallback(async () => { try { const {data}=await CRM_API.get(`/projects?client=${id}`); setProjects(data); } catch {} }, [id]);
  const loadProposals  = useCallback(async () => { try { const {data}=await CRM_API.get(`/proposals?client=${id}`); setProposals(data); } catch {} }, [id]);
  const loadQuotations = useCallback(async () => { try { const {data}=await CRM_API.get(`/quotations?client=${id}`); setQuotations(data); } catch {} }, [id]);
  const loadInvoices   = useCallback(async () => { try { const {data}=await CRM_API.get(`/invoices?client=${id}`); setInvoices(data); } catch {} }, [id]);
  const loadServices   = useCallback(async () => { try { const {data}=await CRM_API.get("/services"); setServices(data); } catch {} }, []);

  useEffect(() => { loadClient(); loadServices(); }, [loadClient, loadServices]);
  useEffect(() => { loadProjects(); }, [loadProjects]);
  useEffect(() => { if (activeTab==="proposals")  loadProposals();  }, [activeTab, loadProposals]);
  useEffect(() => { if (activeTab==="quotations") loadQuotations(); }, [activeTab, loadQuotations]);
  useEffect(() => { if (activeTab==="invoices")   loadInvoices();   }, [activeTab, loadInvoices]);

  // ── Invoice stats ─────────────────────────────────────────────────────────────
  const invStats = {
    billed:      invoices.filter(i=>i.status!=="cancelled").reduce((s,i)=>s+Number(i.grand_total||0),0),
    received:    invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+Number(i.grand_total||0),0),
    outstanding: invoices.filter(i=>["issued","partial","overdue"].includes(i.status)).reduce((s,i)=>s+Number(i.balance_due||0),0),
  };

  // ── Modal open/close helpers ──────────────────────────────────────────────────
  const openModal = (type, doc=null) => {
    setErr(""); setEditing(doc?.id||null);
    if (type==="project") {
      setProjForm(doc ? { name:doc.name||"", project_type:doc.project_type||"retainer", budget_range:doc.budget_range||"", start_date:toISO(doc.start_date), expected_end_date:toISO(doc.expected_end_date), status:doc.status||"active", notes:doc.notes||"", services:doc.services?.map(s=>s.id||s)||[] } : { ...EMPTY_PROJECT });
    }
    if (type==="proposal") {
      setPropForm(doc ? { project:doc.project?.id||doc.project||"", title:doc.title||"", content:doc.content||"", status:doc.status||"draft", valid_until:toISO(doc.valid_until), notes:doc.notes||"", services:doc.services?.map(s=>s.id||s)||[] } : { ...EMPTY_PROPOSAL });
    }
    if (type==="quotation") {
      setQuoteForm(doc ? { project:doc.project?.id||doc.project||"", status:doc.status||"draft", valid_until:toISO(doc.valid_until), discount_type:doc.discount_type||"fixed", discount_value:doc.discount_value||0, cgst_rate:doc.cgst_rate??9, sgst_rate:doc.sgst_rate??9, igst_rate:doc.igst_rate||0, hsn_sac:doc.hsn_sac||"998319", place_of_supply:doc.place_of_supply||"Chhattisgarh", notes:doc.notes||"" } : { ...EMPTY_QUOTATION });
      setQuoteItems(doc?.items?.length ? doc.items.map(it=>({ description:it.description||"", quantity:it.quantity||1, unit_price:it.unit_price||0, total_price:it.total_price||0 })) : [{ ...EMPTY_ITEM }]);
    }
    if (type==="invoice") {
      setInvForm(doc ? { project:doc.project?.id||doc.project||"", invoice_type:doc.invoice_type||"full", invoice_date:toISO(doc.invoice_date)||new Date().toISOString().split("T")[0], due_date:toISO(doc.due_date)||"", status:doc.status||"draft", milestone_label:doc.milestone_label||"", cgst_rate:doc.cgst_rate??9, sgst_rate:doc.sgst_rate??9, igst_rate:doc.igst_rate||0, hsn_sac:doc.hsn_sac||"998319", place_of_supply:doc.place_of_supply||"Chhattisgarh", notes:doc.notes||"" } : { ...EMPTY_INVOICE });
      setInvItems(doc?.items?.length ? doc.items.map(it=>({ description:it.description||"", quantity:it.quantity||1, unit_price:it.unit_price||0, total_price:it.total_price||0 })) : [{ ...EMPTY_ITEM }]);
    }
    setModal(type);
  };
  const closeModal = () => { setModal(null); setEditing(null); setErr(""); };

  // ── Save handlers ─────────────────────────────────────────────────────────────
  const saveProject = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { ...projForm, client: id };
      if (editing) await CRM_API.patch(`/projects/${editing}`, payload);
      else         await CRM_API.post("/projects", payload);
      closeModal(); loadProjects(); loadClient();
    } catch (err) { setErr(err.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const saveProposal = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (editing) await CRM_API.patch(`/proposals/${editing}`, propForm);
      else         await CRM_API.post("/proposals", propForm);
      closeModal(); loadProposals();
    } catch (err) { setErr(err.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const saveQuotation = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { ...quoteForm, items: quoteItems.filter(i=>i.description) };
      if (editing) await CRM_API.patch(`/quotations/${editing}`, payload);
      else         await CRM_API.post("/quotations", payload);
      closeModal(); loadQuotations();
    } catch (err) { setErr(err.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const saveInvoice = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { ...invForm, items: invItems.filter(i=>i.description) };
      if (editing) await CRM_API.patch(`/invoices/${editing}`, payload);
      else         await CRM_API.post("/invoices", payload);
      closeModal(); loadInvoices();
    } catch (err) { setErr(err.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  // ── Quick status changes ──────────────────────────────────────────────────────
  const updateStatus = async (entity, id, status, reload) => {
    try { await CRM_API.patch(`/${entity}/${id}`, { status }); reload(); }
    catch (e) { alert(e.response?.data?.message || "Update failed"); }
  };

  // ── Delete ───────────────────────────────────────────────────────────────────
  const del = async (entity, id, label, reload) => {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
    try { await CRM_API.delete(`/${entity}/${id}`); reload(); if(entity==="projects") { loadProposals(); loadQuotations(); loadInvoices(); } }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  // ── LOADING / NOT FOUND ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36,height:36,border:"3px solid #dcfce7",borderTopColor:"#22c55e",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px" }}/>
        <p style={{ color:"#64748b",fontSize:14,margin:0 }}>Loading client…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
  if (!client) return <div style={{ padding:40,textAlign:"center",color:"#94a3b8" }}>Client not found.</div>;

  const initials = client.full_name?.[0]?.toUpperCase() || "C";

  // ── Inline field helper ───────────────────────────────────────────────────────
  const F = (form, setForm, k) => ({ value: form[k]??'', onChange: e => setForm(p=>({...p,[k]:e.target.value})) });

  const inputStyle = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const labelStyle = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  const TAB_BTNS = [
    { key:"projects",   label:`Projects (${projects.length})` },
    { key:"proposals",  label:`Proposals (${proposals.length})` },
    { key:"quotations", label:`Quotations (${quotations.length})` },
    { key:"invoices",   label:`Invoices (${invoices.length})` },
  ];

  return (
    <div style={{ fontFamily:"'Inter',sans-serif",animation:"fadeIn .2s ease" }}>
      {/* Back */}
      <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:8,color:"#64748b",background:"none",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:20,padding:0 }}>
        <ArrowLeft size={16}/> Back to Clients
      </button>

      <div style={{ display:"grid",gridTemplateColumns:"300px 1fr",gap:24,alignItems:"start" }}>

        {/* ── LEFT: Client Profile Card ── */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,boxShadow:"0 1px 4px rgba(0,0,0,.05)" }}>
            {/* Avatar & Name */}
            <div style={{ textAlign:"center",paddingBottom:20,borderBottom:"1px solid #f1f5f9",marginBottom:20 }}>
              <div style={{ width:72,height:72,borderRadius:"50%",background:"#dcfce7",color:"#16a34a",fontSize:28,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",border:"2px solid #bbf7d0" }}>
                {initials}
              </div>
              <h1 style={{ fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 6px" }}>{client.full_name}</h1>
              {client.company_name && <p style={{ fontSize:13,color:"#64748b",margin:"0 0 6px" }}>{client.company_name}</p>}
              {client.client_type && (
                <span style={{ display:"inline-flex",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",background:"#f0fdf4",color:"#16a34a" }}>
                  {client.client_type.replace(/_/g," ")}
                </span>
              )}
            </div>

            {/* Details */}
            <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
              {[
                { icon:<Mail size={14}/>,    label:"Email",           value:client.email,           href:`mailto:${client.email}` },
                { icon:<Phone size={14}/>,   label:"Phone",           value:client.phone,            href:`tel:${client.phone}` },
                { icon:<CreditCard size={14}/>, label:"GSTIN",        value:client.gstin },
                { icon:<MapPin size={14}/>,  label:"Billing Address", value:client.billing_address },
                { icon:<Globe size={14}/>,   label:"Website",         value:client.website,          href:client.website },
                { icon:<Instagram size={14}/>,label:"Social Handle",  value:client.social_handle },
                { icon:<MapPin size={14}/>,  label:"Location",        value:[client.city,client.state,client.country].filter(Boolean).join(", ") },
                { icon:<Building2 size={14}/>,label:"Lead Source",    value:client.lead_source?.replace(/_/g," ") },
              ].filter(item=>item.value).map(({icon,label,value,href})=>(
                <div key={label} style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                  <div style={{ padding:7,background:"#f8fafc",borderRadius:8,color:"#94a3b8",flexShrink:0 }}>{icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 2px" }}>{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith("http")?"_blank":"_self"} style={{ fontSize:13,color:"#0f172a",fontWeight:500,wordBreak:"break-word",textDecoration:"none" }}
                        onMouseEnter={e=>e.target.style.color="#22c55e"} onMouseLeave={e=>e.target.style.color="#0f172a"}>
                        {value}
                      </a>
                    ) : (
                      <p style={{ fontSize:13,color:"#0f172a",fontWeight:500,wordBreak:"break-word",margin:0 }}>{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:18 }}>
            <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10,color:"#64748b",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em" }}>
              <Calendar size={13}/> Account Info
            </div>
            <p style={{ fontSize:13,color:"#64748b",margin:"0 0 4px" }}>Created: <strong style={{ color:"#0f172a" }}>{fmtDate(client.created_at)}</strong></p>
            {client.notes && <p style={{ fontSize:12,color:"#64748b",margin:"8px 0 0",lineHeight:1.6,background:"#f8fafc",borderRadius:6,padding:"8px 10px" }}>{client.notes}</p>}
          </div>
        </div>

        {/* ── RIGHT: Tabs ── */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          {/* Tab bar */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10 }}>
            <div style={{ display:"flex",gap:2,background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:4 }}>
              {TAB_BTNS.map(t=>(
                <button key={t.key} onClick={()=>setActiveTab(t.key)}
                  style={{ padding:"8px 16px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:activeTab===t.key?"#22c55e":"transparent",color:activeTab===t.key?"#fff":"#64748b",transition:"all .15s",whiteSpace:"nowrap" }}>
                  {t.label}
                </button>
              ))}
            </div>
            <Link
              href={
                activeTab==="projects"   ? `/crm/dashboard/projects/new?client=${id}` :
                activeTab==="proposals"  ? `/crm/dashboard/proposals/new?client=${id}` :
                activeTab==="quotations" ? `/crm/dashboard/quotations/new?client=${id}` :
                                          `/crm/dashboard/invoices/new?client=${id}`
              }
              style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",textDecoration:"none" }}>
              <Plus size={15}/>
              {activeTab==="projects"?"Add Project":activeTab==="proposals"?"New Proposal":activeTab==="quotations"?"New Quotation":"New Invoice"}
            </Link>
          </div>

          {/* ── PROJECTS TAB ── */}
          {activeTab==="projects" && (
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Project","Type","Timeline","Budget","Status","Actions"].map(h=>(
                        <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projects.length===0 ? (
                      <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>
                        <Briefcase size={36} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/>
                        No projects yet. Click "Add Project" to start.
                      </td></tr>
                    ) : projects.map(p=>(
                      <tr key={p.id} style={{ borderBottom:"1px solid #f8fafc" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ fontWeight:700,color:"#0f172a" }}>{p.name}</div>
                          <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{p.client_name_snapshot||client.full_name}</div>
                        </td>
                        <td style={{ padding:"13px 16px",color:"#374151",textTransform:"capitalize" }}>{p.project_type?.replace(/_/g," ")||"—"}</td>
                        <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>
                          {fmtDate(p.start_date)} → {fmtDate(p.expected_end_date)}
                        </td>
                        <td style={{ padding:"13px 16px",color:"#374151" }}>{p.budget_range||"—"}</td>
                        <td style={{ padding:"13px 16px" }}><Badge status={p.status}/></td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex",gap:5 }}>
                            <Link href={`/crm/dashboard/projects/${p.id}`}><button style={{ padding:6,background:"#dcfce7",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer" }} title="View"><Eye size={13}/></button></Link>
                            <Link href={`/crm/dashboard/projects/new?client=${id}&edit=${p.id}`}><button style={{ padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer" }} title="Edit"><Edit2 size={13}/></button></Link>
                            <button onClick={()=>del("projects",p.id,p.name,loadProjects)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Delete"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PROPOSALS TAB ── */}
          {activeTab==="proposals" && (
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Proposal #","Title","Project","Valid Until","Status","Actions"].map(h=>(
                        <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proposals.length===0 ? (
                      <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>
                        <FileText size={36} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/>
                        No proposals yet.
                      </td></tr>
                    ) : proposals.map(p=>(
                      <tr key={p.id} style={{ borderBottom:"1px solid #f8fafc" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"13px 16px",fontWeight:700,color:"#0f172a" }}>{p.prop_number}</td>
                        <td style={{ padding:"13px 16px",color:"#374151" }}>{p.title}</td>
                        <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>{p.project?.name||p.project_name_snapshot||"—"}</td>
                        <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>{fmtDate(p.valid_until)}</td>
                        <td style={{ padding:"13px 16px" }}><Badge status={p.status}/></td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                            <Link href={`/crm/dashboard/proposals/edit/${p.id}`}><button style={{ padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer" }} title="Edit"><Edit2 size={13}/></button></Link>
                            {p.status==="draft" && <button onClick={()=>updateStatus("proposals",p.id,"sent",loadProposals)} style={{ padding:6,background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer" }} title="Mark Sent"><Send size={13}/></button>}
                            {p.status==="sent"  && <button onClick={()=>updateStatus("proposals",p.id,"accepted",loadProposals)} style={{ padding:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:6,cursor:"pointer" }} title="Accept"><CheckCircle size={13}/></button>}
                            {p.status==="sent"  && <button onClick={()=>updateStatus("proposals",p.id,"rejected",loadProposals)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Reject"><X size={13}/></button>}
                            <Link href={`/crm/dashboard/proposals/${p.id}`} target="_blank">
                              <button style={{ padding:6,background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer" }} title="View/Print"><Eye size={13}/></button>
                            </Link>
                            <button onClick={()=>del("proposals",p.id,p.prop_number,loadProposals)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Delete"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── QUOTATIONS TAB ── */}
          {activeTab==="quotations" && (
            <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                  <thead>
                    <tr style={{ background:"#f8fafc" }}>
                      {["Quote #","Project","Grand Total","Valid Until","Status","Actions"].map(h=>(
                        <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotations.length===0 ? (
                      <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>
                        <Receipt size={36} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/>
                        No quotations yet.
                      </td></tr>
                    ) : quotations.map(q=>(
                      <tr key={q.id} style={{ borderBottom:"1px solid #f8fafc" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"13px 16px",fontWeight:700,color:"#0f172a" }}>{q.quote_number}</td>
                        <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>{q.project?.name||q.project_name_snapshot||"—"}</td>
                        <td style={{ padding:"13px 16px",fontWeight:700,color:"#0f172a" }}>{fmt(q.grand_total)}</td>
                        <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>{fmtDate(q.valid_until)}</td>
                        <td style={{ padding:"13px 16px" }}><Badge status={q.status}/></td>
                        <td style={{ padding:"13px 16px" }}>
                          <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                            <Link href={`/crm/dashboard/quotations/edit/${q.id}`}><button style={{ padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer" }} title="Edit"><Edit2 size={13}/></button></Link>
                            {["draft","sent"].includes(q.status) && <button onClick={()=>updateStatus("quotations",q.id,"approved",loadQuotations)} style={{ padding:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:6,cursor:"pointer" }} title="Approve"><CheckCircle size={13}/></button>}
                            {q.status==="draft" && <button onClick={()=>updateStatus("quotations",q.id,"sent",loadQuotations)} style={{ padding:6,background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer" }} title="Mark Sent"><Send size={13}/></button>}
                            <Link href={`/crm/dashboard/quotations/${q.id}`} target="_blank">
                              <button style={{ padding:6,background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer" }} title="View/Print"><Eye size={13}/></button>
                            </Link>
                            <button onClick={()=>del("quotations",q.id,q.quote_number,loadQuotations)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Delete"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── INVOICES TAB ── */}
          {activeTab==="invoices" && (
            <>
              {/* Stats row */}
              <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
                {[
                  { label:"Total Billed",   value:fmt(invStats.billed),       color:"#7c3aed",bg:"#ede9fe" },
                  { label:"Received",       value:fmt(invStats.received),      color:"#15803d",bg:"#dcfce7" },
                  { label:"Outstanding",    value:fmt(invStats.outstanding),   color:"#c2410c",bg:"#ffedd5" },
                ].map(s=>(
                  <div key={s.label} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"14px 16px" }}>
                    <p style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 4px" }}>{s.label}</p>
                    <p style={{ fontSize:18,fontWeight:800,color:s.color,margin:0 }}>{s.value}</p>
                  </div>
                ))}
              </div>

              <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden" }}>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#f8fafc" }}>
                        {["Invoice #","Project","Type","Date","Total","Paid","Balance","Status","Actions"].map(h=>(
                          <th key={h} style={{ padding:"11px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length===0 ? (
                        <tr><td colSpan={9} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>
                          <FileText size={36} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/>
                          No invoices yet.
                        </td></tr>
                      ) : invoices.map(inv=>(
                        <tr key={inv.id} style={{ borderBottom:"1px solid #f8fafc" }}
                          onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <td style={{ padding:"13px 16px",fontWeight:700,color:"#0f172a" }}>{inv.invoice_number}</td>
                          <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>{inv.project?.name||inv.project_name_snapshot||"—"}</td>
                          <td style={{ padding:"13px 16px",textTransform:"capitalize",fontSize:12,color:"#374151" }}>{inv.invoice_type?.replace(/_/g," ")||"—"}</td>
                          <td style={{ padding:"13px 16px",fontSize:12,color:"#64748b" }}>{fmtDate(inv.invoice_date)}</td>
                          <td style={{ padding:"13px 16px",fontWeight:700,color:"#0f172a" }}>{fmt(inv.grand_total)}</td>
                          <td style={{ padding:"13px 16px",color:"#16a34a",fontWeight:600 }}>{fmt(inv.amount_paid)}</td>
                          <td style={{ padding:"13px 16px",color:Number(inv.balance_due)>0?"#dc2626":"#16a34a",fontWeight:600 }}>{fmt(inv.balance_due)}</td>
                          <td style={{ padding:"13px 16px" }}><Badge status={inv.status}/></td>
                          <td style={{ padding:"13px 16px" }}>
                            <div style={{ display:"flex",gap:5,flexWrap:"wrap" }}>
                              <Link href={`/crm/dashboard/invoices/edit/${inv.id}`}><button style={{ padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer" }} title="Edit"><Edit2 size={13}/></button></Link>
                              {inv.status==="draft"   && <button onClick={()=>updateStatus("invoices",inv.id,"issued",loadInvoices)} style={{ padding:6,background:"#dbeafe",color:"#1d4ed8",border:"none",borderRadius:6,cursor:"pointer" }} title="Mark Issued"><Send size={13}/></button>}
                              {["issued","partial","overdue"].includes(inv.status) && <button onClick={()=>updateStatus("invoices",inv.id,"paid",loadInvoices)} style={{ padding:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:6,cursor:"pointer" }} title="Mark Paid"><CheckCircle size={13}/></button>}
                              <Link href={`/crm/dashboard/invoices/${inv.id}`} target="_blank">
                                <button style={{ padding:6,background:"#f0fdf4",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer" }} title="View/Print"><Eye size={13}/></button>
                              </Link>
                              <button onClick={()=>del("invoices",inv.id,inv.invoice_number,loadInvoices)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Delete"><Trash2 size={13}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════════════ */}

      {/* ── PROJECT MODAL ── */}
      {modal==="project" && (
        <Modal title={editing?"Edit Project":"Add Project"} onClose={closeModal} maxW={560}>
          <form onSubmit={saveProject} style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
            <div>
              <label style={labelStyle}>Project Name <span style={{ color:"#ef4444" }}>*</span></label>
              <input {...F(projForm,setProjForm,"name")} required style={inputStyle}/>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div>
                <label style={labelStyle}>Project Type</label>
                <select {...F(projForm,setProjForm,"project_type")} style={inputStyle}>
                  {["retainer","one_time","campaign","audit","consultation","other"].map(t=><option key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select {...F(projForm,setProjForm,"status")} style={inputStyle}>
                  {["active","on_hold","completed","cancelled"].map(s=><option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" {...F(projForm,setProjForm,"start_date")} style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Expected End Date</label>
                <input type="date" {...F(projForm,setProjForm,"expected_end_date")} style={inputStyle}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Budget Range</label>
              <input {...F(projForm,setProjForm,"budget_range")} placeholder="e.g. ₹30,000–₹50,000/month" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Services</label>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",padding:"8px 0" }}>
                {services.map(s=>{
                  const sel=(projForm.services||[]).includes(s.id);
                  return <button key={s.id} type="button" onClick={()=>setProjForm(p=>({ ...p, services:sel?p.services.filter(x=>x!==s.id):[...p.services,s.id] }))}
                    style={{ padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:sel?"none":"1.5px solid #e2e8f0",background:sel?"#22c55e":"#f8fafc",color:sel?"#fff":"#475569",cursor:"pointer" }}>{s.name}</button>;
                })}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea {...F(projForm,setProjForm,"notes")} rows={3} style={{ ...inputStyle,resize:"vertical" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid #f1f5f9" }}>
              <button type="button" onClick={closeModal} style={{ padding:"9px 18px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding:"9px 20px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
                {saving?"Saving…":editing?"Update Project":"Create Project"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── PROPOSAL MODAL ── */}
      {modal==="proposal" && (
        <Modal title={editing?"Edit Proposal":"New Proposal"} onClose={closeModal} maxW={600}>
          <form onSubmit={saveProposal} style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
              <div>
                <label style={labelStyle}>Project <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={propForm.project} onChange={e=>setPropForm(p=>({...p,project:e.target.value}))} required style={inputStyle}>
                  <option value="">Select project…</option>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select {...F(propForm,setPropForm,"status")} style={inputStyle}>
                  {["draft","sent","accepted","rejected"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Title <span style={{ color:"#ef4444" }}>*</span></label>
              <input {...F(propForm,setPropForm,"title")} required style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Valid Until</label>
              <input type="date" {...F(propForm,setPropForm,"valid_until")} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Services</label>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",padding:"6px 0" }}>
                {services.map(s=>{
                  const sel=(propForm.services||[]).includes(s.id);
                  return <button key={s.id} type="button" onClick={()=>setPropForm(p=>({ ...p, services:sel?p.services.filter(x=>x!==s.id):[...p.services,s.id] }))}
                    style={{ padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:sel?"none":"1.5px solid #e2e8f0",background:sel?"#22c55e":"#f8fafc",color:sel?"#fff":"#475569",cursor:"pointer" }}>{s.name}</button>;
                })}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Content / Scope of Work</label>
              <textarea {...F(propForm,setPropForm,"content")} rows={6} placeholder="Describe services, deliverables, timeline…" style={{ ...inputStyle,resize:"vertical" }}/>
            </div>
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea {...F(propForm,setPropForm,"notes")} rows={2} style={{ ...inputStyle,resize:"vertical" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid #f1f5f9" }}>
              <button type="button" onClick={closeModal} style={{ padding:"9px 18px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding:"9px 20px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
                {saving?"Saving…":editing?"Update Proposal":"Create Proposal"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── QUOTATION MODAL ── */}
      {modal==="quotation" && (
        <Modal title={editing?"Edit Quotation":"New Quotation"} onClose={closeModal} maxW={700}>
          <form onSubmit={saveQuotation} style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14 }}>
              <div>
                <label style={labelStyle}>Project <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={quoteForm.project} onChange={e=>setQuoteForm(p=>({...p,project:e.target.value}))} required style={inputStyle}>
                  <option value="">Select…</option>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select {...F(quoteForm,setQuoteForm,"status")} style={inputStyle}>
                  {["draft","sent","approved","rejected"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Valid Until</label>
                <input type="date" {...F(quoteForm,setQuoteForm,"valid_until")} style={inputStyle}/>
              </div>
            </div>
            {/* Line items */}
            <ItemsEditor items={quoteItems} onChange={setQuoteItems}/>
            {/* Tax & Discount */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12 }}>
              {[["cgst_rate","CGST %"],["sgst_rate","SGST %"],["igst_rate","IGST %"],["discount_value","Discount (₹)"]].map(([k,l])=>(
                <div key={k}>
                  <label style={{ ...labelStyle,fontSize:11 }}>{l}</label>
                  <input type="number" min="0" {...F(quoteForm,setQuoteForm,k)} style={{ ...inputStyle,padding:"7px 10px" }}/>
                </div>
              ))}
              <div>
                <label style={{ ...labelStyle,fontSize:11 }}>Disc. Type</label>
                <select {...F(quoteForm,setQuoteForm,"discount_type")} style={{ ...inputStyle,padding:"7px 10px" }}>
                  <option value="fixed">Fixed ₹</option>
                  <option value="percentage">%</option>
                </select>
              </div>
              <div>
                <label style={{ ...labelStyle,fontSize:11 }}>HSN/SAC</label>
                <input {...F(quoteForm,setQuoteForm,"hsn_sac")} style={{ ...inputStyle,padding:"7px 10px" }}/>
              </div>
            </div>
            {/* Summary */}
            {(()=>{
              const sub = quoteItems.reduce((s,i)=>s+(Number(i.total_price)||0),0);
              const disc = quoteForm.discount_type==="percentage" ? sub*(Number(quoteForm.discount_value)||0)/100 : (Number(quoteForm.discount_value)||0);
              const tax = (sub-disc)*((Number(quoteForm.cgst_rate)||0)+(Number(quoteForm.sgst_rate)||0)+(Number(quoteForm.igst_rate)||0))/100;
              return (
                <div style={{ background:"#f8fafc",borderRadius:8,padding:"12px 16px",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ color:"#64748b" }}>Est. Grand Total</span>
                  <strong style={{ fontSize:16,color:"#0f172a" }}>{fmt(sub-disc+tax)}</strong>
                </div>
              );
            })()}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea {...F(quoteForm,setQuoteForm,"notes")} rows={2} style={{ ...inputStyle,resize:"vertical" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid #f1f5f9" }}>
              <button type="button" onClick={closeModal} style={{ padding:"9px 18px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding:"9px 20px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
                {saving?"Saving…":editing?"Update Quotation":"Create Quotation"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── INVOICE MODAL ── */}
      {modal==="invoice" && (
        <Modal title={editing?"Edit Invoice":"New Invoice"} onClose={closeModal} maxW={700}>
          <form onSubmit={saveInvoice} style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:14 }}>
              <div>
                <label style={labelStyle}>Project <span style={{ color:"#ef4444" }}>*</span></label>
                <select value={invForm.project} onChange={e=>setInvForm(p=>({...p,project:e.target.value}))} required style={inputStyle}>
                  <option value="">Select…</option>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Invoice Type</label>
                <select {...F(invForm,setInvForm,"invoice_type")} style={inputStyle}>
                  {["full","advance","milestone","final","monthly_retainer"].map(t=><option key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select {...F(invForm,setInvForm,"status")} style={inputStyle}>
                  {["draft","issued","partial","paid","overdue","cancelled"].map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Invoice Date <span style={{ color:"#ef4444" }}>*</span></label>
                <input type="date" {...F(invForm,setInvForm,"invoice_date")} required style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Due Date <span style={{ color:"#ef4444" }}>*</span></label>
                <input type="date" {...F(invForm,setInvForm,"due_date")} required style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>Milestone Label</label>
                <input {...F(invForm,setInvForm,"milestone_label")} placeholder="Month 1 / Phase 1" style={inputStyle}/>
              </div>
              <div>
                <label style={labelStyle}>HSN/SAC</label>
                <input {...F(invForm,setInvForm,"hsn_sac")} style={inputStyle}/>
              </div>
            </div>
            {/* Line items */}
            <ItemsEditor items={invItems} onChange={setInvItems}/>
            {/* Tax */}
            <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
              {[["cgst_rate","CGST %"],["sgst_rate","SGST %"],["igst_rate","IGST %"]].map(([k,l])=>(
                <div key={k}>
                  <label style={{ ...labelStyle,fontSize:11 }}>{l}</label>
                  <input type="number" min="0" {...F(invForm,setInvForm,k)} style={{ ...inputStyle,padding:"7px 10px" }}/>
                </div>
              ))}
            </div>
            {/* Summary */}
            {(()=>{
              const sub = invItems.reduce((s,i)=>s+(Number(i.total_price)||0),0);
              const tax = sub*((Number(invForm.cgst_rate)||0)+(Number(invForm.sgst_rate)||0)+(Number(invForm.igst_rate)||0))/100;
              return (
                <div style={{ background:"#f8fafc",borderRadius:8,padding:"12px 16px",fontSize:13,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                  <span style={{ color:"#64748b" }}>Grand Total</span>
                  <strong style={{ fontSize:16,color:"#0f172a" }}>{fmt(sub+tax)}</strong>
                </div>
              );
            })()}
            <div>
              <label style={labelStyle}>Notes</label>
              <textarea {...F(invForm,setInvForm,"notes")} rows={2} style={{ ...inputStyle,resize:"vertical" }}/>
            </div>
            <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid #f1f5f9" }}>
              <button type="button" onClick={closeModal} style={{ padding:"9px 18px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
              <button type="submit" disabled={saving} style={{ padding:"9px 20px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
                {saving?"Saving…":editing?"Update Invoice":"Create Invoice"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
}
