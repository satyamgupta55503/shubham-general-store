"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { downloadPdf } from "@/utils/downloadPdf";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const fmt  = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtD = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—");

const th = { textAlign: "left", padding: "9px 10px", border: "1px solid #d1d5db", fontWeight: 700, fontSize: 11, background: "#f1f5f9", textTransform: "uppercase" };
const td = (a = "left") => ({ textAlign: a, padding: "9px 10px", border: "1px solid #e2e8f0", verticalAlign: "top" });

/**
 * CustomerDocument — printable A4 view of a sent quotation or invoice,
 * fetched from the customer's own endpoint. Includes Download PDF + Print.
 *
 * props: kind = "quotation" | "invoice"
 */
export default function CustomerDocument({ kind, id }) {
  const { token } = useCustomerAuth();
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const isQuote = kind === "quotation";
  const backHref = isQuote ? "/account/quotations" : "/account/invoices";

  useEffect(() => {
    if (!token) { router.push(`/account/login?redirect=${backHref}/${id}`); return; }
    const path = isQuote ? `me/quotations/${id}` : `me/invoices/${id}`;
    axios.get(`${API}/api/store/customers/${path}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => setDoc(r.data.data))
      .catch(() => router.push(backHref))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "#9ca3af" }}>Loading document...</div>;
  if (!doc) return null;

  const number = isQuote ? doc.quote_number : doc.invoice_number;
  const hasGST = doc.cgst_rate > 0 || doc.sgst_rate > 0 || doc.igst_rate > 0;
  const isIGST = doc.igst_rate > 0 && doc.sgst_rate === 0;
  const items = Array.isArray(doc.items) ? doc.items : [];

  const company = {
    name: doc.company_name_snapshot || "Subham General Store",
    address: doc.company_address_snapshot || "",
    gstin: doc.company_gstin_snapshot || "",
    phone: doc.company_phone_snapshot || "",
    email: doc.company_email_snapshot || "",
    state: doc.company_state_snapshot || "",
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 20px 80px" }}>
      {/* Action bar (not printed / not in PDF) */}
      <div className="no-print" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <Link href={backHref} style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
          &larr; Back
        </Link>
        <span style={{ fontWeight: 800, color: "#111827" }}>{number}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <button
            onClick={() => downloadPdf("customer-pdf-document", number, () => setDownloading(true), () => setDownloading(false))}
            disabled={downloading}
            style={{ padding: "9px 18px", background: downloading ? "#86efac" : "#16a34a", color: "#fff", border: "none", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: downloading ? "not-allowed" : "pointer" }}>
            {downloading ? "Generating..." : "Download PDF"}
          </button>
          <button onClick={() => window.print()} style={{ padding: "9px 18px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            Print
          </button>
        </div>
      </div>

      {/* Message from store */}
      {doc.send?.message && (
        <div className="no-print" style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>
            {doc.send.subject || "Message from store"}
          </div>
          <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{doc.send.message}</p>
        </div>
      )}

      {/* A4 document */}
      <div id="customer-pdf-document" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "32px 36px", fontFamily: "Arial, Helvetica, sans-serif", fontSize: 12, color: "#111", lineHeight: 1.5 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #111", paddingBottom: 14, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{isQuote ? "Quotation" : "Invoice"}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{company.name}</div>
            {company.address && <div style={{ fontSize: 11, color: "#444", marginTop: 4, lineHeight: 1.6 }}>{company.address}</div>}
            {company.gstin && <div style={{ fontSize: 11, marginTop: 2 }}><strong>GSTIN:</strong> {company.gstin}</div>}
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#444" }}>
            <table style={{ marginLeft: "auto", borderCollapse: "collapse" }}>
              <tbody>
                <tr><td style={{ fontWeight: 700, paddingRight: 14, textTransform: "uppercase", color: "#444" }}>{isQuote ? "Quotation No" : "Invoice No"}</td><td style={{ fontWeight: 600 }}>{number}</td></tr>
                <tr><td style={{ fontWeight: 700, paddingRight: 14, textTransform: "uppercase", color: "#444" }}>Date</td><td style={{ fontWeight: 600 }}>{fmtD(isQuote ? doc.created_at : doc.invoice_date)}</td></tr>
                {isQuote && doc.valid_until && <tr><td style={{ fontWeight: 700, paddingRight: 14, textTransform: "uppercase", color: "#444" }}>Valid Until</td><td style={{ fontWeight: 600 }}>{fmtD(doc.valid_until)}</td></tr>}
                {!isQuote && doc.due_date && <tr><td style={{ fontWeight: 700, paddingRight: 14, textTransform: "uppercase", color: "#444" }}>Due Date</td><td style={{ fontWeight: 600 }}>{fmtD(doc.due_date)}</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill to */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 4 }}>{isQuote ? "Quote To" : "Bill To"}</div>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{doc.client_name_snapshot || "—"}</div>
          {doc.client_address_snapshot && <div style={{ fontSize: 11, color: "#444", marginTop: 3 }}>{doc.client_address_snapshot}</div>}
          {doc.client_gstin_snapshot && <div style={{ fontSize: 11, marginTop: 3 }}><strong>GSTIN:</strong> {doc.client_gstin_snapshot}</div>}
        </div>

        {/* Items */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 14 }}>
          <thead>
            <tr>
              <th style={th}>Description</th>
              <th style={{ ...th, textAlign: "center" }}>Qty</th>
              <th style={{ ...th, textAlign: "right" }}>Unit Price</th>
              <th style={{ ...th, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 12, textAlign: "center", color: "#94a3b8" }}>No line items</td></tr>
            ) : items.map((it, i) => (
              <tr key={i}>
                <td style={td("left")}>{it.description}</td>
                <td style={td("center")}>{Number(it.quantity || 1)}</td>
                <td style={td("right")}>{fmt(it.unit_price)}</td>
                <td style={td("right")}>{fmt(it.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {[
              ["Subtotal", fmt(doc.subtotal), false],
              Number(doc.discount_amount) > 0 ? ["Discount", `- ${fmt(doc.discount_amount)}`, false] : null,
              hasGST && !isIGST && Number(doc.cgst_amount) > 0 ? [`CGST (${doc.cgst_rate}%)`, fmt(doc.cgst_amount), false] : null,
              hasGST && !isIGST && Number(doc.sgst_amount) > 0 ? [`SGST (${doc.sgst_rate}%)`, fmt(doc.sgst_amount), false] : null,
              hasGST && isIGST && Number(doc.igst_amount) > 0 ? [`IGST (${doc.igst_rate}%)`, fmt(doc.igst_amount), false] : null,
              ["Total", fmt(doc.grand_total), true],
              !isQuote && Number(doc.amount_paid) > 0 ? ["Paid", fmt(doc.amount_paid), false] : null,
              !isQuote && Number(doc.balance_due) >= 0 ? ["Balance Due", fmt(doc.balance_due), true] : null,
            ].filter(Boolean).map(([label, val, bold], i) => (
              <tr key={i} style={bold ? { borderTop: "2px solid #111", background: "#f8fafc" } : { borderTop: "1px solid #e2e8f0" }}>
                <td style={{ width: "60%", border: "none" }} />
                <td style={{ textAlign: "right", padding: "6px 10px", fontWeight: bold ? 700 : 400, color: bold ? "#111" : "#64748b" }}>{label}</td>
                <td style={{ textAlign: "right", padding: "6px 10px", fontWeight: bold ? 700 : 400, fontSize: bold ? 14 : 12, minWidth: 110 }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {doc.notes && (
          <div style={{ marginTop: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 6, fontSize: 11, color: "#444" }}>
            <strong>Notes:</strong> {doc.notes}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 10, color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: 10 }}>
          This is a computer generated {isQuote ? "quotation" : "invoice"} from {company.name}.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          #customer-pdf-document { border: none !important; border-radius: 0 !important; padding: 0 !important; }
          @page { size: A4 portrait; margin: 12mm 14mm; }
        }
      ` }} />
    </div>
  );
}
