"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Briefcase, FileText, Receipt,
  CreditCard, Package, UserCheck, MessageSquare,
  History, Bell, Settings, X, TrendingUp, PhoneCall, BarChart2, BookOpen,
  ShoppingCart,
} from "lucide-react";

const NAV_SECTIONS = [
  {
    section: "Main",
    items: [
      { id:"dashboard",  label:"Dashboard",       href:"/crm/dashboard",               icon:LayoutDashboard, roles:["owner","manager","accountant","executive"] },
      { id:"clients",    label:"Clients",          href:"/crm/dashboard/clients",       icon:Users,           roles:["owner","manager","executive"] },
      { id:"projects",   label:"Projects",         href:"/crm/dashboard/projects",      icon:Briefcase,       roles:["owner","manager","executive"] },
      { id:"enquiries",  label:"Enquiries",        href:"/crm/dashboard/enquiries",     icon:MessageSquare,   roles:["owner","manager","executive"] },
    ],
  },
  {
    section: "Sales",
    items: [
      { id:"proposals",  label:"Proposals",        href:"/crm/dashboard/proposals",     icon:FileText,        roles:["owner","manager","executive"] },
      { id:"quotations", label:"Quotations",       href:"/crm/dashboard/quotations",    icon:Receipt,         roles:["owner","manager"] },
      { id:"orders",     label:"Order Sheets",     href:"/crm/dashboard/orders",        icon:ShoppingCart,    roles:["owner","manager"] },
      { id:"invoices",   label:"Invoices",         href:"/crm/dashboard/invoices",      icon:FileText,        roles:["owner","manager","accountant"] },
      { id:"payments",   label:"Payments",         href:"/crm/dashboard/payments",      icon:CreditCard,      roles:["owner","manager","accountant"] },
      { id:"ledger",     label:"Ledger / Khata",   href:"/crm/dashboard/ledger",        icon:BookOpen,        roles:["owner","manager","accountant"] },
      { id:"followups",  label:"Follow-Ups",       href:"/crm/dashboard/followups",     icon:PhoneCall,       roles:["owner","manager","executive"] },
    ],
  },
  {
    section: "Manage",
    items: [
      { id:"services",      label:"Service Catalog", href:"/crm/dashboard/services",      icon:Package,    roles:["owner","manager"] },
      { id:"pending-users", label:"User Approvals",  href:"/crm/dashboard/pending-users", icon:UserCheck,  roles:["owner","manager"] },
      { id:"history",       label:"Activity Log",    href:"/crm/dashboard/history",       icon:History,    roles:["owner","manager"] },
      { id:"reports",       label:"Reports",         href:"/crm/dashboard/reports",       icon:BarChart2,  roles:["owner","manager"] },
      { id:"notifications", label:"Notifications",   href:"/crm/dashboard/notifications", icon:Bell,       roles:["owner","manager","accountant","executive"] },
      { id:"settings",      label:"Settings",        href:"/crm/dashboard/settings",      icon:Settings,   roles:["owner","manager"] },
    ],
  },
];

const OTHER_PORTALS = [
  { href:"/hrm/login",   label:"HR Management",   short:"HRM", color:"#7c3aed", bg:"#f5f3ff" },
  { href:"/emp/login",   label:"Employee Portal",  short:"EMP", color:"#2563eb", bg:"#eff6ff" },
  { href:"/admin/login", label:"Content Admin",    short:"CMS", color:"#0891b2", bg:"#ecfeff" },
];

export default function CrmSidebar({ mobileOpen, desktopOpen, isMobile, side, onClose }) {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState("executive");

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("crm_user") || "{}");
      if (u.role) setUserRole(u.role);
    } catch {}
  }, []);

  const isActive = (href) =>
    href === "/crm/dashboard"
      ? pathname === "/crm/dashboard"
      : pathname === href || pathname.startsWith(href + "/");

  /* ── Dimensions ── */
  const EXPANDED_W = 232;
  const COLLAPSED_W = 60;

  /* ── Visibility logic ── */
  // On mobile: fixed overlay, slides in/out via mobileOpen
  // On desktop: always visible but width collapses
  const visible = isMobile ? mobileOpen : true;
  const width   = isMobile ? EXPANDED_W : (desktopOpen ? EXPANDED_W : COLLAPSED_W);
  const collapsed = !isMobile && !desktopOpen;

  /* ── Transform ── */
  let transform = "none";
  if (isMobile) {
    const direction = side === "right" ? 1 : -1;
    transform = mobileOpen ? "translateX(0)" : `translateX(${direction * 100}%)`;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && mobileOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(15,23,42,.5)",
            zIndex: 99,
            backdropFilter: "blur(3px)",
            animation: "fadeIn .2s ease",
          }}
        />
      )}

      <aside
        style={{
          width: `${width}px`,
          minWidth: `${width}px`,
          height: "100vh",
          background: "#fff",
          borderRight: side === "left" ? "1px solid #e2e8f0" : "none",
          borderLeft:  side === "right" ? "1px solid #e2e8f0" : "none",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflowY: "auto",
          overflowX: "hidden",
          scrollbarWidth: "thin",
          scrollbarColor: "#e2e8f0 transparent",
          // Mobile: fixed overlay; Desktop: static
          position: isMobile ? "fixed" : "relative",
          top: 0,
          [side]: 0,
          zIndex: isMobile ? 100 : "auto",
          transform,
          transition: "transform .28s cubic-bezier(.4,0,.2,1), width .25s cubic-bezier(.4,0,.2,1), min-width .25s cubic-bezier(.4,0,.2,1)",
          boxShadow: isMobile && mobileOpen
            ? (side === "left" ? "6px 0 28px rgba(0,0,0,.14)" : "-6px 0 28px rgba(0,0,0,.14)")
            : "none",
        }}>

        {/* ── Logo header ── */}
        <div style={{
          padding: collapsed ? "16px 0" : "14px 16px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          flexShrink: 0,
          minHeight: "62px",
        }}>
          {collapsed ? (
            /* Collapsed: show just the icon */
            <div style={{
              width: "34px", height: "34px",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              borderRadius: "9px",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
          ) : (
            <>
              {/* Expanded: Subham Store logo + CRM badge */}
              <div style={{ display: "flex", alignItems: "center", gap: "9px", minWidth: 0 }}>
                <div style={{ width:26, height:26, borderRadius:7, background:"linear-gradient(135deg,#16a34a,#15803d)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:"11px", fontWeight:"800", color:"#0f172a", lineHeight:1.1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>Subham Store</div>
                  <div style={{ fontSize:"9px", color:"#16a34a", fontWeight:"700", letterSpacing:"0.08em", textTransform:"uppercase" }}>CRM</div>
                </div>
              </div>

              {/* Mobile close button */}
              {isMobile && (
                <button onClick={onClose} style={{
                  background: "#f1f5f9", border: "none", borderRadius: "7px",
                  width: "28px", height: "28px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#64748b",
                }}>
                  <X size={14} />
                </button>
              )}
            </>
          )}
        </div>

        {/* ── Nav sections ── */}
        <div style={{ flex: 1, padding: "8px 0 4px", overflowY: "auto", overflowX: "hidden" }}>
          {NAV_SECTIONS.map(section => {
            const visible = section.items.filter(i => i.roles.includes(userRole));
            if (!visible.length) return null;
            return (
              <div key={section.section} style={{ marginBottom: "2px" }}>
                {/* Section label — hidden when collapsed */}
                {!collapsed && (
                  <p style={{
                    fontSize: "9.5px", fontWeight: "700", letterSpacing: ".1em",
                    textTransform: "uppercase", color: "#b0bec5",
                    padding: "8px 18px 3px", margin: 0,
                  }}>{section.section}</p>
                )}
                {collapsed && <div style={{ height: "10px" }} />}

                <nav style={{ padding: collapsed ? "0 8px" : "0 8px" }}>
                  {visible.map(item => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={isMobile ? onClose : undefined}
                        title={collapsed ? item.label : undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: collapsed ? 0 : "9px",
                          justifyContent: collapsed ? "center" : "flex-start",
                          padding: collapsed ? "10px 0" : "9px 11px",
                          borderRadius: "9px",
                          textDecoration: "none",
                          fontSize: "13px",
                          fontWeight: active ? "600" : "500",
                          marginBottom: "1px",
                          background: active ? "linear-gradient(135deg,#22c55e,#16a34a)" : "transparent",
                          color: active ? "#fff" : "#4a5568",
                          transition: "all .15s",
                          boxShadow: active ? "0 2px 8px rgba(34,197,94,.2)" : "none",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.color = "#15803d"; } }}
                        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4a5568"; } }}
                      >
                        <Icon size={16} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} />
                        {!collapsed && (
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                            {item.label}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>

        {/* ── Other Portals ── */}
        {!collapsed && (
          <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px 8px 4px", flexShrink: 0 }}>
            <p style={{ fontSize: "9px", fontWeight: "700", color: "#b0bec5", textTransform: "uppercase", letterSpacing: ".1em", padding: "0 8px 4px", margin: 0 }}>
              Other Portals
            </p>
            {OTHER_PORTALS.map(p => (
              <a key={p.href} href={p.href} target="_blank" rel="noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "7px 10px", borderRadius: "7px",
                  textDecoration: "none", fontSize: "12px", fontWeight: "500",
                  color: "#4a5568", transition: "all .15s", marginBottom: "1px",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = p.bg; e.currentTarget.style.color = p.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#4a5568"; }}>
                <span style={{ fontSize: "8px", fontWeight: "800", padding: "2px 5px", borderRadius: "4px", background: p.color, color: "#fff", letterSpacing: ".05em", flexShrink: 0 }}>
                  {p.short}
                </span>
                {p.label}
                <span style={{ marginLeft: "auto", fontSize: "11px", opacity: 0.35 }}>↗</span>
              </a>
            ))}
          </div>
        )}

        {/* ── Role badge ── */}
        <div style={{ padding: collapsed ? "10px 0" : "10px 18px 14px", flexShrink: 0, textAlign: collapsed ? "center" : "left" }}>
          {collapsed ? (
            <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", margin: "0 auto" }}>
              {userRole[0]?.toUpperCase()}
            </div>
          ) : (
            <span style={{ fontSize: "9.5px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em" }}>
              Role: {userRole}
            </span>
          )}
        </div>
      </aside>

      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </>
  );
}
