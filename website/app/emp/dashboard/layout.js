"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import EmpSidebar from "../components/layout/EmpSidebar";
import EmpHeader  from "../components/layout/EmpHeader";
import EMP_API    from "@/utils/empApi";
import "../emp.css";

export default function EmpDashboardLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  useEffect(() => {
    const token = localStorage.getItem("emp_token");
    if (!token) { router.replace("/emp/login"); return; }
    EMP_API.get("/auth/verify")
      .then(() => setAuthChecked(true))
      .catch(() => {
        localStorage.removeItem("emp_token"); localStorage.removeItem("emp_user");
        router.replace("/emp/login");
      });
  }, [pathname, router]);

  if (!authChecked) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#eff6ff", fontFamily:"'Inter',sans-serif" }}>
      <div style={{ textAlign:"center" }}>
        <div className="emp-spinner" style={{ margin:"0 auto 14px" }}/>
        <p style={{ color:"#2563eb", fontWeight:"600", fontSize:"14px", margin:0 }}>Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="emp-layout" style={{ fontFamily:"'Inter',sans-serif" }}>
      <EmpSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/>
      <div className="emp-main">
        <EmpHeader onMenuToggle={() => setMobileOpen(p => !p)}/>
        <main className="emp-content">{children}</main>
      </div>
    </div>
  );
}
