"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, X, Send, Lock, Trash2, AlertTriangle } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY = { name: "", quantity: 1, quality: "", price: 0 };
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—";

export default function OrderSheetDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [sheet, setSheet] = useState(null);
  const [items, setItems] = useState([{ ...EMPTY }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [showSend, setShowSend] = useState(false);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = useCallback(async () => {
    try {
      const { data } = await CRM_API.get(`/order-sheets/${id}`);
      const s = data.data;
      setSheet(s);
      setItems(s.items?.length ? s.items.map((i) => ({ name: i.name || "", quantity: i.quantity ?? 1, quality: i.quality || "", price: i.price ?? 0 })) : [{ ...EMPTY }]);
      setNotes(s.notes || "");
    } catch {
      router.replace("/crm/dashboard/orders");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const locked = sheet?.locked || sheet?.send?.sent;

  const updateItem = (i, k, v) => setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));
  const addRow = () => setItems((p) => [...p, { ...EMPTY }]);
  const delRow = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const grandTotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  const saveChanges = async () => {
    setSaving(true);
    try {
      const cleaned = items.filter((i) => i.name.trim());
      const { data } = await CRM_API.patch(`/order-sheets/${id}`, { items: cleaned, notes });
      setSheet(data.data);
      showToast("Saved!");
    } catch (ex) {
      showToast(ex.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteDraft = async () => {
    if (!confirm("Delete this draft order?")) return;
    try {
      await CRM_API.delete(`/order-sheets/${id}`);
      router.replace("/crm/dashboard/orders");
    } catch (ex) {
      showToast(ex.response?.data?.message || "Delete failed", "error");
    }
  };

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "#94a3b8" }}>Loading…</div>;
  if (!sheet) return null;

  const cellInp = { width: "100%", padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(16px,3vw,24px)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => router.push("/crm/dashboard/orders")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: 0 }}>{sheet.order_number}</h1>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 20,
          background: locked ? "#dcfce7" : "#f1f5f9", color: locked ? "#15803d" : "#64748b",
        }}>
          {locked ? <><Lock size={11} /> Sent</> : "Draft"}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {!locked && (
            <>
              <button onClick={deleteDraft} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Trash2 size={13} /> Delete
              </button>
              <button onClick={saveChanges} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 16px", background: "#f1f5f9", color: "#0f172a", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Save size={13} /> {saving ? "…" : "Save"}
              </button>
              <button onClick={() => setShowSend(true)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 18px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Send size={13} /> Send to Customer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sent banner */}
      {locked && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "14px 16px", marginBottom: 18, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Lock size={18} color="#15803d" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>Sent &amp; locked — permanent</div>
            <div style={{ fontSize: 12, color: "#166534", marginTop: 2 }}>
              Sent to {sheet.store_customer?.name || sheet.customer_name_snapshot} on {fmtDateTime(sheet.send?.sentAt)} by {sheet.send?.sentByName}. This order cannot be edited or deleted.
            </div>
            {sheet.send?.subject && <div style={{ fontSize: 12, color: "#166534", marginTop: 6 }}><strong>Subject:</strong> {sheet.send.subject}</div>}
            {sheet.send?.message && <div style={{ fontSize: 12, color: "#166534", marginTop: 2 }}><strong>Message:</strong> {sheet.send.message}</div>}
          </div>
        </div>
      )}

      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24 }}>
        {/* Customer */}
        <div style={{ marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: "#64748b" }}>Customer: </span>
          <strong style={{ color: "#0f172a" }}>{sheet.store_customer?.name || sheet.customer_name_snapshot || "—"}</strong>
          {sheet.store_customer?.phone && <span style={{ color: "#9ca3af" }}> · {sheet.store_customer.phone}</span>}
        </div>

        {/* Items */}
        {!locked ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Order Items</label>
              <button type="button" onClick={addRow} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={13} /> Add Row
              </button>
            </div>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 560 }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Order Name", "Quantity", "Quality", "Price (₹)", "Total", ""].map((h) => (
                      <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td style={{ padding: "6px 8px", minWidth: 160 }}><input value={it.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="Item name" style={cellInp} /></td>
                      <td style={{ padding: "6px 8px", width: 90 }}><input type="number" min="0" value={it.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} style={{ ...cellInp, textAlign: "right" }} /></td>
                      <td style={{ padding: "6px 8px", width: 120 }}><input value={it.quality} onChange={(e) => updateItem(i, "quality", e.target.value)} placeholder="Quality" style={cellInp} /></td>
                      <td style={{ padding: "6px 8px", width: 110 }}><input type="number" min="0" value={it.price} onChange={(e) => updateItem(i, "price", e.target.value)} style={{ ...cellInp, textAlign: "right" }} /></td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>{fmt((Number(it.quantity) || 0) * (Number(it.price) || 0))}</td>
                      <td style={{ padding: "6px 8px", width: 30 }}>{items.length > 1 && <button type="button" onClick={() => delRow(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 3 }}><X size={14} /></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* Read-only table when locked */
          <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Order Name", "Quantity", "Quality", "Price", "Total"].map((h) => (
                    <th key={h} style={{ padding: "9px 10px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sheet.items.map((it, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                    <td style={{ padding: "9px 10px", fontWeight: 600 }}>{it.name}</td>
                    <td style={{ padding: "9px 10px" }}>{it.quantity}</td>
                    <td style={{ padding: "9px 10px", color: "#64748b" }}>{it.quality || "—"}</td>
                    <td style={{ padding: "9px 10px" }}>{fmt(it.price)}</td>
                    <td style={{ padding: "9px 10px", fontWeight: 700, textAlign: "right" }}>{fmt((it.quantity || 0) * (it.price || 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, marginTop: 12, fontSize: 13 }}>
          <span style={{ color: "#64748b" }}>Total Qty: <strong style={{ color: "#0f172a" }}>{locked ? sheet.total_quantity : totalQty}</strong></span>
          <span style={{ color: "#64748b" }}>Grand Total: <strong style={{ color: "#15803d", fontSize: 15 }}>{fmt(locked ? sheet.grand_total : grandTotal)}</strong></span>
        </div>

        {/* Notes */}
        {!locked ? (
          <div style={{ marginTop: 16 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
          </div>
        ) : (
          sheet.notes && <div style={{ marginTop: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 12, color: "#64748b" }}><strong>Notes:</strong> {sheet.notes}</div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 3000, padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#fff", background: toast.type === "error" ? "#dc2626" : "#16a34a", boxShadow: "0 4px 16px rgba(0,0,0,.15)" }}>
          {toast.msg}
        </div>
      )}

      {/* Send confirmation popup */}
      {showSend && (
        <SendConfirm
          sheet={sheet}
          onClose={() => setShowSend(false)}
          onSent={(updated) => { setShowSend(false); setSheet(updated); showToast("Order sent to customer!"); }}
          beforeSend={saveChanges}
        />
      )}
    </div>
  );
}

// ── Send confirmation modal ──
function SendConfirm({ sheet, onClose, onSent, beforeSend }) {
  const id = sheet._id || sheet.id;
  const [subject, setSubject] = useState(sheet.send?.subject || `Order ${sheet.order_number}`);
  const [message, setMessage] = useState(sheet.send?.message || "");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    setErr("");
    if (!subject.trim()) { setErr("Subject is required"); return; }
    setSending(true);
    try {
      // Save latest edits first, then send
      await beforeSend?.();
      const { data } = await CRM_API.post(`/order-sheets/${id}/send`, { subject, message });
      onSent(data.data);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Send failed");
    } finally {
      setSending(false);
    }
  };

  const inp = { width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", margin: 0 }}>Send Order to Customer</h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", width: 30, height: 30, borderRadius: 6, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>
          {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: 8, fontSize: 13, marginBottom: 14 }}>{err}</div>}

          {/* Warning banner — permanent */}
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, padding: "12px 14px", marginBottom: 16, display: "flex", gap: 10 }}>
            <AlertTriangle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: "#92400e", lineHeight: 1.5 }}>
              Once sent to the customer (dukandar), this order <strong>cannot be deleted or edited</strong>. It stays permanent and transparent for both sides. Please review before sending.
            </div>
          </div>

          <div style={{ marginBottom: 14, fontSize: 13 }}>
            <span style={{ color: "#64748b" }}>To: </span>
            <strong style={{ color: "#0f172a" }}>{sheet.store_customer?.name || sheet.customer_name_snapshot || "—"}</strong>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Subject <span style={{ color: "#ef4444" }}>*</span></label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} style={inp} placeholder="e.g. Your order is ready" />
          </div>
          <div>
            <label style={lbl}>Message / Description</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} style={{ ...inp, resize: "vertical" }} placeholder="Write a note for the customer…" />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid #f1f5f9" }}>
            <button onClick={onClose} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={send} disabled={sending} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 20px", background: sending ? "#93c5fd" : "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer" }}>
              <Send size={14} /> {sending ? "Sending…" : "Confirm & Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
