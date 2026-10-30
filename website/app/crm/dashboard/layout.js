"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import CrmSidebar from "../components/layout/CrmSidebar";
import CrmHeader from "../components/layout/CrmHeader";
import CRM_API from "@/utils/crmApi";
import ReminderBanner from "@/components/crm/ReminderBanner";
import "../../crm/crm.css";

export default function CrmDashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();

  // Auth
  const [authChecked, setAuthChecked] = useState(false);

  // Desktop: sidebar collapsed/expanded
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Mobile: drawer open/close
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sidebar side: "left" | "right"
  const [sidebarSide, setSidebarSide] = useState("left");

  // Track viewport
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Restore saved preferences
    const savedSide = localStorage.getItem("crm_sidebar_side");
    if (savedSide) setSidebarSide(savedSide);
    const savedOpen = localStorage.getItem("crm_sidebar_open");
    if (savedOpen !== null) setSidebarOpen(savedOpen !== "false");
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => setMobileDrawerOpen(false), [pathname]);

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("crm_token");
    if (!token) { router.replace("/crm/login"); return; }
    CRM_API.get("/auth/verify")
      .then(() => setAuthChecked(true))
      .catch(() => {
        localStorage.removeItem("crm_token");
        localStorage.removeItem("crm_user");
        router.replace("/crm/login");
      });
  }, [pathname, router]);

  // Hamburger toggle — on mobile: open/close drawer; on desktop: collapse/expand sidebar
  const handleMenuToggle = () => {
    if (isMobile) {
      setMobileDrawerOpen(prev => !prev);
    } else {
      setSidebarOpen(prev => {
        const next = !prev;
        localStorage.setItem("crm_sidebar_open", String(next));
        return next;
      });
    }
  };

  // Side toggle button
  const handleSideToggle = () => {
    setSidebarSide(prev => {
      const next = prev === "left" ? "right" : "left";
      localStorage.setItem("crm_sidebar_side", next);
      return next;
    });
  };

  if (!authChecked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0fdf4", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #dcfce7", borderTopColor: "#22c55e", borderRadius: "50%", animation: "spin .7s linear infinite", margin: "0 auto 14px" }} />
          <p style={{ color: "#16a34a", fontWeight: "600", fontSize: "14px", margin: 0 }}>Loading CRM…</p>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const sidebar = (
    <CrmSidebar
      mobileOpen={mobileDrawerOpen}
      desktopOpen={sidebarOpen}
      isMobile={isMobile}
      side={sidebarSide}
      onClose={() => setMobileDrawerOpen(false)}
    />
  );

  return (
    <div
      className="crm-layout"
      style={{
        height: "100vh",
        overflow: "hidden",
        background: "#f8fafc",
        fontFamily: "'Inter', sans-serif",
        flexDirection: "row",
        // Reverse row direction when sidebar is on the right
        direction: sidebarSide === "right" ? "rtl" : "ltr",
      }}>

      {/* Sidebar — rendered on correct side via direction trick */}
      {sidebar}

      {/* Main content — always ltr internally */}
      <div
        className="crm-main"
        style={{
          display: "flex", flexDirection: "column",
          minWidth: 0, overflow: "hidden",
          direction: "ltr", // always ltr inside
        }}>
        <CrmHeader
          onMenuToggle={handleMenuToggle}
          sidebarSide={sidebarSide}
          onSidebarSideToggle={handleSideToggle}
        />
        <main className="crm-content" style={{ flex: 1, overflowY: "auto" }}>
          <ReminderBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
