"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EVENT_ICONS = { client_created:"👤", invoice_created:"🧾", invoice_paid:"💰", quotation_created:"📋", quotation_approved:"✅", payment_received:"💵", proposal_created:"📄", proposal_accepted:"🎉", project_created:"🏗️", project_status_changed:"🔄", service_created:"⚙️", portfolio_created:"🖼️", enquiry_received:"📨", user_created:"👥", access_granted:"🔓", access_revoked:"🔒" };
const fmtDate = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—";

export default function CrmNotificationsPage() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (showUnreadOnly) params.is_read = "false";
      const { data } = await CRM_API.get("/notifications", { params });
      setItems(data.notifications || []);
      setUnread(data.unread_count || 0);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [showUnreadOnly]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    try { await CRM_API.post("/notifications/mark-all-read"); load(); }
    catch {}
  };

  const markRead = async (id) => {
    try { await CRM_API.patch(`/notifications/${id}/read`); load(); }
    catch {}
  };

  const handleDelete = async (id) => {
    try { await CRM_API.delete(`/notifications/${id}`); load(); }
    catch {}
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Notifications</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{unread} unread</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          {unread > 0 && (
            <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
              <Check size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      <div style={{ display: "flex", gap: "2px", background: "#f1f5f9", borderRadius: "10px", padding: "4px", width: "fit-content", marginBottom: "20px" }}>
        {[false, true].map(v => (
          <button key={String(v)} onClick={() => setShowUnreadOnly(v)}
            style={{ padding: "7px 16px", borderRadius: "7px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", background: showUnreadOnly === v ? "#fff" : "transparent", color: showUnreadOnly === v ? "#0f172a" : "#64748b", boxShadow: showUnreadOnly === v ? "0 1px 4px rgba(0,0,0,.08)" : "none" }}>
            {v ? `Unread (${unread})` : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</div>
      ) : items.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "48px", textAlign: "center" }}>
          <Bell size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>{showUnreadOnly ? "No unread notifications." : "No notifications yet."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {items.map(n => (
            <div key={n.id} style={{ background: "#fff", border: `1px solid ${n.is_read ? "#e2e8f0" : "#bbf7d0"}`, borderLeft: `4px solid ${n.is_read ? "#e2e8f0" : "#22c55e"}`, borderRadius: "10px", padding: "14px 18px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ fontSize: "22px", flexShrink: 0, lineHeight: 1 }}>{EVENT_ICONS[n.event_type] || "🔔"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: n.is_read ? "500" : "700", color: n.is_read ? "#374151" : "#0f172a", fontSize: "14px" }}>{n.title}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtDate(n.created_at)}</div>
                </div>
                <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>{n.message}</p>
              </div>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                {!n.is_read && (
                  <button onClick={() => markRead(n.id)} style={{ padding: "5px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer" }} title="Mark read"><Check size={13} /></button>
                )}
                <button onClick={() => handleDelete(n.id)} style={{ padding: "5px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }} title="Delete"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
