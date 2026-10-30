"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import EMP_API from "@/utils/empApi";

const STATUS_STYLES = { pending:{bg:"#fef9c3",c:"#a16207"}, approved:{bg:"#dcfce7",c:"#15803d"}, rejected:{bg:"#fee2e2",c:"#dc2626"}, cancelled:{bg:"#f1f5f9",c:"#475569"} };
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

export default function EmpLeavesPage() {
  const [leaves,  setLeaves]  = useState([]);
  const [types,   setTypes]   = useState([]);
  const [balance, setBalance] = useState({});
  const [tab,     setTab]     = useState("apply");
  const [form,    setForm]    = useState({ leave_type:"", from_date:"", to_date:"", reason:"", session:"full_day" });
  const [days,    setDays]    = useState(0);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data:l }, { data:t }, { data:b }] = await Promise.all([EMP_API.get("/leaves"), EMP_API.get("/leaves/types"), EMP_API.get("/leaves/balance")]);
      setLeaves(l||[]); setTypes(t||[]); setBalance(b||{});
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-calc days
  useEffect(() => {
    if (form.from_date && form.to_date) {
      const diff = (new Date(form.to_date)-new Date(form.from_date))/(1000*60*60*24)+1;
      setDays(Math.max(0,diff));
    } else setDays(0);
  }, [form.from_date, form.to_date]);

  const apply = async (e) => {
    e.preventDefault(); setSaving(true); setMsg("");
    try { await EMP_API.post("/leaves", { ...form, days }); setForm({ leave_type:"",from_date:"",to_date:"",reason:"",session:"full_day" }); setMsg("✅ Leave applied!"); load(); setTab("history"); }
    catch (err) { setMsg("❌ "+(err.response?.data?.message||"Failed")); }
    finally { setSaving(false); }
  };

  const cancel = async (id) => {
    if (!confirm("Cancel this leave request?")) return;
    try { await EMP_API.patch(`/leaves/${id}/cancel`); load(); } catch {}
  };

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div>
      <div className="emp-page-header"><h1 className="emp-page-title">My Leaves</h1></div>

      {/* Balance */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:12,marginBottom:24 }}>
        {[["EL","Earned",balance.el,12,"#2563eb"],["SL","Sick",balance.sl,12,"#16a34a"],["CL","Casual",balance.cl,8,"#ea580c"],["OL","Optional",balance.ol,2,"#7c3aed"]].map(([code,name,v,max,color])=>(
          <div key={code} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:14 }}>
            <p style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",margin:"0 0 2px" }}>{name} ({code})</p>
            <p style={{ fontSize:22,fontWeight:800,color,margin:"0 0 4px" }}>{v||0}</p>
            <p style={{ fontSize:10,color:"#94a3b8",margin:0 }}>of {max} remaining</p>
          </div>
        ))}
      </div>

      <div className="emp-tabs" style={{ marginBottom:20 }}>
        {["apply","history"].map(t=><button key={t} className={`emp-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)} style={{ padding:"8px 16px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:tab===t?"#2563eb":"transparent",color:tab===t?"#fff":"#64748b" }}>{t==="apply"?"Apply Leave":"My Requests"}</button>)}
      </div>

      {tab==="apply" && (
        <div style={{ maxWidth:520 }}>
          {msg && <div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:msg.startsWith("✅")?"#dcfce7":"#fee2e2",color:msg.startsWith("✅")?"#15803d":"#dc2626" }}>{msg}</div>}
          <form onSubmit={apply} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            <div>
              <label style={lbl}>Leave Type <span style={{ color:"#ef4444" }}>*</span></label>
              <select value={form.leave_type} onChange={e=>setForm(p=>({...p,leave_type:e.target.value}))} required style={inp}>
                <option value="">Select…</option>
                {types.map(t=><option key={t.id||t._id} value={t.id||t._id}>{t.name} ({t.code}) — {balance[t.code?.toLowerCase()]||0} remaining</option>)}
              </select>
            </div>
            <div className="emp-form-row">
              <div><label style={lbl}>From Date <span style={{ color:"#ef4444" }}>*</span></label><input type="date" value={form.from_date} onChange={e=>setForm(p=>({...p,from_date:e.target.value}))} required style={inp} min={new Date().toISOString().split("T")[0]}/></div>
              <div><label style={lbl}>To Date <span style={{ color:"#ef4444" }}>*</span></label><input type="date" value={form.to_date} onChange={e=>setForm(p=>({...p,to_date:e.target.value}))} required style={inp} min={form.from_date||new Date().toISOString().split("T")[0]}/></div>
            </div>
            {days>0&&<div style={{ padding:"10px 14px",background:"#eff6ff",borderRadius:8,fontSize:13,color:"#1d4ed8",fontWeight:600 }}>📅 {days} day{days>1?"s":""} selected</div>}
            <div><label style={lbl}>Session</label>
              <select value={form.session} onChange={e=>setForm(p=>({...p,session:e.target.value}))} style={inp}>
                {["full_day","first_half","second_half"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Reason <span style={{ color:"#ef4444" }}>*</span></label><textarea value={form.reason} onChange={e=>setForm(p=>({...p,reason:e.target.value}))} required rows={3} style={{ ...inp,resize:"vertical" }}/></div>
            <button type="submit" className="emp-btn emp-btn-primary" disabled={saving||!days} style={{ alignSelf:"flex-start" }}>{saving?"Submitting…":"Apply Leave"}</button>
          </form>
        </div>
      )}

      {tab==="history" && (
        <div className="emp-card">
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead><tr>{["Type","Dates","Days","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {leaves.length===0?<tr><td colSpan={5} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No leave requests yet</td></tr>
                :leaves.map(l=>{
                  const st=STATUS_STYLES[l.status]||{bg:"#f1f5f9",c:"#475569"};
                  return (
                    <tr key={l.id||l._id}>
                      <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#dbeafe",color:"#1d4ed8" }}>{l.leave_type?.code||l.leave_type_code||"—"}</span></td>
                      <td style={{ fontSize:12,color:"#374151" }}>{fmtD(l.from_date)} → {fmtD(l.to_date)}</td>
                      <td style={{ fontWeight:600,color:"#0f172a" }}>{l.days}</td>
                      <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st.bg,color:st.c }}>{l.status}</span></td>
                      <td>{l.status==="pending"&&<button onClick={()=>cancel(l.id||l._id)} style={{ padding:"5px 10px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer" }}>Cancel</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
