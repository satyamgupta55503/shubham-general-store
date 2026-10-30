"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import EMP_API from "@/utils/empApi";

const STATUS_STYLES = { present:{bg:"#dcfce7",c:"#15803d"},late:{bg:"#fef9c3",c:"#a16207"},absent:{bg:"#fee2e2",c:"#dc2626"},on_leave:{bg:"#dbeafe",c:"#1d4ed8"},wfh:{bg:"#ede9fe",c:"#7c3aed"},half_day:{bg:"#ffedd5",c:"#c2410c"},holiday:{bg:"#f1f5f9",c:"#475569"},weekly_off:{bg:"#f1f5f9",c:"#94a3b8"} };
const fmtT = (d) => d ? new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

export default function EmpAttendancePage() {
  const [records,  setRecords]  = useState([]);
  const [month,    setMonth]    = useState(new Date().getMonth()+1);
  const [year,     setYear]     = useState(new Date().getFullYear());
  const [loading,  setLoading]  = useState(false);
  const [regModal, setRegModal] = useState(false);
  const [regForm,  setRegForm]  = useState({ date:"", req_check_in:"", req_check_out:"", reason:"" });
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await EMP_API.get("/attendance/history", { params:{month,year} }); setRecords(data||[]); }
    catch {} finally { setLoading(false); }
  }, [month, year]);

  useEffect(() => { load(); }, [load]);

  const submitReg = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await EMP_API.post("/attendance/regularize", regForm); setRegModal(false); setRegForm({date:"",req_check_in:"",req_check_out:"",reason:""}); setMsg("✅ Regularization submitted!"); setTimeout(()=>setMsg(""),3000); }
    catch (err) { setMsg("❌ "+(err.response?.data?.message||"Failed")); }
    finally { setSaving(false); }
  };

  const summary = { present:records.filter(r=>r.status==="present").length, late:records.filter(r=>r.status==="late").length, absent:records.filter(r=>r.status==="absent").length, on_leave:records.filter(r=>r.status==="on_leave").length, hours:records.reduce((s,r)=>s+(r.work_hours||0),0).toFixed(1) };

  const months = Array.from({length:12},(_,i)=>new Date(2024,i).toLocaleString("en-IN",{month:"long"}));
  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div>
      <div className="emp-page-header">
        <div><h1 className="emp-page-title">My Attendance</h1><p className="emp-page-sub">Track your attendance history</p></div>
        <button className="emp-btn emp-btn-primary" onClick={()=>setRegModal(true)}><Plus size={15}/> Request Regularization</button>
      </div>

      {msg && <div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:msg.startsWith("✅")?"#dcfce7":"#fee2e2",color:msg.startsWith("✅")?"#15803d":"#dc2626" }}>{msg}</div>}

      {/* Summary */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12,marginBottom:24 }}>
        {[["Present",summary.present,"#dcfce7","#15803d"],["Late",summary.late,"#fef9c3","#a16207"],["Absent",summary.absent,"#fee2e2","#dc2626"],["On Leave",summary.on_leave,"#dbeafe","#1d4ed8"],["Total Hours",summary.hours+"h","#ede9fe","#7c3aed"]].map(([l,v,bg,c])=>(
          <div key={l} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:14 }}>
            <p style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 4px" }}>{l}</p>
            <p style={{ fontSize:22,fontWeight:800,color:c,margin:0 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* Month Selector */}
      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ ...inp,width:"auto",minWidth:140 }}>
          {months.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ ...inp,width:"auto",minWidth:100 }}>
          {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="emp-card">
        <div className="emp-table-wrap">
          <table className="emp-table">
            <thead><tr>{["Date","Check In","Check Out","Hours","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {loading?<tr><td colSpan={5} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
              :records.length===0?<tr><td colSpan={5} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No records for this month</td></tr>
              :records.map((r,i)=>{
                const st=STATUS_STYLES[r.status]||{bg:"#f1f5f9",c:"#475569"};
                return (
                  <tr key={i}>
                    <td style={{ fontWeight:600,color:"#0f172a" }}>{fmtD(r.date)}</td>
                    <td style={{ color:"#374151",fontSize:13 }}>{fmtT(r.check_in)}</td>
                    <td style={{ color:"#374151",fontSize:13 }}>{fmtT(r.check_out)}</td>
                    <td style={{ color:"#374151",fontSize:13 }}>{r.work_hours?.toFixed(1)||"0.0"}h</td>
                    <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st.bg,color:st.c }}>{r.status?.replace(/_/g," ")}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regularization Modal */}
      {regModal && (
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{ maxWidth:460 }}>
            <div className="emp-modal-header"><h2 className="emp-modal-title">Request Regularization</h2><button className="emp-close-btn" onClick={()=>setRegModal(false)}><X size={16}/></button></div>
            <form onSubmit={submitReg}>
              <div className="emp-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
                <div><label style={lbl}>Date <span style={{ color:"#ef4444" }}>*</span></label><input type="date" value={regForm.date} onChange={e=>setRegForm(p=>({...p,date:e.target.value}))} required style={inp} max={new Date().toISOString().split("T")[0]}/></div>
                <div className="emp-form-row">
                  <div><label style={lbl}>Actual Check-in <span style={{ color:"#ef4444" }}>*</span></label><input type="time" value={regForm.req_check_in} onChange={e=>setRegForm(p=>({...p,req_check_in:e.target.value}))} required style={inp}/></div>
                  <div><label style={lbl}>Actual Check-out <span style={{ color:"#ef4444" }}>*</span></label><input type="time" value={regForm.req_check_out} onChange={e=>setRegForm(p=>({...p,req_check_out:e.target.value}))} required style={inp}/></div>
                </div>
                <div><label style={lbl}>Reason <span style={{ color:"#ef4444" }}>*</span></label><textarea value={regForm.reason} onChange={e=>setRegForm(p=>({...p,reason:e.target.value}))} required rows={3} placeholder="Why did you miss check-in/out?" style={{ ...inp,resize:"vertical" }}/></div>
              </div>
              <div className="emp-modal-footer">
                <button type="button" className="emp-btn emp-btn-outline" onClick={()=>setRegModal(false)}>Cancel</button>
                <button type="submit" className="emp-btn emp-btn-primary" disabled={saving}>{saving?"Submitting…":"Submit Request"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
