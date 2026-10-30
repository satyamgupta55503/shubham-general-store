"use client";
import React, { useState, useEffect } from "react";

const PORTALS = [
  {
    id:       "cms",
    label:    "CMS",
    name:     "Content Management",
    href:     "/admin/login",
    gradient: "linear-gradient(135deg,#16a34a,#15803d)",
    glow:     "rgba(22,163,74,.3)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
      </svg>
    ),
  },
  {
    id:       "crm",
    label:    "CRM",
    name:     "Client Management",
    href:     "/crm/login",
    gradient: "linear-gradient(135deg,#2563eb,#1d4ed8)",
    glow:     "rgba(37,99,235,.3)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id:       "hrm",
    label:    "HRM",
    name:     "HR Management",
    href:     "/hrm/login",
    gradient: "linear-gradient(135deg,#7c3aed,#5b21b6)",
    glow:     "rgba(124,58,237,.3)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    id:       "emp",
    label:    "EMP",
    name:     "Employee Portal",
    href:     "/emp/login",
    gradient: "linear-gradient(135deg,#0891b2,#0e7490)",
    glow:     "rgba(8,145,178,.3)",
    icon: (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export default function LoginHub() {
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const s = document.createElement("style");
    s.id = "hub-fix";
    s.textContent = `
      * { cursor: auto !important; }
      .custom-cursor, .custom-cursor-outer { display: none !important; }
      a { cursor: pointer !important; }
    `;
    document.head.appendChild(s);
    return () => document.getElementById("hub-fix")?.remove();
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 20px",
      background: "linear-gradient(135deg,#052e16 0%,#14532d 40%,#052e16 100%)",
      fontFamily: "'Inter',-apple-system,sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background glows */}
      <div style={{ position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden" }}>
        <div style={{ position:"absolute",left:"25%",top:"30%",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(22,163,74,.12),transparent 70%)",transform:"translate(-50%,-50%)" }}/>
        <div style={{ position:"absolute",left:"75%",top:"70%",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,rgba(22,163,74,.08),transparent 70%)",transform:"translate(-50%,-50%)" }}/>
      </div>

      {/* Logo + Title */}
      <div style={{ textAlign:"center",marginBottom:36,position:"relative",zIndex:1 }}>
        {/* Store Icon */}
        <div style={{
          display:"inline-flex",alignItems:"center",justifyContent:"center",
          width:64,height:64,borderRadius:20,
          background:"linear-gradient(135deg,#16a34a,#15803d)",
          marginBottom:16,
          boxShadow:"0 8px 32px rgba(22,163,74,.45)",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h1 style={{ fontSize:26,fontWeight:800,color:"#fff",margin:"0 0 4px",letterSpacing:"-.02em" }}>
          Subham General Store
        </h1>
        <p style={{ fontSize:13,color:"rgba(255,255,255,.45)",margin:"0 0 6px" }}>
          Admin & Management Portals
        </p>
        <a href="/" style={{ fontSize:12,color:"rgba(134,239,172,.7)",textDecoration:"none",
          display:"inline-flex",alignItems:"center",gap:4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go to Store
        </a>
      </div>

      {/* Portal Cards */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",
        gap:16,
        maxWidth:940,
        width:"100%",
        position:"relative",
        zIndex:1,
      }}>
        {PORTALS.map(p => {
          const on = hovered === p.id;
          return (
            <a
              key={p.id}
              href={p.href}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                textDecoration:"none",
                display:"block",
                background: on ? "rgba(255,255,255,.1)" : "rgba(255,255,255,.05)",
                border:`1.5px solid ${on ? "rgba(255,255,255,.22)" : "rgba(255,255,255,.09)"}`,
                borderRadius:16,
                padding:"22px 20px 18px",
                cursor:"pointer",
                transition:"all .22s ease",
                backdropFilter:"blur(10px)",
                boxShadow: on
                  ? `0 16px 48px ${p.glow}, 0 2px 16px rgba(0,0,0,.3)`
                  : "0 2px 16px rgba(0,0,0,.2)",
                transform: on ? "translateY(-5px)" : "none",
              }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14 }}>
                <div style={{
                  width:48,height:48,borderRadius:12,
                  background:p.gradient,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow: on ? `0 6px 20px ${p.glow}` : "none",
                  transition:"box-shadow .22s",
                  flexShrink:0,
                }}>
                  {p.icon}
                </div>
                <span style={{
                  padding:"3px 10px",borderRadius:20,fontSize:10,
                  fontWeight:800,letterSpacing:".08em",textTransform:"uppercase",
                  background: on ? p.gradient : "rgba(255,255,255,.08)",
                  color:"#fff",transition:"background .22s",
                }}>
                  {p.label}
                </span>
              </div>
              <div style={{ fontSize:15,fontWeight:700,color:"#fff",marginBottom:16,letterSpacing:"-.01em" }}>
                {p.name}
              </div>
              <div style={{
                display:"flex",alignItems:"center",justifyContent:"space-between",
                paddingTop:14,borderTop:"1px solid rgba(255,255,255,.08)",
              }}>
                <span style={{ fontSize:12,fontWeight:600,color:"rgba(255,255,255,.6)" }}>
                  Open Portal
                </span>
                <div style={{
                  width:28,height:28,borderRadius:"50%",
                  background: on ? p.gradient : "rgba(255,255,255,.1)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  transition:"all .22s",
                  transform: on ? "translateX(3px)" : "none",
                  boxShadow: on ? `0 3px 12px ${p.glow}` : "none",
                  flexShrink:0,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <p style={{ marginTop:32,fontSize:11,color:"rgba(255,255,255,.2)",position:"relative",zIndex:1 }}>
        © 2026 Subham General Store · All portals secured
      </p>
    </div>
  );
}
