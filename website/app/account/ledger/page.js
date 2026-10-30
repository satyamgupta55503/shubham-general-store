"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Format date + time nicely
function fmt(dt) {
  const d = new Date(dt);
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function MyLedgerPage() {
  const { customer, token } = useCustomerAuth();
  const router = useRouter();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all"); // all | baaki | jama

  useEffect(() => {
    if (!token) { router.push("/account/login"); return; }
    axios.get(`${API}/api/store/ledger/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [token, router]);

  // Only wholesale customers have a meaningful khata
  const notWholesale = customer && customer.customerType !== "wholesale";

  if (loading) {
    return <StoreLayout><div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Loading your khata…</div></StoreLayout>;
  }

  const entries = (data?.entries || []).filter(e => filter === "all" ? true : e.type === filter);

  return (
    <StoreLayout>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 20px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
          <Link href="/account" style={{ color: "#6b7280", textDecoration: "none", fontSize: 13 }}>← My Account</Link>
          <span style={{ color: "#d1d5db" }}>/</span>
          <h1 style={{ fontSize: "clamp(20px,4vw,24px)", fontWeight: 900, color: "#111827", margin: 0 }}>Khata / Ledger</h1>
        </div>

        {notWholesale ? (
          <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", border: "2px dashed #e5e7eb" }}>
            <p style={{ color: "#6b7280", margin: 0 }}>Khata (ledger) is available for wholesale accounts only.</p>
            <Link href="/products" style={{ display: "inline-block", marginTop: 16, padding: "10px 24px", background: "#16a34a", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Continue Shopping</Link>
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 24 }}>
              <SummaryCard label="Total Baaki (Dues)"  value={`₹${data?.totalBaaki || 0}`} color="#dc2626" bg="#fef2f2" />
              <SummaryCard label="Total Jama (Paid)"   value={`₹${data?.totalJama || 0}`}  color="#16a34a" bg="#f0fdf4" />
              <SummaryCard
                label={data?.balance > 0 ? "Outstanding Balance" : "Settled"}
                value={`₹${Math.abs(data?.balance || 0)}`}
                color={data?.balance > 0 ? "#d97706" : "#16a34a"}
                bg={data?.balance > 0 ? "#fff7ed" : "#f0fdf4"}
                highlight
              />
            </div>

            {/* Transparency note */}
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "10px 14px", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#1e40af" }}>
                This is a full transparent record of your khata. Every due (baaki) and payment (jama) is shown with date &amp; time.
                {" "}If you have a question, contact the store.
              </p>
            </div>

            {/* Filter tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[
                { v: "all",   l: "All Entries" },
                { v: "baaki", l: "Baaki (Dues)" },
                { v: "jama",  l: "Jama (Payments)" },
              ].map(f => (
                <button key={f.v} onClick={() => setFilter(f.v)} style={{
                  padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  border: filter === f.v ? "none" : "1px solid #e5e7eb",
                  background: filter === f.v ? "#16a34a" : "#fff",
                  color: filter === f.v ? "#fff" : "#374151",
                }}>
                  {f.l}
                </button>
              ))}
            </div>

            {/* Entries — table on desktop, cards on mobile */}
            {entries.length === 0 ? (
              <div style={{ background: "#fff", borderRadius: 16, padding: 40, textAlign: "center", border: "1px solid #f3f4f6", color: "#9ca3af" }}>
                No entries yet.
              </div>
            ) : (
              <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
                {/* Desktop table header */}
                <div className="ledger-row ledger-head">
                  <div>Date &amp; Time</div>
                  <div>Details</div>
                  <div style={{ textAlign: "right" }}>Baaki (Dr)</div>
                  <div style={{ textAlign: "right" }}>Jama (Cr)</div>
                  <div style={{ textAlign: "right" }}>Balance</div>
                </div>

                {entries.map(e => (
                  <div key={e._id} className="ledger-row">
                    <div data-label="Date">
                      <div style={{ fontSize: 13, color: "#374151" }}>{fmt(e.entryDate)}</div>
                    </div>
                    <div data-label="Details">
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                        {e.type === "jama" ? "Payment received" : "Due added"}
                        {e.orderNumber ? ` · ${e.orderNumber}` : ""}
                      </div>
                      {e.note && <div style={{ fontSize: 12, color: "#9ca3af" }}>{e.note}</div>}
                      {e.paymentMethod && <div style={{ fontSize: 11, color: "#9ca3af", textTransform: "capitalize" }}>via {e.paymentMethod}</div>}
                    </div>
                    <div data-label="Baaki" style={{ textAlign: "right", color: "#dc2626", fontWeight: 700, fontSize: 14 }}>
                      {e.type === "baaki" ? `₹${e.amount}` : "—"}
                    </div>
                    <div data-label="Jama" style={{ textAlign: "right", color: "#16a34a", fontWeight: 700, fontSize: 14 }}>
                      {e.type === "jama" ? `₹${e.amount}` : "—"}
                    </div>
                    <div data-label="Balance" style={{ textAlign: "right", fontWeight: 800, fontSize: 14, color: e.balanceAfter > 0 ? "#d97706" : "#16a34a" }}>
                      ₹{e.balanceAfter}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ledger-row {
          display: grid;
          grid-template-columns: 1.4fr 2fr 1fr 1fr 1fr;
          gap: 12px;
          padding: 14px 18px;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
        }
        .ledger-head {
          background: #f9fafb;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        @media (max-width: 640px) {
          .ledger-head { display: none; }
          .ledger-row {
            grid-template-columns: 1fr 1fr;
            gap: 8px 12px;
            padding: 14px 16px;
          }
          .ledger-row > div[data-label]::before {
            content: attr(data-label);
            display: block;
            font-size: 10px;
            font-weight: 700;
            color: #9ca3af;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .ledger-row > div[data-label="Details"] { grid-column: 1 / -1; }
        }
      ` }} />
    </StoreLayout>
  );
}

function SummaryCard({ label, value, color, bg, highlight }) {
  return (
    <div style={{
      background: bg, borderRadius: 16, padding: "18px 16px", textAlign: "center",
      border: highlight ? `2px solid ${color}40` : "1px solid #f3f4f6",
    }}>
      <div style={{ fontSize: "clamp(20px,4vw,26px)", fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600, marginTop: 2 }}>{label}</div>
    </div>
  );
}
