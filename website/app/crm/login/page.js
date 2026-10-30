"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CRM_API from "@/utils/crmApi";

export default function CrmLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("crm_token")) router.replace("/crm/dashboard");
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await CRM_API.post("/auth/login", { email, password });
      localStorage.setItem("crm_token", data.token);
      localStorage.setItem("crm_user", JSON.stringify(data.user));
      router.replace("/crm/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally { setLoading(false); }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: "1.5px solid #e2e8f0", borderRadius: "9px",
    fontSize: "14px", outline: "none",
    fontFamily: "inherit", transition: "border-color .15s",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      background: "#f0fdf4", fontFamily: "'Inter', sans-serif",
      flexDirection: isMobile ? "column" : "row",
    }}>
      {/* ── Left / Top panel — Login form ── */}
      <div style={{
        flex: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? "36px 20px 32px" : "48px 40px",
        minHeight: isMobile ? "auto" : "100vh",
      }}>
        <div style={{ width: "100%", maxWidth: "400px" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "36px" }}>
            <div style={{
              width: "44px", height: "44px", flexShrink: 0,
              background: "linear-gradient(135deg,#22c55e,#16a34a)",
              borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "#14532d" }}>Subham General Store</div>
              <div style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>CRM Portal</div>
            </div>
          </div>

          <h1 style={{ fontSize: isMobile ? "22px" : "26px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>Welcome Back</h1>
          <p style={{ fontSize: "14px", color: "#64748b", margin: "0 0 28px" }}>
            Sign in to manage clients, projects and billing.
          </p>

          {error && (
            <div style={{
              background: "#fee2e2", color: "#dc2626",
              padding: "12px 14px", borderRadius: "9px",
              fontSize: "13px", marginBottom: "18px",
              border: "1px solid #fecaca",
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Email Address <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="email" required value={email}
                onChange={e => setEmail(e.target.value)} disabled={loading}
                placeholder="crm@subhamstore.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#22c55e"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                Password <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} required value={password}
                  onChange={e => setPassword(e.target.value)} disabled={loading}
                  placeholder="Enter your password"
                  style={{ ...inputStyle, paddingRight: "56px" }}
                  onFocus={e => e.target.style.borderColor = "#22c55e"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{
                  position: "absolute", right: "12px", top: "50%",
                  transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer",
                  color: "#94a3b8", fontSize: "11px", fontWeight: "700",
                }}>
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px",
              background: loading ? "#86efac" : "linear-gradient(135deg,#22c55e,#16a34a)",
              color: "#fff", border: "none", borderRadius: "9px",
              fontSize: "15px", fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              marginTop: "4px",
            }}>
              {loading ? (
                <>
                  <span style={{
                    width: "18px", height: "18px",
                    border: "2px solid rgba(255,255,255,.4)", borderTopColor: "#fff",
                    borderRadius: "50%", animation: "spin .7s linear infinite",
                    display: "inline-block", flexShrink: 0,
                  }} />
                  Signing in…
                </>
              ) : "Sign In to CRM"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#94a3b8", marginTop: "24px" }}>
            Looking for the website admin?{" "}
            <a href="/admin/login" style={{ color: "#16a34a", fontWeight: "600", textDecoration: "none" }}>
              CMS Login →
            </a>
          </p>
        </div>
      </div>

      {/* ── Right / Bottom panel — hidden on mobile ── */}
      {!isMobile && (
        <div style={{
          flex: 1,
          background: "linear-gradient(135deg,#14532d,#166534,#15803d)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "48px", position: "relative", overflow: "hidden",
          minHeight: "100vh",
        }}>
          {/* Dot grid pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.07,
            backgroundImage: "radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div style={{ position: "relative", textAlign: "center", color: "#fff", maxWidth: "360px" }}>
            <div style={{
              width: "80px", height: "80px",
              background: "rgba(255,255,255,.15)", borderRadius: "20px",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
                <path d="M7 7h2m4 0h2M7 11h4"/>
              </svg>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: "800", margin: "0 0 14px" }}>CRM Dashboard</h2>
            <p style={{ fontSize: "15px", opacity: 0.85, margin: "0 0 32px", lineHeight: 1.6 }}>
              Manage your entire client lifecycle — from enquiry to payment — in one place.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", textAlign: "left" }}>
              {["Clients & Projects","Proposals & Quotations","Invoices & Payments","Portfolio & History"].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", opacity: 0.9 }}>
                  <div style={{
                    width: "22px", height: "22px", flexShrink: 0,
                    background: "rgba(255,255,255,.2)", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: "14px" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
