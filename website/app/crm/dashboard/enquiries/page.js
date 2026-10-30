"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, X, MessageSquare, Search } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY = { client_name: "", mobile_number: "", email: "", address: "", service_interest: "", service_interest_other: "", budget_range: "", notes: "", status: "new", source: "manual" };
const STATUS_MAP = { new:["#dbeafe","#1d4ed8"], contacted:["#fef9c3","#a16207"], proposal_sent:["#ede9fe","#6d28d9"], converted:["#dcfce7","#15803d"], lost:["#fee2e2","#dc2626"] };
const SOURCES = ["manual","website","instagram","facebook","linkedin","referral","whatsapp","other"];
const SERVICES = ["SEO","Social Media Marketing","PPC / Paid Ads","Content Marketing","Web Design","Branding","Email Marketing","Video Production","Full Package","Other"];

export default function CrmEnquiriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const { data } = await CRM_API.get("/enquiries", { params });
      setItems(data);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [filterStatus, search]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (e) => { setEditing(e); setForm({ ...EMPTY, ...e }); setError(""); setModal(true); };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = { ...form };
      if (form.service_interest === "Other" && form.service_interest_other?.trim()) {
        payload.service_interest = `Other: ${form.service_interest_other.trim()}`;
      }
      delete payload.service_interest_other;
      if (editing) await CRM_API.patch(`/enquiries/${editing.id}`, payload);
      else await CRM_API.post("/enquiries", payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete enquiry from "${name}"?`)) return;
    try { await CRM_API.delete(`/enquiries/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Enquiries</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{items.length} total · {items.filter(i => i.status === "new").length} new</p>
        </div>
        <Link href="/crm/dashboard/enquiries/new" style={{ display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"700",cursor:"pointer",textDecoration:"none" }}>
          <Plus size={16} /> Log Enquiry
        </Link>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "9px", padding: "8px 14px", flex: 1, minWidth: "180px", maxWidth: "340px" }}>
          <Search size={15} color="#94a3b8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", flex: 1, minWidth: 0, fontFamily: "inherit" }} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: "8px 12px", border: "1.5px solid #e2e8f0", borderRadius: "9px", fontSize: "13px", background: "#f8fafc", outline: "none", fontFamily: "inherit" }}>
          <option value="">All Status</option>
          {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
        </select>
      </div>

      <div className="crm-card">
        <div className="crm-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Name", "Contact", "Service Interest", "Budget", "Source", "Date", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: "48px", textAlign: "center" }}>
                  <MessageSquare size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No enquiries yet.</p>
                </td></tr>
              ) : items.map(item => {
                const [bg, color] = STATUS_MAP[item.status] || ["#f1f5f9","#475569"];
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontWeight: "600", color: "#0f172a" }}>{item.client_name}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "12px", color: "#374151" }}>{item.mobile_number}</div>
                      {item.email && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.email}</div>}
                    </td>
                    <td style={{ padding: "13px 16px", color: "#374151", textTransform: "capitalize" }}>{item.service_interest?.replace(/_/g," ") || "—"}</td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>{item.budget_range || "—"}</td>
                    <td style={{ padding: "13px 16px", color: "#374151", textTransform: "capitalize" }}>{item.source || "manual"}</td>
                    <td style={{ padding: "13px 16px", color: "#64748b", fontSize: "12px" }}>{fmtDate(item.enquiry_date)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize", background: bg, color }}>{item.status?.replace(/_/g," ")}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => openEdit(item)} style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(item.id, item.client_name)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}><Trash2 size={13} /></button>
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
          <div className="crm-modal" style={{ maxWidth: "560px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? "Update Enquiry" : "Log New Enquiry"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
              <div className="crm-form-row">
                {[["client_name","Client Name",true],["mobile_number","Mobile Number",true],["email","Email"],["budget_range","Budget Range"]].map(([k,l,r]) => (
                  <div key={k}>
                    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>{l}{r && <span style={{ color: "#ef4444" }}> *</span>}</label>
                    <input {...F(k)} required={r} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                  </div>
                ))}
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Service Interest</label>
                  <select value={form.service_interest} onChange={e => setForm(p => ({ ...p, service_interest: e.target.value, service_interest_other: "" }))} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    <option value="">Select…</option>
                    {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {form.service_interest === "Other" && (
                    <input value={form.service_interest_other || ""} onChange={e => setForm(p => ({ ...p, service_interest_other: e.target.value }))}
                      placeholder="Please specify…" required
                      style={{ width: "100%", marginTop: "8px", padding: "9px 12px", border: "1.5px solid #8b5cf6", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}/>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Source</label>
                  <select {...F("source")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {SOURCES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Status</label>
                  <select {...F("status")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Address</label>
                <input {...F("address")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Notes</label>
                <textarea {...F("notes")} rows={3} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update" : "Log Enquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
