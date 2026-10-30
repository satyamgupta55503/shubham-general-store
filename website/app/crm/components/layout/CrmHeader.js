"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, ChevronDown, Menu, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import CRM_API from "@/utils/crmApi";

/* Page title map */
const PAGE_TITLES = {
  "/crm/dashboard":                { title: "Dashboard",        sub: "Overview & key metrics" },
  "/crm/dashboard/clients":        { title: "Clients",          sub: "Manage your client base" },
  "/crm/dashboard/projects":       { title: "Projects",         sub: "Track all active work" },
  "/crm/dashboard/enquiries":      { title: "Enquiries",        sub: "Incoming leads & queries" },
  "/crm/dashboard/proposals":      { title: "Proposals",        sub: "Draft & send proposals" },
  "/crm/dashboard/quotations":     { title: "Quotations",       sub: "Price quotes & estimates" },
  "/crm/dashboard/invoices":       { title: "Invoices",         sub: "Billing & tax invoices" },
  "/crm/dashboard/payments":       { title: "Payments",         sub: "Receipts & payment records" },
  "/crm/dashboard/services":       { title: "Service Catalog",  sub: "Manage offerings & pricing" },
  "/crm/dashboard/pending-users":  { title: "User Approvals",   sub: "Review access requests" },
  "/crm/dashboard/history":        { title: "Activity Log",     sub: "Full audit trail" },
  "/crm/dashboard/notifications":  { title: "Notifications",    sub: "Alerts & updates" },
  "/crm/dashboard/settings":       { title: "Settings",         sub: "Company, tax & billing config" },
  "/crm/dashboard/followups":      { title: "Follow-Ups",       sub: "Track every client interaction" },
  "/crm/dashboard/reports":        { title: "Reports",           sub: "Revenue, pipeline & business analytics" },
};

function getPageMeta(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const key = Object.keys(PAGE_TITLES).find(k => k !== "/crm/dashboard" && pathname.startsWith(k + "/"));
  return key ? PAGE_TITLES[key] : { title: "CRM", sub: "Subham General Store" };
}

export default function CrmHeader({ onMenuToggle, sidebarSide, onSidebarSideToggle }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [user, setUser]       = useState({ full_name: "User", role: "executive", email: "" });
  const [unread, setUnread]   = useState(0);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);
  const pageMeta = getPageMeta(pathname);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("crm_user") || "{}");
      if (u.full_name) setUser(u);
    } catch {}
    fetchUnread();
    const iv = setInterval(fetchUnread, 30000);
    return () => clearInterval(iv);
  }, []);

  const fetchUnread = async () => {
    try {
      const { data } = await CRM_API.get("/notifications?limit=1");
      setUnread(data.unread_count || 0);
    } catch {}
  };

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const logout = async () => {
    try {
      // ✅ Call backend logout — invalidates ALL devices/sessions
      await CRM_API.post("/auth/logout");
    } catch {}
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    router.replace("/crm/login");
  };

  const initials = user.full_name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "U";
  const roleColor = { owner:"#16a34a", manager:"#2563eb", accountant:"#7c3aed", executive:"#0891b2" }[user.role] || "#64748b";

  return (
    <header style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 16px 0 12px", height: "60px",
      background: "#fff", borderBottom: "1px solid #e2e8f0",
      flexShrink: 0, fontFamily: "'Inter', sans-serif", gap: "8px",
    }}>

      {/* ── Left: hamburger + page title ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>

        {/* Hamburger — toggles sidebar open/close */}
        <button
          onClick={onMenuToggle}
          title="Toggle sidebar"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
            width: "36px", height: "36px", borderRadius: "8px", flexShrink: 0,
            transition: "background .15s, color .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#0f172a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#64748b"; }}>
          <Menu size={20} />
        </button>

        {/* Divider */}
        <span style={{ width: "1px", height: "20px", background: "#e2e8f0", flexShrink: 0 }} />

        {/* Page title */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: 0,
            lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {pageMeta.title}
          </h1>
          <p style={{
            fontSize: "11px", color: "#94a3b8", margin: 0,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {pageMeta.sub}
          </p>
        </div>
      </div>

      {/* ── Right: sidebar side toggle + bell + user ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>

        {/* Sidebar side toggle button */}
        <button
          onClick={onSidebarSideToggle}
          title={sidebarSide === "left" ? "Move sidebar to right" : "Move sidebar to left"}
          style={{
            background: "none", border: "1px solid #e2e8f0", cursor: "pointer",
            color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center",
            width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0,
            transition: "all .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.color = "#16a34a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
          {sidebarSide === "left" ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>

        {/* Notification Bell */}
        <Link href="/crm/dashboard/notifications"
          title="Notifications"
          style={{
            position: "relative", width: "34px", height: "34px", borderRadius: "8px",
            border: "1px solid #e2e8f0", background: "#f8fafc",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#64748b", textDecoration: "none", transition: "all .15s", flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; e.currentTarget.style.color = "#16a34a"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = "#64748b"; }}>
          <Bell size={16} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: "-4px", right: "-4px",
              minWidth: "17px", height: "17px", padding: "0 4px",
              background: "#ef4444", border: "2px solid #fff",
              borderRadius: "10px", fontSize: "9px", fontWeight: "800",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        {/* User dropdown */}
        <div ref={dropRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropOpen(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: "7px",
              padding: "4px 9px 4px 5px",
              borderRadius: "9px", border: "1px solid #e2e8f0",
              background: "#f8fafc", cursor: "pointer", transition: "all .15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#f0fdf4"; e.currentTarget.style.borderColor = "#bbf7d0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e2e8f0"; }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "7px",
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: "800", fontSize: "11px", flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div style={{ fontSize: "12px", fontWeight: "600", color: "#1e293b", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.full_name}
              </div>
              <div style={{ fontSize: "10px", fontWeight: "600", textTransform: "capitalize", color: roleColor }}>
                {user.role}
              </div>
            </div>
            <ChevronDown size={12} style={{ color: "#94a3b8", flexShrink: 0, transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
          </button>

          {dropOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)",
              right: 0, width: "192px",
              background: "#fff", border: "1px solid #e2e8f0",
              borderRadius: "11px", boxShadow: "0 10px 36px rgba(0,0,0,.10)",
              zIndex: 1000, padding: "6px", animation: "ddFade .15s ease",
            }}>
              <div style={{ padding: "9px 12px 8px", borderBottom: "1px solid #f1f5f9", marginBottom: "4px" }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{user.full_name}</div>
                <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{user.email || "Subham General Store"}</div>
                <span style={{ display: "inline-block", marginTop: "5px", fontSize: "9px", fontWeight: "800", padding: "2px 7px", borderRadius: "5px", textTransform: "capitalize", letterSpacing: ".04em", background: roleColor + "20", color: roleColor }}>
                  {user.role}
                </span>
              </div>
              <Link href="/crm/dashboard/settings" onClick={() => setDropOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "7px", textDecoration: "none", fontSize: "13px", color: "#374151", transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <Settings size={14} style={{ color: "#94a3b8" }} /> Settings
              </Link>
              <button onClick={logout} style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", background: "none", border: "none", cursor: "pointer", borderRadius: "7px", color: "#dc2626", fontSize: "13px", fontWeight: "500", transition: "background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes ddFade { from { opacity:0; transform:translateY(-5px); } to { opacity:1; transform:none; } }`}</style>
    </header>
  );
}
