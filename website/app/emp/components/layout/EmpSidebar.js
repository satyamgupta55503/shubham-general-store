"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, FileText, DollarSign,
  User, Bell, X, Sun, Megaphone, Users, ClipboardList
} from "lucide-react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const navItems = [
  { id:"dashboard",     label:"Dashboard",      href:"/emp/dashboard",                icon:LayoutDashboard },
  { id:"attendance",    label:"Attendance",     href:"/emp/dashboard/attendance",     icon:Calendar        },
  { id:"tasks",         label:"My Tasks",       href:"/emp/dashboard/tasks",          icon:ClipboardList   },
  { id:"leaves",        label:"My Leaves",      href:"/emp/dashboard/leaves",         icon:FileText        },
  { id:"holidays",      label:"Holidays",       href:"/emp/dashboard/holidays",       icon:Sun             },
  { id:"salary",        label:"Salary",         href:"/emp/dashboard/salary",         icon:DollarSign      },
  { id:"announcements", label:"Announcements",  href:"/emp/dashboard/announcements",  icon:Megaphone       },
  { id:"team",          label:"Team Directory", href:"/emp/dashboard/team",           icon:Users           },
  { id:"profile",       label:"My Profile",     href:"/emp/dashboard/profile",        icon:User            },
  { id:"notifications", label:"Notifications",  href:"/emp/dashboard/notifications",  icon:Bell            },
];

export default function EmpSidebar({ mobileOpen, onClose }) {
  const pathname  = usePathname();
  const [emp,      setEmp]      = useState({ full_name:"Employee", employee_id:"", profile_image:null });
  const [isMobile, setIsMobile] = useState(false);
  const [unread,   setUnread]   = useState(0);

  /* Load employee from localStorage first, then refresh from API for latest photo */
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("emp_user") || "{}");
      if (u.full_name) setEmp(u);
    } catch {}

    // Refresh from API to get latest profile_image
    const token = localStorage.getItem("emp_token");
    if (!token) return;
    fetch(`${BASE}/api/emp/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.full_name) {
          setEmp(data);
          // Update localStorage too so header also reflects
          localStorage.setItem("emp_user", JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, [pathname]); // re-fetch on every navigation so photo is always fresh

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* Poll unread announcements */
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("emp_token");
        if (!token) return;
        const res = await fetch(`${BASE}/api/emp/announcements`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setUnread((data || []).filter(a => !a.is_read).length);
        }
      } catch {}
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 60000);
    return () => clearInterval(iv);
  }, [pathname]);

  const initials = emp.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "E";

  return (
    <>
      {isMobile && mobileOpen && (
        <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:99,backdropFilter:"blur(2px)" }}/>
      )}
      <aside style={{
        width:"220px", height:"100vh", background:"#fff", borderRight:"1px solid #e2e8f0",
        display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto", overflowX:"hidden",
        position:isMobile?"fixed":"relative", top:0, left:0, zIndex:isMobile?100:"auto",
        transform:isMobile?(mobileOpen?"translateX(0)":"translateX(-100%)"):"none",
        transition:"transform .28s cubic-bezier(.4,0,.2,1)",
        boxShadow:isMobile&&mobileOpen?"4px 0 24px rgba(0,0,0,.12)":"none",
      }}>
        {/* Logo */}
        <div style={{ padding:"18px 18px 14px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
            <div style={{ width:"32px",height:"32px",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontSize:"13px",fontWeight:"800",color:"#1e3a8a",lineHeight:1.1 }}>Subham Store</div>
              <div style={{ fontSize:"9px",color:"#2563eb",fontWeight:"700",letterSpacing:"0.08em",textTransform:"uppercase" }}>My Portal</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={onClose} style={{ background:"#eff6ff",border:"none",borderRadius:"6px",width:"28px",height:"28px",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#2563eb" }}>
              <X size={16}/>
            </button>
          )}
        </div>

        {/* Employee mini-card */}
        <div style={{ padding:"14px 18px",borderBottom:"1px solid #f1f5f9",flexShrink:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:"10px" }}>
            {/* ✅ Show actual photo if HR uploaded one */}
            {emp.profile_image ? (
              <img
                src={`${BASE}/${emp.profile_image}`}
                alt={emp.full_name}
                style={{ width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid #dbeafe",flexShrink:0 }}
                onError={e => { e.target.style.display="none"; }}
              />
            ) : (
              <div style={{ width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"700",fontSize:"13px",flexShrink:0 }}>
                {initials}
              </div>
            )}
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:"13px",fontWeight:"700",color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{emp.full_name}</div>
              <div style={{ fontSize:"10px",color:"#94a3b8" }}>{emp.employee_id}</div>
            </div>
          </div>
        </div>

        <p style={{ fontSize:"10px",fontWeight:"700",letterSpacing:".1em",textTransform:"uppercase",color:"#94a3b8",padding:"10px 18px 4px",margin:0,flexShrink:0 }}>Menu</p>

        <nav style={{ display:"flex",flexDirection:"column",gap:"2px",padding:"0 10px",flex:1 }}>
          {navItems.map(item => {
            const Icon   = item.icon;
            const active = pathname === item.href || (item.href !== "/emp/dashboard" && pathname.startsWith(item.href));
            const badge  = item.id === "announcements" && unread > 0 ? unread : 0;
            return (
              <Link key={item.id} href={item.href} onClick={onClose}
                className={`emp-nav-link ${active ? "active" : "inactive"}`}
                style={{ position:"relative" }}>
                <Icon size={16} style={{ flexShrink:0 }}/>
                <span style={{ flex:1 }}>{item.label}</span>
                {badge > 0 && (
                  <span style={{ background:"#dc2626",color:"#fff",fontSize:"9px",fontWeight:"800",padding:"1px 5px",borderRadius:"10px",lineHeight:1.4,flexShrink:0 }}>{badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding:"12px 18px",borderTop:"1px solid #f1f5f9",flexShrink:0 }}>
          <div style={{ fontSize:"10px",fontWeight:"700",color:"#94a3b8",textTransform:"uppercase",letterSpacing:".05em" }}>Employee Portal</div>
        </div>
      </aside>
    </>
  );
}
