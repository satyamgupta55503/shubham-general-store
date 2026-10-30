"use client";
import React, { useState } from "react";

function PortalCard({ href, title, description, btnLabel, btnBg, iconColor, iconBg, icon, badge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a href={href} style={{ textDecoration:"none" }}>
      <div onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{ background:"#fff", border:`1.5px solid ${hovered?iconColor:"#e2e8f0"}`, borderRadius:"16px", padding:"28px 24px", textAlign:"center", cursor:"pointer", transition:"all .2s", boxShadow:hovered?`0 8px 24px ${iconColor}1f`:"none" }}>
        {badge && <div style={{ position:"absolute",top:12,right:12,background:"#22c55e",color:"#fff",fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:10 }}>{badge}</div>}
        <div style={{ width:"52px",height:"52px",background:iconBg,borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>{icon}</div>
        <h2 style={{ fontSize:"16px",fontWeight:"800",color:"#0f172a",margin:"0 0 6px" }}>{title}</h2>
        <p style={{ fontSize:"12px",color:"#64748b",margin:"0 0 16px",lineHeight:1.5 }}>{description}</p>
        <span style={{ display:"inline-flex",alignItems:"center",gap:"5px",padding:"8px 18px",background:btnBg,color:"#fff",borderRadius:"8px",fontSize:"13px",fontWeight:"700" }}>{btnLabel}</span>
      </div>
    </a>
  );
}

export default function PortalsPage() {
  const portals = [
    { href:"/admin/login",title:"CMS Portal",description:"Manage website content, blog posts, projects and media",btnLabel:"Login to CMS →",btnBg:"#22c55e",iconColor:"#22c55e",iconBg:"#f0fdf4",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg> },
    { href:"/crm/login",title:"CRM Portal",description:"Manage clients, projects, invoices, proposals and payments",btnLabel:"Login to CRM →",btnBg:"#16a34a",iconColor:"#16a34a",iconBg:"#dcfce7",badge:"Built",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { href:"/hrm/login",title:"HRM Portal",description:"Manage team, attendance, payroll, leaves and performance",btnLabel:"Login to HRM →",btnBg:"#7c3aed",iconColor:"#7c3aed",iconBg:"#ede9fe",badge:"New",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { href:"/emp/login",title:"Employee Portal",description:"View your attendance, salary slips, apply leaves",btnLabel:"Employee Login →",btnBg:"#2563eb",iconColor:"#2563eb",iconBg:"#dbeafe",badge:"New",icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#f0fdf4,#f5f3ff,#eff6ff)",fontFamily:"'Inter',-apple-system,sans-serif",padding:"40px 20px" }}>
      <div style={{ width:"100%",maxWidth:"720px" }}>
        <div style={{ textAlign:"center",marginBottom:"40px" }}>
          <div style={{ width:"56px",height:"56px",background:"linear-gradient(135deg,#22c55e,#7c3aed)",borderRadius:"16px",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
          </div>
          <h1 style={{ fontSize:"28px",fontWeight:"800",color:"#0f172a",margin:"0 0 8px" }}>Subham General Store</h1>
          <p style={{ fontSize:"15px",color:"#64748b",margin:0 }}>Choose your portal to continue</p>
        </div>

        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"16px",position:"relative" }}>
          {portals.map(p=><PortalCard key={p.href} {...p}/>)}
        </div>

        <p style={{ textAlign:"center",fontSize:"12px",color:"#94a3b8",marginTop:"28px" }}>Subham General Store · Internal Staff Only</p>
      </div>
    </div>
  );
}

