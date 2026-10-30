"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit2, Trash2, X, Users, Building2, Phone, Mail, MapPin } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY = { full_name: "", company_name: "", email: "", phone: "", billing_address: "", gstin: "", client_type: "", lead_source: "", city: "", state: "", country: "India", website: "", social_handle: "", notes: "" };

const CLIENT_TYPES = ["startup","sme","enterprise","ecommerce","agency","personal","ngo","other"];
const LEAD_SOURCES = ["instagram","facebook","google","linkedin","website","referral","cold_outreach","event","other"];
const INDIAN_STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Chandigarh","Jammu and Kashmir"];

const TYPE_COLOR = { startup:"badge-blue", sme:"badge-teal", enterprise:"badge-purple", ecommerce:"badge-orange", agency:"badge-yellow", personal:"badge-gray", ngo:"badge-green", other:"badge-gray" };

export default function CrmClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterType) params.client_type = filterType;
      const { data } = await CRM_API.get("/clients", { params });
      setClients(data);
    } catch { setClients([]); } finally { setLoading(false); }
  }, [search, filterType]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...EMPTY, ...c }); setError(""); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      if (editing) await CRM_API.patch(`/clients/${editing.id}`, form);
      else await CRM_API.post("/clients", form);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete client "${name}"? This cannot be undone.`)) return;
    try { await CRM_API.delete(`/clients/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const F = (k) => ({ value: form[k] || "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Clients</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{clients.length} client{clients.length !== 1 ? "s" : ""} total</p>
        </div>
        <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 18px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}>
          <Plus size={16} /> Add Client
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "9px", padding: "8px 14px", flex: 1, minWidth: "200px", maxWidth: "340px" }}>
          <Search size={15} color="#94a3b8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…" style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: "#1e293b", flex: 1, minWidth: 0, fontFamily: "inherit" }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", color: "#374151", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}>
          <option value="">All Types</option>
          {CLIENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="crm-card">
        <div className="crm-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Client", "Company", "Contact", "City / State", "Type", "Lead Source", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center" }}>
                  <Users size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No clients yet. Add your first client.</p>
                </td></tr>
              ) : clients.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "13px 16px" }} onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>
                        {c.full_name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <div style={{ fontWeight: "700", color: "#16a34a", textDecoration: "underline", textDecorationColor: "#bbf7d0" }}>{c.full_name}</div>
                        {c.gstin && <div style={{ fontSize: "11px", color: "#94a3b8" }}>GST: {c.gstin}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", color: "#374151" }} onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)}>{c.company_name || <span style={{ color: "#cbd5e1" }}>—</span>}</td>
                  <td style={{ padding: "13px 16px" }} onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)}>
                    <div style={{ fontSize: "12px", color: "#374151" }}>{c.phone}</div>
                    {c.email && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{c.email}</div>}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#374151" }} onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)}>{[c.city, c.state].filter(Boolean).join(", ") || "—"}</td>
                  <td style={{ padding: "13px 16px" }} onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)}>
                    {c.client_type ? <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize", ...(TYPE_COLOR[c.client_type] === "badge-blue" ? { background: "#dbeafe", color: "#1d4ed8" } : TYPE_COLOR[c.client_type] === "badge-teal" ? { background: "#ccfbf1", color: "#0f766e" } : TYPE_COLOR[c.client_type] === "badge-purple" ? { background: "#ede9fe", color: "#6d28d9" } : TYPE_COLOR[c.client_type] === "badge-orange" ? { background: "#ffedd5", color: "#c2410c" } : { background: "#f1f5f9", color: "#475569" }) }}>{c.client_type}</span> : <span style={{ color: "#cbd5e1" }}>—</span>}
                  </td>
                  <td style={{ padding: "13px 16px", color: "#374151", textTransform: "capitalize" }} onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)}>{c.lead_source || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => router.push(`/crm/dashboard/clients/${c.id}`)} style={{ padding: "6px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer" }} title="View Details">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button onClick={() => openEdit(c)} style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }} title="Edit"><Edit2 size={13} /></button>
                      <button onClick={() => handleDelete(c.id, c.full_name)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }} title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal" style={{ maxWidth: "640px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? "Edit Client" : "Add New Client"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}
              {[
                [["full_name","Full Name *",true],["company_name","Company Name"]],
                [["email","Email"],["phone","Phone *",true]],
                [["billing_address","Billing Address *",true,"single"]],
                [["city","City"],["state","State","","select",INDIAN_STATES]],
                [["gstin","GSTIN"],["website","Website"]],
                [["client_type","Client Type","","select",CLIENT_TYPES],["lead_source","Lead Source","","select",LEAD_SOURCES]],
                [["social_handle","Social Handle / Handle"]],
                [["notes","Notes","","textarea"]],
              ].map((row, ri) => (
                <div key={ri} className={`crm-form-row${row[0][3] === "single" ? " single" : row.length === 1 ? " single" : ""}`}>
                  {row.map(([key, label, required, type, opts]) => (
                    <div key={key}>
                      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
                      {type === "select" ? (
                        <select {...F(key)} required={!!required} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit" }}>
                          <option value="">Select…</option>
                          {(opts || []).map(o => <option key={o} value={o}>{o.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                        </select>
                      ) : type === "textarea" ? (
                        <textarea {...F(key)} rows={3} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#1e293b", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
                      ) : (
                        <input {...F(key)} required={!!required} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", color: "#1e293b", outline: "none", fontFamily: "inherit" }} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9", marginTop: "8px" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update Client" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
