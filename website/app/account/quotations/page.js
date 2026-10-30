"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const STATUS_COLORS = {
  draft:      { bg: "#f3f4f6", color: "#6b7280" },
  sent:       { bg: "#eff6ff", color: "#2563eb" },
  approved:   { bg: "#f0fdf4", color: "#16a34a" },
  rejected:   { bg: "#fef2f2", color: "#dc2626" },
  superseded: { bg: "#fefce8", color: "#ca8a04" },
};

export default function MyQuotationsPage() {
  const { token } = useCustomerAuth();
  const router = useRouter();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!token) { router.push("/account/login?redirect=/account/quotations"); return; }
    axios.get(`${API}/api/store/customers/me/quotations`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setQuotes(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, router]);

  return (
    <StoreLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
        <Link href="/account" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          &larr; My Account
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "8px 0 24px" }}>
          My Quotations {quotes.length > 0 && <span style={{ color: "#9ca3af", fontWeight: 700 }}>({quotes.length})</span>}
        </h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading your quotations...</div>
        ) : quotes.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9fafb", borderRadius: 16, border: "1px dashed #d1d5db" }}>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>No quotations yet.</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>
              When the store prepares a price quotation for you, it will show up here.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {quotes.map((q) => {
              const sc = STATUS_COLORS[q.status] || STATUS_COLORS.draft;
              const isOpen = open === q._id;
              return (
                <div key={q._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => setOpen(isOpen ? null : q._id)} style={{
                    width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                    padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>{q.quote_number}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        Dated {fmtDate(q.created_at)}{q.valid_until ? ` · Valid till ${fmtDate(q.valid_until)}` : ""}
                      </div>
                      {q.send?.subject && (
                        <div style={{ fontSize: 13, color: "#374151", marginTop: 4, fontWeight: 600 }}>{q.send.subject}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 20, background: sc.bg, color: sc.color, textTransform: "capitalize" }}>
                        {q.status}
                      </span>
                      <span style={{ fontSize: 17, fontWeight: 900, color: "#16a34a" }}>{fmt(q.grand_total)}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: 18, background: "#fafafa" }}>
                      {q.send?.message && (
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Message from store</div>
                          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{q.send.message}</p>
                        </div>
                      )}
                      <div style={{ marginBottom: 14 }}>
                        <Link href={`/account/quotations/${q._id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "#16a34a", color: "#fff", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                          View &amp; Download PDF &rarr;
                        </Link>
                      </div>
                      {q.items?.length > 0 && (
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
                          <thead>
                            <tr style={{ textAlign: "left", color: "#6b7280" }}>
                              <th style={{ padding: "6px 8px", fontWeight: 700 }}>Item</th>
                              <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>Qty</th>
                              <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>Rate</th>
                              <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {q.items.map((it) => (
                              <tr key={it._id || it.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "6px 8px", color: "#374151" }}>{it.description}</td>
                                <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280" }}>{it.quantity}</td>
                                <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280" }}>{fmt(it.unit_price)}</td>
                                <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{fmt(it.total_price)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, maxWidth: 260, marginLeft: "auto" }}>
                        <Row label="Subtotal" value={fmt(q.subtotal)} />
                        {q.discount_amount > 0 && <Row label="Discount" value={`-${fmt(q.discount_amount)}`} />}
                        {q.total_tax > 0 && <Row label="Tax (GST)" value={fmt(q.total_tax)} />}
                        <div style={{ borderTop: "2px solid #e5e7eb", marginTop: 4, paddingTop: 6, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontWeight: 800 }}>Grand Total</span>
                          <span style={{ fontWeight: 900, color: "#16a34a" }}>{fmt(q.grand_total)}</span>
                        </div>
                      </div>
                      {q.notes && (
                        <p style={{ marginTop: 14, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                          <strong style={{ color: "#374151" }}>Notes:</strong> {q.notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#374151" }}>{value}</span>
    </div>
  );
}
