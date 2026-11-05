"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const EMPTY = { name: "", quantity: 1, quality: "", price: 0 };
const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const fetchStoreCustomers = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  return axios.get(`${BACKEND}/api/store/customers/crm/list`, { headers: { Authorization: `Bearer ${token}` } });
};

export default function NewOrderSheetPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState([]);
  const [storeCustomer, setStoreCustomer] = useState("");
  const [items, setItems] = useState([{ ...EMPTY }]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetchStoreCustomers().then(({ data }) => setCustomers(data.data || [])).catch(() => {});
  }, []);

  const updateItem = (i, k, v) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  const addRow = () => setItems((p) => [...p, { ...EMPTY }]);
  const delRow = (i) => setItems((p) => p.filter((_, idx) => idx !== i));

  const grandTotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    const cleaned = items.filter((i) => i.name.trim());
    if (cleaned.length === 0) { setErr("Add at least one order item with a name"); return; }
    setSaving(true);
    try {
      const { data } = await CRM_API.post("/order-sheets", {
        store_customer: storeCustomer || null,
        items: cleaned,
        notes,
      });
      router.push(`/crm/dashboard/orders/${data.data.id || data.data._id}`);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 };
  const inp = { width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 9, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
  const cellInp = { width: "100%", padding: "7px 9px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "clamp(16px,3vw,24px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#475569", cursor: "pointer" }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>New Order Sheet</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: "3px 0 0" }}>Create a manual order list for a store customer</p>
        </div>
      </div>

      <form onSubmit={save}>
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          {err && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "11px 15px", borderRadius: 8, fontSize: 13 }}>{err}</div>}

          {/* Customer */}
          <div>
            <label style={lbl}>Store Customer <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>(required before sending)</span></label>
            <select value={storeCustomer} onChange={(e) => setStoreCustomer(e.target.value)} style={inp}>
              <option value="">— Select a store customer —</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} · {c.phone || c.email}{c.customerType === "wholesale" ? " (Wholesale)" : ""}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p style={{ fontSize: 11, color: "#b45309", margin: "6px 0 0" }}>
                No store customers found. Customers register on the store and are approved in CMS.
              </p>
            )}
          </div>

          {/* Editable items table */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label style={{ ...lbl, margin: 0 }}>Order Items</label>
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
                      <td style={{ padding: "6px 8px", minWidth: 160 }}>
                        <input value={it.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="e.g. Basmati Rice" style={cellInp} />
                      </td>
                      <td style={{ padding: "6px 8px", width: 90 }}>
                        <input type="number" min="0" value={it.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} style={{ ...cellInp, textAlign: "right" }} />
                      </td>
                      <td style={{ padding: "6px 8px", width: 120 }}>
                        <input value={it.quality} onChange={(e) => updateItem(i, "quality", e.target.value)} placeholder="e.g. Premium" style={cellInp} />
                      </td>
                      <td style={{ padding: "6px 8px", width: 110 }}>
                        <input type="number" min="0" value={it.price} onChange={(e) => updateItem(i, "price", e.target.value)} style={{ ...cellInp, textAlign: "right" }} />
                      </td>
                      <td style={{ padding: "6px 10px", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap" }}>
                        {fmt((Number(it.quantity) || 0) * (Number(it.price) || 0))}
                      </td>
                      <td style={{ padding: "6px 8px", width: 30 }}>
                        {items.length > 1 && (
                          <button type="button" onClick={() => delRow(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", padding: 3 }}>
                            <X size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 20, marginTop: 10, fontSize: 13 }}>
              <span style={{ color: "#64748b" }}>Total Qty: <strong style={{ color: "#0f172a" }}>{totalQty}</strong></span>
              <span style={{ color: "#64748b" }}>Grand Total: <strong style={{ color: "#15803d", fontSize: 15 }}>{fmt(grandTotal)}</strong></span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inp, resize: "vertical" }} placeholder="Any note about this order…" />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
          <button type="button" onClick={() => router.back()} style={{ padding: "10px 20px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
            <Save size={14} /> {saving ? "Saving…" : "Save Draft"}
          </button>
        </div>
      </form>
    </div>
  );
}
