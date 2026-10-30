"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Check, X, RefreshCw } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const STATUS_STYLE = { pending:{bg:"#fef9c3",c:"#a16207"}, approved:{bg:"#dcfce7",c:"#15803d"}, rejected:{bg:"#fee2e2",c:"#dc2626"}, cancelled:{bg:"#f1f5f9",c:"#475569"} };
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

export default function HrmLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [types,  setTypes]  = useState([]);
  const [tab,    setTab]    = useState("requests");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectNote,  setRejectNote]  = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data:l }, { data:t }] = await Promise.all([
        HRM_API.get("/leaves", { params:{ status:filterStatus||undefined } }),
        HRM_API.get("/leaves/types"),
      ]);
      setLeaves(l.leaves||[]); setTypes(t||[]);
    } catch {} finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const review = async (id, status, note="") => {
    try { await HRM_API.patch(`/leaves/${id}/review`, { status, rejection_note:note }); setRejectModal(null); setRejectNote(""); load(); }
    catch (e) { alert(e.response?.data?.message||"Failed"); }
  };

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Leave Management</h1><p className="hrm-page-sub">{leaves.length} requests</p></div>
        <button className="hrm-btn hrm-btn-outline hrm-btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <div className="hrm-tabs" style={{ marginBottom:20 }}>
        {["requests","types"].map(t=>(
          <button key={t} className={`hrm-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)}>{t==="requests"?"Leave Requests":"Leave Types"}</button>
        ))}
      </div>

      {tab==="requests" && (
        <>
          <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
            {["","pending","approved","rejected","cancelled"].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} className={`hrm-btn hrm-btn-sm ${filterStatus===s?"hrm-btn-primary":"hrm-btn-outline"}`}>{s||"All"}</button>
            ))}
          </div>

          <div className="hrm-card">
            <div className="hrm-table-wrap">
              <table className="hrm-table">
                <thead><tr>{["Employee","Leave Type","Dates","Days","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
                  : leaves.length===0 ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No leave requests</td></tr>
                  : leaves.map(l=>{
                    const st = STATUS_STYLE[l.status]||{bg:"#f1f5f9",c:"#475569"};
                    return (
                      <tr key={l.id||l._id}>
                        <td>
                          <div style={{ fontWeight:600,color:"#0f172a",fontSize:13 }}>{l.employee?.full_name||l.employee_name_snapshot||"—"}</div>
                          <div style={{ fontSize:11,color:"#94a3b8" }}>{l.employee?.employee_id||""}</div>
                        </td>
                        <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#ede9fe",color:"#5b21b6" }}>{l.leave_type?.code||l.leave_type_code||"—"}</span></td>
                        <td style={{ fontSize:12,color:"#374151" }}>{fmtD(l.from_date)} → {fmtD(l.to_date)}</td>
                        <td style={{ fontWeight:600,color:"#0f172a" }}>{l.days}</td>
                        <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st.bg,color:st.c }}>{l.status}</span></td>
                        <td>
                          {l.status==="pending" && (
                            <div style={{ display:"flex",gap:5 }}>
                              <button onClick={()=>review(l.id||l._id,"approved")} style={{ padding:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:6,cursor:"pointer" }} title="Approve"><Check size={13}/></button>
                              <button onClick={()=>{ setRejectModal(l.id||l._id); setRejectNote(""); }} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Reject"><X size={13}/></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab==="types" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16 }}>
          {types.map(t=>(
            <div key={t.id||t._id} className="hrm-card" style={{ padding:18 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <span style={{ fontSize:22,fontWeight:800,color:"#7c3aed" }}>{t.code}</span>
                <span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:t.is_active?"#dcfce7":"#f1f5f9",color:t.is_active?"#15803d":"#475569" }}>{t.is_active?"Active":"Inactive"}</span>
              </div>
              <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 6px" }}>{t.name}</h3>
              <div style={{ display:"flex",gap:12,fontSize:12,color:"#64748b" }}>
                <span>Quota: {t.annual_quota}/yr</span>
                <span>{t.paid?"Paid":"Unpaid"}</span>
                {t.carry_forward && <span>CF: {t.max_carry}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:420 }}>
            <div className="hrm-modal-header"><h2 className="hrm-modal-title">Reject Leave</h2><button className="hrm-close-btn" onClick={()=>setRejectModal(null)}><X size={16}/></button></div>
            <div className="hrm-modal-body">
              <label style={{ display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 }}>Rejection Reason (optional)</label>
              <textarea value={rejectNote} onChange={e=>setRejectNote(e.target.value)} rows={3} placeholder="Explain why the leave is rejected…" style={{ ...inp,resize:"vertical" }}/>
            </div>
            <div className="hrm-modal-footer">
              <button className="hrm-btn hrm-btn-outline" onClick={()=>setRejectModal(null)}>Cancel</button>
              <button className="hrm-btn hrm-btn-danger" onClick={()=>review(rejectModal,"rejected",rejectNote)}>Reject Leave</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
