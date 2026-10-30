"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HRM_API from "@/utils/hrmApi";

export default function HrmLogin() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("hrm_token")) router.replace("/hrm/dashboard");
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await HRM_API.post("/auth/login", form);
      localStorage.setItem("hrm_token", data.token);
      localStorage.setItem("hrm_user", JSON.stringify(data.user));
      router.replace("/hrm/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const F = (k) => ({ value: form[k], onChange: (e) => setForm(p => ({ ...p, [k]: e.target.value })) });
  const inputStyle = { width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:"9px", fontSize:"14px", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:isMobile?"column":"row", background:"#f5f3ff", fontFamily:"'Inter',sans-serif" }}>
      {/* Left — Form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:isMobile?"36px 20px":"48px 40px" }}>
        <div style={{ width:"100%", maxWidth:"400px" }}>
          {/* Brand */}
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"36px" }}>
            <div style={{ width:"44px", height:"44px", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div style={{ fontSize:"17px", fontWeight:"800", color:"#3b0764" }}>Subham General Store</div>
              <div style={{ fontSize:"11px", color:"#7c3aed", fontWeight:"600", letterSpacing:"0.08em", textTransform:"uppercase" }}>HRM Portal</div>
            </div>
          </div>

          <h1 style={{ fontSize:isMobile?"22px":"26px", fontWeight:"800", color:"#0f172a", margin:"0 0 6px" }}>HR Admin Login</h1>
          <p style={{ fontSize:"14px", color:"#64748b", margin:"0 0 28px" }}>Manage your team, attendance, payroll and more.</p>

          {error && <div style={{ background:"#fee2e2", color:"#dc2626", padding:"12px 14px", borderRadius:"9px", fontSize:"13px", marginBottom:"18px", border:"1px solid #fecaca" }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" }}>Email Address <span style={{ color:"#ef4444" }}>*</span></label>
              <input type="email" {...F("email")} required placeholder="hrm@subhamstore.com" style={inputStyle} onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" }}>Password <span style={{ color:"#ef4444" }}>*</span></label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} {...F("password")} required placeholder="Enter password" style={{ ...inputStyle, paddingRight:"56px" }} onFocus={e=>e.target.style.borderColor="#7c3aed"} onBlur={e=>e.target.style.borderColor="#e2e8f0"} />
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:"11px", fontWeight:"700" }}>{showPw?"HIDE":"SHOW"}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:loading?"#c4b5fd":"linear-gradient(135deg,#7c3aed,#5b21b6)", color:"#fff", border:"none", borderRadius:"9px", fontSize:"15px", fontWeight:"700", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"4px" }}>
              {loading ? <><span style={{ width:"18px", height:"18px", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/>Signing in…</> : "Sign In to HRM"}
            </button>
          </form>
          <p style={{ textAlign:"center", fontSize:"13px", color:"#94a3b8", marginTop:"24px" }}>
            Looking for another portal?{" "}
            <a href="/portals" style={{ color:"#7c3aed", fontWeight:"600", textDecoration:"none" }}>Portal Chooser →</a>
          </p>
        </div>
      </div>

      {/* Right — Decorative (desktop only) */}
      {!isMobile && (
        <div style={{ flex:1, background:"linear-gradient(135deg,#3b0764,#5b21b6,#7c3aed)", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, opacity:.07, backgroundImage:"radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)", backgroundSize:"40px 40px" }}/>
          <div style={{ position:"relative", textAlign:"center", color:"#fff", maxWidth:"360px" }}>
            <div style={{ width:"80px", height:"80px", background:"rgba(255,255,255,.15)", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h2 style={{ fontSize:"28px", fontWeight:"800", margin:"0 0 14px" }}>HR Management</h2>
            <p style={{ fontSize:"15px", opacity:.85, margin:"0 0 32px", lineHeight:1.6 }}>Manage employees, attendance, payroll, leaves and performance — all in one place.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", textAlign:"left" }}>
              {["Employee Management","Attendance Tracking","Payroll Processing","Leave Management"].map((item,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px", opacity:.9 }}>
                  <div style={{ width:"22px", height:"22px", flexShrink:0, background:"rgba(255,255,255,.2)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <span style={{ fontSize:"14px" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
