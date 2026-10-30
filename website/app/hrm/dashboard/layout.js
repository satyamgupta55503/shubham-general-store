"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import HrmSidebar from "../components/layout/HrmSidebar";
import HrmHeader  from "../components/layout/HrmHeader";
import HRM_API    from "@/utils/hrmApi";
import "../hrm.css";

export default function HrmDashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("hrm_token");
    if (!token) { router.replace("/hrm/login"); return; }

    HRM_API.get("/auth/verify")
      .then(() => setAuthChecked(true))
      .catch(() => {
        localStorage.removeItem("hrm_token"); localStorage.removeItem("hrm_user");
        router.replace("/hrm/login");
      });
  }, [pathname, router]);

  if (!authChecked) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#f5f3ff", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div className="hrm-spinner" style={{ margin:"0 auto 14px" }}/>
        <p style={{ color:"#7c3aed", fontWeight:"600", fontSize:"14px", margin:0 }}>Loading HRM…</p>
      </div>
    </div>
  );

  return (
    <div className="hrm-layout" style={{ fontFamily:"'Inter',sans-serif" }}>
      <HrmSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/>
      <div className="hrm-main">
        <HrmHeader onMenuToggle={() => setMobileOpen(p => !p)}/>
        <main className="hrm-content">{children}</main>
      </div>
    </div>
  );
}
