"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Clock, Search, RefreshCw } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const ACTION_COLORS = { created:["#dcfce7","#15803d"], updated:["#dbeafe","#1d4ed8"], deleted:["#fee2e2","#dc2626"], status_changed:["#fef9c3","#a16207"], payment_received:["#ccfbf1","#0f766e"], sent:["#ede9fe","#6d28d9"], approved:["#dcfce7","#15803d"], rejected:["#fee2e2","#dc2626"], login:["#f1f5f9","#475569"], logout:["#f1f5f9","#475569"], access_granted:["#ccfbf1","#0f766e"], access_revoked:["#fee2e2","#dc2626"] };
const ENTITY_TYPES = ["client","project","service","proposal","quotation","invoice","payment","portfolio","enquiry","user"];
const fmtDate = d => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—";

export default function CrmHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filterEntity, setFilterEntity] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const LIMIT = 50;

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { limit: LIMIT, page };
      if (filterEntity) params.entity_type = filterEntity;
      if (filterAction) params.action = filterAction;
      const { data } = await CRM_API.get("/history", { params });
      setLogs(data.logs || []); setTotal(data.total || 0);
    } catch { setLogs([]); } finally { setLoading(false); }
  }, [page, filterEntity, filterAction]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [filterEntity, filterAction]);

  const pages = Math.ceil(total / LIMIT);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Activity History</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{total} total records</p>
        </div>
        <button onClick={load} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 14px", background: "#f8fafc", color: "#374151", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}>
          <option value="">All Entities</option>
          {ENTITY_TYPES.map(e => <option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}>
          <option value="">All Actions</option>
          {Object.keys(ACTION_COLORS).map(a => <option key={a} value={a}>{a.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
        </select>
      </div>

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center" }}>
            <Clock size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No activity yet.</p>
          </div>
        ) : (
          <div>
            {logs.map((log, i) => {
              const [bg, color] = ACTION_COLORS[log.action] || ["#f1f5f9","#475569"];
              return (
                <div key={log.id || i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "14px 20px", borderBottom: "1px solid #f8fafc" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color, marginTop: "7px", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "3px" }}>
                      <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", textTransform: "capitalize", background: bg, color }}>{log.action?.replace(/_/g," ")}</span>
                      <span style={{ background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "600", textTransform: "capitalize" }}>{log.entity_type}</span>
                      {log.entity_label && <span style={{ fontWeight: "600", color: "#0f172a", fontSize: "13px" }}>"{log.entity_label}"</span>}
                    </div>
                    {log.description && <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 3px" }}>{log.description}</p>}
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      By <strong style={{ color: "#475569" }}>{log.actor_name || "System"}</strong> · {fmtDate(log.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", fontSize: "13px", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>← Prev</button>
          <span style={{ padding: "7px 14px", fontSize: "13px", color: "#64748b" }}>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} style={{ padding: "7px 14px", border: "1px solid #e2e8f0", borderRadius: "7px", background: "#fff", fontSize: "13px", cursor: page >= pages ? "not-allowed" : "pointer", opacity: page >= pages ? 0.5 : 1 }}>Next →</button>
        </div>
      )}
    </div>
  );
}
