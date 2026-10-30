"use client";
import React, { useState, useEffect, useCallback } from "react";
import { BarChart2, Users, Calendar, FileText, DollarSign, RefreshCw, Download } from "lucide-react";
import HRM_API from "@/utils/hrmApi";
import { downloadPdf } from "@/utils/downloadPdf";

const fmt  = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtN = (n) => Number(n||0).toLocaleString("en-IN");
const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function HrmReportsPage() {
  const [tab,        setTab]        = useState("headcount");
  const [headcount,  setHeadcount]  = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [leave,      setLeave]      = useState(null);
  const [payroll,    setPayroll]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [month,      setMonth]      = useState(new Date().getMonth()+1);
  const [year,       setYear]       = useState(new Date().getFullYear());
  const [downloading,setDownloading]= useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (tab==="headcount")  { const { data } = await HRM_API.get("/reports/headcount");  setHeadcount(data); }
      if (tab==="attendance") { const { data } = await HRM_API.get("/reports/attendance",{ params:{month,year} }); setAttendance(data); }
      if (tab==="leave")      { const { data } = await HRM_API.get("/reports/leave",{ params:{year} }); setLeave(data); }
      if (tab==="payroll")    { const { data } = await HRM_API.get("/reports/payroll",{ params:{months:6} }); setPayroll(data); }
    } catch {} finally { setLoading(false); }
  }, [tab, month, year]);

  useEffect(() => { load(); }, [load]);

  const BAR_MAX = (arr, key) => Math.max(1, ...arr.map(i=>i[key]||0));

  const StatBox = ({label,value,color="#7c3aed",sub=""}) => (
    <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:20 }}>
      <p style={{ fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",margin:"0 0 4px" }}>{label}</p>
      <p style={{ fontSize:24,fontWeight:800,color,margin:"0 0 2px" }}>{value}</p>
      {sub && <p style={{ fontSize:11,color:"#94a3b8",margin:0 }}>{sub}</p>}
    </div>
  );

  const tabs = [
    { key:"headcount",  label:"Headcount",  icon:Users       },
    { key:"attendance", label:"Attendance", icon:Calendar    },
    { key:"leave",      label:"Leave",      icon:FileText    },
    { key:"payroll",    label:"Payroll",    icon:DollarSign  },
  ];

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Reports & Analytics</h1><p className="hrm-page-sub">Insights across employees, attendance, leaves and payroll</p></div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={load} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={13}/></button>
          <button onClick={()=>downloadPdf(`report-${tab}`,"HRM-Report-"+tab,()=>setDownloading(true),()=>setDownloading(false))} className="hrm-btn hrm-btn-outline hrm-btn-sm" disabled={downloading}><Download size={13}/>{downloading?"…":"Export PDF"}</button>
        </div>
      </div>

      <div className="hrm-tabs" style={{ marginBottom:24 }}>
        {tabs.map(t=>{
          const Icon=t.icon;
          return <button key={t.key} className={`hrm-tab ${tab===t.key?"active":"inactive"}`} onClick={()=>setTab(t.key)} style={{ display:"flex",alignItems:"center",gap:6 }}><Icon size={13}/>{t.label}</button>;
        })}
      </div>

      {/* Filters for attendance/leave */}
      {tab==="attendance" && (
        <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
          <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{ padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
            {MONTHS_SHORT.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
            {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
      {tab==="leave" && (
        <div style={{ display:"flex",gap:10,marginBottom:20 }}>
          <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
            {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {loading ? <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading report…</div> : (
        <div id={`report-${tab}`}>

          {/* ── HEADCOUNT ── */}
          {tab==="headcount" && headcount && (
            <div style={{ display:"flex",flexDirection:"column",gap:24 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14 }}>
                <StatBox label="Total Employees"  value={fmtN(headcount.total)}          color="#7c3aed"/>
                <StatBox label="Active"           value={fmtN(headcount.active)}         color="#15803d"/>
                <StatBox label="Probation"        value={fmtN(headcount.probation)}      color="#a16207"/>
                <StatBox label="Notice Period"    value={fmtN(headcount.notice_period)}  color="#c2410c"/>
                <StatBox label="Resigned"         value={fmtN(headcount.resigned)}       color="#dc2626"/>
                <StatBox label="Terminated"       value={fmtN(headcount.terminated)}     color="#64748b"/>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20 }}>
                {/* Dept breakdown bar chart */}
                <div className="hrm-card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>By Department</h3>
                  {(headcount.deptBreakdown||[]).map((d,i)=>(
                    <div key={i} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:12,color:"#374151",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%" }}>{d.dept_name||"Unknown"}</span>
                        <span style={{ fontSize:12,fontWeight:700,color:"#7c3aed" }}>{d.count}</span>
                      </div>
                      <div style={{ height:6,background:"#f1f5f9",borderRadius:99 }}>
                        <div style={{ height:"100%",width:`${Math.min(100,(d.count/BAR_MAX(headcount.deptBreakdown,"count"))*100)}%`,background:"linear-gradient(90deg,#7c3aed,#5b21b6)",borderRadius:99 }}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Type breakdown */}
                <div className="hrm-card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>By Employment Type</h3>
                  {(headcount.typeBreakdown||[]).map((t,i)=>(
                    <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f8fafc" }}>
                      <span style={{ fontSize:13,color:"#374151",textTransform:"capitalize" }}>{t._id?.replace(/_/g," ")||"Unknown"}</span>
                      <span style={{ fontSize:15,fontWeight:800,color:"#0f172a" }}>{t.count}</span>
                    </div>
                  ))}
                </div>

                {/* Monthly joinings */}
                <div className="hrm-card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>Monthly Joinings (12m)</h3>
                  <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:80 }}>
                    {(headcount.monthlyJoinings||[]).map((m,i)=>{
                      const max = Math.max(1,...(headcount.monthlyJoinings||[]).map(x=>x.count));
                      return (
                        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                          <div style={{ width:"100%",background:"#7c3aed",borderRadius:"4px 4px 0 0",height:`${Math.max(4,(m.count/max)*60)}px`,minHeight:4 }}/>
                          <span style={{ fontSize:9,color:"#94a3b8" }}>{MONTHS_SHORT[(m._id.month-1)]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {tab==="attendance" && attendance && (
            <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14 }}>
                <StatBox label="Total Present"  value={fmtN(attendance.totals?.present)}     color="#15803d"/>
                <StatBox label="Total Late"     value={fmtN(attendance.totals?.late)}        color="#a16207"/>
                <StatBox label="Total Absent"   value={fmtN(attendance.totals?.absent)}      color="#dc2626"/>
                <StatBox label="Total WFH"      value={fmtN(attendance.totals?.wfh)}         color="#7c3aed"/>
                <StatBox label="Total Hours"    value={(attendance.totals?.total_hours||0)+"h"} color="#0d9488"/>
              </div>
              <div className="hrm-card">
                <div className="hrm-table-wrap">
                  <table className="hrm-table">
                    <thead><tr>{["Employee","Dept","Present","Late","Absent","Leave","WFH","Hours"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(attendance.employees||[]).length===0
                        ? <tr><td colSpan={8} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No data</td></tr>
                        : (attendance.employees||[]).map((e,i)=>(
                          <tr key={i}>
                            <td style={{ fontWeight:600,color:"#0f172a",fontSize:12 }}>{e.full_name}</td>
                            <td style={{ fontSize:12,color:"#64748b" }}>{e.department}</td>
                            <td style={{ color:"#15803d",fontWeight:700 }}>{e.present}</td>
                            <td style={{ color:"#a16207",fontWeight:600 }}>{e.late}</td>
                            <td style={{ color:"#dc2626",fontWeight:600 }}>{e.absent}</td>
                            <td style={{ color:"#1d4ed8" }}>{e.on_leave}</td>
                            <td style={{ color:"#7c3aed" }}>{e.wfh}</td>
                            <td>{e.total_hours}h</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── LEAVE ── */}
          {tab==="leave" && leave && (
            <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14 }}>
                <StatBox label="Total Approved"  value={fmtN(leave.total_approved)} color="#15803d"/>
                <StatBox label="Total Days Used" value={fmtN(leave.total_days)}     color="#dc2626"/>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:20 }}>
                {/* By Type */}
                <div className="hrm-card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>By Leave Type</h3>
                  {(leave.byType||[]).map((t,i)=>(
                    <div key={i} style={{ marginBottom:12 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:12,fontWeight:700,color:"#374151" }}>{t.name} ({t.code})</span>
                        <span style={{ fontSize:12,color:"#64748b" }}>{t.total_days}d / {t.total_requests} req</span>
                      </div>
                      <div style={{ height:6,background:"#f1f5f9",borderRadius:99 }}>
                        <div style={{ height:"100%",width:`${Math.min(100,(t.total_days/Math.max(1,...(leave.byType||[]).map(x=>x.total_days)))*100)}%`,background:"linear-gradient(90deg,#2563eb,#1d4ed8)",borderRadius:99 }}/>
                      </div>
                    </div>
                  ))}
                </div>
                {/* By Month bar */}
                <div className="hrm-card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>Monthly Distribution ({year})</h3>
                  <div style={{ display:"flex",gap:4,alignItems:"flex-end",height:90 }}>
                    {(leave.byMonth||[]).map((m,i)=>{
                      const maxDays = Math.max(1,...(leave.byMonth||[]).map(x=>x.days));
                      return (
                        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                          <span style={{ fontSize:9,color:"#64748b" }}>{m.days||""}</span>
                          <div style={{ width:"100%",background:"#2563eb",borderRadius:"3px 3px 0 0",height:`${Math.max(4,(m.days/maxDays)*70)}px`,minHeight:4,opacity:m.days?1:.15 }}/>
                          <span style={{ fontSize:9,color:"#94a3b8" }}>{m.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── PAYROLL ── */}
          {tab==="payroll" && payroll && (
            <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14 }}>
                <StatBox label="Total Paid (6m)"  value={fmt(payroll.total_paid)}     color="#15803d"/>
                <StatBox label="Avg Monthly Net"  value={fmt(payroll.avg_monthly_net)} color="#7c3aed"/>
                <StatBox label="Months Processed" value={payroll.months}              color="#0d9488"/>
              </div>
              <div className="hrm-card">
                <div className="hrm-table-wrap">
                  <table className="hrm-table">
                    <thead><tr>{["Period","Employees","Gross","PF","ESI","Net Payout","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                      {(payroll.history||[]).length===0
                        ? <tr><td colSpan={7} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No payroll data</td></tr>
                        : (payroll.history||[]).map((p,i)=>(
                          <tr key={i}>
                            <td style={{ fontWeight:600,color:"#0f172a" }}>{p.pay_period}</td>
                            <td>{p.total_employees}</td>
                            <td style={{ fontWeight:600 }}>{fmt(p.total_gross)}</td>
                            <td style={{ color:"#dc2626" }}>{fmt(p.total_pf)}</td>
                            <td style={{ color:"#ea580c" }}>{fmt(p.total_esi)}</td>
                            <td style={{ fontWeight:700,color:"#15803d" }}>{fmt(p.total_net)}</td>
                            <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:p.status==="paid"?"#dcfce7":p.status==="processed"?"#ede9fe":"#f1f5f9",color:p.status==="paid"?"#15803d":p.status==="processed"?"#5b21b6":"#475569" }}>{p.status}</span></td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Cost trend bar */}
              {payroll.history?.length > 0 && (
                <div className="hrm-card" style={{ padding:20 }}>
                  <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>Net Payout Trend</h3>
                  <div style={{ display:"flex",gap:8,alignItems:"flex-end",height:90 }}>
                    {[...(payroll.history||[])].reverse().map((p,i)=>{
                      const maxNet = Math.max(1,...(payroll.history||[]).map(x=>x.total_net));
                      return (
                        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                          <span style={{ fontSize:9,color:"#64748b" }}>{fmt(p.total_net).replace("₹","")}</span>
                          <div style={{ width:"100%",background:"linear-gradient(180deg,#7c3aed,#5b21b6)",borderRadius:"4px 4px 0 0",height:`${Math.max(4,(p.total_net/maxNet)*70)}px` }}/>
                          <span style={{ fontSize:9,color:"#94a3b8",textAlign:"center",lineHeight:1.2 }}>{p.pay_period?.split(" ")[0]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
