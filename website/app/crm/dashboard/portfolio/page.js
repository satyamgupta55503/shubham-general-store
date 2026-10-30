"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Image, ExternalLink } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY = { title: "", description: "", category: "other", client: "", cover_image: "", live_url: "", results_summary: "", tags: "", is_published: false };
const CATEGORIES = ["seo","smm","ppc","content","web_design","branding","email","video","other"];
const CAT_COLORS = { seo:["#dcfce7","#15803d"], smm:["#dbeafe","#1d4ed8"], ppc:["#ffedd5","#c2410c"], content:["#ede9fe","#6d28d9"], web_design:["#ccfbf1","#0f766e"], branding:["#fef9c3","#a16207"], email:["#fee2e2","#dc2626"], video:["#f3e8ff","#7c3aed"], other:["#f1f5f9","#475569"] };

export default function CrmPortfolioPage() {
  const [items, setItems] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = filterCat ? { category: filterCat } : {};
      const [{ data: p }, { data: c }] = await Promise.all([CRM_API.get("/portfolio", { params }), CRM_API.get("/clients")]);
      setItems(p); setClients(c);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [filterCat]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, client: p.client?.id || p.client || "", tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "" });
    setError(""); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form, tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [] };
      if (editing) await CRM_API.patch(`/portfolio/${editing.id}`, payload);
      else await CRM_API.post("/portfolio", payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete portfolio item "${title}"?`)) return;
    try { await CRM_API.delete(`/portfolio/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Portfolio</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{items.length} case studies · {items.filter(i=>i.is_published).length} published</p>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <Plus size={16} /> Add Case Study
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</option>)}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" }}>
        {loading ? (
          <div style={{ gridColumn: "1/-1", padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ gridColumn: "1/-1", padding: "48px", textAlign: "center" }}>
            <Image size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No portfolio items yet.</p>
          </div>
        ) : items.map(item => {
          const [bg, color] = CAT_COLORS[item.category] || CAT_COLORS.other;
          return (
            <div key={item.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
              {item.cover_image ? (
                <div style={{ height: "160px", background: `url(${item.cover_image}) center/cover no-repeat`, position: "relative" }}>
                  {item.is_published && <span style={{ position: "absolute", top: "10px", right: "10px", background: "#22c55e", color: "#fff", fontSize: "10px", fontWeight: "700", padding: "3px 8px", borderRadius: "20px" }}>LIVE</span>}
                </div>
              ) : (
                <div style={{ height: "100px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Image size={32} color="#86efac" />
                </div>
              )}
              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                  <span style={{ display: "inline-flex", padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", background: bg, color }}>{item.category.replace(/_/g," ")}</span>
                  {!item.cover_image && item.is_published && <span style={{ background: "#dcfce7", color: "#15803d", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>LIVE</span>}
                </div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 6px" }}>{item.title}</h3>
                {item.client_name_snapshot && <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px" }}>Client: {item.client_name_snapshot}</p>}
                {item.results_summary && <p style={{ fontSize: "12px", color: "#374151", margin: "0 0 10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.results_summary}</p>}
                {(item.tags || []).length > 0 && (
                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {item.tags.map((t, i) => <span key={i} style={{ background: "#f1f5f9", color: "#475569", padding: "2px 7px", borderRadius: "20px", fontSize: "10px", fontWeight: "600" }}>{t}</span>)}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid #f1f5f9" }}>
                  {item.live_url ? <a href={item.live_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#16a34a", fontWeight: "600", textDecoration: "none" }}><ExternalLink size={12} /> Live Link</a> : <span />}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button onClick={() => openEdit(item)} style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }}><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(item.id, item.title)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal" style={{ maxWidth: "580px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? "Edit Portfolio Item" : "Add Case Study"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input {...F("title")} required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Category</label>
                  <select {...F("category")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g," ").replace(/\b\w/g,x=>x.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Client</label>
                  <select value={form.client} onChange={e => setForm(p=>({...p,client:e.target.value}))} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    <option value="">Select client (optional)</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Description</label>
                <textarea {...F("description")} rows={3} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Results / Key Metrics</label>
                <textarea {...F("results_summary")} rows={2} placeholder="e.g. 300% increase in organic traffic…" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              {[["cover_image","Cover Image URL"],["live_url","Live URL"],["tags","Tags (comma-separated)"]].map(([k,l]) => (
                <div key={k}>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>{l}</label>
                  <input {...F(k)} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
              ))}
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}>
                <input type="checkbox" checked={!!form.is_published} onChange={e => setForm(p=>({...p,is_published:e.target.checked}))} style={{ width: "16px", height: "16px", accentColor: "#22c55e" }} />
                <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Publish to public portfolio</span>
              </label>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update" : "Add to Portfolio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
