"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import CRM_API from "@/utils/crmApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * SendToCustomerModal — sends a quotation or invoice to the linked store customer
 * with a subject + message. Requires the doc to be linked to a store customer.
 *
 * props:
 *  - kind: "quotation" | "invoice"
 *  - doc:  the quotation/invoice object (needs _id/id, store_customer, number, send)
 *  - onClose()
 *  - onDone(updatedDoc)
 */
export default function SendToCustomerModal({ kind, doc, onClose, onDone }) {
  const id = doc._id || doc.id;
  const number = kind === "quotation" ? doc.quote_number : doc.invoice_number;
  const linked = doc.store_customer; // object (populated) or id string
  const linkedName =
    linked && typeof linked === "object"
      ? `${linked.name} · ${linked.phone || linked.email || ""}`
      : linked
      ? "Linked customer"
      : "";

  const [customers, setCustomers] = useState([]);
  const [subject, setSubject] = useState(doc.send?.subject || `${kind === "quotation" ? "Quotation" : "Invoice"} ${number}`);
  const [message, setMessage] = useState(doc.send?.message || "");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  // If not linked, let the user pick one here (we'll link + send in two steps)
  const [pickCustomer, setPickCustomer] = useState("");

  useEffect(() => {
    if (!linked) {
      const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
      axios
        .get(`${BACKEND}/api/store/customers/crm/list`, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data }) => setCustomers(data.data || []))
        .catch(() => {});
    }
  }, [linked]);

  const handleSend = async (e) => {
    e.preventDefault();
    setErr("");
    if (!subject.trim()) { setErr("Subject is required"); return; }
    if (!linked && !pickCustomer) { setErr("Please select a store customer to link"); return; }
    setSending(true);
    try {
      const base = kind === "quotation" ? "/quotations" : "/invoices";
      // If not linked yet, link it first via update
      if (!linked && pickCustomer) {
        await CRM_API.patch(`${base}/${id}`, { store_customer: pickCustomer });
      }
      const { data } = await CRM_API.post(`${base}/${id}/send`, { subject, message });
      onDone?.(data.data || data);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 };
  const inp = { width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)", fontFamily: "'Inter',sans-serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              Send {kind === "quotation" ? "Quotation" : "Invoice"} to Customer
            </h2>
            <p style={{ fontSize: 12, color: "#64748b", margin: "3px 0 0" }}>{number}</p>
          </div>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        <form onSubmit={handleSend} style={{ padding: 24 }}>
          {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}

          {/* Customer */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Store Customer</label>
            {linked ? (
              <div style={{ padding: "10px 13px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                {linkedName}
              </div>
            ) : (
              <>
                <select value={pickCustomer} onChange={(e) => setPickCustomer(e.target.value)} style={inp}>
                  <option value="">— Select a store customer —</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} · {c.phone || c.email}{c.customerType === "wholesale" ? " (Wholesale)" : ""}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: 11, color: "#94a3b8", margin: "5px 0 0" }}>
                  This {kind} is not linked yet. Selecting a customer will link and send it.
                </p>
              </>
            )}
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Subject <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inp} placeholder="e.g. Your quotation for monthly groceries" />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 4 }}>
            <label style={lbl}>Message to Customer</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} style={{ ...inp, resize: "vertical" }} placeholder="Write a note for the customer — e.g. Please review and confirm. Prices valid till month end." />
          </div>

          {doc.send?.sent && (
            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "#b45309", marginTop: 12 }}>
              Already sent on {doc.send.sentAt ? new Date(doc.send.sentAt).toLocaleString("en-IN") : ""}. Sending again will update the message and notify the customer.
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <button type="button" onClick={onClose} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={sending} style={{ padding: "9px 20px", background: sending ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer" }}>
              {sending ? "Sending…" : doc.send?.sent ? "Re-send" : "Send to Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
