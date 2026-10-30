"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, X, FileText, Search, Eye } from "lucide-react";
import CRM_API from "@/utils/crmApi";
import ExportButton from "@/components/crm/ExportButton";
import { INVOICE_COLUMNS } from "@/utils/exportUtils";

const EMPTY_ITEM = { description: "", quantity: 1, unit_price: 0, total_price: 0 };
const EMPTY = { project: "", invoice_type: "full", invoice_date: "", due_date: "", status: "draft", milestone_label: "", cgst_rate: 9, sgst_rate: 9, igst_rate: 0, hsn_sac: "998319", place_of_supply: "Chhattisgarh", notes: "", items: [{ ...EMPTY_ITEM }] };
const STATUS_MAP = { draft:["#f1f5f9","#475569"], issued:["#dbeafe","#1d4ed8"], partial:["#ffedd5","#c2410c"], paid:["#dcfce7","#15803d"], overdue:["#fee2e2","#dc2626"], cancelled:["#f1f5f9","#94a3b8"] };
const INV_TYPES = ["full","advance","milestone","final","monthly_retainer"];
const fmt = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const toInput = d => d ? d.split("T")[0] : "";

export default function CrmInvoicesPage() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterStatus ? { status: filterStatus } : {};
      const [{ data: inv }, { data: proj }] = await Promise.all([CRM_API.get("/invoices", { params }), CRM_API.get("/projects")]);
      setItems(inv); setProjects(proj);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => !search || i.invoice_number?.toLowerCase().includes(search.toLowerCase()) || i.client_name_snapshot?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm({ ...EMPTY, invoice_date: new Date().toISOString().split("T")[0] }); setError(""); setModal(true); };
  const openEdit = async (inv) => {
    try {
      const { data } = await CRM_API.get(`/invoices/${inv.id}`);
      setEditing(data);
      setForm({ ...EMPTY, ...data, project: data.project?.id || data.project || "", invoice_date: toInput(data.invoice_date), due_date: toInput(data.due_date), items: data.items?.length ? data.items : [{ ...EMPTY_ITEM }] });
      setError(""); setModal(true);
    } catch { alert("Could not load invoice."); }
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const updateItem = (i, k, v) => setForm(p => {
    const items = p.items.map((it, idx) => {
      if (idx !== i) return it;
      const u = { ...it, [k]: v };
      u.total_price = (Number(u.quantity)||0) * (Number(u.unit_price)||0);
      return u;
    });
    return { ...p, items };
  });
  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM }] }));
  const removeItem = (i) => setForm(p => ({ ...p, items: p.items.filter((_,idx) => idx !== i) }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, items: form.items.filter(it => it.description) };
      if (editing) await CRM_API.patch(`/invoices/${editing.id}`, payload);
      else await CRM_API.post("/invoices", payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, num) => {
    if (!confirm(`Delete invoice ${num}?`)) return;
    try { await CRM_API.delete(`/invoices/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });
  const subtotal = form.items.reduce((s, i) => s + (Number(i.total_price)||0), 0);
  const cgst = subtotal * (Number(form.cgst_rate)||0) / 100;
  const sgst = subtotal * (Number(form.sgst_rate)||0) / 100;
  const igst = subtotal * (Number(form.igst_rate)||0) / 100;
  const grandTotal = subtotal + cgst + sgst + igst;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Invoices</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{items.length} total · {items.filter(i=>i.status==="overdue").length} overdue</p>
        </div>
        <Link href="/crm/dashboard/invoices/new" style={{ display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"700",cursor:"pointer",textDecoration:"none" }}>
          <Plus size={16} /> New Invoice
        </Link>
        <ExportButton data={items} columns={INVOICE_COLUMNS} type="Invoices" />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "9px", padding: "8px 14px", flex: 1, minWidth: "200px", maxWidth: "340px" }}>
          <Search size={15} color="#94a3b8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices…" style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", flex: 1, minWidth: 0, fontFamily: "inherit" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}>
          <option value="">All Status</option>
          {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
        </select>
      </div>

      <div className="crm-card">
        <div className="crm-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Invoice #", "Client", "Grand Total", "Paid", "Balance Due", "Due Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (<tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>)
              : filtered.length === 0 ? (<tr><td colSpan={8} style={{ padding: "48px", textAlign: "center" }}><FileText size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} /><p style={{ color: "#94a3b8", margin: 0 }}>No invoices yet.</p></td></tr>)
              : filtered.map(inv => {
                const [bg, color] = STATUS_MAP[inv.status] || ["#f1f5f9","#475569"];
                return (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontWeight: "700", color: "#0f172a" }}>{inv.invoice_number}</td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>{inv.client_name_snapshot || "—"}</td>
                    <td style={{ padding: "13px 16px", fontWeight: "700", color: "#0f172a" }}>{fmt(inv.grand_total)}</td>
                    <td style={{ padding: "13px 16px", color: "#16a34a", fontWeight: "600" }}>{fmt(inv.amount_paid)}</td>
                    <td style={{ padding: "13px 16px", color: inv.balance_due > 0 ? "#dc2626" : "#16a34a", fontWeight: "600" }}>{fmt(inv.balance_due)}</td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#64748b" }}>{fmtDate(inv.due_date)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize", background: bg, color }}>{inv.status}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link href={`/crm/dashboard/invoices/${inv.id}`} target="_blank">
                          <button style={{ padding: "6px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer" }} title="View / Print"><Eye size={13} /></button>
                        </Link>
                        <Link href={`/crm/dashboard/invoices/edit/${inv.id}`}>
                          <button style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }}><Edit2 size={13} /></button>
                        </Link>
                        <button onClick={() => handleDelete(inv.id, inv.invoice_number)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal" style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? `Edit ${editing.invoice_number}` : "New Invoice"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Project <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={form.project} onChange={e => setForm(p=>({...p,project:e.target.value}))} required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    <option value="">Select…</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Invoice Type</label>
                  <select {...F("invoice_type")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {INV_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Status</label>
                  <select {...F("status")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Invoice Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input {...F("invoice_date")} type="date" required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Due Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input {...F("due_date")} type="date" required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Milestone Label</label>
                  <input {...F("milestone_label")} placeholder="e.g. Month 1" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>HSN/SAC Code</label>
                  <input {...F("hsn_sac")} placeholder="998319" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Place of Supply</label>
                  <input {...F("place_of_supply")} placeholder="Chhattisgarh" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <label style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Line Items</label>
                  <button type="button" onClick={addItem} style={{ padding: "5px 12px", background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>+ Add Row</button>
                </div>
                <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Description","Qty","Unit Price (₹)","Total (₹)",""].map(h => <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: "600", color: "#64748b", borderBottom: "1px solid #e2e8f0" }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {form.items.map((it, i) => (
                        <tr key={i}>
                          <td style={{ padding: "6px 8px" }}><input value={it.description} onChange={e => updateItem(i,"description",e.target.value)} placeholder="Service / deliverable" style={{ width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", outline: "none", fontFamily: "inherit" }} /></td>
                          <td style={{ padding: "6px 8px", width: "60px" }}><input type="number" min="1" value={it.quantity} onChange={e => updateItem(i,"quantity",e.target.value)} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", outline: "none", textAlign: "right", fontFamily: "inherit" }} /></td>
                          <td style={{ padding: "6px 8px", width: "120px" }}><input type="number" min="0" value={it.unit_price} onChange={e => updateItem(i,"unit_price",e.target.value)} style={{ width: "100%", padding: "6px 8px", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", outline: "none", textAlign: "right", fontFamily: "inherit" }} /></td>
                          <td style={{ padding: "6px 8px", width: "110px", fontWeight: "700", color: "#0f172a", textAlign: "right" }}>{fmt(it.total_price)}</td>
                          <td style={{ padding: "6px 8px", width: "32px" }}>{form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}><X size={14} /></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax rates */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "10px" }}>
                {[["cgst_rate","CGST %"],["sgst_rate","SGST %"],["igst_rate","IGST %"]].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>{l}</label>
                    <input type="number" min="0" {...F(k)} style={{ width: "100%", padding: "7px 10px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "12px", outline: "none", fontFamily: "inherit" }} />
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: "#f8fafc", borderRadius: "8px", padding: "14px 16px", fontSize: "13px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Subtotal</span><span>{fmt(subtotal)}</span></div>
                {cgst > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>CGST ({form.cgst_rate}%)</span><span>{fmt(cgst)}</span></div>}
                {sgst > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>SGST ({form.sgst_rate}%)</span><span>{fmt(sgst)}</span></div>}
                {igst > 0 && <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>IGST ({form.igst_rate}%)</span><span>{fmt(igst)}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid #e2e8f0" }}>
                  <span style={{ fontWeight: "700", color: "#0f172a" }}>Grand Total</span>
                  <span style={{ fontWeight: "800", fontSize: "15px", color: "#0f172a" }}>{fmt(grandTotal)}</span>
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Notes</label>
                <textarea {...F("notes")} rows={2} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update" : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
