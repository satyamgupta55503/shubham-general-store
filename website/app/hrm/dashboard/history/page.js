"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Clock, RefreshCw, Trash2, AlertTriangle } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const ACTION_COLORS = {
  created:           { bg:"#dcfce7", c:"#15803d" },
  updated:           { bg:"#dbeafe", c:"#1d4ed8" },
  deleted:           { bg:"#fee2e2", c:"#dc2626" },
  approved:          { bg:"#dcfce7", c:"#15803d" },
  rejected:          { bg:"#fee2e2", c:"#dc2626" },
  login:             { bg:"#f1f5f9", c:"#475569" },
  logout:            { bg:"#f1f5f9", c:"#475569" },
  payroll_processed: { bg:"#ede9fe", c:"#5b21b6" },
  access_granted:    { bg:"#ccfbf1", c:"#0f766e" },
  access_revoked:    { bg:"#fee2e2", c:"#dc2626" },
  status_changed:    { bg:"#fef9c3", c:"#a16207" },
  password_changed:  { bg:"#ffedd5", c:"#c2410c" },
};

const ENTITY_TYPES = ["employee","department","designation","attendance","leave","payroll","salary_slip","user"];
const ACTION_TYPES = Object.keys(ACTION_COLORS);

export default function HrmHistoryPage() {
  const [logs,    setLogs]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [filter,  setFilter]  = useState({ entity_type:"", action:"" });
  const [loading, setLoading] = useState(false);
  const [hrmUser, setHrmUser] = useState({});
  /* delete state */
  const [deleting,    setDeleting]    = useState(null); // id being deleted
  const [clearModal,  setClearModal]  = useState(false);
  const [clearing,    setClearing]    = useState(false);
  const [clearMsg,    setClearMsg]    = useState("");

  const LIMIT = 50;

  useEffect(()=>{
    try { const u=JSON.parse(localStorage.getItem("hrm_user")||"{}"); setHrmUser(u); } catch {}
  },[]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await HRM_API.get("/history", { params:{ ...filter, limit:LIMIT, page } });
      setLogs(data.logs||[]); setTotal(data.total||0);
    } catch {} finally { setLoading(false); }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filter]);

  /* Delete single log */
  const handleDeleteOne = async (id) => {
    setDeleting(id);
    try {
      await HRM_API.delete(`/history/${id}`);
      setLogs(prev => prev.filter(l => (l.id||l._id) !== id));
      setTotal(prev => prev - 1);
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed");
    } finally { setDeleting(null); }
  };

  /* Clear all (with current filter applied) */
  const handleClearAll = async () => {
    setClearing(true); setClearMsg("");
    try {
      const body = {};
      if (filter.entity_type) body.entity_type = filter.entity_type;
      if (filter.action)      body.action      = filter.action;
      const { data } = await HRM_API.delete("/history/clear", { data: body });
      setClearMsg(`✅ ${data.deleted} record(s) deleted`);
      setClearModal(false);
      load();
    } catch (e) {
      setClearMsg("❌ " + (e.response?.data?.message || "Failed"));
    } finally { setClearing(false); setTimeout(()=>setClearMsg(""),3000); }
  };

  const fmtDT = (d) => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
  const pages = Math.ceil(total/LIMIT);
  const isAdmin = hrmUser.role === "hr_admin";
  const selStyle = { padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,background:"#f8fafc",outline:"none",fontFamily:"inherit" };

  /* What will be deleted on Clear All */
  const clearScope = filter.entity_type || filter.action
    ? `filtered records (${[filter.entity_type, filter.action].filter(Boolean).join(" + ")})`
    : "ALL history records";

  return (
    <div>
      {/* Header */}
      <div className="hrm-page-header">
        <div>
          <h1 className="hrm-page-title">Activity History</h1>
          <p className="hrm-page-sub">{total} records</p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <button onClick={load} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={14}/></button>
          {isAdmin && (
            <button onClick={()=>setClearModal(true)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#fee2e2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}>
              <Trash2 size={14}/> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Clear feedback */}
      {clearMsg && (
        <div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:clearMsg.startsWith("✅")?"#dcfce7":"#fee2e2",color:clearMsg.startsWith("✅")?"#15803d":"#dc2626" }}>
          {clearMsg}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <select value={filter.entity_type} onChange={e=>setFilter(p=>({...p,entity_type:e.target.value}))} style={selStyle}>
          <option value="">All Entities</option>
          {ENTITY_TYPES.map(e=><option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
        </select>
        <select value={filter.action} onChange={e=>setFilter(p=>({...p,action:e.target.value}))} style={selStyle}>
          <option value="">All Actions</option>
          {ACTION_TYPES.map(a=><option key={a} value={a}>{a.replace(/_/g," ")}</option>)}
        </select>
        {(filter.entity_type || filter.action) && (
          <button onClick={()=>setFilter({entity_type:"",action:""})} style={{ fontSize:12,color:"#7c3aed",fontWeight:600,background:"#f5f3ff",border:"1px solid #ddd6fe",borderRadius:8,padding:"7px 12px",cursor:"pointer" }}>
            ✕ Clear Filter
          </button>
        )}
      </div>

      {/* Logs list */}
      <div className="hrm-card">
        {loading ? (
          <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>
            <Clock size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/>
            <p style={{ margin:0 }}>No activity records</p>
          </div>
        ) : (
          logs.map((l, i) => {
            const ac = ACTION_COLORS[l.action] || { bg:"#f1f5f9", c:"#475569" };
            const id = l.id || l._id;
            return (
              <div key={id||i} style={{ display:"flex",alignItems:"flex-start",gap:14,padding:"14px 20px",borderBottom:"1px solid #f8fafc" }}>
                {/* Color dot */}
                <div style={{ width:8,height:8,borderRadius:"50%",background:ac.c,marginTop:7,flexShrink:0 }}/>

                {/* Content */}
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4 }}>
                    <span style={{ display:"inline-flex",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"capitalize",background:ac.bg,color:ac.c }}>{l.action?.replace(/_/g," ")}</span>
                    <span style={{ background:"#f1f5f9",color:"#475569",padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:600,textTransform:"capitalize" }}>{l.entity_type}</span>
                    {l.entity_label && <span style={{ fontWeight:600,color:"#0f172a",fontSize:13 }}>"{l.entity_label}"</span>}
                  </div>
                  {l.description && <p style={{ fontSize:12,color:"#64748b",margin:"0 0 3px" }}>{l.description}</p>}
                  <div style={{ fontSize:11,color:"#94a3b8" }}>
                    By <strong style={{ color:"#475569" }}>{l.actor_name||"System"}</strong> · {fmtDT(l.created_at)}
                  </div>
                </div>

                {/* Per-row delete (admin only) */}
                {isAdmin && (
                  <button
                    onClick={()=>handleDeleteOne(id)}
                    disabled={deleting === id}
                    style={{ padding:6,background:"#fff",border:"1px solid #fecaca",color:"#dc2626",borderRadius:6,cursor:"pointer",flexShrink:0,opacity:deleting===id?0.5:1,transition:"all .15s" }}
                    title="Delete this record"
                    onMouseEnter={e=>e.currentTarget.style.background="#fee2e2"}
                    onMouseLeave={e=>e.currentTarget.style.background="#fff"}
                  >
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display:"flex",justifyContent:"center",gap:8,marginTop:16,alignItems:"center" }}>
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="hrm-btn hrm-btn-outline hrm-btn-sm" style={{ opacity:page<=1?.5:1 }}>← Prev</button>
          <span style={{ padding:"7px 14px",fontSize:13,color:"#64748b" }}>Page {page} of {pages}</span>
          <button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="hrm-btn hrm-btn-outline hrm-btn-sm" style={{ opacity:page>=pages?.5:1 }}>Next →</button>
        </div>
      )}

      {/* ── CLEAR ALL CONFIRMATION MODAL ── */}
      {clearModal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:420 }}>
            <div className="hrm-modal-header">
              <h2 className="hrm-modal-title">Clear History</h2>
              <button className="hrm-close-btn" onClick={()=>setClearModal(false)}>✕</button>
            </div>
            <div className="hrm-modal-body">
              <div style={{ display:"flex",gap:12,alignItems:"flex-start",padding:"14px 16px",background:"#fff7ed",borderRadius:10,border:"1px solid #fed7aa",marginBottom:16 }}>
                <AlertTriangle size={20} color="#ea580c" style={{ flexShrink:0,marginTop:1 }}/>
                <div>
                  <div style={{ fontSize:14,fontWeight:700,color:"#9a3412",marginBottom:4 }}>This action cannot be undone!</div>
                  <div style={{ fontSize:13,color:"#c2410c" }}>
                    You are about to permanently delete <strong>{clearScope}</strong>.
                    {!filter.entity_type && !filter.action && <span> This will delete <strong>all {total} records</strong>.</span>}
                  </div>
                </div>
              </div>

              {/* Show what filters are active */}
              {(filter.entity_type || filter.action) && (
                <div style={{ background:"#f8fafc",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#374151",marginBottom:12 }}>
                  <strong>Current filter:</strong>
                  {filter.entity_type && <span style={{ marginLeft:8,padding:"2px 9px",borderRadius:20,background:"#ede9fe",color:"#5b21b6",fontSize:11,fontWeight:700 }}>{filter.entity_type}</span>}
                  {filter.action && <span style={{ marginLeft:6,padding:"2px 9px",borderRadius:20,background:"#dbeafe",color:"#1d4ed8",fontSize:11,fontWeight:700 }}>{filter.action.replace(/_/g," ")}</span>}
                  <div style={{ fontSize:11,color:"#94a3b8",marginTop:6 }}>Only filtered records will be deleted.</div>
                </div>
              )}

              <p style={{ fontSize:13,color:"#374151",margin:0 }}>Are you sure you want to proceed?</p>
            </div>
            <div className="hrm-modal-footer">
              <button onClick={()=>setClearModal(false)} className="hrm-btn hrm-btn-outline">Cancel</button>
              <button onClick={handleClearAll} disabled={clearing}
                style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 20px",background:"#dc2626",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer",opacity:clearing?0.6:1 }}>
                <Trash2 size={14}/>{clearing?"Deleting…":"Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
