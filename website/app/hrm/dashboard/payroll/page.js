"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Play, DollarSign, Download, ArrowRight, Eye, CheckCircle } from "lucide-react";
import Link from "next/link";
import HRM_API from "@/utils/hrmApi";

const fmt = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const STATUS_STYLE = { draft:{bg:"#f1f5f9",c:"#475569"}, processing:{bg:"#dbeafe",c:"#1d4ed8"}, processed:{bg:"#dcfce7",c:"#15803d"}, paid:{bg:"#ede9fe",c:"#5b21b6"} };

export default function HrmPayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [slips,    setSlips]    = useState([]);
  const [tab,      setTab]      = useState("history");
  const [loading,  setLoading]  = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [running,  setRunning]  = useState(false);
  const [msg,      setMsg]      = useState("");

  const thisMonth = new Date().getMonth()+1;
  const thisYear  = new Date().getFullYear();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data:p }, { data:s }] = await Promise.all([HRM_API.get("/payroll"), HRM_API.get("/payroll/slips")]);
      setPayrolls(p||[]); setSlips(s||[]);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const runPreview = async () => {
    try { setRunning(true); const { data } = await HRM_API.post("/payroll/preview", { month:thisMonth, year:thisYear }); setPreview(data); setTab("preview"); }
    catch (e) { alert(e.response?.data?.message||"Preview failed"); }
    finally { setRunning(false); }
  };

  const processPayroll = async () => {
    if (!confirm(`Process payroll for ${new Date().toLocaleString("en-IN",{month:"long"})} ${thisYear}? This cannot be undone.`)) return;
    try {
      setRunning(true); setMsg("");
      await HRM_API.post("/payroll/process", { month:thisMonth, year:thisYear });
      setMsg("✅ Payroll processed! Salary slips generated."); setTab("history"); load();
    } catch (e) { setMsg("❌ "+( e.response?.data?.message||"Processing failed")); }
    finally { setRunning(false); }
  };

  const markPaid = async (month, year) => {
    try { await HRM_API.patch(`/payroll/${month}/${year}/mark-paid`); load(); }
    catch (e) { alert(e.response?.data?.message||"Failed"); }
  };

  const currentPayroll = payrolls.find(p=>p.month===thisMonth&&p.year===thisYear);

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Payroll Management</h1><p className="hrm-page-sub">Process monthly salaries and manage slips</p></div>
        {(!currentPayroll || currentPayroll.status==="draft") && (
          <button className="hrm-btn hrm-btn-primary" onClick={runPreview} disabled={running}>
            <Play size={15}/>{running?"Loading…":"Run Payroll Preview"}
          </button>
        )}
      </div>

      {msg && <div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:20,background:msg.startsWith("✅")?"#dcfce7":"#fee2e2",color:msg.startsWith("✅")?"#15803d":"#dc2626",border:`1px solid ${msg.startsWith("✅")?"#bbf7d0":"#fecaca"}` }}>{msg}</div>}

      {/* Current Month Card */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:16,marginBottom:24 }}>
        {[
          { label:"Current Month", value:currentPayroll?.pay_period||`${new Date().toLocaleString("en-IN",{month:"long"})} ${thisYear}`, sub:currentPayroll?`Status: ${currentPayroll.status}`:"Not started" },
          { label:"Total Payout", value:currentPayroll?fmt(currentPayroll.total_net):"—", sub:"Net salaries" },
          { label:"Employees", value:currentPayroll?.total_employees||"—", sub:"On payroll" },
        ].map((c,i)=>(
          <div key={i} className="hrm-card" style={{ padding:20 }}>
            <div style={{ fontSize:11,fontWeight:600,color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",margin:"0 0 4px" }}>{c.label}</div>
            <div style={{ fontSize:20,fontWeight:800,color:"#0f172a",marginBottom:2 }}>{c.value}</div>
            <div style={{ fontSize:11,color:"#94a3b8" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="hrm-tabs" style={{ marginBottom:20 }}>
        {["history","slips","preview"].map(t=>(
          <button key={t} className={`hrm-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)} disabled={t==="preview"&&!preview}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {/* History */}
      {tab==="history" && (
        <div className="hrm-card">
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead><tr>{["Month","Employees","Gross","Net","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {loading?<tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
                :payrolls.length===0?<tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No payroll records</td></tr>
                :payrolls.map(p=>{
                  const st = STATUS_STYLE[p.status]||{bg:"#f1f5f9",c:"#475569"};
                  return (
                    <tr key={p.id||p._id}>
                      <td style={{ fontWeight:600,color:"#0f172a" }}>{p.pay_period}</td>
                      <td>{p.total_employees}</td>
                      <td style={{ fontWeight:600 }}>{fmt(p.total_gross)}</td>
                      <td style={{ fontWeight:700,color:"#16a34a" }}>{fmt(p.total_net)}</td>
                      <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st.bg,color:st.c }}>{p.status}</span></td>
                      <td>
                        <div style={{ display:"flex",gap:5 }}>
                          {p.status==="processed" && <button onClick={()=>markPaid(p.month,p.year)} style={{ padding:"5px 10px",background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer",fontSize:11,fontWeight:600,display:"flex",alignItems:"center",gap:4 }}><CheckCircle size={12}/>Mark Paid</button>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slips */}
      {tab==="slips" && (
        <div className="hrm-card">
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead><tr>{["Employee","Month","Gross","Deductions","Net","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {slips.length===0?<tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No salary slips yet</td></tr>
                :slips.map(s=>(
                  <tr key={s.id||s._id}>
                    <td>
                      <div style={{ fontWeight:600,color:"#0f172a",fontSize:13 }}>{s.employee_snapshot?.full_name||s.employee?.full_name||"—"}</div>
                      <div style={{ fontSize:11,color:"#94a3b8" }}>{s.employee_snapshot?.employee_id||""}</div>
                    </td>
                    <td style={{ color:"#374151",fontSize:13 }}>{s.pay_period}</td>
                    <td style={{ fontWeight:600 }}>{fmt(s.gross_salary)}</td>
                    <td style={{ color:"#dc2626" }}>-{fmt(s.total_deductions)}</td>
                    <td style={{ fontWeight:700,color:"#16a34a" }}>{fmt(s.net_salary)}</td>
                    <td>
                      <Link href={`/hrm/dashboard/payroll/slips/${s.id||s._id}`} style={{ padding:"5px 10px",background:"#ede9fe",color:"#7c3aed",borderRadius:6,fontSize:11,fontWeight:600,textDecoration:"none",display:"inline-flex",alignItems:"center",gap:4 }}><Eye size={12}/>View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Preview */}
      {tab==="preview" && preview && (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:12 }}>
            <div>
              <h3 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:"0 0 4px" }}>Payroll Preview — {preview.year}</h3>
              <p style={{ fontSize:13,color:"#64748b",margin:0 }}>{preview.employees?.length||0} employees · Working days: {preview.working_days}</p>
            </div>
            <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
              <div style={{ fontSize:13,color:"#374151" }}>Total Net: <strong style={{ color:"#16a34a" }}>{fmt(preview.totals?.net)}</strong></div>
              <button className="hrm-btn hrm-btn-primary" onClick={processPayroll} disabled={running}>
                <DollarSign size={15}/>{running?"Processing…":"Process Payroll"}
              </button>
            </div>
          </div>

          <div className="hrm-card">
            <div className="hrm-table-wrap">
              <table className="hrm-table">
                <thead><tr>{["Employee","Present","LWP","Gross","Deductions","LWP Ded","Net"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {(preview.employees||[]).map((e,i)=>(
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight:600,color:"#0f172a",fontSize:13 }}>{e.employee?.full_name}</div>
                        <div style={{ fontSize:11,color:"#94a3b8" }}>{e.employee?.employee_id}</div>
                      </td>
                      <td style={{ color:"#16a34a",fontWeight:600 }}>{e.attendance?.present}</td>
                      <td style={{ color:e.attendance?.lwp_days>0?"#dc2626":"#374151",fontWeight:e.attendance?.lwp_days>0?700:400 }}>{e.attendance?.lwp_days}</td>
                      <td>{fmt(e.gross_salary)}</td>
                      <td style={{ color:"#dc2626" }}>-{fmt(e.total_deductions)}</td>
                      <td style={{ color:e.lwp_deduction>0?"#dc2626":"#374151" }}>{e.lwp_deduction>0?`-${fmt(e.lwp_deduction)}`:"—"}</td>
                      <td style={{ fontWeight:700,color:"#16a34a" }}>{fmt(e.net_salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
