"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");
const authHdr  = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

export default function AdminLedgerOverview() {
  const [rows, setRows]       = useState([]);
  const [total, setTotal]     = useState(0);
  const [outstanding, setOut] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const LIMIT = 30;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (search) params.set("search", search);
    axios.get(`${API}/api/store/ledger/admin?${params}`, authHdr())
      .then(r => { setRows(r.data.data || []); setTotal(r.data.pagination?.total || 0); setOut(r.data.totalOutstanding || 0); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: 24 }}>
      <Toaster position="top-right" />
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Ledger / Khata</h1>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Wholesale customer dues &amp; payments overview.</p>

      {/* Total outstanding card */}
      <div style={{ background: "linear-gradient(135deg,#d97706,#b45309)", borderRadius: 16, padding: "20px 24px", color: "#fff", marginBottom: 20, display: "inline-block", minWidth: 240 }}>
        <div style={{ fontSize: 13, opacity: .85 }}>Total Outstanding (All Wholesale)</div>
        <div style={{ fontSize: 30, fontWeight: 900, marginTop: 4 }}>₹{outstanding}</div>
      </div>

      <div>
        <input type="text" placeholder="Search business / name / phone…" value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", marginBottom: 16, width: "min(340px,100%)", boxSizing: "border-box" }} />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", background: "#fff", borderRadius: 16, border: "1px solid #f3f4f6" }}>No wholesale customers yet.</div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Business / Customer", "Phone", "Credit Limit", "Outstanding (Baaki)", "Action"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(c => (
                <tr key={c._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{c.businessName || c.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.name} · {c.email}</div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280" }}>{c.phone || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13 }}>₹{c.creditLimit || 0}</td>
                  <td style={{ padding: "12px 14px", fontSize: 15, fontWeight: 800, color: c.outstandingBalance > 0 ? "#d97706" : "#16a34a" }}>
                    ₹{c.outstandingBalance || 0}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <Link href={`/admin/store/customers`} style={{ fontSize: 12, fontWeight: 700, color: "#2563eb", textDecoration: "none", background: "#eff6ff", padding: "5px 12px", borderRadius: 6 }}>
                      Manage Khata →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {Math.ceil(total / LIMIT) > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {Array(Math.ceil(total / LIMIT)).fill(0).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 32, height: 32, borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer",
              border: page === i + 1 ? "none" : "1px solid #e5e7eb",
              background: page === i + 1 ? "#16a34a" : "#fff",
              color: page === i + 1 ? "#fff" : "#374151",
            }}>{i + 1}</button>
          ))}
        </div>
      )}
    </div>
  );
}
