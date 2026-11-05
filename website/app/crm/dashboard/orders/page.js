"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package, Send, Lock } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function OrderSheetsPage() {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | draft | sent

  const load = useCallback(() => {
    setLoading(true);
    const params = tab !== "all" ? { status: tab } : {};
    CRM_API.get("/order-sheets", { params })
      .then(({ data }) => setRows(data.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: "clamp(16px,3vw,28px)", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
            <Package size={22} color="#16a34a" /> Order Sheets
          </h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Create manual order lists and send them to store customers.</p>
        </div>
        <button onClick={() => router.push("/crm/dashboard/orders/new")} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
          background: "#22c55e", color: "#fff", border: "none", borderRadius: 9,
          fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          <Plus size={15} /> New Order
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {[{ v: "all", l: "All" }, { v: "draft", l: "Drafts" }, { v: "sent", l: "Sent" }].map((t) => (
          <button key={t.v} onClick={() => setTab(t.v)} style={{
            padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
            border: tab === t.v ? "none" : "1px solid #e2e8f0",
            background: tab === t.v ? "#16a34a" : "#fff",
            color: tab === t.v ? "#fff" : "#475569",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, color: "#94a3b8", background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9" }}>
          No order sheets yet. Click &quot;New Order&quot; to create one.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720, fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                {["Order #", "Customer", "Items", "Qty", "Total", "Status", "Date", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                  onClick={() => router.push(`/crm/dashboard/orders/${r.id}`)}>
                  <td style={{ padding: "11px 12px", fontWeight: 800, color: "#0f172a", whiteSpace: "nowrap" }}>{r.order_number}</td>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ fontWeight: 600, color: "#374151" }}>{r.store_customer?.name || r.customer_name_snapshot || "—"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{r.store_customer?.phone || ""}</div>
                  </td>
                  <td style={{ padding: "11px 12px", color: "#64748b" }}>{r.items?.length || 0}</td>
                  <td style={{ padding: "11px 12px", color: "#64748b" }}>{r.total_quantity}</td>
                  <td style={{ padding: "11px 12px", fontWeight: 800, color: "#0f172a" }}>{fmt(r.grand_total)}</td>
                  <td style={{ padding: "11px 12px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: r.status === "sent" ? "#dcfce7" : "#f1f5f9",
                      color: r.status === "sent" ? "#15803d" : "#64748b",
                    }}>
                      {r.status === "sent" ? <><Lock size={10} /> Sent</> : "Draft"}
                    </span>
                  </td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</td>
                  <td style={{ padding: "11px 12px", color: "#2563eb", fontWeight: 700 }}>Open →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
