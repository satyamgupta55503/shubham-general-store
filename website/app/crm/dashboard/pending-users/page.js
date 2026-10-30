"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert, Check, X, UserX, Users, Shield } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const ROLES = ["owner","manager","accountant","executive"];
const ALL_PAGES = ["dashboard","clients","services","projects","proposals","quotations","invoices","portfolio","payments","pending_users","enquiries","history","notifications","settings"];

export default function CrmPendingUsersPage() {
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [approveModal, setApproveModal] = useState(null);
  const [roleForm, setRoleForm] = useState({ role: "executive", page_access: [] });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: p }, { data: a }] = await Promise.all([CRM_API.get("/auth/pending-users"), CRM_API.get("/auth/users")]);
      setPending(p); setActive(a);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openApprove = (u) => { setApproveModal(u); setRoleForm({ role: "executive", page_access: [] }); };

  const handleApprove = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await CRM_API.put(`/auth/users/${approveModal._id || approveModal.id}/approve`, roleForm);
      setApproveModal(null); load();
    } catch (err) { alert(err.response?.data?.message || "Approval failed"); }
    finally { setSaving(false); }
  };

  const handleReject = async (id, name) => {
    if (!confirm(`Reject and remove "${name}"?`)) return;
    try { await CRM_API.delete(`/auth/users/${id}/reject`); load(); }
    catch (err) { alert(err.response?.data?.message || "Reject failed"); }
  };

  const handleDeactivate = async (id, name) => {
    if (!confirm(`Deactivate "${name}"? They will lose CRM access.`)) return;
    try { await CRM_API.put(`/auth/users/${id}/deactivate`); load(); }
    catch {}
  };

  const togglePage = (page) => setRoleForm(p => ({
    ...p,
    page_access: p.page_access.includes(page) ? p.page_access.filter(x => x !== page) : [...p.page_access, page]
  }));
  const toggleAll = () => setRoleForm(p => ({ ...p, page_access: p.page_access.length === ALL_PAGES.length ? [] : [...ALL_PAGES] }));

  const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>User Management</h1>
        <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{pending.length} pending approval · {active.length} active users</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "2px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content", marginBottom: "20px" }}>
        {[["pending","Pending","#ef4444"],["active","Active Users","#22c55e"]].map(([t,l,c]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: tab === t ? "#fff" : "transparent", color: tab === t ? "#0f172a" : "#64748b", boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,.08)" : "none", display: "flex", alignItems: "center", gap: "6px" }}>
            {l}
            {t === "pending" && pending.length > 0 && <span style={{ background: c, color: "#fff", fontSize: "10px", fontWeight: "700", padding: "1px 5px", borderRadius: "10px" }}>{pending.length}</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</div>
      ) : tab === "pending" ? (
        pending.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
            <ShieldAlert size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No pending approval requests.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pending.map(u => (
              <div key={u._id || u.id} style={{ background: "#fff", border: "1.5px solid #fde68a", borderRadius: "12px", padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "#fef9c3", color: "#a16207", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "16px", flexShrink: 0 }}>
                  {u.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>{u.full_name}</div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>{u.email}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Registered: {fmtDate(u.created_at)}</div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openApprove(u)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleReject(u._id || u.id, u.full_name)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
                    <X size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["User", "Role", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {active.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>No active users.</td></tr>
              ) : active.map(u => (
                <tr key={u._id || u.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "12px" }}>{u.full_name?.[0]?.toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: "600", color: "#0f172a" }}>{u.full_name}</div>
                        <div style={{ fontSize: "11px", color: "#94a3b8" }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    <span style={{ background: "#f0fdf4", color: "#15803d", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize" }}>{u.role}</span>
                  </td>
                  <td style={{ padding: "13px 16px", fontSize: "12px", color: "#64748b" }}>{fmtDate(u.created_at)}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <button onClick={() => handleDeactivate(u._id || u.id, u.full_name)} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                      <UserX size={13} /> Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {approveModal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal" style={{ maxWidth: "500px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9" }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>Approve — {approveModal.full_name}</h2>
              <button onClick={() => setApproveModal(null)} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleApprove} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Assign Role</label>
                <select value={roleForm.role} onChange={e => setRoleForm(p=>({...p,role:e.target.value}))} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#374151" }}>Page Access</label>
                  <button type="button" onClick={toggleAll} style={{ fontSize: "11px", color: "#16a34a", fontWeight: "600", background: "none", border: "none", cursor: "pointer" }}>
                    {roleForm.page_access.length === ALL_PAGES.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {ALL_PAGES.map(page => (
                    <label key={page} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", userSelect: "none" }}>
                      <input type="checkbox" checked={roleForm.page_access.includes(page)} onChange={() => togglePage(page)} style={{ width: "14px", height: "14px", accentColor: "#22c55e" }} />
                      <span style={{ fontSize: "12px", color: "#374151", textTransform: "capitalize" }}>{page.replace(/_/g," ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={() => setApproveModal(null)} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Approving…" : "Approve & Grant Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
