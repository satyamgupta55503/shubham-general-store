"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Wrench, ToggleLeft, ToggleRight } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY = { name: "", description: "", category: "other", base_price: "", price_unit: "monthly", status: "active" };
const CATEGORIES = ["seo","smm","ppc","content","web_design","email_marketing","branding","video","analytics","other"];
const PRICE_UNITS = ["monthly","one_time","per_post","per_hour","custom"];
const CAT_COLOR = { seo:"badge-green", smm:"badge-blue", ppc:"badge-orange", content:"badge-purple", web_design:"badge-teal", email_marketing:"badge-yellow", branding:"badge-red", video:"badge-blue", analytics:"badge-gray", other:"badge-gray" };

export default function CrmServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await CRM_API.get("/services"); setServices(data); }
    catch { setServices([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ ...EMPTY, ...s, base_price: s.base_price ?? "" }); setError(""); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, base_price: Number(form.base_price) || 0 };
      if (editing) await CRM_API.patch(`/services/${editing.id}`, payload);
      else await CRM_API.post("/services", payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (s) => {
    try { await CRM_API.patch(`/services/${s.id}`, { status: s.status === "active" ? "inactive" : "active" }); load(); }
    catch {}
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete service "${name}"?`)) return;
    try { await CRM_API.delete(`/services/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const badgeStyle = (cat) => {
    const map = {
      "badge-green":  ["#dcfce7","#15803d"],
      "badge-blue":   ["#dbeafe","#1d4ed8"],
      "badge-orange": ["#ffedd5","#c2410c"],
      "badge-purple": ["#ede9fe","#6d28d9"],
      "badge-teal":   ["#ccfbf1","#0f766e"],
      "badge-yellow": ["#fef9c3","#a16207"],
      "badge-red":    ["#fee2e2","#dc2626"],
      "badge-gray":   ["#f1f5f9","#475569"],
    };
    const cls = CAT_COLOR[cat] || "badge-gray";
    const [bg, color] = map[cls] || ["#f1f5f9","#475569"];
    return { background: bg, color };
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Services</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>Master service catalogue — {services.filter(s=>s.status==="active").length} active</p>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
        {loading ? (
          <div style={{ gridColumn: "1/-1", padding: "48px", textAlign: "center", color: "#94a3b8", fontSize: "14px" }}>Loading…</div>
        ) : services.length === 0 ? (
          <div style={{ gridColumn: "1/-1", padding: "48px", textAlign: "center" }}>
            <Wrench size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No services yet. Add your first service.</p>
          </div>
        ) : services.map(s => (
          <div key={s.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px", opacity: s.status === "inactive" ? 0.65 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ ...badgeStyle(s.category), display: "inline-flex", padding: "2px 9px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: "6px" }}>{s.category.replace(/_/g," ")}</span>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{s.name}</h3>
              </div>
              <button onClick={() => toggleStatus(s)} style={{ background: "none", border: "none", cursor: "pointer", color: s.status === "active" ? "#22c55e" : "#94a3b8", padding: "2px" }} title={s.status === "active" ? "Deactivate" : "Activate"}>
                {s.status === "active" ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#64748b", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{s.description || "No description"}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "#0f172a" }}>
                  {s.base_price > 0 ? `₹${Number(s.base_price).toLocaleString("en-IN")}` : "Custom"}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", textTransform: "capitalize" }}>{s.price_unit?.replace(/_/g," ")}</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => openEdit(s)} style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }}><Edit2 size={13} /></button>
                <button onClick={() => handleDelete(s.id, s.name)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal" style={{ maxWidth: "540px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? "Edit Service" : "Add Service"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
              {[["name","Service Name",true],].map(([key,label,req]) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>{label}{req && <span style={{ color: "#ef4444" }}> *</span>}</label>
                  <input {...F(key)} required={req} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Description</label>
                <textarea {...F("description")} rows={3} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Category</label>
                  <select {...F("category")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Status</label>
                  <select {...F("status")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Base Price (₹)</label>
                  <input {...F("base_price")} type="number" min="0" placeholder="0 = Custom" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Price Unit</label>
                  <select {...F("price_unit")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {PRICE_UNITS.map(u => <option key={u} value={u}>{u.replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update" : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
