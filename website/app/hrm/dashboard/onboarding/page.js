"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Circle, Search, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const STEPS = [
  { key:"welcome_email_sent",    label:"Welcome Email Sent",         icon:"📧", desc:"Send welcome email with login credentials and company info" },
  { key:"documents_collected",   label:"Documents Collected",        icon:"📄", desc:"Collect Aadhar, PAN, degree certificates, experience letters" },
  { key:"system_access_given",   label:"System Access Given",        icon:"💻", desc:"Create email account, EMP portal login, Slack/tools access" },
  { key:"induction_completed",   label:"Induction Completed",        icon:"🎓", desc:"HR orientation, company policy walkthrough, team introduction" },
  { key:"equipment_issued",      label:"Equipment Issued",           icon:"🖥️",  desc:"Laptop, ID card, access cards, stationery issued" },
];

export default function HrmOnboardingPage() {
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState("");
  const [saving,    setSaving]    = useState({});
  const [expanded,  setExpanded]  = useState({});
  const [msg,       setMsg]       = useState({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // Get employees who joined recently (last 90 days) or on probation
      const { data } = await HRM_API.get("/employees", { params:{ status:"active", limit:100 } });
      const recent = (data.employees||[]).filter(e => {
        const doj = e.date_of_joining ? new Date(e.date_of_joining) : null;
        const ninetyDaysAgo = new Date(); ninetyDaysAgo.setDate(ninetyDaysAgo.getDate()-90);
        return doj && doj >= ninetyDaysAgo;
      });
      // Also include probation regardless of join date
      const probation = (data.employees||[]).filter(e => e.status==="probation" && !recent.find(r=>r.id===e.id));
      setEmployees([...recent,...probation]);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleStep = async (emp, key) => {
    const currentVal = emp.onboarding?.[key] || false;
    setSaving(p=>({...p,[`${emp.id}_${key}`]:true}));
    try {
      await HRM_API.patch(`/employees/${emp.id||emp._id}`, { [`onboarding.${key}`]: !currentVal });
      // Optimistic update
      setEmployees(prev => prev.map(e =>
        (e.id||e._id) === (emp.id||emp._id)
          ? { ...e, onboarding: { ...e.onboarding, [key]: !currentVal } }
          : e
      ));
      setMsg(p=>({...p,[emp.id||emp._id]:"✅ Saved"}));
      setTimeout(()=>setMsg(p=>({...p,[emp.id||emp._id]:""})), 2000);
    } catch {
      setMsg(p=>({...p,[emp.id||emp._id]:"❌ Save failed"}));
    } finally {
      setSaving(p=>({...p,[`${emp.id}_${key}`]:false}));
    }
  };

  const getProgress = (emp) => {
    const ob = emp.onboarding || {};
    const done = STEPS.filter(s => ob[s.key]).length;
    return { done, total: STEPS.length, pct: Math.round((done/STEPS.length)*100) };
  };

  const filtered = employees.filter(e =>
    e.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Onboarding Tracker</h1><p className="hrm-page-sub">Recent joiners (last 90 days) + probation employees</p></div>
        <button onClick={load} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={13}/></button>
      </div>

      {/* Summary bar */}
      {employees.length > 0 && (() => {
        const total = employees.length;
        const complete = employees.filter(e=>getProgress(e).pct===100).length;
        const inProgress = employees.filter(e=>{ const p=getProgress(e); return p.pct>0&&p.pct<100; }).length;
        const notStarted = employees.filter(e=>getProgress(e).pct===0).length;
        return (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:24 }}>
            {[["Total","#7c3aed",total],["Complete","#15803d",complete],["In Progress","#a16207",inProgress],["Not Started","#dc2626",notStarted]].map(([l,c,v])=>(
              <div key={l} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"16px 18px" }}>
                <p style={{ fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",margin:"0 0 4px" }}>{l}</p>
                <p style={{ fontSize:24,fontWeight:800,color:c,margin:0 }}>{v}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Search */}
      <div className="hrm-search-bar" style={{ marginBottom:20,maxWidth:360 }}>
        <Search size={15} color="#94a3b8"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees…" style={{ border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,fontFamily:"inherit" }}/>
      </div>

      {loading ? <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      : filtered.length===0 ? (
        <div style={{ padding:"64px",textAlign:"center",color:"#94a3b8" }}>
          <CheckCircle size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 12px" }}/>
          <p style={{ margin:0 }}>{search?"No employees match your search.":"No recent joiners found."}</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {filtered.map(emp => {
            const { done, total, pct } = getProgress(emp);
            const isExpanded = !!expanded[emp.id||emp._id];
            const empMsg = msg[emp.id||emp._id];
            return (
              <div key={emp.id||emp._id} className="hrm-card">
                {/* Header row */}
                <div style={{ display:"flex",alignItems:"center",gap:14,padding:"16px 20px",cursor:"pointer" }} onClick={()=>setExpanded(p=>({...p,[emp.id||emp._id]:!isExpanded}))}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontWeight:700,fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{emp.full_name?.[0]?.toUpperCase()}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,color:"#0f172a",fontSize:14 }}>{emp.full_name}</div>
                    <div style={{ fontSize:11,color:"#94a3b8" }}>{emp.employee_id} · {emp.department?.name||"—"} · Joined {fmtD(emp.date_of_joining)}</div>
                  </div>
                  {empMsg && <span style={{ fontSize:12,color:empMsg.startsWith("✅")?"#15803d":"#dc2626",fontWeight:600 }}>{empMsg}</span>}
                  {/* Progress bar */}
                  <div style={{ minWidth:160,display:"flex",flexDirection:"column",gap:4 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,fontWeight:700 }}>
                      <span style={{ color:pct===100?"#15803d":pct>0?"#a16207":"#dc2626" }}>{pct===100?"Complete":pct>0?"In Progress":"Not Started"}</span>
                      <span style={{ color:"#64748b" }}>{done}/{total}</span>
                    </div>
                    <div style={{ height:6,background:"#f1f5f9",borderRadius:99 }}>
                      <div style={{ height:"100%",width:`${pct}%`,background:pct===100?"#16a34a":pct>0?"#f59e0b":"#e2e8f0",borderRadius:99,transition:"width .3s" }}/>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp size={16} color="#94a3b8"/> : <ChevronDown size={16} color="#94a3b8"/>}
                </div>

                {/* Checklist steps */}
                {isExpanded && (
                  <div style={{ borderTop:"1px solid #f1f5f9" }}>
                    {STEPS.map(step => {
                      const done = emp.onboarding?.[step.key] || false;
                      const isSaving = saving[`${emp.id}_${step.key}`];
                      return (
                        <div key={step.key} style={{ display:"flex",alignItems:"center",gap:14,padding:"14px 20px",borderBottom:"1px solid #f8fafc",cursor:"pointer",transition:"background .15s" }}
                          onClick={()=>!isSaving&&toggleStep(emp,step.key)}
                          onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                          <span style={{ fontSize:20,flexShrink:0 }}>{step.icon}</span>
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:13,fontWeight:done?600:500,color:done?"#0f172a":"#374151",display:"flex",alignItems:"center",gap:8 }}>
                              {step.label}
                              {done && <span style={{ fontSize:10,background:"#dcfce7",color:"#15803d",padding:"1px 7px",borderRadius:20,fontWeight:700 }}>Done</span>}
                            </div>
                            <div style={{ fontSize:11,color:"#94a3b8",marginTop:2 }}>{step.desc}</div>
                          </div>
                          <div style={{ flexShrink:0,transition:"transform .15s",transform:isSaving?"scale(0.9)":"scale(1)" }}>
                            {done
                              ? <CheckCircle size={22} color="#16a34a" fill="#dcfce7"/>
                              : <Circle size={22} color="#d1d5db"/>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
