"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import CRM_API from "@/utils/crmApi";
import { downloadPdf } from "@/utils/downloadPdf";
import { LOGO_BASE64 } from "@/utils/logoBase64";
import SendModal from "@/components/crm/SendToCustomerModal";

// ── Company defaults (overridden by CRM Settings if available) ────────────────
const DEFAULT_COMPANY = {
  name:"Subham General Store", address:"270/1, Swami Vivekanand Ward, Budhapara, Dani Wada, Raipur",
  city:"Raipur, Chhattisgarh India 492001", phone:"9302279701", email:"info@Subham Storesocial.com",
  gstin:"22AARFD5166H1ZB", state:"Chhattisgarh", state_code:"22",
  bank_name:"HDFC Bank", account_name:"Subham General Store", account_no:"50200054829505",
  ifsc:"HDFC0002706", upi:"9021073372@hdfcbank", logo:"/assets/imgs/template/logo.png",
};

const fmt  = (n) => `₹ ${Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
const INR  = (n) => Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2});
const thS  = (a="left",p="10px") => ({ textAlign:a, padding:p, border:"1px solid #d1d5db", fontWeight:700, fontSize:11, background:"#f1f5f9", textTransform:"uppercase", letterSpacing:".03em" });
const tdS  = (a="left") => ({ textAlign:a, padding:"10px", border:"1px solid #e2e8f0", verticalAlign:"top" });
const tdSm = (a="left") => ({ textAlign:a, padding:"6px 10px", border:"1px solid #d1d5db", fontSize:11 });

const STATUS_COLORS = {
  draft:      { bg:"#f1f5f9", color:"#475569" },
  sent:       { bg:"#dbeafe", color:"#1d4ed8" },
  approved:   { bg:"#dcfce7", color:"#15803d" },
  rejected:   { bg:"#fee2e2", color:"#dc2626" },
  superseded: { bg:"#f1f5f9", color:"#94a3b8" },
};

// ── Copy Modal ─────────────────────────────────────────────────────────────────
function CopyModal({ q, projects, onClose, onDone }) {
  const [form, setForm] = useState({ project: q.project?.id || q.project || "", valid_until:"", notes: q.notes||"" });
  const [items, setItems] = useState(q.items?.map(i=>({ description:i.description||"", quantity:i.quantity||1, unit_price:i.unit_price||0, total_price:i.total_price||0 }))||[]);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const updateItem = (i, k, v) => setItems(prev => prev.map((it, idx) => {
    if (idx!==i) return it;
    const u = { ...it, [k]:v };
    u.total_price = (Number(u.quantity)||0) * (Number(u.unit_price)||0);
    return u;
  }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      // Create new quotation as copy
      const payload = {
        project: form.project,
        valid_until: form.valid_until,
        notes: form.notes,
        status: "draft",
        discount_type: q.discount_type,
        discount_value: q.discount_value,
        cgst_rate: q.cgst_rate,
        sgst_rate: q.sgst_rate,
        igst_rate: q.igst_rate,
        hsn_sac: q.hsn_sac,
        place_of_supply: q.place_of_supply,
        items: items.filter(i=>i.description),
      };
      await CRM_API.post("/quotations", payload);
      onDone();
    } catch(e) { setErr(e.response?.data?.message||"Copy failed"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.5)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:16 }}>
      <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:660,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.2)",fontFamily:"'Inter',sans-serif" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 24px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
          <div>
            <h2 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>Copy Quotation</h2>
            <p style={{ fontSize:12,color:"#64748b",margin:"3px 0 0" }}>Creates a new Draft copy of {q.quote_number}</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:6,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ padding:24 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:14 }}>{err}</div>}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16 }}>
            <div>
              <label style={{ display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 }}>Project</label>
              <select value={form.project} onChange={e=>setForm(p=>({...p,project:e.target.value}))} style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
                {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 }}>Valid Until</label>
              <input type="date" value={form.valid_until} onChange={e=>setForm(p=>({...p,valid_until:e.target.value}))} style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}/>
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
              <label style={{ fontSize:12,fontWeight:700,color:"#374151" }}>Line Items (editable)</label>
              <button type="button" onClick={()=>setItems(p=>[...p,{description:"",quantity:1,unit_price:0,total_price:0}])} style={{ padding:"4px 12px",background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer" }}>+ Add</button>
            </div>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,border:"1px solid #e2e8f0",borderRadius:8,overflow:"hidden" }}>
              <thead>
                <tr style={{ background:"#f8fafc" }}>
                  {["Description","Qty","Rate (₹)","Total",""].map(h=><th key={h} style={{ padding:"8px 10px",textAlign:"left",fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0" }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((it,i)=>(
                  <tr key={i}>
                    <td style={{ padding:"5px 8px" }}><input value={it.description} onChange={e=>updateItem(i,"description",e.target.value)} style={{ width:"100%",padding:"5px 8px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,outline:"none",fontFamily:"inherit" }}/></td>
                    <td style={{ padding:"5px 8px",width:55 }}><input type="number" min="1" value={it.quantity} onChange={e=>updateItem(i,"quantity",e.target.value)} style={{ width:"100%",padding:"5px 7px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,outline:"none",textAlign:"right",fontFamily:"inherit" }}/></td>
                    <td style={{ padding:"5px 8px",width:110 }}><input type="number" min="0" value={it.unit_price} onChange={e=>updateItem(i,"unit_price",e.target.value)} style={{ width:"100%",padding:"5px 7px",border:"1px solid #e2e8f0",borderRadius:5,fontSize:12,outline:"none",textAlign:"right",fontFamily:"inherit" }}/></td>
                    <td style={{ padding:"5px 8px",fontWeight:700,textAlign:"right",fontSize:12,whiteSpace:"nowrap",color:"#0f172a" }}>₹{Number(it.total_price||0).toLocaleString("en-IN")}</td>
                    <td style={{ padding:"5px 8px",width:28 }}>{items.length>1&&<button type="button" onClick={()=>setItems(p=>p.filter((_,idx)=>idx!==i))} style={{ background:"none",border:"none",color:"#dc2626",cursor:"pointer",fontSize:16 }}>✕</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign:"right",marginTop:6,fontSize:12,color:"#64748b" }}>
              Subtotal: <strong style={{ color:"#0f172a" }}>₹{items.reduce((s,i)=>s+(Number(i.total_price)||0),0).toLocaleString("en-IN")}</strong>
            </div>
          </div>

          <div>
            <label style={{ display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 }}>Notes</label>
            <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} rows={2} style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit" }}/>
          </div>

          <div style={{ display:"flex",justifyContent:"flex-end",gap:10,marginTop:18,paddingTop:16,borderTop:"1px solid #f1f5f9" }}>
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
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CRM_API.get(`/history?entity_type=${entityType}&entity_id=${entityId}&limit=50`)
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff/60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m/60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  const ACTION_COLORS = {
    created:        { bg:"#dcfce7", color:"#15803d" },
    updated:        { bg:"#dbeafe", color:"#1d4ed8" },
    status_changed: { bg:"#fef9c3", color:"#a16207" },
    deleted:        { bg:"#fee2e2", color:"#dc2626" },
    sent:           { bg:"#ede9fe", color:"#6d28d9" },
    approved:       { bg:"#dcfce7", color:"#15803d" },
    rejected:       { bg:"#fee2e2", color:"#dc2626" },
  };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:0 }}>
      <div style={{ background:"#fff",width:"100%",maxWidth:380,height:"100vh",overflowY:"auto",boxShadow:"-8px 0 32px rgba(0,0,0,.12)",fontFamily:"'Inter',sans-serif",display:"flex",flexDirection:"column" }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
          <div>
            <h3 style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:0 }}>📋 Activity History</h3>
            <p style={{ fontSize:12,color:"#64748b",margin:"3px 0 0" }}>All changes and actions</p>
          </div>
          <button onClick={onClose} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:6,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        </div>
        <div style={{ flex:1,padding:"16px 20px",display:"flex",flexDirection:"column",gap:10 }}>
          {loading ? (
            <div style={{ textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:13 }}>Loading history…</div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign:"center",padding:"40px 0",color:"#94a3b8",fontSize:13 }}>No history yet.</div>
          ) : logs.map((log, i) => {
            const ac = ACTION_COLORS[log.action] || { bg:"#f1f5f9",color:"#475569" };
            return (
              <div key={log.id||i} style={{ background:"#f8fafc",borderRadius:10,padding:"12px 14px",border:"1px solid #f1f5f9" }}>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                  <span style={{ display:"inline-flex",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"capitalize",background:ac.bg,color:ac.color }}>
                    {log.action?.replace(/_/g," ")}
                  </span>
                  <span style={{ fontSize:11,color:"#94a3b8",marginLeft:"auto" }}>{timeAgo(log.created_at)}</span>
                </div>
                {log.description && <p style={{ fontSize:12,color:"#374151",margin:"0 0 4px",lineHeight:1.5 }}>{log.description}</p>}
                <p style={{ fontSize:11,color:"#94a3b8",margin:0 }}>
                  By <strong style={{ color:"#475569" }}>{log.actor_name||"System"}</strong>
                  {" · "}{new Date(log.created_at).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true})}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function QuotationPrintPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [q,        setQ]        = useState(null);
  const [items,    setItems]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [company,  setCompany]  = useState(DEFAULT_COMPANY);

  const [showCopy,    setShowCopy]    = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSend,    setShowSend]    = useState(false);
  const [statusSaving,setStatusSaving]= useState(false);
  const [toast,       setToast]       = useState(null);
  const [downloading, setDownloading] = useState(false);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    try {
      const [{ data: qData }, { data: proj }] = await Promise.all([
        CRM_API.get(`/quotations/${id}`),
        CRM_API.get("/projects"),
      ]);
      setQ(qData);
      setItems(Array.isArray(qData.items) ? qData.items : []);
      setProjects(proj);
      // Try load company settings
      try {
        const { data: s } = await CRM_API.get("/settings");
        if (s.company_name) setCompany({
          name:        s.company_name,
          address:     s.company_address,
          city:        `${s.company_city}, ${s.company_state} India ${s.company_pincode}`,
          phone:       s.company_phone,
          email:       s.company_email,
          gstin:       s.gstin,
          state:       s.company_state,
          state_code:  s.state_code,
          bank_name:   s.bank_name,
          account_name:s.account_name,
          account_no:  s.account_number,
          ifsc:        s.ifsc_code,
          upi:         s.upi_id,
          logo:        s.company_logo || DEFAULT_COMPANY.logo,
        });
      } catch {}
    } catch { router.replace("/crm/dashboard/quotations"); }
    finally { setLoading(false); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (newStatus) => {
    if (!q || statusSaving) return;
    setStatusSaving(true);
    try {
      const { data } = await CRM_API.patch(`/quotations/${id}`, { status: newStatus });
      setQ(data);
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
  if (!q) return null;

  const hasGST = q.cgst_rate > 0 || q.sgst_rate > 0 || q.igst_rate > 0;
  const isIGST = q.igst_rate > 0 && q.sgst_rate === 0;
  const sc     = STATUS_COLORS[q.status] || STATUS_COLORS.draft;

  const STATUS_ACTIONS = [
    { label:"Draft",    value:"draft",    show: q.status !== "draft" },
    { label:"Sent",     value:"sent",     show: ["draft"].includes(q.status) },
    { label:"Approved", value:"approved", show: ["draft","sent"].includes(q.status) },
    { label:"Rejected", value:"rejected", show: ["sent"].includes(q.status) },
  ].filter(a => a.show);

  return (
    <>
      {/* ── ACTION BAR ── */}
      <div className="no-print" style={{ position:"fixed",top:0,left:0,right:0,zIndex:100,background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"10px 20px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",fontFamily:"'Inter',sans-serif",boxShadow:"0 1px 6px rgba(0,0,0,.06)" }}>
        {/* Left */}
        <button onClick={() => router.back()} style={{ padding:"7px 14px",background:"#f1f5f9",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>← Back</button>
        <span style={{ fontSize:14,fontWeight:700,color:"#0f172a" }}>{q.quote_number}</span>
        <span style={{ padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,textTransform:"capitalize",background:sc.bg,color:sc.color }}>{q.status}</span>

        {/* Status Actions */}
        {STATUS_ACTIONS.map(a => (
          <button key={a.value} onClick={() => changeStatus(a.value)} disabled={statusSaving}
            style={{ padding:"7px 14px",background:a.value==="approved"?"#dcfce7":a.value==="rejected"?"#fee2e2":a.value==="sent"?"#dbeafe":"#f1f5f9",color:a.value==="approved"?"#15803d":a.value==="rejected"?"#dc2626":a.value==="sent"?"#1d4ed8":"#475569",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:statusSaving?"not-allowed":"pointer",opacity:statusSaving?.6:1 }}>
            {statusSaving?"…":a.label+" →"}
          </button>
        ))}

        {/* Right Actions */}
        <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center" }}>
          <button onClick={()=>setShowHistory(true)} style={{ padding:"7px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            📋 History
          </button>
          <button onClick={()=>setShowCopy(true)} style={{ padding:"7px 14px",background:"#fffbeb",border:"1px solid #fde68a",color:"#b45309",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            📄 Copy
          </button>
          <button onClick={()=>setShowSend(true)} style={{ padding:"7px 14px",background:q.send?.sent?"#dcfce7":"#eff6ff",border:q.send?.sent?"1px solid #86efac":"1px solid #bfdbfe",color:q.send?.sent?"#15803d":"#1d4ed8",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            {q.send?.sent ? "✓ Sent to Customer" : "📧 Send to Customer"}
          </button>
          <button
            onClick={() => downloadPdf("crm-pdf-document", q.quote_number, ()=>setDownloading(true), ()=>{ setDownloading(false); showToast("PDF downloaded!"); })}
            disabled={downloading}
            style={{ padding:"8px 18px",background:downloading?"#86efac":"#16a34a",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:downloading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,opacity:downloading?.7:1 }}>
            {downloading ? "⏳ Generating…" : "⬇️ Download PDF"}
          </button>
          <button onClick={() => window.print()} style={{ padding:"8px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
            🖨️ Print
          </button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className="no-print" style={{ position:"fixed",bottom:24,right:24,zIndex:3000,padding:"12px 20px",borderRadius:10,fontSize:13,fontWeight:600,color:"#fff",background:toast.type==="error"?"#dc2626":"#16a34a",boxShadow:"0 4px 16px rgba(0,0,0,.15)",animation:"fadeIn .2s ease" }}>
          {toast.type==="error"?"✗":"✓"} {toast.msg}
        </div>
      )}

      {/* ── DOCUMENT ── */}
      <div id="crm-pdf-document" style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        fontSize: 12,
        color: "#111",
        maxWidth: 794,
        margin: "70px auto 40px",
        padding: "32px 40px",
        background: "#fff",
        boxShadow: "0 0 24px rgba(0,0,0,.08)",
        lineHeight: 1.5,
        boxSizing: "border-box",
      }}>

        {/* Header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,borderBottom:"2px solid #111",paddingBottom:16 }}>
          <div>
            <div style={{ fontSize:22,fontWeight:700,marginBottom:2 }}>Quotation</div>
            <div style={{ fontSize:16,fontWeight:700 }}>{company.name}</div>
            <div style={{ fontSize:11,color:"#444",marginTop:4,lineHeight:1.7 }}>
              {company.address}<br/>{company.city}<br/>
              Phone Number: {company.phone}<br/>
              <strong>GSTIN :</strong> {company.gstin}<br/>
              <strong>State Name:</strong> {company.state} &nbsp;<strong>Code:</strong> {company.state_code}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <img src={LOGO_BASE64} alt="Logo" style={{ height:55, objectFit:"contain", maxWidth:180, display:"block", marginLeft:"auto" }} />
          </div>
        </div>

        {/* Bill To + Meta */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontWeight:700,marginBottom:6,fontSize:12,textTransform:"uppercase",letterSpacing:".04em" }}>Quote To</div>
            <div style={{ fontWeight:700,fontSize:13 }}>{q.client_name_snapshot||"—"}</div>
            {q.client_address_snapshot && <div style={{ fontSize:11,color:"#444",marginTop:3,lineHeight:1.6 }}>{q.client_address_snapshot}</div>}
            {q.billing_address && q.billing_address !== q.client_address_snapshot && <div style={{ fontSize:11,color:"#444",lineHeight:1.6 }}>{q.billing_address}</div>}
            {q.client_gstin_snapshot && (
              <div style={{ fontSize:11,marginTop:4 }}>
                <strong>GSTIN :</strong> {q.client_gstin_snapshot}
                {q.client_state_snapshot && <><br/><strong>State Name:</strong> {q.client_state_snapshot}</>}
              </div>
            )}
          </div>
          <div style={{ textAlign:"right",minWidth:220 }}>
            <table style={{ marginLeft:"auto",borderCollapse:"collapse",fontSize:12 }}>
              <tbody>
                {[["QUOTATION NO",q.quote_number],["DATE",fmtD(q.created_at)],["VALID UNTIL",fmtD(q.valid_until)]].map(([l,v])=>(
                  <tr key={l}><td style={{ fontWeight:700,paddingRight:16,paddingBottom:4,color:"#444",fontSize:11,textTransform:"uppercase" }}>{l}</td><td style={{ fontWeight:600,paddingBottom:4 }}>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {hasGST && <div style={{ marginBottom:14,fontSize:11 }}><strong>PLACE OF SUPPLY</strong><br/>{q.place_of_supply||company.state}</div>}

        {/* Line Items */}
        <table style={{ width:"100%",borderCollapse:"collapse",marginBottom:0,fontSize:12 }}>
          <thead>
            <tr style={{ background:"#f1f5f9" }}>
              <th style={thS("left")}>Products</th>
              <th style={thS("left")}>Description</th>
              <th style={thS("center")}>Qty</th>
              <th style={thS("right")}>Unit Price</th>
              <th style={thS("right")}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length===0 ? (
              <tr><td colSpan={5} style={{ padding:"12px 10px",color:"#94a3b8",textAlign:"center" }}>No line items</td></tr>
            ) : items.map((it,i)=>(
              <tr key={i} style={{ borderBottom:"1px solid #e2e8f0" }}>
                <td style={tdS("left")}>
                  <div style={{ fontWeight:600 }}>{it.description||q.project_name_snapshot||"Service"}</div>
                  {hasGST && q.hsn_sac && <div style={{ fontSize:10,color:"#64748b",marginTop:2 }}>HSN/SAC : {q.hsn_sac}</div>}
                </td>
                <td style={tdS("left")}>{it.description}</td>
                <td style={tdS("center")}>{Number(it.quantity||1).toFixed(2)}</td>
                <td style={tdS("right")}>{fmt(it.unit_price)}</td>
                <td style={tdS("right")}>{fmt(it.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:0 }}>
          <tbody>
            {[
              ["Subtotal",            fmt(q.subtotal),      false],
              Number(q.discount_amount)>0 ? ["Discount",   `- ${fmt(q.discount_amount)}`, false] : null,
              hasGST&&!isIGST&&Number(q.cgst_amount)>0 ? [`CGST (${q.cgst_rate}%)`, fmt(q.cgst_amount), false] : null,
              hasGST&&!isIGST&&Number(q.sgst_amount)>0 ? [`SGST (${q.sgst_rate}%)`, fmt(q.sgst_amount), false] : null,
              hasGST&&isIGST&&Number(q.igst_amount)>0  ? [`IGST (${q.igst_rate}%)`, fmt(q.igst_amount), false] : null,
              ["Total",               fmt(q.grand_total),   true],
            ].filter(Boolean).map(([label,val,bold],i)=>(
              <tr key={i} style={bold?{borderTop:"2px solid #111",background:"#f8fafc"}:{borderTop:"1px solid #e2e8f0"}}>
                <td style={{ width:"60%",border:"none" }}/>
                <td style={{ textAlign:"right",padding:"6px 10px",color:bold?"#111":"#64748b",fontWeight:bold?700:400 }}>{label}</td>
                <td style={{ textAlign:"right",padding:"6px 10px",fontWeight:bold?700:400,fontSize:bold?14:12,minWidth:100 }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* GST Breakdown */}
        {hasGST && (
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:11,marginTop:14,border:"1px solid #d1d5db" }}>
            <thead>
              <tr style={{ background:"#f1f5f9" }}>
                <th style={thS("center","8px 10px")}>HSN/SAC</th>
                <th style={thS("right","8px 10px")}>Taxable Value</th>
                {!isIGST?(<><th style={thS("center","8px 10px")} colSpan={2}>Central Tax</th><th style={thS("center","8px 10px")} colSpan={2}>State Tax</th></>):(<th style={thS("center","8px 10px")} colSpan={2}>Integrated Tax</th>)}
                <th style={thS("right","8px 10px")}>Total Tax Amount</th>
              </tr>
              <tr style={{ background:"#f8fafc",fontSize:10 }}>
                <td style={tdSm("center")}/><td style={tdSm("right")}/>
                {!isIGST?(<><td style={tdSm("center")}>Rate</td><td style={tdSm("right")}>Amount</td><td style={tdSm("center")}>Rate</td><td style={tdSm("right")}>Amount</td></>):(<><td style={tdSm("center")}>Rate</td><td style={tdSm("right")}>Amount</td></>)}
                <td style={tdSm("right")}/>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdSm("center")}>{q.hsn_sac||"998319"}</td>
                <td style={tdSm("right")}>{INR(q.taxable_amount||q.subtotal)}</td>
                {!isIGST?(<><td style={tdSm("center")}>{q.cgst_rate}%</td><td style={tdSm("right")}>{INR(q.cgst_amount)}</td><td style={tdSm("center")}>{q.sgst_rate}%</td><td style={tdSm("right")}>{INR(q.sgst_amount)}</td></>):(<><td style={tdSm("center")}>{q.igst_rate}%</td><td style={tdSm("right")}>{INR(q.igst_amount)}</td></>)}
                <td style={tdSm("right")}>{INR(q.total_tax)}</td>
              </tr>
              <tr style={{ fontWeight:700,background:"#f1f5f9" }}>
                <td style={tdSm("center")}>Total</td><td style={tdSm("right")}>{INR(q.taxable_amount||q.subtotal)}</td>
                {!isIGST?(<><td style={tdSm("center")}/><td style={tdSm("right")}>{INR(q.cgst_amount)}</td><td style={tdSm("center")}/><td style={tdSm("right")}>{INR(q.sgst_amount)}</td></>):(<><td style={tdSm("center")}/><td style={tdSm("right")}>{INR(q.igst_amount)}</td></>)}
                <td style={tdSm("right")}>{INR(q.total_tax)}</td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Terms */}
        <div style={{ marginTop:16,borderTop:"1px solid #d1d5db",paddingTop:12 }}>
          <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>TERMS &amp; CONDITIONS</div>
          <ol style={{ margin:0,paddingLeft:18,fontSize:10,color:"#444",lineHeight:1.6 }}>
            <li>This quotation is valid until the date mentioned above.</li>
            <li>Payment Due: 30 days from invoice date.</li>
            <li>Late Payment: 1.5% per month on unpaid balance.</li>
            <li>All applicable taxes have been included.</li>
            <li>Disputes must be communicated within 15 days of receipt.</li>
            <li>All payments in Indian Rupees (INR).</li>
          </ol>
        </div>

        {/* Account Details */}
        <div style={{ marginTop:14,borderTop:"1px solid #d1d5db",paddingTop:12 }}>
          <div style={{ fontWeight:700,fontSize:11,marginBottom:6 }}>ACCOUNT DETAILS</div>
          <div style={{ fontSize:10,lineHeight:1.7,color:"#333" }}>
            <strong>Firm Name-</strong> {company.account_name}<br/>
            <strong>Bank:</strong> {company.bank_name} &nbsp;<strong>Account name:</strong> {company.account_name}<br/>
            <strong>Account no.:</strong> {company.account_no} &nbsp;<strong>IFSC:</strong> {company.ifsc}<br/>
            <strong>For UPI Payments:</strong> {company.upi}
          </div>
        </div>
        <div style={{ fontSize:10,lineHeight:1.7,color:"#333",marginTop:8 }}>
          <strong>Contact:</strong> +91 {company.phone} &nbsp;|&nbsp; {company.email}
        </div>
        {q.notes && <div style={{ marginTop:10,padding:"8px 12px",background:"#f8fafc",borderRadius:4,fontSize:10,color:"#444" }}><strong>Notes:</strong> {q.notes}</div>}
        <div style={{ textAlign:"center",marginTop:16,fontSize:10,color:"#64748b",borderTop:"1px solid #e2e8f0",paddingTop:10 }}>
          This is a Computer Generated Quotation
        </div>
      </div>

      {/* Modals */}
      {showCopy && <CopyModal q={q} projects={projects} onClose={()=>setShowCopy(false)} onDone={()=>{ setShowCopy(false); showToast("Copy created! Redirecting…"); setTimeout(()=>router.replace("/crm/dashboard/quotations"),1500); }}/>}
      {showHistory && <HistoryPanel entityType="quotation" entityId={id} onClose={()=>setShowHistory(false)}/>}
      {showSend && <SendModal kind="quotation" doc={q} onClose={()=>setShowSend(false)} onDone={(updated)=>{ setShowSend(false); setQ(updated); showToast("Sent to customer!"); }}/>}

      <style>{`
        @media print {
          aside, header, .no-print { display: none !important; }
          html, body { background: #fff !important; margin: 0 !important; padding: 0 !important; }
          .crm-layout { display: block !important; height: auto !important; overflow: visible !important; }
          .crm-main   { display: block !important; width: 100% !important; overflow: visible !important; }
          .crm-content{ padding: 0 !important; overflow: visible !important; height: auto !important; }
          #crm-pdf-document { box-shadow: none !important; margin: 0 auto !important; width: 100% !important; max-width: 100% !important; }
          @page { size: A4 portrait; margin: 10mm 12mm; }
        }
        body { background: #f1f5f9; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
      `}</style>
    </>
  );
}

