"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EMP_API from "@/utils/empApi";

export default function EmpLogin() {
  const router = useRouter();
  const [form, setForm]     = useState({ work_email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("emp_token")) router.replace("/emp/dashboard");
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await EMP_API.post("/auth/login", form);
      localStorage.setItem("emp_token", data.token);
      localStorage.setItem("emp_user", JSON.stringify(data.employee));
      router.replace("/emp/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  const F = (k) => ({ value:form[k], onChange:(e)=>setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:"9px", fontSize:"14px", outline:"none", fontFamily:"inherit", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:isMobile?"column":"row", background:"#eff6ff", fontFamily:"'Inter',sans-serif" }}>
      {/* Left — Form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:isMobile?"36px 20px":"48px 40px" }}>
        <div style={{ width:"100%", maxWidth:"400px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"36px" }}>
            <div style={{ width:"44px", height:"44px", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontSize:"17px", fontWeight:"800", color:"#1e3a8a" }}>Subham General Store</div>
              <div style={{ fontSize:"11px", color:"#2563eb", fontWeight:"600", letterSpacing:"0.08em", textTransform:"uppercase" }}>Employee Portal</div>
            </div>
          </div>

          <h1 style={{ fontSize:isMobile?"22px":"26px", fontWeight:"800", color:"#0f172a", margin:"0 0 6px" }}>Employee Login</h1>
          <p style={{ fontSize:"14px", color:"#64748b", margin:"0 0 28px" }}>Sign in with your work email to access your portal.</p>

          {error && <div style={{ background:"#fee2e2", color:"#dc2626", padding:"12px 14px", borderRadius:"9px", fontSize:"13px", marginBottom:"18px", border:"1px solid #fecaca" }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" }}>Work Email <span style={{ color:"#ef4444" }}>*</span></label>
              <input type="email" {...F("work_email")} required placeholder="emp@subhamstore.com" style={inp} onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
            </div>
            <div>
              <label style={{ display:"block", fontSize:"13px", fontWeight:"600", color:"#374151", marginBottom:"6px" }}>Password <span style={{ color:"#ef4444" }}>*</span></label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} {...F("password")} required placeholder="Enter password" style={{ ...inp, paddingRight:"56px" }} onFocus={e=>e.target.style.borderColor="#2563eb"} onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#94a3b8", fontSize:"11px", fontWeight:"700" }}>{showPw?"HIDE":"SHOW"}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", background:loading?"#93c5fd":"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", border:"none", borderRadius:"9px", fontSize:"15px", fontWeight:"700", cursor:loading?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"4px" }}>
              {loading?<><span style={{ width:"18px", height:"18px", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }}/>Signing in…</>:"Sign In"}
            </button>
          </form>
          <p style={{ textAlign:"center", fontSize:"13px", color:"#94a3b8", marginTop:"24px" }}>
            Forgot password? <a href="/portals" style={{ color:"#2563eb", fontWeight:"600", textDecoration:"none" }}>Contact HR →</a>
          </p>
        </div>
      </div>

      {/* Right — Decorative */}
      {!isMobile && (
        <div style={{ flex:1, background:"linear-gradient(135deg,#1e3a8a,#1d4ed8,#2563eb)", display:"flex", alignItems:"center", justifyContent:"center", padding:"48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, opacity:.07, backgroundImage:"radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)", backgroundSize:"40px 40px" }}/>
          <div style={{ position:"relative", textAlign:"center", color:"#fff", maxWidth:"360px" }}>
            <div style={{ width:"80px", height:"80px", background:"rgba(255,255,255,.15)", borderRadius:"20px", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h2 style={{ fontSize:"28px", fontWeight:"800", margin:"0 0 14px" }}>Employee Self-Service</h2>
            <p style={{ fontSize:"15px", opacity:.85, margin:"0 0 32px", lineHeight:1.6 }}>Your personal portal for attendance, leaves, salary slips and more.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", textAlign:"left" }}>
              {["Mark Attendance","Apply for Leave","Download Salary Slip","View Profile"].map((item,i)=>(
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
