"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, AlertCircle } from "lucide-react";
import HRM_API from "@/utils/hrmApi";
import { downloadPdf } from "@/utils/downloadPdf";

const fmt = (n) => `₹${Number(n||0).toLocaleString("en-IN",{ minimumFractionDigits:2 })}`;

export default function HrmSalarySlipDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const [slip,   setSlip]        = useState(null);
  const [loading,setLoading]     = useState(true);
  const [downloading,setDownloading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await HRM_API.get(`/payroll/slips/${id}`);
      setSlip(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleDownload = async () => {
    await downloadPdf(
      "hrm-slip-pdf",
      `${slip?.employee_snapshot?.employee_id||"emp"}-${slip?.pay_period||"slip"}-Salary-Slip`,
      () => setDownloading(true),
      () => setDownloading(false)
    );
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"300px" }}>
      <div style={{ textAlign:"center" }}>
        <div className="hrm-spinner" style={{ margin:"0 auto 12px" }}/>
        <p style={{ color:"#64748b",fontSize:14,margin:0 }}>Loading slip…</p>
      </div>
    </div>
  );

  if (!slip) return (
    <div style={{ padding:"48px",textAlign:"center" }}>
      <AlertCircle size={40} color="#dc2626" style={{ display:"block",margin:"0 auto 12px" }}/>
      <p style={{ color:"#dc2626",fontWeight:600 }}>Salary slip not found</p>
      <button onClick={()=>router.back()} className="hrm-btn hrm-btn-outline" style={{ marginTop:12 }}>Go Back</button>
    </div>
  );

  const emp  = slip.employee_snapshot || {};
  const rows = Math.max(slip.earnings?.length||0, slip.deductions?.length||0);

  return (
    <div>
      {/* Top bar */}
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:24,flexWrap:"wrap" }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div style={{ flex:1 }}/>
        <button onClick={handleDownload} disabled={downloading} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",opacity:downloading?.7:1 }}>
          <Download size={14}/> {downloading?"Generating…":"Download PDF"}
        </button>
      </div>

      {/* Slip wrapper — this div is captured by downloadPdf */}
      <div className="hrm-card" style={{ maxWidth:760,margin:"0 auto" }}>
        <div id="hrm-slip-pdf" style={{ padding:"36px 44px",fontSize:12,color:"#111",lineHeight:1.6,fontFamily:"Arial,Helvetica,sans-serif" }}>

          {/* Header */}
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",paddingBottom:16,borderBottom:"2px solid #111",marginBottom:20 }}>
            <div>
              <div style={{ fontSize:20,fontWeight:700,marginBottom:2 }}>SALARY SLIP</div>
              <div style={{ fontSize:15,fontWeight:700,color:"#1e3a5f" }}>Subham General Store</div>
              <div style={{ fontSize:11,color:"#555",marginTop:4,lineHeight:1.7 }}>
                270/1, Swami Vivekanand Ward, Raipur<br/>
                Chhattisgarh 492001 · GSTIN: 22AARFD5166H1ZB
              </div>
            </div>
            <div style={{ textAlign:"right",fontSize:11,color:"#444",lineHeight:2 }}>
              <div><strong>Pay Period:</strong> {slip.pay_period}</div>
              <div><strong>Employee ID:</strong> {emp.employee_id||"—"}</div>
              <div><strong>UAN:</strong> {emp.uan_number||"—"}</div>
              <div><strong>PF No:</strong> {emp.pf_number||"—"}</div>
            </div>
          </div>

          {/* Employee details grid */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px",marginBottom:20,fontSize:12 }}>
            {[
              ["Employee Name",  emp.full_name],
              ["Department",     emp.department],
              ["Designation",    emp.designation],
              ["Employment Type",emp.employment_type?.replace(/_/g," ")],
              ["Working Days",   slip.working_days],
              ["Days Present",   slip.present_days],
              ["LWP Days",       slip.lwp_days||0],
              ["Bank",           emp.bank_name||"—"],
            ].map(([l,v])=>(
              <div key={l} style={{ display:"flex",gap:6,padding:"4px 0",borderBottom:"1px solid #f0f0f0" }}>
                <span style={{ fontWeight:700,color:"#555",minWidth:110,flexShrink:0 }}>{l}:</span>
                <span style={{ textTransform:"capitalize" }}>{v||"—"}</span>
              </div>
            ))}
          </div>

          {/* Earnings vs Deductions table */}
          <table style={{ width:"100%",borderCollapse:"collapse",marginBottom:18 }}>
            <thead>
              <tr style={{ background:"#1e3a5f",color:"#fff" }}>
                <th style={{ padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,letterSpacing:".04em" }}>EARNINGS</th>
                <th style={{ padding:"9px 14px",textAlign:"right",fontSize:11,fontWeight:700 }}>AMOUNT</th>
                <th style={{ padding:"9px 14px",textAlign:"left",fontSize:11,fontWeight:700,letterSpacing:".04em",borderLeft:"1px solid #3b5998" }}>DEDUCTIONS</th>
                <th style={{ padding:"9px 14px",textAlign:"right",fontSize:11,fontWeight:700 }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length:rows }).map((_,i)=>{
                const e = slip.earnings?.[i];
                const d = slip.deductions?.[i];
                return (
                  <tr key={i} style={{ background:i%2===0?"#fff":"#f9fafb" }}>
                    <td style={{ padding:"7px 14px",border:"1px solid #e5e7eb",fontSize:12 }}>{e?.name||""}</td>
                    <td style={{ padding:"7px 14px",border:"1px solid #e5e7eb",textAlign:"right",fontWeight:e?500:400,fontSize:12 }}>{e?fmt(e.amount):""}</td>
                    <td style={{ padding:"7px 14px",border:"1px solid #e5e7eb",fontSize:12 }}>{d?.name||""}</td>
                    <td style={{ padding:"7px 14px",border:"1px solid #e5e7eb",textAlign:"right",color:d?"#dc2626":"",fontWeight:d?500:400,fontSize:12 }}>{d?fmt(d.amount):""}</td>
                  </tr>
                );
              })}
              {/* Totals row */}
              <tr style={{ background:"#f1f5f9",fontWeight:700 }}>
                <td style={{ padding:"9px 14px",border:"1px solid #d1d5db",fontSize:12 }}>Gross Salary</td>
                <td style={{ padding:"9px 14px",border:"1px solid #d1d5db",textAlign:"right",fontSize:12 }}>{fmt(slip.gross_salary)}</td>
                <td style={{ padding:"9px 14px",border:"1px solid #d1d5db",fontSize:12 }}>Total Deductions</td>
                <td style={{ padding:"9px 14px",border:"1px solid #d1d5db",textAlign:"right",color:"#dc2626",fontSize:12 }}>-{fmt(slip.total_deductions)}</td>
              </tr>
            </tbody>
          </table>

          {/* LWP deduction note */}
          {slip.lwp_deduction > 0 && (
            <div style={{ padding:"8px 14px",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:6,fontSize:11,color:"#c2410c",marginBottom:16 }}>
              ⚠️ LWP Deduction of {fmt(slip.lwp_deduction)} applied for {slip.lwp_days} day(s) Loss of Pay
            </div>
          )}

          {/* Net salary */}
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:24 }}>
            <div style={{ padding:"14px 28px",background:"#dcfce7",border:"1px solid #bbf7d0",borderRadius:10,textAlign:"right" }}>
              <div style={{ fontSize:11,fontWeight:700,color:"#14532d",textTransform:"uppercase",letterSpacing:".05em",marginBottom:4 }}>Net Salary (Take Home)</div>
              <div style={{ fontSize:22,fontWeight:800,color:"#15803d" }}>{fmt(slip.net_salary)}</div>
            </div>
          </div>

          {/* Bank details */}
          <div style={{ fontSize:11,color:"#64748b",borderTop:"1px solid #e2e8f0",paddingTop:10,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
            <span>Bank: {emp.bank_name||"—"} | A/C: XXXX{emp.account_number?.slice(-4)||"XXXX"} | IFSC: {emp.ifsc_code||"—"}</span>
            <span>This is a computer-generated salary slip and does not require a signature.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

