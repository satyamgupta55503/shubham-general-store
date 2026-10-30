"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Settings, Save, CheckCircle, AlertCircle } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

export default function HrmSettingsPage() {
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);
  const [tab,     setTab]     = useState("company");

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await HRM_API.get("/settings"); setForm(data); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault(); setSaving(true); setMsg(null);
    try {
      await HRM_API.put("/settings", form);
      setMsg({ type:"success", text:"Settings saved successfully!" });
      setTimeout(()=>setMsg(null),3000);
    } catch (err) { setMsg({ type:"error", text:err.response?.data?.message||"Save failed" }); }
    finally { setSaving(false); }
  };

  const F = (k) => ({ value:form?.[k]||"", onChange:(e)=>setForm(p=>({...p,[k]:e.target.value})) });
  const Fn = (k) => ({ ...F(k), type:"number", min:"0", value:form?.[k]||0, onChange:(e)=>setForm(p=>({...p,[k]:Number(e.target.value)})) });
  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  if (loading) return <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading settings…</div>;

  const TABS = [
    { key:"company", label:"Company" },{ key:"working", label:"Working Hours" },
    { key:"payroll", label:"Payroll" },{ key:"leave",   label:"Leave Policy" },
    { key:"security",label:"Security" },
  ];

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">HRM Settings</h1><p className="hrm-page-sub">Configure HR policies and company info</p></div>
        <button className="hrm-btn hrm-btn-primary" onClick={save} disabled={saving}><Save size={15}/>{saving?"Saving…":"Save Settings"}</button>
      </div>

      {msg && (
        <div style={{ display:"flex",alignItems:"center",gap:8,padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:20,background:msg.type==="success"?"#dcfce7":"#fee2e2",color:msg.type==="success"?"#15803d":"#dc2626",border:`1px solid ${msg.type==="success"?"#bbf7d0":"#fecaca"}` }}>
          {msg.type==="success"?<CheckCircle size={15}/>:<AlertCircle size={15}/>} {msg.text}
        </div>
      )}

      <div className="hrm-tabs" style={{ marginBottom:24 }}>
        {TABS.map(t=><button key={t.key} className={`hrm-tab ${tab===t.key?"active":"inactive"}`} onClick={()=>setTab(t.key)}>{t.label}</button>)}
      </div>

      <form onSubmit={save} style={{ maxWidth:680 }}>
        {tab==="company" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div className="hrm-form-row"><div><label style={lbl}>Company Name</label><input {...F("company_name")} style={inp}/></div><div><label style={lbl}>HR Email</label><input type="email" {...F("company_email")} style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>Phone</label><input {...F("company_phone")} style={inp}/></div></div>
            <div><label style={lbl}>Company Address</label><textarea {...F("company_address")} rows={3} style={{ ...inp,resize:"vertical" }}/></div>
          </div>
        )}
        {tab==="working" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div className="hrm-form-row"><div><label style={lbl}>Working Hours/Day</label><input {...Fn("working_hours_per_day")} style={inp}/></div><div><label style={lbl}>Working Days/Month</label><input {...Fn("working_days_per_month")} style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>Grace Period (min)</label><input {...Fn("grace_period_minutes")} style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>Standard Check-in</label><input {...F("standard_check_in")} placeholder="09:30" style={inp}/></div><div><label style={lbl}>Standard Check-out</label><input {...F("standard_check_out")} placeholder="18:30" style={inp}/></div></div>
          </div>
        )}
        {tab==="payroll" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div className="hrm-form-row"><div><label style={lbl}>PF Employee % (12)</label><input {...Fn("pf_employee_percent")} style={inp}/></div><div><label style={lbl}>PF Employer % (12)</label><input {...Fn("pf_employer_percent")} style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>ESI Employee % (0.75)</label><input {...Fn("esi_employee_percent")} step="0.01" style={inp}/></div><div><label style={lbl}>ESI Employer % (3.25)</label><input {...Fn("esi_employer_percent")} step="0.01" style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>Professional Tax (₹)</label><input {...Fn("professional_tax")} style={inp}/></div><div><label style={lbl}>Salary Day</label><input {...Fn("salary_day")} style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>PF Basic Ceiling (₹)</label><input {...Fn("pf_basic_ceiling")} style={inp}/></div><div><label style={lbl}>ESI Gross Ceiling (₹)</label><input {...Fn("esi_gross_ceiling")} style={inp}/></div></div>
          </div>
        )}
        {tab==="leave" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div className="hrm-form-row"><div><label style={lbl}>Leave Year Start Month</label><input {...Fn("leave_year_start_month")} min="1" max="12" style={inp}/><p style={{ fontSize:11,color:"#94a3b8",margin:"4px 0 0" }}>4 = April (financial year)</p></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>Max Carry Forward Days</label><input {...Fn("max_carry_forward")} style={inp}/></div></div>
          </div>
        )}
        {tab==="security" && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div className="hrm-form-row"><div><label style={lbl}>Max Login Attempts</label><input {...Fn("max_login_attempts")} style={inp}/></div><div><label style={lbl}>Lockout Duration (min)</label><input {...Fn("lockout_duration_minutes")} style={inp}/></div></div>
            <div className="hrm-form-row"><div><label style={lbl}>Session Timeout (hours)</label><input {...Fn("session_timeout_hours")} style={inp}/></div></div>
          </div>
        )}
      </form>
    </div>
  );
}
