"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Home,
  User,
  Layers,
  Phone,
  HelpCircle,
  Users,
  LogOut,
  Shield,
  Search,
  MessageCircle,
  Send,
  Settings,
} from "lucide-react";
import "./Asidebar.css";

const Asidebar = ({ open = false, onClose }) => {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setIsMounted(true);
    const role = localStorage.getItem("role") || "user";
    setUserRole(role);

    // ✅ Re-read role when ProtectedRoute updates it (after verify API returns)
    const handleStorageChange = () => {
      const updatedRole = localStorage.getItem("role") || "user";
      setUserRole(updatedRole);
    };
    window.addEventListener("storage", handleStorageChange);

    // ✅ Also poll every 500ms for 3 seconds after mount
    // This handles the case where ProtectedRoute updates localStorage
    // in the same tab (storage event doesn't fire for same-tab changes)
    let attempts = 0;
    const poll = setInterval(() => {
      const r = localStorage.getItem("role") || "user";
      if (r !== "user" || attempts > 6) {
        setUserRole(r);
        clearInterval(poll);
      }
      attempts++;
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(poll);
    };
  }, []);

  // Allow quick role switching from the sidebar for debugging/local use
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    localStorage.setItem("role", newRole);
    setUserRole(newRole);
    // notify other windows/tabs
    window.dispatchEvent(new Event("storage"));
  };

  // All menu items with role access
  const allMainMenuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      link: "/admin/dashboard",
      roles: ["superadmin", "admin", "author"],
    },
    // ── STORE MANAGEMENT ──────────────────────────────────
    {
      id: "store-homepage",
      name: "Store Homepage",
      icon: Home,
      link: "/admin/store/homepage",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-products",
      name: "Products",
      icon: Layers,
      link: "/admin/store/products",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-categories",
      name: "Grocery Categories",
      icon: Layers,
      link: "/admin/store/categories",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-info",
      name: "Store Info",
      icon: FileText,
      link: "/admin/store/settings",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-brands",
      name: "Brands",
      icon: Layers,
      link: "/admin/store/brands",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-orders",
      name: "Orders",
      icon: Briefcase,
      link: "/admin/store/orders",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-customers",
      name: "Customers",
      icon: Users,
      link: "/admin/store/customers",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-ledger",
      name: "Ledger / Khata",
      icon: FileText,
      link: "/admin/store/ledger",
      roles: ["superadmin", "admin"],
    },
    {
      id: "store-sent-docs",
      name: "Sent Documents",
      icon: FileText,
      link: "/admin/store/sent-documents",
      roles: ["superadmin", "admin"],
    },
  ];

  const allBottomMenuItems = [
    {
      id: "enquiry",
      name: "Enquiries",
      icon: HelpCircle,
      link: "/admin/enquiry",
      roles: ["superadmin", "admin", "author"],
    },
    {
      id: "logs",
      name: "Activity Logs",
      icon: FileText,
      link: "/admin/logs",
      roles: ["superadmin"],
    },
    {
      id: "users",
      name: "Admin Users",
      icon: Users,
      link: "/admin/users",
      roles: ["superadmin"],
    },
  ];

  // Filter menu items based on user role
  const mainMenuItems = allMainMenuItems.filter(
    (item) => item.roles.includes(userRole)
  );
  const bottomMenuItems = allBottomMenuItems.filter(
    (item) => item.roles.includes(userRole)
  );

  if (!isMounted) {
    return <div className="sidebar-container" />;
  }

  return (
    <div className={`sidebar-container ${open ? "sidebar-open" : ""}`}>

      {/* ── Logo ── */}
      <div className="logo-section" style={{ justifyContent: "space-between" }}>
        <span className="logo-text" style={{ display:"flex", alignItems:"center", gap:"10px", padding:"0 4px" }}>
          {/* Store icon */}
          <div style={{
            width:36, height:36, borderRadius:9,
            background:"linear-gradient(135deg,#16a34a,#15803d)",
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, boxShadow:"0 3px 10px rgba(22,163,74,.35)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:13, color:"#111827", lineHeight:1.1, letterSpacing:"-.01em" }}>Subham Store</div>
            <div style={{ fontWeight:600, fontSize:10, color:"#16a34a", letterSpacing:".05em", textTransform:"uppercase" }}>Admin Panel</div>
          </div>
        </span>

        {/* Mobile close button */}
        <button onClick={onClose} className="sidebar-close-btn" aria-label="Close menu" style={{
          border: "none", background: "#f3f4f6", borderRadius: 8,
          width: 32, height: 32, cursor: "pointer", flexShrink: 0,
          display: "none", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Role switcher (helpful when testing/admin setup) */}
      <div className="role-switcher">
        <label className="role-switcher-label">Role:</label>
        <select className="role-select" value={userRole} onChange={handleRoleChange}>
          <option value="user">user</option>
          <option value="author">author</option>
          <option value="admin">admin</option>
          <option value="superadmin">superadmin</option>
        </select>
      </div>

      {/* ── Scrollable nav area ── */}
      <div className="nav-scroll-area">

        {/* ── Main Nav ── */}
        <p className="section-label">Main</p>
        <nav className="nav-menu">
          {mainMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.link;
            return (
              <Link
                key={item.id}
                href={item.link}
                className={`nav-link ${isActive ? "active" : "inactive"}`}
              >
                <div className="icon-wrapper">
                  <Icon className="nav-icon" size={17} />
                </div>
                <span className="link-text">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── Bottom Nav ── */}
        {bottomMenuItems.length > 0 && (
          <>
            <div className="sidebar-spacer" />
            <hr className="sidebar-divider" />
            <p className="section-label" style={{ paddingTop: "4px" }}>System</p>

            <nav className="nav-menu bottom-nav">
              {bottomMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.link;
                return (
                  <Link
                    key={item.id}
                    href={item.link}
                    className={`nav-link ${isActive ? "active" : "inactive"}`}
                  >
                    <div className="icon-wrapper">
                      <Icon className="nav-icon" size={17} />
                    </div>
                    <span className="link-text">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}

      </div>{/* end nav-scroll-area */}

      {/* ── Fixed bottom: role indicator ── */}
      <div style={{ padding: "12px 20px", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
        <span style={{ fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Role: {userRole}
        </span>
      </div>
    </div>
  );
};

export default Asidebar;
