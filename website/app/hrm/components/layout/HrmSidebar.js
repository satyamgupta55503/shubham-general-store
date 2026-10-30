"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, Calendar, FileText,
  DollarSign, ShieldAlert, Bell, Clock, Settings, X,
  Sun, Megaphone, BarChart2, CheckSquare, ClipboardList
} from "lucide-react";

const navItems = [
  { id:"dashboard",     label:"Dashboard",      href:"/hrm/dashboard",                  icon:LayoutDashboard, roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"employees",     label:"Employees",      href:"/hrm/dashboard/employees",        icon:Users,           roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"departments",   label:"Departments",    href:"/hrm/dashboard/departments",      icon:Building2,       roles:["hr_admin","hr_manager"] },
  { id:"attendance",    label:"Attendance",     href:"/hrm/dashboard/attendance",       icon:Calendar,        roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"leaves",        label:"Leaves",         href:"/hrm/dashboard/leaves",           icon:FileText,        roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"holidays",      label:"Holidays",       href:"/hrm/dashboard/holidays",         icon:Sun,             roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"tasks",         label:"Task Log",       href:"/hrm/dashboard/tasks",            icon:ClipboardList,   roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"payroll",       label:"Payroll",        href:"/hrm/dashboard/payroll",          icon:DollarSign,      roles:["hr_admin","hr_manager"] },
  { id:"onboarding",    label:"Onboarding",     href:"/hrm/dashboard/onboarding",       icon:CheckSquare,     roles:["hr_admin","hr_manager"] },
  { id:"announcements", label:"Announcements",  href:"/hrm/dashboard/announcements",    icon:Megaphone,       roles:["hr_admin","hr_manager"] },
  { id:"reports",       label:"Reports",        href:"/hrm/dashboard/reports",          icon:BarChart2,       roles:["hr_admin","hr_manager"] },
  { id:"pending",       label:"Pending Users",  href:"/hrm/dashboard/pending-users",    icon:ShieldAlert,     roles:["hr_admin"] },
  { id:"history",       label:"History",        href:"/hrm/dashboard/history",          icon:Clock,           roles:["hr_admin","hr_manager"] },
  { id:"notifications", label:"Notifications",  href:"/hrm/dashboard/notifications",    icon:Bell,            roles:["hr_admin","hr_manager","dept_manager"] },
  { id:"settings",      label:"Settings",       href:"/hrm/dashboard/settings",         icon:Settings,        roles:["hr_admin"] },
];

export default function HrmSidebar({ mobileOpen, onClose }) {
  const pathname  = usePathname();
  const [role,     setRole]     = useState("hr_manager");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("hrm_user")||"{}"); if (u.role) setRole(u.role); } catch {}
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const visible = navItems.filter(i => i.roles.includes(role));

  return (
    <>
      {isMobile && mobileOpen && (
        <div onClick={onClose} style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:99,backdropFilter:"blur(2px)" }}/>
      )}
      <aside style={{
        width:"220px", height:"100vh", background:"#fff", borderRight:"1px solid #e2e8f0",
        display:"flex", flexDirection:"column", flexShrink:0, overflowY:"auto", overflowX:"hidden",
        position:isMobile?"fixed":"relative", top:0, left:0,
        zIndex:isMobile?100:"auto",
        transform:isMobile?(mobileOpen?"translateX(0)":"translateX(-100%)"):"none",
        transition:"transform .28s cubic-bezier(.4,0,.2,1)",
        boxShadow:isMobile&&mobileOpen?"4px 0 24px rgba(0,0,0,.12)":"none",
      }}>
        {/* Logo */}
        <div style={{ padding:"18px 18px 14px", borderBottom:"1px solid #f1f5f9", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"32px", height:"32px", background:"linear-gradient(135deg,#7c3aed,#5b21b6)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontSize:"13px", fontWeight:"800", color:"#3b0764", lineHeight:1.1 }}>Subham</div>
              <div style={{ fontSize:"9px", color:"#7c3aed", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase" }}>HRM</div>
            </div>
          </div>
          {isMobile && (
            <button onClick={onClose} style={{ background:"#f5f3ff", border:"none", borderRadius:"6px", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#7c3aed" }}>
              <X size={16}/>
            </button>
          )}
        </div>

        <p style={{ fontSize:"10px", fontWeight:"700", letterSpacing:".1em", textTransform:"uppercase", color:"#94a3b8", padding:"10px 18px 4px", margin:0, flexShrink:0 }}>Menu</p>

        <nav style={{ display:"flex", flexDirection:"column", gap:"2px", padding:"0 10px", flex:1 }}>
          {visible.map(item => {
            const Icon   = item.icon;
            const active = pathname === item.href || (item.href !== "/hrm/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.id} href={item.href} onClick={onClose}
                className={`hrm-nav-link ${active?"active":"inactive"}`}>
                <Icon size={16} style={{ flexShrink:0 }}/>
                <span style={{ flex:1 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Other Portals */}
        <div style={{ borderTop:"1px solid #f1f5f9", margin:"8px 10px 0", paddingTop:8 }}>
          <p style={{ fontSize:"9px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".1em", padding:"0 8px 4px", margin:0 }}>Other Portals</p>
          {[
            { href:"/crm/login", label:"CRM Portal", color:"#22c55e", bg:"#f0fdf4" },
            { href:"/emp/login", label:"EMP Portal", color:"#2563eb", bg:"#eff6ff" },
          ].map(p => (
            <a key={p.href} href={p.href} target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", gap:"8px", padding:"8px 10px", borderRadius:"7px", textDecoration:"none", color:p.color, fontSize:"12px", fontWeight:"600", transition:"background .15s" }}
              onMouseEnter={e=>e.currentTarget.style.background=p.bg}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:p.color, flexShrink:0 }}/>
              {p.label}<span style={{ marginLeft:"auto", fontSize:"10px" }}>↗</span>
            </a>
          ))}
        </div>

        <div style={{ padding:"12px 18px", borderTop:"1px solid #f1f5f9", flexShrink:0 }}>
          <div style={{ fontSize:"10px", fontWeight:"700", color:"#94a3b8", textTransform:"uppercase", letterSpacing:".05em" }}>Role: {role?.replace(/_/g," ")}</div>
        </div>
      </aside>
    </>
  );
}
