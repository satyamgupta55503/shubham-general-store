"use client";
import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw, Check, X, Calendar } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const STATUS_COLORS = { present:{bg:"#dcfce7",c:"#15803d"}, late:{bg:"#fef9c3",c:"#a16207"}, absent:{bg:"#fee2e2",c:"#dc2626"}, on_leave:{bg:"#dbeafe",c:"#1d4ed8"}, wfh:{bg:"#ede9fe",c:"#7c3aed"}, half_day:{bg:"#ffedd5",c:"#c2410c"}, holiday:{bg:"#f1f5f9",c:"#475569"}, weekly_off:{bg:"#f1f5f9",c:"#94a3b8"} };

export default function HrmAttendancePage() {
  const [records,  setRecords]  = useState([]);
  const [summary,  setSummary]  = useState({});
  const [date,     setDate]     = useState(new Date().toISOString().split("T")[0]);
  const [regs,     setRegs]     = useState([]);
  const [tab,      setTab]      = useState("daily");
  const [loading,  setLoading]  = useState(false);
  const [regLoading,setRegLoading] = useState(false);

  const loadDaily = useCallback(async () => {
    try { setLoading(true); const { data } = await HRM_API.get("/attendance", { params:{ date } }); setRecords(data.records||[]); setSummary(data.summary||{}); }
    catch {} finally { setLoading(false); }
  }, [date]);

  const loadRegs = useCallback(async () => {
    try { setRegLoading(true); const { data } = await HRM_API.get("/attendance/regularizations", { params:{ status:"pending" } }); setRegs(data||[]); }
    catch {} finally { setRegLoading(false); }
  }, []);

  useEffect(() => { if (tab==="daily") loadDaily(); else loadRegs(); }, [tab, loadDaily, loadRegs]);

  const reviewReg = async (id, status) => {
    try { await HRM_API.patch(`/attendance/regularizations/${id}`, { status }); loadRegs(); }
    catch (e) { alert(e.response?.data?.message||"Failed"); }
  };

  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Attendance</h1><p className="hrm-page-sub">Track daily attendance and manage regularizations</p></div>
        <button className="hrm-btn hrm-btn-outline hrm-btn-sm" onClick={tab==="daily"?loadDaily:loadRegs}><RefreshCw size={14}/></button>
      </div>

      <div className="hrm-tabs" style={{ marginBottom:20 }}>
        {["daily","regularizations"].map(t=>(
          <button key={t} className={`hrm-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)} {t==="regularizations"&&regs.length>0?`(${regs.length})`:""}</button>
        ))}
      </div>

      {tab==="daily" && (
        <>
          <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap" }}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}/>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {[["Present",summary.present,"#dcfce7","#15803d"],["Late",summary.late,"#fef9c3","#a16207"],["Absent",summary.absent,"#fee2e2","#dc2626"],["On Leave",summary.on_leave,"#dbeafe","#1d4ed8"]].map(([l,v,bg,c])=>(
                <div key={l} style={{ padding:"6px 14px",borderRadius:20,background:bg,color:c,fontSize:12,fontWeight:700 }}>{l}: {v||0}</div>
              ))}
            </div>
          </div>

          <div className="hrm-card">
            <div className="hrm-table-wrap">
              <table className="hrm-table">
                <thead><tr>{["Employee","Check In","Check Out","Hours","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={5} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
                  : records.map((r,i)=>{
                    const at = r.attendance||{};
                    const st = STATUS_COLORS[at.status]||{bg:"#f1f5f9",c:"#475569"};
                    return (
                      <tr key={i}>
                        <td>
                          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                            <div style={{ width:30,height:30,borderRadius:"50%",background:"#ede9fe",color:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,flexShrink:0 }}>{r.employee?.full_name?.[0]?.toUpperCase()}</div>
                            <div>
                              <div style={{ fontWeight:600,color:"#0f172a",fontSize:13 }}>{r.employee?.full_name}</div>
                              <div style={{ fontSize:11,color:"#94a3b8" }}>{r.employee?.department?.name||"—"}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color:"#374151",fontSize:13 }}>{fmtTime(at.check_in)}</td>
                        <td style={{ color:"#374151",fontSize:13 }}>{fmtTime(at.check_out)}</td>
                        <td style={{ color:"#374151",fontSize:13 }}>{at.work_hours?.toFixed(1)||"0.0"}h</td>
                        <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st.bg,color:st.c }}>{at.status?.replace(/_/g," ")||"absent"}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab==="regularizations" && (
        <div className="hrm-card">
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead><tr>{["Employee","Date","Req. Check-in","Req. Check-out","Reason","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {regLoading ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
                : regs.length===0 ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No pending regularizations</td></tr>
                : regs.map(r=>(
                  <tr key={r.id||r._id}>
                    <td style={{ fontWeight:600,color:"#0f172a",fontSize:13 }}>{r.employee?.full_name||"—"}</td>
                    <td style={{ color:"#374151",fontSize:13 }}>{r.date ? new Date(r.date).toLocaleDateString("en-IN") : "—"}</td>
                    <td style={{ color:"#374151",fontSize:13 }}>{r.req_check_in}</td>
                    <td style={{ color:"#374151",fontSize:13 }}>{r.req_check_out}</td>
                    <td style={{ color:"#64748b",fontSize:12,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={r.reason}>{r.reason}</td>
                    <td>
                      <div style={{ display:"flex",gap:5 }}>
                        <button onClick={()=>reviewReg(r.id||r._id,"approved")} style={{ padding:6,background:"#dcfce7",color:"#15803d",border:"none",borderRadius:6,cursor:"pointer" }} title="Approve"><Check size={13}/></button>
                        <button onClick={()=>reviewReg(r.id||r._id,"rejected")} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Reject"><X size={13}/></button>
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
