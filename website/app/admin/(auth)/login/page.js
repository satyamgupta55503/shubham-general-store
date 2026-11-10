"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import API from "@/utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Global style.css hides the cursor (custom cursor) — restore it on this page
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "login-cursor-fix";
    style.textContent = `
      * { cursor: auto !important; }
      button, a, label[for], input[type="checkbox"] { cursor: pointer !important; }
      input[type="email"], input[type="password"], input[type="text"] { cursor: text !important; }
      .custom-cursor, .custom-cursor-outer { display: none !important; }
    `;
    document.head.appendChild(style);
    return () => document.getElementById("login-cursor-fix")?.remove();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const response = await API.post("/auth/login", { email, password });

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.role || "user");
        localStorage.setItem("userName", response.data.name || response.data.user?.name || "Admin");
        localStorage.setItem("userEmail", email);
        window.location.replace("/admin/dashboard");
      } else {
        throw new Error("Authorization payload missing token.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="al-wrap">
      {/* ── Form side ── */}
      <section className="al-form-side">
        <div className="al-form-box">
          {/* Brand */}
          <Link href="/" className="al-brand" aria-label="Subham General Store home">
            <span className="al-logo" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </span>
            <span>
              <span className="al-brand-name">Subham Store</span>
              <span className="al-brand-tag">Admin Panel</span>
            </span>
          </Link>

          <h1 className="al-title">Welcome back</h1>
          <p className="al-sub">Sign in to manage products, orders, customers and your store homepage.</p>

          {errorMessage && (
            <div className="al-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate={false}>
            <label htmlFor="al-email" className="al-label">Email address</label>
            <div className="al-field">
              <svg className="al-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                id="al-email"
                type="email"
                autoComplete="email"
                placeholder="admin@subhamstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <label htmlFor="al-pass" className="al-label">Password</label>
            <div className="al-field">
              <svg className="al-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="al-pass"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="al-eye"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <p className="al-hint">Forgot your password? Ask your superadmin to reset it.</p>

            <button type="submit" className="al-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="al-spin" aria-hidden="true" /> Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="al-foot">
            <Link href="/">&larr; Back to store</Link>
            <span className="al-dot" aria-hidden="true">·</span>
            <Link href="/login">Other portals</Link>
          </div>
        </div>
      </section>

      {/* ── Brand side ── */}
      <aside className="al-side" aria-hidden="true">
        <div className="al-grid" />
        <div className="al-side-inner">
          <span className="al-pill">Store Management</span>
          <h2 className="al-side-title">Run your grocery store from one place</h2>
          <p className="al-side-text">Retail &amp; wholesale pricing, orders, khata ledger and homepage content — all in the Subham Store admin.</p>

          <ul className="al-feats">
            {[
              ["Products & categories", "Images, videos, PDF brochures"],
              ["Orders & tracking", "Status updates customers can see"],
              ["Customers & approvals", "Retail and wholesale accounts"],
              ["Ledger / khata", "Jama and baaki with date & time"],
            ].map(([t, d]) => (
              <li key={t}>
                <span className="al-check">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                </span>
                <span>
                  <strong>{t}</strong>
                  <small>{d}</small>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        .al-wrap{min-height:100vh;display:flex;background:#f8faf9;font-family:'Inter',system-ui,sans-serif;color:#0f172a}
        .al-form-side{flex:1;display:flex;align-items:center;justify-content:center;padding:48px 24px}
        .al-form-box{width:100%;max-width:400px}
        .al-brand{display:inline-flex;align-items:center;gap:11px;text-decoration:none;margin-bottom:36px}
        .al-logo{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#16a34a,#15803d);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(22,163,74,.35)}
        .al-brand-name{display:block;font-size:16px;font-weight:800;color:#0f172a;line-height:1.1}
        .al-brand-tag{display:block;font-size:10.5px;font-weight:700;color:#16a34a;letter-spacing:.08em;text-transform:uppercase;margin-top:2px}
        .al-title{font-size:30px;font-weight:800;letter-spacing:-.02em;margin:0 0 8px}
        .al-sub{font-size:14.5px;color:#64748b;line-height:1.6;margin:0 0 26px}
        .al-error{display:flex;align-items:flex-start;gap:9px;background:#fef2f2;border:1px solid #fecaca;color:#b91c1c;padding:11px 14px;border-radius:10px;font-size:13.5px;margin-bottom:18px}
        .al-error svg{flex-shrink:0;margin-top:1px}
        .al-label{display:block;font-size:13px;font-weight:600;color:#334155;margin:0 0 7px}
        .al-field{position:relative;margin-bottom:18px}
        .al-field input{width:100%;box-sizing:border-box;padding:12px 44px 12px 42px;border:1.5px solid #e2e8f0;border-radius:11px;background:#fff;font-size:14.5px;color:#0f172a;outline:none;font-family:inherit;transition:border-color .15s,box-shadow .15s}
        .al-field input:focus{border-color:#16a34a;box-shadow:0 0 0 4px rgba(22,163,74,.12)}
        .al-field input:disabled{background:#f8fafc}
        .al-ico{position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#94a3b8;pointer-events:none}
        .al-eye{position:absolute;right:8px;top:50%;transform:translateY(-50%);border:none;background:none;color:#94a3b8;padding:6px;border-radius:7px;display:flex}
        .al-eye:hover{color:#16a34a;background:#f0fdf4}
        .al-eye:focus-visible,.al-btn:focus-visible,.al-foot a:focus-visible,.al-brand:focus-visible{outline:2px solid #16a34a;outline-offset:2px}
        .al-hint{font-size:12.5px;color:#94a3b8;margin:-4px 0 22px}
        .al-btn{width:100%;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border:none;border-radius:11px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-size:15px;font-weight:700;box-shadow:0 8px 22px rgba(22,163,74,.3);transition:transform .15s,box-shadow .15s,opacity .15s}
        .al-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 26px rgba(22,163,74,.38)}
        .al-btn:disabled{opacity:.75}
        .al-spin{width:16px;height:16px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:al-rot .7s linear infinite}
        @keyframes al-rot{to{transform:rotate(360deg)}}
        .al-foot{display:flex;align-items:center;justify-content:center;gap:10px;margin-top:26px;font-size:13px}
        .al-foot a{color:#64748b;text-decoration:none;font-weight:600}
        .al-foot a:hover{color:#16a34a}
        .al-dot{color:#cbd5e1}

        .al-side{flex:1;position:relative;overflow:hidden;background:linear-gradient(150deg,#052e16 0%,#14532d 55%,#166534 100%);display:flex;align-items:center;justify-content:center;padding:56px}
        .al-grid{position:absolute;inset:0;opacity:.09;background-image:radial-gradient(circle at 1px 1px,#fff 1px,transparent 0);background-size:26px 26px}
        .al-side::after{content:"";position:absolute;width:420px;height:420px;right:-120px;top:-120px;border-radius:50%;background:radial-gradient(circle,rgba(74,222,128,.28),transparent 70%)}
        .al-side-inner{position:relative;z-index:1;max-width:420px;color:#fff}
        .al-pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#bbf7d0;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);padding:6px 12px;border-radius:50px}
        .al-side-title{font-size:32px;font-weight:800;line-height:1.2;letter-spacing:-.02em;margin:18px 0 12px}
        .al-side-text{font-size:15px;line-height:1.7;color:rgba(255,255,255,.72);margin:0 0 30px}
        .al-feats{list-style:none;padding:0;margin:0;display:grid;gap:12px}
        .al-feats li{display:flex;gap:12px;align-items:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:13px 15px}
        .al-check{width:24px;height:24px;flex-shrink:0;border-radius:7px;background:#22c55e;color:#052e16;display:flex;align-items:center;justify-content:center}
        .al-feats strong{display:block;font-size:14px;font-weight:700}
        .al-feats small{display:block;font-size:12.5px;color:rgba(255,255,255,.6);margin-top:2px}

        @media (max-width:900px){
          .al-side{display:none}
          .al-form-side{padding:40px 20px}
        }
        @media (max-width:420px){
          .al-title{font-size:26px}
        }
        @media (prefers-reduced-motion:reduce){
          .al-btn,.al-spin{transition:none;animation:none}
        }
      ` }} />
    </main>
  );
}
