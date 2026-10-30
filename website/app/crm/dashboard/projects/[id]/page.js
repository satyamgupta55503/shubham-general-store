"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Save, X, Plus, Trash2, Eye,
  FileText, Receipt, CreditCard, AlertCircle
} from "lucide-react";
import CRM_API from "@/utils/crmApi";

const fmt   = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtD  = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const toISO = d => d ? d.split("T")[0] : "";

const STATUS_MAP = { active:["#dcfce7","#15803d"], on_hold:["#fef9c3","#a16207"], completed:["#dbeafe","#1d4ed8"], cancelled:["#fee2e2","#dc2626"] };
const TYPE_MAP   = { retainer:"Retainer", one_time:"One Time", campaign:"Campaign", audit:"Audit", consultation:"Consultation", other:"Other" };

const PROP_STATUS = { draft:["#f1f5f9","#475569"], sent:["#dbeafe","#1d4ed8"], accepted:["#dcfce7","#15803d"], rejected:["#fee2e2","#dc2626"] };
const QUOT_STATUS = { draft:["#f1f5f9","#475569"], sent:["#dbeafe","#1d4ed8"], approved:["#dcfce7","#15803d"], rejected:["#fee2e2","#dc2626"] };
const INV_STATUS  = { draft:["#f1f5f9","#475569"], issued:["#dbeafe","#1d4ed8"], partial:["#ffedd5","#c2410c"], paid:["#dcfce7","#15803d"], overdue:["#fee2e2","#dc2626"], cancelled:["#f1f5f9","#94a3b8"] };

function Badge({ status, map }) {
  const [bg,c] = (map||{})[status]||["#f1f5f9","#475569"];
  return <span style={{display:"inline-flex",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:bg,color:c,whiteSpace:"nowrap"}}>{status?.replace(/_/g," ")||"—"}</span>;
}

const TABS = ["Overview","Proposals","Quotations","Invoices"];

export default function ProjectDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [project,   setProject]   = useState(null);
  const [services,  setServices]  = useState([]);
  const [proposals, setProposals] = useState([]);
  const [quotations,setQuotations]= useState([]);
  const [invoices,  setInvoices]  = useState([]);
  const [tab,       setTab]       = useState("Overview");
  const [loading,   setLoading]   = useState(true);
  const [editMode,  setEditMode]  = useState(false);
  const [form,      setForm]      = useState({});
  const [saving,    setSaving]    = useState(false);
  const [err,       setErr]       = useState("");
  const [saveOk,    setSaveOk]    = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data:p }, { data:s }] = await Promise.all([
        CRM_API.get(`/projects/${id}`),
        CRM_API.get("/services"),
      ]);
      setProject(p); setServices(s);
      setForm({
        name: p.name||"", project_type: p.project_type||"retainer",
        budget_range: p.budget_range||"", start_date: toISO(p.start_date),
        expected_end_date: toISO(p.expected_end_date),
        status: p.status||"active", notes: p.notes||"",
        services: p.services?.map(s=>s.id||s)||[],
      });
    } catch { router.replace("/crm/dashboard/projects"); }
    finally { setLoading(false); }
  }, [id, router]);

  const loadTab = useCallback(async () => {
    try {
      if (tab==="Proposals")  { const {data}=await CRM_API.get(`/proposals?project=${id}`); setProposals(data||[]); }
      if (tab==="Quotations") { const {data}=await CRM_API.get(`/quotations?project=${id}`); setQuotations(data||[]); }
      if (tab==="Invoices")   { const {data}=await CRM_API.get(`/invoices?project=${id}`);   setInvoices(data||[]); }
    } catch {}
  }, [tab, id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (tab !== "Overview") loadTab(); }, [tab, loadTab]);

  const handleSave = async () => {
    setSaving(true); setErr(""); setSaveOk("");
    try {
      const { data } = await CRM_API.patch(`/projects/${id}`, form);
      setProject(data); setEditMode(false);
      setSaveOk("Project updated!"); setTimeout(()=>setSaveOk(""),3000);
    } catch (ex) { setErr(ex.response?.data?.message||"Update failed"); }
    finally { setSaving(false); }
  };

  const deleteDoc = async (entity, docId, label) => {
    if (!confirm(`Delete "${label}"?`)) return;
    try { await CRM_API.delete(`/${entity}/${docId}`); loadTab(); }
    catch (e) { alert(e.response?.data?.message||"Delete failed"); }
  };

  const toggleSvc = (sId) => setForm(p=>({
    ...p, services: p.services.includes(sId) ? p.services.filter(x=>x!==sId) : [...p.services,sId]
  }));

  const F   = (k) => ({ value: form[k]||"", onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"50vh"}}>
      <div style={{textAlign:"center"}}><div style={{width:36,height:36,border:"3px solid #dcfce7",borderTopColor:"#22c55e",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 10px"}}/><p style={{color:"#64748b",fontSize:14,margin:0}}>Loading…</p><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>
    </div>
  );
  if (!project) return <div style={{padding:40,textAlign:"center",color:"#94a3b8"}}>Project not found.</div>;

  const [stBg, stC] = STATUS_MAP[project.status]||["#f1f5f9","#475569"];
  const clientHref  = `/crm/dashboard/clients/${project.client?.id||project.client}`;

  return (
    <div>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap"}}>
        <button onClick={()=>router.back()} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer"}}>
          <ArrowLeft size={14}/> Back
        </button>
        <div style={{flex:1}}/>
        {saveOk && <span style={{fontSize:12,fontWeight:600,color:"#15803d",background:"#dcfce7",padding:"6px 12px",borderRadius:8}}>✅ {saveOk}</span>}
        {err    && <span style={{fontSize:12,fontWeight:600,color:"#dc2626",background:"#fee2e2",padding:"6px 12px",borderRadius:8}}>❌ {err}</span>}
        {editMode ? (
          <>
            <button onClick={()=>{setEditMode(false);setErr("");}} style={{padding:"8px 16px",background:"#f1f5f9",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}><X size={13}/> Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer"}}>
              <Save size={13}/>{saving?"Saving…":"Save Changes"}
            </button>
          </>
        ) : (
          <button onClick={()=>setEditMode(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#dbeafe",color:"#1d4ed8",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>
            <Edit2 size={13}/> Edit Project
          </button>
        )}
      </div>

      {/* Project header card */}
      <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
          <div style={{width:52,height:52,borderRadius:12,background:"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:22}}>📁</span>
          </div>
          <div style={{flex:1,minWidth:0}}>
            {editMode
              ? <input {...F("name")} style={{...inp,fontSize:20,fontWeight:700,marginBottom:8}}/>
              : <h1 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 6px"}}>{project.name}</h1>
            }
            <div style={{display:"flex",gap:10,flexWrap:"wrap",fontSize:13,color:"#64748b",alignItems:"center"}}>
              <Link href={clientHref} style={{fontWeight:600,color:"#22c55e",textDecoration:"none"}}>{project.client?.full_name||project.client_name_snapshot||"—"}</Link>
              <span>·</span>
              <span>{TYPE_MAP[project.project_type]||project.project_type}</span>
              <span>·</span>
              <span>{fmtD(project.start_date)} → {fmtD(project.expected_end_date)}</span>
              {project.budget_range && <><span>·</span><span style={{fontWeight:600,color:"#0f172a"}}>{project.budget_range}</span></>}
            </div>
          </div>
          <div>
            {editMode
              ? <select {...F("status")} style={{...inp,minWidth:130}}>{Object.entries(STATUS_MAP).map(([v])=><option key={v} value={v}>{v.replace(/_/g," ")}</option>)}</select>
              : <span style={{padding:"5px 14px",borderRadius:20,fontWeight:700,fontSize:12,textTransform:"capitalize",background:stBg,color:stC}}>{project.status?.replace(/_/g," ")}</span>
            }
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:2,background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:4,width:"fit-content",marginBottom:20,flexWrap:"wrap"}}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:tab===t?"#22c55e":"transparent",color:tab===t?"#fff":"#64748b"}}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {tab==="Overview" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>

          {/* Details */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Project Details</h3>
            {editMode ? (
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <div><label style={lbl}>Type</label><select {...F("project_type")} style={inp}>{Object.entries(TYPE_MAP).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
                <div><label style={lbl}>Budget Range</label><input {...F("budget_range")} style={inp}/></div>
                <div><label style={lbl}>Start Date</label><input type="date" {...F("start_date")} style={inp}/></div>
                <div><label style={lbl}>End Date</label><input type="date" {...F("expected_end_date")} style={inp}/></div>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10,fontSize:13}}>
                {[["Type",TYPE_MAP[project.project_type]||project.project_type],["Budget",project.budget_range||"—"],["Start",fmtD(project.start_date)],["End",fmtD(project.expected_end_date)],["Created",fmtD(project.created_at)]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",gap:8}}><span style={{color:"#64748b",minWidth:70}}>{l}:</span><span style={{fontWeight:600,color:"#0f172a"}}>{v}</span></div>
                ))}
              </div>
            )}
          </div>

          {/* Services */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Services</h3>
            {editMode ? (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {services.filter(s=>s.status==="active").map(s=>{
                  const sel=form.services.includes(s.id);
                  return <button key={s.id} type="button" onClick={()=>toggleSvc(s.id)} style={{padding:"5px 12px",borderRadius:20,fontSize:12,fontWeight:600,border:sel?"none":"1.5px solid #e2e8f0",background:sel?"#22c55e":"#f8fafc",color:sel?"#fff":"#475569",cursor:"pointer"}}>{s.name}</button>;
                })}
              </div>
            ) : (
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {(project.services||[]).length===0
                  ? <span style={{fontSize:13,color:"#94a3b8"}}>No services assigned</span>
                  : (project.services||[]).map((s,i)=>(
                    <span key={i} style={{padding:"4px 12px",borderRadius:20,background:"#f0fdf4",color:"#15803d",fontSize:12,fontWeight:600}}>{s.name||s}</span>
                  ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Notes</h3>
            {editMode
              ? <textarea {...F("notes")} rows={5} style={{...inp,resize:"vertical"}}/>
              : <p style={{fontSize:13,color:project.notes?"#374151":"#94a3b8",lineHeight:1.6,margin:0}}>{project.notes||"No notes."}</p>
            }
          </div>

          {/* Quick actions */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20}}>
            <h3 style={{fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Quick Actions</h3>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                { label:"+ New Proposal",  href:`/crm/dashboard/proposals/new?project=${id}&client=${project.client?.id||project.client}`, bg:"#ede9fe", c:"#5b21b6" },
                { label:"+ New Quotation", href:`/crm/dashboard/quotations/new?project=${id}&client=${project.client?.id||project.client}`, bg:"#dbeafe", c:"#1d4ed8" },
                { label:"+ New Invoice",   href:`/crm/dashboard/invoices/new?project=${id}&client=${project.client?.id||project.client}`, bg:"#dcfce7", c:"#15803d" },
              ].map(({label,href,bg,c})=>(
                <Link key={label} href={href} style={{padding:"10px 14px",background:bg,color:c,borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none",display:"block",textAlign:"center"}}>{label}</Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Proposals tab */}
      {tab==="Proposals" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontSize:13,color:"#64748b"}}>{proposals.length} proposal{proposals.length!==1?"s":""}</span>
            <Link href={`/crm/dashboard/proposals/new?project=${id}&client=${project.client?.id||project.client}`} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#22c55e",color:"#fff",borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none"}}>
              <Plus size={14}/> New Proposal
            </Link>
          </div>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8fafc"}}>{["Number","Title","Valid Until","Status","Actions"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
              <tbody>
                {proposals.length===0
                  ? <tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"#94a3b8"}}>No proposals yet</td></tr>
                  : proposals.map(p=>(
                    <tr key={p.id} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"12px 16px",fontWeight:700,color:"#0f172a"}}>{p.prop_number||"—"}</td>
                      <td style={{padding:"12px 16px",color:"#374151"}}>{p.title}</td>
                      <td style={{padding:"12px 16px",fontSize:12,color:"#64748b"}}>{fmtD(p.valid_until)}</td>
                      <td style={{padding:"12px 16px"}}><Badge status={p.status} map={PROP_STATUS}/></td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <Link href={`/crm/dashboard/proposals/${p.id}`} target="_blank"><button style={{padding:6,background:"#dcfce7",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer"}}><Eye size={13}/></button></Link>
                          <Link href={`/crm/dashboard/proposals/edit/${p.id}`}><button style={{padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer"}}><Edit2 size={13}/></button></Link>
                          <button onClick={()=>deleteDoc("proposals",p.id,p.title)} style={{padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer"}}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quotations tab */}
      {tab==="Quotations" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontSize:13,color:"#64748b"}}>{quotations.length} quotation{quotations.length!==1?"s":""}</span>
            <Link href={`/crm/dashboard/quotations/new?project=${id}&client=${project.client?.id||project.client}`} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#22c55e",color:"#fff",borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none"}}>
              <Plus size={14}/> New Quotation
            </Link>
          </div>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8fafc"}}>{["Quote #","Grand Total","Valid Until","Status","Actions"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
              <tbody>
                {quotations.length===0
                  ? <tr><td colSpan={5} style={{padding:"40px",textAlign:"center",color:"#94a3b8"}}>No quotations yet</td></tr>
                  : quotations.map(q=>(
                    <tr key={q.id} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"12px 16px",fontWeight:700,color:"#0f172a"}}>{q.quote_number}</td>
                      <td style={{padding:"12px 16px",fontWeight:700,color:"#0f172a"}}>{fmt(q.grand_total)}</td>
                      <td style={{padding:"12px 16px",fontSize:12,color:"#64748b"}}>{fmtD(q.valid_until)}</td>
                      <td style={{padding:"12px 16px"}}><Badge status={q.status} map={QUOT_STATUS}/></td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <Link href={`/crm/dashboard/quotations/${q.id}`} target="_blank"><button style={{padding:6,background:"#dcfce7",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer"}}><Eye size={13}/></button></Link>
                          <Link href={`/crm/dashboard/quotations/edit/${q.id}`}><button style={{padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer"}}><Edit2 size={13}/></button></Link>
                          <button onClick={()=>deleteDoc("quotations",q.id,q.quote_number)} style={{padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer"}}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoices tab */}
      {tab==="Invoices" && (
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <span style={{fontSize:13,color:"#64748b"}}>{invoices.length} invoice{invoices.length!==1?"s":""}</span>
            <Link href={`/crm/dashboard/invoices/new?project=${id}&client=${project.client?.id||project.client}`} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#22c55e",color:"#fff",borderRadius:8,fontSize:13,fontWeight:700,textDecoration:"none"}}>
              <Plus size={14}/> New Invoice
            </Link>
          </div>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8fafc"}}>{["Invoice #","Grand Total","Balance Due","Due Date","Status","Actions"].map(h=><th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
              <tbody>
                {invoices.length===0
                  ? <tr><td colSpan={6} style={{padding:"40px",textAlign:"center",color:"#94a3b8"}}>No invoices yet</td></tr>
                  : invoices.map(inv=>(
                    <tr key={inv.id} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"12px 16px",fontWeight:700,color:"#0f172a"}}>{inv.invoice_number}</td>
                      <td style={{padding:"12px 16px",fontWeight:700}}>{fmt(inv.grand_total)}</td>
                      <td style={{padding:"12px 16px",fontWeight:700,color:inv.balance_due>0?"#dc2626":"#16a34a"}}>{fmt(inv.balance_due)}</td>
                      <td style={{padding:"12px 16px",fontSize:12,color:"#64748b"}}>{fmtD(inv.due_date)}</td>
                      <td style={{padding:"12px 16px"}}><Badge status={inv.status} map={INV_STATUS}/></td>
                      <td style={{padding:"12px 16px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <Link href={`/crm/dashboard/invoices/${inv.id}`} target="_blank"><button style={{padding:6,background:"#dcfce7",color:"#16a34a",border:"none",borderRadius:6,cursor:"pointer"}}><Eye size={13}/></button></Link>
                          <Link href={`/crm/dashboard/invoices/edit/${inv.id}`}><button style={{padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer"}}><Edit2 size={13}/></button></Link>
                          <button onClick={()=>deleteDoc("invoices",inv.id,inv.invoice_number)} style={{padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer"}}><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
