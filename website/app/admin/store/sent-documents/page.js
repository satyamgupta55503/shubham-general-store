"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");
const authHdr  = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

export default function AdminSentDocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | quotation | invoice
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/api/store/customers/admin/sent-documents`, authHdr())
      .then((r) => setDocs(r.data.data || []))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = docs.filter((d) => {
    if (tab !== "all" && d.kind !== tab) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (d.number || "").toLowerCase().includes(s) ||
        (d.customer?.name || "").toLowerCase().includes(s) ||
        (d.subject || "").toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div style={{ padding: 24 }}>
      <Toaster position="top-right" />
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Sent Documents</h1>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
        Quotations &amp; invoices sent to store customers from CRM — with subject, message and date.
      </p>

      {/* Tabs + search */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {[{ v: "all", l: "All" }, { v: "quotation", l: "Quotations" }, { v: "invoice", l: "Invoices" }].map((t) => (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer",
              border: tab === t.v ? "none" : "1px solid #e5e7eb",
              background: tab === t.v ? "#16a34a" : "#fff",
              color: tab === t.v ? "#fff" : "#374151",
            }}>
              {t.l}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search number, customer, subject..."
          style={{ flex: 1, minWidth: 200, padding: "8px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none" }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", background: "#fff", borderRadius: 16, border: "1px solid #f3f4f6" }}>
          No documents have been sent to customers yet.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Type", "Number", "Customer", "Subject", "Amount", "Status", "Sent", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={`${d.kind}-${d._id}`} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "11px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, textTransform: "capitalize",
                      background: d.kind === "quotation" ? "#eff6ff" : "#f0fdf4", color: d.kind === "quotation" ? "#2563eb" : "#16a34a" }}>
                      {d.kind}
                    </span>
                  </td>
                  <td style={{ padding: "11px 12px", fontWeight: 800, fontSize: 13, color: "#111827", whiteSpace: "nowrap" }}>{d.number}</td>
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{d.customer?.name || "—"}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{d.customer?.phone || d.customer?.email || ""}</div>
                  </td>
                  <td style={{ padding: "11px 12px", fontSize: 13, color: "#374151", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.subject || "—"}</td>
                  <td style={{ padding: "11px 12px", fontSize: 14, fontWeight: 800, color: "#111827" }}>{fmt(d.grandTotal)}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: "#6b7280", textTransform: "capitalize" }}>{d.status}</td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: "#9ca3af", whiteSpace: "nowrap" }}>{fmtDateTime(d.sentAt)}</td>
                  <td style={{ padding: "11px 12px" }}>
                    <button onClick={() => setSelected(d)} style={{ background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail drawer */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 1000, display: "flex", justifyContent: "flex-end" }} onClick={() => setSelected(null)}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 460, height: "100%", overflowY: "auto", padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{selected.number}</h2>
              <button onClick={() => setSelected(null)} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer" }}>×</button>
            </div>

            <Field label="Type" value={selected.kind} cap />
            <Field label="Customer" value={selected.customer?.name || "—"} />
            <Field label="Contact" value={selected.customer?.phone || selected.customer?.email || "—"} />
            <Field label="Amount" value={fmt(selected.grandTotal)} />
            <Field label="Status" value={selected.status} cap />
            <Field label="Sent By" value={selected.sentByName || "—"} />
            <Field label="Sent At" value={fmtDateTime(selected.sentAt)} />

            <div style={{ marginTop: 16, background: "#f9fafb", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Subject</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 14px" }}>{selected.subject || "—"}</p>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 6 }}>Message to Customer</div>
              <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{selected.message || "— No message —"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, cap }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
      <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#374151", fontWeight: 700, textTransform: cap ? "capitalize" : "none" }}>{value}</span>
    </div>
  );
}
