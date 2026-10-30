"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Download } from "lucide-react";
import EMP_API from "@/utils/empApi";
import { downloadPdf } from "@/utils/downloadPdf";

const fmt = (n) => `₹${Number(n||0).toLocaleString("en-IN",{minimumFractionDigits:2})}`;

export default function EmpSalaryPage() {
  const [slips, setSlips]    = useState([]);
  const [ctc,   setCtc]      = useState(null);
  const [tab,   setTab]      = useState("slips");
  const [viewSlip, setViewSlip] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [{ data:s }, { data:c }] = await Promise.all([EMP_API.get("/salary/slips"), EMP_API.get("/salary/ctc")]);
      setSlips(s||[]); setCtc(c);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async (slip) => {
    setViewSlip(slip); setDownloading(false);
    setTimeout(async () => {
      await downloadPdf("emp-slip-pdf", `${slip.employee_snapshot?.employee_id||"emp"}-${slip.pay_period}-Salary-Slip`,
        ()=>setDownloading(true), ()=>setDownloading(false));
    }, 500);
  };

  return (
    <div>
      <div className="emp-page-header"><h1 className="emp-page-title">My Salary</h1></div>

      <div className="emp-tabs" style={{ marginBottom:20 }}>
        {["slips","ctc"].map(t=><button key={t} className={`emp-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)} style={{ padding:"8px 16px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:tab===t?"#2563eb":"transparent",color:tab===t?"#fff":"#64748b" }}>{t==="slips"?"Salary Slips":"CTC Breakup"}</button>)}
      </div>

      {tab==="slips" && (
        <div className="emp-card">
          <div className="emp-table-wrap">
            <table className="emp-table">
              <thead><tr>{["Month","Gross","Deductions","Net Salary","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {slips.length===0?<tr><td colSpan={5} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No salary slips yet</td></tr>
                :slips.map(s=>(
                  <tr key={s.id||s._id}>
                    <td style={{ fontWeight:600,color:"#0f172a" }}>{s.pay_period}</td>
                    <td>{fmt(s.gross_salary)}</td>
                    <td style={{ color:"#dc2626" }}>-{fmt(s.total_deductions)}</td>
                    <td style={{ fontWeight:700,color:"#16a34a" }}>{fmt(s.net_salary)}</td>
                    <td>
                      <div style={{ display:"flex",gap:5 }}>
                        <button onClick={()=>setViewSlip(s)} style={{ padding:"5px 10px",background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }}><Eye size={11}/>View</button>
                        <button onClick={()=>handleDownload(s)} style={{ padding:"5px 10px",background:"#dcfce7",color:"#15803d",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 }} disabled={downloading}><Download size={11}/>PDF</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab==="ctc" && ctc && (
        <div style={{ maxWidth:520 }}>
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden" }}>
            <div style={{ padding:"16px 20px",background:"#eff6ff",borderBottom:"1px solid #e2e8f0" }}>
              <p style={{ fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",margin:"0 0 2px" }}>Annual CTC</p>
              <p style={{ fontSize:26,fontWeight:800,color:"#1e3a8a",margin:0 }}>{fmt(ctc.annual_ctc)}</p>
            </div>
            <div style={{ padding:20 }}>
              <h4 style={{ fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 10px" }}>Monthly Earnings</h4>
              {(ctc.monthly?.earnings||[]).map((e,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f8fafc",fontSize:13 }}>
                  <span style={{ color:"#374151" }}>{e.name}</span>
                  <span style={{ fontWeight:600,color:"#0f172a" }}>{fmt(e.amount)}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",padding:"10px 0",borderTop:"2px solid #e2e8f0",marginTop:4,fontSize:14 }}>
                <span style={{ fontWeight:700,color:"#0f172a" }}>Gross Salary</span>
                <span style={{ fontWeight:800,color:"#0f172a" }}>{fmt(ctc.monthly?.gross)}</span>
              </div>

              <h4 style={{ fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".06em",margin:"16px 0 10px" }}>Monthly Deductions</h4>
              {(ctc.monthly?.deductions||[]).map((d,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #f8fafc",fontSize:13 }}>
                  <span style={{ color:"#374151" }}>{d.name}</span>
                  <span style={{ fontWeight:600,color:"#dc2626" }}>-{fmt(d.amount)}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",padding:"12px 16px",borderRadius:10,background:"#dcfce7",marginTop:12,fontSize:15 }}>
                <span style={{ fontWeight:800,color:"#14532d" }}>Net Take Home</span>
                <span style={{ fontWeight:800,color:"#15803d" }}>{fmt(ctc.monthly?.net_salary)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {viewSlip && (
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto" }}>
          <div style={{ background:"#fff",borderRadius:16,width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,.15)",fontFamily:"Arial,Helvetica,sans-serif" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
              <h2 style={{ fontSize:16,fontWeight:700,color:"#0f172a",margin:0 }}>Salary Slip — {viewSlip.pay_period}</h2>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>handleDownload(viewSlip)} disabled={downloading} style={{ padding:"7px 14px",background:"#22c55e",color:"#fff",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer" }}>⬇️ {downloading?"…":"Download PDF"}</button>
                <button onClick={()=>setViewSlip(null)} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16 }}>✕</button>
              </div>
            </div>
            {/* Slip content */}
            <div id="emp-slip-pdf" style={{ padding:"32px 40px",fontSize:12,color:"#111",lineHeight:1.6 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,borderBottom:"2px solid #111",paddingBottom:16 }}>
                <div>
                  <div style={{ fontSize:20,fontWeight:700 }}>Salary Slip</div>
                  <div style={{ fontSize:14,fontWeight:700 }}>Subham General Store</div>
                  <div style={{ fontSize:11,color:"#444",marginTop:4 }}>Main Market, Raipur<br/>Chhattisgarh 492001 | GSTIN: XXXXXXXXXXXX</div>
                </div>
                <div style={{ textAlign:"right",fontSize:11,color:"#444",lineHeight:1.8 }}>
                  <strong>Pay Period:</strong> {viewSlip.pay_period}<br/>
                  <strong>Employee ID:</strong> {viewSlip.employee_snapshot?.employee_id}<br/>
                  <strong>UAN:</strong> {viewSlip.employee_snapshot?.uan_number||"—"}
                </div>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20,fontSize:12 }}>
                {[["Name",viewSlip.employee_snapshot?.full_name],["Department",viewSlip.employee_snapshot?.department],["Designation",viewSlip.employee_snapshot?.designation],["Working Days",viewSlip.working_days],["Days Present",viewSlip.present_days],["LWP Days",viewSlip.lwp_days]].map(([l,v])=>(
                  <div key={l} style={{ display:"flex",gap:8 }}><span style={{ fontWeight:700,color:"#444",minWidth:100 }}>{l}:</span><span>{v||"—"}</span></div>
                ))}
              </div>
              <table style={{ width:"100%",borderCollapse:"collapse",marginBottom:16 }}>
                <thead><tr style={{ background:"#f1f5f9" }}><th style={{ padding:"8px 12px",textAlign:"left",border:"1px solid #d1d5db",fontSize:11,fontWeight:700 }}>Earnings</th><th style={{ padding:"8px 12px",textAlign:"right",border:"1px solid #d1d5db",fontSize:11,fontWeight:700 }}>Amount</th><th style={{ padding:"8px 12px",textAlign:"left",border:"1px solid #d1d5db",fontSize:11,fontWeight:700 }}>Deductions</th><th style={{ padding:"8px 12px",textAlign:"right",border:"1px solid #d1d5db",fontSize:11,fontWeight:700 }}>Amount</th></tr></thead>
                <tbody>
                  {Array.from({length:Math.max(viewSlip.earnings?.length||0,viewSlip.deductions?.length||0)}).map((_,i)=>{
                    const e=viewSlip.earnings?.[i]; const d=viewSlip.deductions?.[i];
                    return (<tr key={i}><td style={{ padding:"6px 12px",border:"1px solid #e2e8f0" }}>{e?.name||""}</td><td style={{ padding:"6px 12px",border:"1px solid #e2e8f0",textAlign:"right" }}>{e?fmt(e.amount):""}</td><td style={{ padding:"6px 12px",border:"1px solid #e2e8f0" }}>{d?.name||""}</td><td style={{ padding:"6px 12px",border:"1px solid #e2e8f0",textAlign:"right",color:"#dc2626" }}>{d?fmt(d.amount):""}</td></tr>);
                  })}
                  <tr style={{ background:"#f8fafc",fontWeight:700 }}><td style={{ padding:"8px 12px",border:"1px solid #d1d5db" }}>Gross Salary</td><td style={{ padding:"8px 12px",border:"1px solid #d1d5db",textAlign:"right" }}>{fmt(viewSlip.gross_salary)}</td><td style={{ padding:"8px 12px",border:"1px solid #d1d5db" }}>Total Deductions</td><td style={{ padding:"8px 12px",border:"1px solid #d1d5db",textAlign:"right",color:"#dc2626" }}>-{fmt(viewSlip.total_deductions)}</td></tr>
                </tbody>
              </table>
              <div style={{ textAlign:"right" }}>
                <div style={{ display:"inline-block",padding:"12px 24px",background:"#dcfce7",borderRadius:8 }}>
                  <span style={{ fontSize:11,fontWeight:700,color:"#14532d" }}>NET SALARY: </span>
                  <span style={{ fontSize:18,fontWeight:800,color:"#15803d" }}>{fmt(viewSlip.net_salary)}</span>
                </div>
              </div>
              <div style={{ marginTop:20,fontSize:10,color:"#64748b",borderTop:"1px solid #e2e8f0",paddingTop:10,textAlign:"center" }}>
                Bank: {viewSlip.employee_snapshot?.bank_name||"HDFC"} | A/C: XXXX{viewSlip.employee_snapshot?.account_number?.slice(-4)||"XXXX"} | This is a computer generated salary slip.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
