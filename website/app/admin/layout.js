"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Asidebar from "./components/layout/Asidebar";
import Header from "./components/layout/Header";
import "./globals.css";
import AuthProvider from "@/context/ProtectedRoute";

// Auth-only pages — no sidebar/header/ProtectedRoute wrapper
const AUTH_PATHS = ["/admin/login", "/admin/register"];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  // ─── Login / Register pages: bare layout ───
  if (isAuthPage) {
    return <>{children}</>;
  }

  // ─── All other admin pages: full dashboard layout ───
  return (
    <div className="admin-shell" style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#f8faf5",
    }}>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left sidebar — slides in on mobile */}
      <Asidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Right working column */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
      }}>
        <Header onMenuToggle={() => setSidebarOpen(o => !o)} />

        <main style={{ flex: 1, width: "100%", overflowY: "auto" }}>
          <AuthProvider>{children}</AuthProvider>
        </main>
      </div>
    </div>
  );
}
