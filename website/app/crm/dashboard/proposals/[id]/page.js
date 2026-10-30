"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import CRM_API from "@/utils/crmApi";
import { downloadPdf } from "@/utils/downloadPdf";
import { LOGO_BASE64 } from "@/utils/logoBase64";

const DEFAULT_COMPANY = {
  name:"Subham General Store", address:"270/1, Swami Vivekanand Ward, Budhapara, Dani Wada, Raipur",
  city:"Raipur, Chhattisgarh India 492001", phone:"9302279701", email:"info@Subham Storesocial.com",
  gstin:"22AARFD5166H1ZB", state:"Chhattisgarh", logo:"/assets/imgs/template/logo.png",
};

const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"}) : "—";

const STATUS_COLORS = {
  draft:    { bg:"#f1f5f9", color:"#475569" },
  sent:     { bg:"#dbeafe", color:"#1d4ed8" },
  accepted: { bg:"#dcfce7", color:"#15803d" },
  rejected: { bg:"#fee2e2", color:"#dc2626" },
};

// ── Copy Modal ────────────────────────────────────────────────────────────────
function CopyModal({ p, projects, onClose, onDone }) {
  const [form, setForm] = useState({
    project: p.project?.id || p.project || "",
    title: `Copy of ${p.title}`,
    content: p.content || "",
    valid_until: "",
    notes: p.notes || "",
    services: p.services?.map(s=>s.id||s) || [],
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      await CRM_API.post("/proposals", { ...form, status: "draft" });
      onDone();
    } catch(e) { setErr(e.response?.data?.message||"Copy failed"); }
    finally { setSaving(false); }
  };

  const iStyle = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lStyle = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:580,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:"'Inter',sans-serif" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
          <div>
            <h2 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>Copy Proposal</h2>
            <p style={{ fontSize:12,color:"#64748b",margin:"3px 0 0" }}>Creates a new Draft copy of {p.prop_number}</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:6,cursor:"pointer",fontSize:16 }}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ padding:24,display:"flex",flexDirection:"column",gap:14 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
            <div><label style={lStyle}>Project</label>
              <select value={form.project} onChange={e=>setForm(p=>({...p,project:e.target.value}))} style={iStyle}>
                {projects.map(pr=><option key={pr.id} value={pr.id}>{pr.name}</option>)}
              </select></div>
            <div><label style={lStyle}>Valid Until</label>
              <input type="date" value={form.valid_until} onChange={e=>setForm(p=>({...p,valid_until:e.target.value}))} style={iStyle}/></div>
          </div>
          <div><label style={lStyle}>Title <span style={{ color:"#ef4444" }}>*</span></label>
            <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required style={iStyle}/></div>
          <div><label style={lStyle}>Content / Scope of Work</label>
            <textarea value={form.content} onChange={e=>setForm(p=>({...p,content:e.target.value}))} rows={6} style={{ ...iStyle,resize:"vertical" }}/></div>
          <div><label style={lStyle}>Notes</label>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2} style={{ ...iStyle,resize:"vertical" }}/></div>
          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:"1px solid #f1f5f9" }}>
            <button type="button" onClick={onClose} style={{ padding:"9px 18px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ padding:"9px 20px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
              {saving?"Creating…":"Create Copy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────────────────────
function HistoryPanel({ entityType, entityId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    CRM_API.get(`/history?entity_type=${entityType}&entity_id=${entityId}&limit=50`)
      .then(({ data }) => setLogs(data.logs || []))
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, [entityType, entityId]);
  const timeAgo = (iso) => {
    const m=Math.floor((Date.now()-new Date(iso).getTime())/60000);
    if(m<1)return"just now"; if(m<60)return`${m}m ago`;
    const h=Math.floor(m/60); if(h<24)return`${h}h ago`;
    return`${Math.floor(h/24)}d ago`;
  };
  const AC = { created:{bg:"#dcfce7",color:"#15803d"},updated:{bg:"#dbeafe",color:"#1d4ed8"},status_changed:{bg:"#fef9c3",color:"#a16207"},sent:{bg:"#ede9fe",color:"#6d28d9"} };
  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"flex-end" }}>
      <div style={{ background:"#fff",width:"100%",maxWidth:380,height:"100vh",overflowY:"auto",boxShadow:"-8px 0 32px rgba(0,0,0,.12)",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
          <div><h3 style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:0 }}>📋 Activity History</h3><p style={{ fontSize:12,color:"#64748b",margin:"3px 0 0" }}>All changes and actions</p></div>
          <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:6,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:10 }}>
          {loading?<div style={{ textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:13 }}>Loading…</div>
          :logs.length===0?<div style={{ textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:13 }}>No history yet.</div>
          :logs.map((log,i)=>{
            const ac=AC[log.action]||{bg:"#f1f5f9",color:"#475569"};
            return (
              <div key={log.id||i} style={{ background:"#f8fafc",borderRadius:10,padding:"12px 14px",border:"1px solid #f1f5f9" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                  <span style={{ display:"inline-flex",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"capitalize",background:ac.bg,color:ac.color }}>{log.action?.replace(/_/g," ")}</span>
                  <span style={{ fontSize:11,color:"#94a3b8",marginLeft:"auto" }}>{timeAgo(log.created_at)}</span>
                </div>
                {log.description&&<p style={{ fontSize:12,color:"#374151",margin:"0 0 4px",lineHeight:1.5 }}>{log.description}</p>}
                <p style={{ fontSize:11,color:"#94a3b8",margin:0 }}>By <strong style={{ color:"#475569" }}>{log.actor_name||"System"}</strong>{" · "}{new Date(log.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true})}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function ProposalPrintPage() {
  const { id } = useParams();
  const router  = useRouter();
  const [p,        setP]        = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [company,  setCompany]  = useState(DEFAULT_COMPANY);
  const [showCopy,    setShowCopy]    = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [statusSaving,setStatusSaving]= useState(false);
  const [toast,       setToast]       = useState(null);
  const [downloading, setDownloading] = useState(false);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    try {
      const [{ data: prop }, { data: proj }] = await Promise.all([
        CRM_API.get(`/proposals/${id}`),
        CRM_API.get("/projects"),
      ]);
      setP(prop); setProjects(proj);
      try {
        const { data: s } = await CRM_API.get("/settings");
        if (s.company_name) setCompany({ name:s.company_name, address:s.company_address, city:`${s.company_city}, ${s.company_state} India ${s.company_pincode}`, phone:s.company_phone, email:s.company_email, gstin:s.gstin, state:s.company_state, logo: s.company_logo || DEFAULT_COMPANY.logo,
            bank_name:s.bank_name||DEFAULT_COMPANY.bank_name, account_name:s.account_name||DEFAULT_COMPANY.account_name, account_no:s.account_number||DEFAULT_COMPANY.account_no, ifsc:s.ifsc_code||DEFAULT_COMPANY.ifsc, upi:s.upi_id||DEFAULT_COMPANY.upi });
      } catch {}
    } catch { router.replace("/crm/dashboard/proposals"); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (newStatus) => {
    if (!p || statusSaving) return;
    setStatusSaving(true);
    try {
      const { data } = await CRM_API.patch(`/proposals/${id}`, { status: newStatus });
      setP(data);
      showToast(`Status changed to ${newStatus}`);
    } catch(e) { showToast(e.response?.data?.message||"Update failed","error"); }
    finally { setStatusSaving(false); }
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ width:36,height:36,border:"3px solid #dcfce7",borderTopColor:"#22c55e",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px" }}/>
        <p style={{ color:"#64748b",fontSize:14,margin:0 }}>Loading…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
  if (!p) return null;

  const sc = STATUS_COLORS[p.status] || STATUS_COLORS.draft;

  const STATUS_ACTIONS = [
    { label:"Mark Sent",   value:"sent",     show: p.status === "draft" },
    { label:"Accept",      value:"accepted", show: p.status === "sent" },
    { label:"Reject",      value:"rejected", show: p.status === "sent" },
    { label:"Back to Draft",value:"draft",   show: ["sent","rejected"].includes(p.status) },
  ].filter(a => a.show);

  return (
    <>
      {/* Action Bar */}
      <div className="no-print" style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"10px 20px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",fontFamily:"'Inter',sans-serif",boxShadow:"0 1px 6px rgba(0,0,0,.06)" }}>
        <button onClick={()=>router.back()} style={{ padding:"7px 14px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>← Back</button>
        <span style={{ fontSize:14,fontWeight:700,color:"#0f172a" }}>{p.prop_number}</span>
        <span style={{ padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,textTransform:"capitalize",background:sc.bg,color:sc.color }}>{p.status}</span>

        {STATUS_ACTIONS.map(a=>(
          <button key={a.value} onClick={()=>changeStatus(a.value)} disabled={statusSaving}
            style={{ padding:"7px 14px",background:a.value==="accepted"?"#dcfce7":a.value==="rejected"?"#fee2e2":a.value==="sent"?"#dbeafe":"#f1f5f9",color:a.value==="accepted"?"#15803d":a.value==="rejected"?"#dc2626":a.value==="sent"?"#1d4ed8":"#475569",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:statusSaving?"not-allowed":"pointer",opacity:statusSaving?.6:1 }}>
            {statusSaving?"…":a.label}
          </button>
        ))}

        <div style={{ marginLeft:"auto",display:"flex",gap:8 }}>
          <button onClick={()=>setShowHistory(true)} style={{ padding:"7px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>📋 History</button>
          <button onClick={()=>setShowCopy(true)} style={{ padding:"7px 14px",background:"#fffbeb",border:"1px solid #fde68a",color:"#b45309",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}>📄 Copy</button>
          <button
            onClick={() => downloadPdf("crm-pdf-document", p.prop_number, ()=>setDownloading(true), ()=>{ setDownloading(false); showToast("PDF downloaded!"); })}
            disabled={downloading}
            style={{ padding:"8px 18px",background:downloading?"#86efac":"#16a34a",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:downloading?"not-allowed":"pointer",opacity:downloading?.7:1 }}>
            {downloading ? "⏳ Generating…" : "⬇️ Download PDF"}
          </button>
          <button onClick={()=>window.print()} style={{ padding:"8px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}>🖨️ Print</button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="no-print" style={{ position:"fixed",bottom:24,right:24,zIndex:3000,padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:600,color:"#fff",background:toast.type==="error"?"#dc2626":"#16a34a",boxShadow:"0 4px 16px rgba(0,0,0,.15)" }}>
          {toast.type==="error"?"✗":"✓"} {toast.msg}
        </div>
      )}

      {/* Document */}
      <div id="crm-pdf-document" style={{ fontFamily:"Arial,Helvetica,sans-serif",fontSize:12,color:"#111",maxWidth:794,margin:"70px auto 40px",padding:"32px 40px",background:"#fff",boxShadow:"0 0 24px rgba(0,0,0,.08)",lineHeight:1.6,boxSizing:"border-box" }}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:32,borderBottom:"2px solid #111",paddingBottom:20 }}>
          <div>
            <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".1em",color:"#64748b",marginBottom:6 }}>Business Proposal</div>
            <div style={{ fontSize:26,fontWeight:700,color:"#111",marginBottom:6 }}>{p.title}</div>
            <div style={{ fontSize:11,color:"#444",lineHeight:1.8 }}>
              <strong>{company.name}</strong><br/>
              {company.address}<br/>{company.city}<br/>
              <strong>GSTIN:</strong> {company.gstin}<br/>
              Phone: {company.phone} &nbsp;|&nbsp; {company.email}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <img src={LOGO_BASE64} alt="Logo" style={{ height:55,objectFit:"contain",maxWidth:180,display:"block",marginLeft:"auto" }}/>
            <div style={{ marginTop:12,fontSize:11,lineHeight:1.8,color:"#444" }}>
              <strong>PROPOSAL NO:</strong> {p.prop_number}<br/>
              <strong>DATE:</strong> {fmtD(p.created_at)}<br/>
              {p.valid_until && <><strong>VALID UNTIL:</strong> {fmtD(p.valid_until)}<br/></>}
              <span style={{ display:"inline-block",marginTop:4,padding:"3px 10px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"uppercase",background:sc.bg,color:sc.color }}>{p.status}</span>
            </div>
          </div>
        </div>

        {/* Prepared For */}
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".08em",color:"#64748b",marginBottom:6 }}>Prepared For</div>
          <div style={{ fontSize:15,fontWeight:700 }}>{p.client_name_snapshot||"—"}</div>
          {p.client_address_snapshot && <div style={{ fontSize:11,color:"#444",marginTop:2,lineHeight:1.6 }}>{p.client_address_snapshot}</div>}
          {p.client_gstin_snapshot && <div style={{ fontSize:11,marginTop:4 }}><strong>GSTIN:</strong> {p.client_gstin_snapshot}</div>}
          <div style={{ fontSize:12,color:"#64748b",marginTop:4 }}>Project: <strong>{p.project_name_snapshot||p.project?.name||"—"}</strong></div>
        </div>

        {/* Services */}
        {p.services && p.services.length > 0 && (
          <div style={{ marginBottom:24,padding:"14px 18px",background:"#f0fdf4",borderRadius:8,border:"1px solid #bbf7d0" }}>
            <div style={{ fontWeight:700,fontSize:12,marginBottom:8,color:"#14532d" }}>Services Included</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
              {p.services.map((s,i)=>(
                <span key={i} style={{ padding:"4px 12px",background:"#dcfce7",color:"#15803d",borderRadius:20,fontSize:11,fontWeight:600 }}>{s.name||s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {p.content && (
          <div style={{ marginBottom:28 }}>
            <div style={{ fontWeight:700,fontSize:13,marginBottom:10,borderBottom:"1px solid #e2e8f0",paddingBottom:8 }}>Proposal Details</div>
            <div style={{ fontSize:12,color:"#333",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{p.content}</div>
          </div>
        )}

        {/* Notes */}
        {p.notes && (
          <div style={{ marginBottom:24,padding:"12px 16px",background:"#fffbeb",borderRadius:8,border:"1px solid #fde68a" }}>
            <div style={{ fontWeight:700,fontSize:11,marginBottom:4,color:"#92400e" }}>ADDITIONAL NOTES</div>
            <div style={{ fontSize:11,color:"#78350f",lineHeight:1.7 }}>{p.notes}</div>
          </div>
        )}

        {/* Terms */}
        <div style={{ marginTop:16,borderTop:"1px solid #d1d5db",paddingTop:12 }}>
          <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>TERMS &amp; CONDITIONS</div>
          <ol style={{ margin:0,paddingLeft:18,fontSize:10,color:"#444",lineHeight:1.6 }}>
            <li>This proposal is valid until the date mentioned above.</li>
            <li>50% advance payment required before project commencement.</li>
            <li>Remaining 50% due within 30 days of project delivery.</li>
            <li>All applicable taxes (GST) will be added to the final invoice.</li>
            <li>Any scope changes may result in revised quotation.</li>
            <li>All payments in Indian Rupees (INR) via bank transfer or UPI.</li>
          </ol>
        </div>

        {/* Account Details */}
        <div style={{ marginTop:14,borderTop:"1px solid #d1d5db",paddingTop:12 }}>
          <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>ACCOUNT DETAILS</div>
          <div style={{ fontSize:10,lineHeight:1.7,color:"#333" }}>
            <strong>Firm Name:</strong> {company.name} &nbsp;|&nbsp;
            <strong>Bank:</strong> HDFC &nbsp;|&nbsp;
            <strong>A/C:</strong> 50200054829505 &nbsp;|&nbsp;
            <strong>IFSC:</strong> HDFC0002706<br/>
            <strong>UPI:</strong> 9021073372@hdfcbank &nbsp;|&nbsp;
            <strong>Phone:</strong> +91 {company.phone} &nbsp;|&nbsp;
            <strong>Email:</strong> {company.email}
          </div>
        </div>

        {/* Signature */}
        <div style={{ marginTop:20,display:"flex",justifyContent:"space-between",gap:40 }}>
          <div style={{ flex:1,borderTop:"1px solid #111",paddingTop:8,textAlign:"center",fontSize:10,color:"#64748b" }}>
            Authorized Signature<br/><strong>{company.name}</strong>
          </div>
          <div style={{ flex:1,borderTop:"1px solid #111",paddingTop:8,textAlign:"center",fontSize:10,color:"#64748b" }}>
            Client Signature &amp; Date<br/><strong>{p.client_name_snapshot||"Client"}</strong>
          </div>
        </div>
        <div style={{ textAlign:"center",marginTop:14,fontSize:10,color:"#64748b",borderTop:"1px solid #e2e8f0",paddingTop:10 }}>
          This is a Computer Generated Proposal — {company.name}
        </div>
      </div>

      {showCopy    && <CopyModal p={p} projects={projects} onClose={()=>setShowCopy(false)} onDone={()=>{ setShowCopy(false); showToast("Copy created!"); setTimeout(()=>router.replace("/crm/dashboard/proposals"),1500); }}/>}
      {showHistory && <HistoryPanel entityType="proposal" entityId={id} onClose={()=>setShowHistory(false)}/>}
      <style>{`@media print{aside,header,.no-print{display:none!important}html,body{background:#fff!important;margin:0!important;padding:0!important}.crm-layout{display:block!important;height:auto!important;overflow:visible!important}.crm-main{display:block!important;width:100%!important;overflow:visible!important}.crm-content{padding:0!important;overflow:visible!important;height:auto!important}#crm-pdf-document{box-shadow:none!important;margin:0 auto!important;width:100%!important;max-width:100%!important}@page{size:A4 portrait;margin:10mm 12mm}}body{background:#f1f5f9}`}</style>
    </>
  );
}

