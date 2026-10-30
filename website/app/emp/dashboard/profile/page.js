"use client";
import React, { useState, useEffect } from "react";
import EMP_API from "@/utils/empApi";

export default function EmpProfilePage() {
  const [emp,    setEmp]    = useState(null);
  const [form,   setForm]   = useState({});
  const [pwForm, setPwForm] = useState({ old_password:"", new_password:"", confirm:"" });
  const [saving, setSaving] = useState(false);
  const [pwSaving,setPwSaving] = useState(false);
  const [msg,    setMsg]    = useState("");
  const [pwMsg,  setPwMsg]  = useState("");
  const [tab,    setTab]    = useState("personal");

  useEffect(() => {
    EMP_API.get("/auth/me").then(({ data }) => { setEmp(data); setForm({ phone:data.phone||"", personal_email:data.personal_email||"", current_address:data.current_address||"", emergency_contact_name:data.emergency_contact_name||"", emergency_contact_phone:data.emergency_contact_phone||"" }); }).catch(()=>{});
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setMsg("");
    try { await EMP_API.patch("/auth/profile", form); setMsg("✅ Profile updated!"); setTimeout(()=>setMsg(""),3000); }
    catch (err) { setMsg("❌ "+(err.response?.data?.message||"Failed")); }
    finally { setSaving(false); }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { setPwMsg("❌ Passwords don't match"); return; }
    if (pwForm.new_password.length < 8) { setPwMsg("❌ Min 8 characters"); return; }
    setPwSaving(true); setPwMsg("");
    try { await EMP_API.post("/auth/me/change-password", { old_password:pwForm.old_password, new_password:pwForm.new_password }); setPwForm({ old_password:"", new_password:"", confirm:"" }); setPwMsg("✅ Password changed!"); setTimeout(()=>setPwMsg(""),3000); }
    catch (err) { setPwMsg("❌ "+(err.response?.data?.message||"Failed")); }
    finally { setPwSaving(false); }
  };

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };
  const F = (k,setter,obj) => ({ value:obj[k]||"", onChange:(e)=>setter(p=>({...p,[k]:e.target.value})) });
  const initials = emp?.full_name?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"E";

  if (!emp) return <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>;

  return (
    <div>
      <div className="emp-page-header"><h1 className="emp-page-title">My Profile</h1></div>

      {/* Avatar Card */}
      <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,marginBottom:24,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>
        {emp.profile_image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_BACKEND_URL||"http://localhost:5000"}/${emp.profile_image}`}
            alt={emp.full_name}
            style={{ width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"3px solid #dbeafe",flexShrink:0 }}
          />
        ) : (
          <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",fontSize:26,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>{initials}</div>
        )}
        <div>
          <h2 style={{ fontSize:20,fontWeight:800,color:"#0f172a",margin:"0 0 4px" }}>{emp.full_name}</h2>
          <div style={{ fontSize:13,color:"#64748b" }}>{emp.employee_id} · {emp.designation?.title||"—"} · {emp.department?.name||"—"}</div>
          <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>Joined: {emp.date_of_joining?new Date(emp.date_of_joining).toLocaleDateString("en-IN"):"—"} · Status: <span style={{ color:"#16a34a",fontWeight:600,textTransform:"capitalize" }}>{emp.status}</span></div>
          {emp.profile_image && <div style={{ fontSize:11,color:"#64748b",marginTop:4 }}>📷 Profile photo set by HR</div>}
        </div>
      </div>

      <div className="emp-tabs" style={{ marginBottom:20 }}>
        {["personal","bank","password"].map(t=><button key={t} className={`emp-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)} style={{ padding:"8px 16px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:tab===t?"#2563eb":"transparent",color:tab===t?"#fff":"#64748b",textTransform:"capitalize" }}>{t==="password"?"Change Password":t.charAt(0).toUpperCase()+t.slice(1)}</button>)}
      </div>

      {tab==="personal" && (
        <div style={{ maxWidth:520 }}>
          {msg&&<div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:msg.startsWith("✅")?"#dcfce7":"#fee2e2",color:msg.startsWith("✅")?"#15803d":"#dc2626" }}>{msg}</div>}
          <form onSubmit={saveProfile} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            <div className="emp-form-row">
              <div><label style={lbl}>Personal Phone</label><input {...F("phone",setForm,form)} style={inp}/></div>
              <div><label style={lbl}>Personal Email</label><input type="email" {...F("personal_email",setForm,form)} style={inp}/></div>
            </div>
            <div><label style={lbl}>Current Address</label><textarea {...F("current_address",setForm,form)} rows={2} style={{ ...inp,resize:"vertical" }}/></div>
            <div className="emp-form-row">
              <div><label style={lbl}>Emergency Contact Name</label><input {...F("emergency_contact_name",setForm,form)} style={inp}/></div>
              <div><label style={lbl}>Emergency Phone</label><input {...F("emergency_contact_phone",setForm,form)} style={inp}/></div>
            </div>
            <button type="submit" className="emp-btn emp-btn-primary" disabled={saving} style={{ alignSelf:"flex-start" }}>{saving?"Saving…":"Update Profile"}</button>
          </form>
        </div>
      )}

      {tab==="bank" && (
        <div style={{ maxWidth:520 }}>
          <div style={{ background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"14px 18px",marginBottom:16,fontSize:13,color:"#92400e" }}>🔒 Bank details can only be updated by HR. Contact your HR admin to make changes.</div>
          <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:10,fontSize:13 }}>
            {[["Bank Name",emp.bank_name||"—"],["Account Number",emp.account_number?`XXXX XXXX ${emp.account_number.slice(-4)}`:"—"],["IFSC Code",emp.ifsc_code||"—"],["UPI ID",emp.upi_id||"—"],["PF Number",emp.pf_number||"—"],["ESI Number",emp.esi_number||"—"],["UAN Number",emp.uan_number||"—"]].map(([l,v])=>(
              <div key={l} style={{ display:"flex",gap:8,padding:"8px 0",borderBottom:"1px solid #f8fafc" }}>
                <span style={{ fontWeight:600,color:"#374151",minWidth:130 }}>{l}:</span>
                <span style={{ color:"#0f172a" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="password" && (
        <div style={{ maxWidth:400 }}>
          {pwMsg&&<div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:pwMsg.startsWith("✅")?"#dcfce7":"#fee2e2",color:pwMsg.startsWith("✅")?"#15803d":"#dc2626" }}>{pwMsg}</div>}
          <form onSubmit={changePw} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:14 }}>
            <div><label style={lbl}>Current Password <span style={{ color:"#ef4444" }}>*</span></label><input type="password" value={pwForm.old_password} onChange={e=>setPwForm(p=>({...p,old_password:e.target.value}))} required style={inp}/></div>
            <div><label style={lbl}>New Password <span style={{ color:"#ef4444" }}>*</span></label><input type="password" value={pwForm.new_password} onChange={e=>setPwForm(p=>({...p,new_password:e.target.value}))} required minLength={8} style={inp}/></div>
            <div><label style={lbl}>Confirm New Password <span style={{ color:"#ef4444" }}>*</span></label><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(p=>({...p,confirm:e.target.value}))} required style={inp}/></div>
            <button type="submit" className="emp-btn emp-btn-primary" disabled={pwSaving} style={{ alignSelf:"flex-start" }}>{pwSaving?"Changing…":"Change Password"}</button>
          </form>
        </div>
      )}
    </div>
  );
}
