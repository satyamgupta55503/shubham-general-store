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

export default function MyOrderSheetsPage() {
  const { token } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    if (!token) { router.push("/account/login?redirect=/account/order-sheets"); return; }
    axios.get(`${API}/api/store/customers/me/order-sheets`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, router]);

  return (
    <StoreLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 80px" }}>
        <Link href="/account" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          &larr; My Account
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "8px 0 6px" }}>
          Order Sheets {orders.length > 0 && <span style={{ color: "#9ca3af", fontWeight: 700 }}>({orders.length})</span>}
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 24px" }}>
          Order lists the store prepared and sent to you. These are permanent records.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9fafb", borderRadius: 16, border: "1px dashed #d1d5db" }}>
            <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>No order sheets yet.</p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 6 }}>When the store sends you an order list, it will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {orders.map((o) => {
              const isOpen = open === o._id;
              return (
                <div key={o._id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
                  <button onClick={() => setOpen(isOpen ? null : o._id)} style={{
                    width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer",
                    padding: 18, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap",
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#111827" }}>{o.order_number}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                        Sent {fmtDate(o.send?.sentAt)} · {o.items?.length || 0} items
                      </div>
                      {o.send?.subject && <div style={{ fontSize: 13, color: "#374151", marginTop: 4, fontWeight: 600 }}>{o.send.subject}</div>}
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 900, color: "#16a34a" }}>{fmt(o.grand_total)}</span>
                  </button>

                  {isOpen && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: 18, background: "#fafafa" }}>
                      {o.send?.message && (
                        <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Message from store</div>
                          <p style={{ fontSize: 13, color: "#374151", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{o.send.message}</p>
                        </div>
                      )}
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ textAlign: "left", color: "#6b7280" }}>
                            <th style={{ padding: "6px 8px", fontWeight: 700 }}>Item</th>
                            <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>Qty</th>
                            <th style={{ padding: "6px 8px", fontWeight: 700 }}>Quality</th>
                            <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>Price</th>
                            <th style={{ padding: "6px 8px", fontWeight: 700, textAlign: "right" }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {o.items?.map((it) => (
                            <tr key={it._id} style={{ borderTop: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "6px 8px", color: "#374151", fontWeight: 600 }}>{it.name}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280" }}>{it.quantity}</td>
                              <td style={{ padding: "6px 8px", color: "#6b7280" }}>{it.quality || "—"}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right", color: "#6b7280" }}>{fmt(it.price)}</td>
                              <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{fmt((it.quantity || 0) * (it.price || 0))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, marginTop: 10, fontSize: 13 }}>
                        <span style={{ color: "#6b7280" }}>Total Qty: <strong style={{ color: "#111827" }}>{o.total_quantity}</strong></span>
                        <span style={{ color: "#6b7280" }}>Grand Total: <strong style={{ color: "#16a34a" }}>{fmt(o.grand_total)}</strong></span>
                      </div>
                      {o.notes && <p style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}><strong style={{ color: "#374151" }}>Notes:</strong> {o.notes}</p>}
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
