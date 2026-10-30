"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, ChevronDown, Menu } from "lucide-react";
import EMP_API from "@/utils/empApi";

export default function EmpHeader({ onMenuToggle }) {
  const router = useRouter();
  const [emp,     setEmp]     = useState({ full_name:"Employee", employee_id:"", department:{name:""} });
  const [unread,  setUnread]  = useState(0);
  const [dropOpen,setDropOpen]= useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("emp_user")||"{}"); if (u.full_name) setEmp(u); } catch {}
    fetchUnread();
    // Refresh from API for latest profile_image
    const token = localStorage.getItem("emp_token");
    if (token) {
      const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      fetch(`${base}/api/emp/auth/me`, { headers:{ Authorization:`Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.full_name) { setEmp(data); localStorage.setItem("emp_user", JSON.stringify(data)); } })
        .catch(()=>{});
    }
    const iv = setInterval(fetchUnread, 30000);
    return () => clearInterval(iv);
  }, []);

  const fetchUnread = async () => {
    try { const { data } = await EMP_API.get("/notifications?limit=1"); setUnread(data.unread_count||0); } catch {}
  };

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn); return () => document.removeEventListener("mousedown", fn);
  }, []);

  const logout = () => { localStorage.removeItem("emp_token"); localStorage.removeItem("emp_user"); router.replace("/emp/login"); };
  const initials = emp.full_name?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"E";
  const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  return (
    <header style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0 24px", height:"62px", background:"#fff", borderBottom:"1px solid #e2e8f0", flexShrink:0, fontFamily:"'Inter',sans-serif" }}>
      <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
        <button onClick={onMenuToggle} style={{ background:"none", border:"none", cursor:"pointer", color:"#64748b", display:"flex", padding:"4px" }}><Menu size={20}/></button>
        <h2 style={{ fontSize:"15px", fontWeight:"700", color:"#1e293b", margin:0 }}>Employee Portal</h2>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
        <Link href="/emp/dashboard/notifications" style={{ position:"relative", width:"36px", height:"36px", borderRadius:"50%", border:"1px solid #e2e8f0", background:"#f8fafc", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748b", textDecoration:"none" }}>
          <Bell size={17}/>
          {unread>0 && <span style={{ position:"absolute", top:"-3px", right:"-3px", minWidth:"17px", height:"17px", padding:"0 4px", background:"#ef4444", border:"2px solid #fff", borderRadius:"10px", fontSize:"9px", fontWeight:"700", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>{unread>99?"99+":unread}</span>}
        </Link>
        <div ref={dropRef} style={{ position:"relative" }}>
          <button onClick={()=>setDropOpen(!dropOpen)} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"5px 10px", borderRadius:"8px", border:"1px solid #e2e8f0", background:"#f8fafc", cursor:"pointer" }}>
            {emp.profile_image ? (
              <img src={`${BASE}/${emp.profile_image}`} alt={emp.full_name} style={{ width:30,height:30,borderRadius:"50%",objectFit:"cover",border:"2px solid #dbeafe",flexShrink:0 }} onError={e=>{e.target.style.display="none";}}/>
            ) : (
              <div style={{ width:"30px", height:"30px", borderRadius:"50%", background:"linear-gradient(135deg,#2563eb,#1d4ed8)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"700", fontSize:"12px" }}>{initials}</div>
            )}
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#1e293b", maxWidth:"100px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{emp.full_name}</div>
              <div style={{ fontSize:"10px", color:"#64748b" }}>{emp.employee_id}</div>
            </div>
            <ChevronDown size={13} style={{ color:"#94a3b8", transform:dropOpen?"rotate(180deg)":"none", transition:"transform .15s" }}/>
          </button>
          {dropOpen && (
            <div style={{ position:"absolute", top:"calc(100% + 8px)", right:0, width:"180px", background:"#fff", border:"1px solid #e2e8f0", borderRadius:"10px", boxShadow:"0 10px 30px rgba(0,0,0,.08)", zIndex:1000, padding:"6px" }}>
              <div style={{ padding:"8px 10px", borderBottom:"1px solid #f1f5f9", marginBottom:"4px" }}>
                <div style={{ fontSize:"11px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase" }}>{emp.department?.name||"Employee"}</div>
              </div>
              <a href="/emp/dashboard/profile" style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", textDecoration:"none", borderRadius:"6px", color:"#374151", fontSize:"13px", fontWeight:"500" }}
                onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>My Profile</a>
              <button onClick={logout} style={{ width:"100%", display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", background:"none", border:"none", cursor:"pointer", borderRadius:"6px", color:"#dc2626", fontSize:"13px", fontWeight:"500" }}
                onMouseEnter={e=>e.currentTarget.style.background="#fef2f2"}
                onMouseLeave={e=>e.currentTarget.style.background="none"}>
                <LogOut size={14}/> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
