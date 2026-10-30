"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, X, FileText, Search, Eye } from "lucide-react";
import CRM_API from "@/utils/crmApi";
import ExportButton from "@/components/crm/ExportButton";
import { PROPOSAL_COLUMNS } from "@/utils/exportUtils";

const EMPTY = { project: "", title: "", content: "", status: "draft", valid_until: "", notes: "", services: [] };
const STATUS_MAP = { draft:["#f1f5f9","#475569"], sent:["#dbeafe","#1d4ed8"], accepted:["#dcfce7","#15803d"], rejected:["#fee2e2","#dc2626"] };

export default function CrmProposalsPage() {
  const [items, setItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
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
      const [{ data: p }, { data: proj }, { data: s }] = await Promise.all([
        CRM_API.get("/proposals", { params }),
        CRM_API.get("/projects"),
        CRM_API.get("/services"),
      ]);
      setItems(p); setProjects(proj); setServices(s);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = items.filter(i => !search || i.title?.toLowerCase().includes(search.toLowerCase()) || i.prop_number?.toLowerCase().includes(search.toLowerCase()) || i.client_name_snapshot?.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, project: p.project?.id || p.project || "", services: p.services?.map(s => s.id || s) || [], valid_until: p.valid_until ? p.valid_until.split("T")[0] : "" });
    setError(""); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      if (editing) await CRM_API.patch(`/proposals/${editing.id}`, form);
      else await CRM_API.post("/proposals", form);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete proposal "${title}"?`)) return;
    try { await CRM_API.delete(`/proposals/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });
  const toggleSvc = (id) => setForm(p => ({ ...p, services: p.services.includes(id) ? p.services.filter(s => s !== id) : [...p.services, id] }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Proposals</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{items.length} total · {items.filter(i=>i.status==="accepted").length} accepted</p>
        </div>
        <Link href="/crm/dashboard/proposals/new" style={{ display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"700",cursor:"pointer",textDecoration:"none" }}>
          <Plus size={16} /> New Proposal
        </Link>
        <ExportButton data={items} columns={PROPOSAL_COLUMNS} type="Proposals" />
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "9px", padding: "8px 14px", flex: 1, minWidth: "200px", maxWidth: "340px" }}>
          <Search size={15} color="#94a3b8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search proposals…" style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", flex: 1, minWidth: 0, fontFamily: "inherit" }} />
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
                {["Proposal #", "Title", "Client / Project", "Valid Until", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "48px", textAlign: "center" }}>
                  <FileText size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No proposals yet.</p>
                </td></tr>
              ) : filtered.map(item => {
                const [bg, color] = STATUS_MAP[item.status] || ["#f1f5f9","#475569"];
                return (
                  <tr key={item.id} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px", fontWeight: "700", color: "#0f172a", whiteSpace: "nowrap" }}>{item.prop_number}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{item.title}</div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "12px", color: "#374151" }}>{item.client_name_snapshot || "—"}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{item.project_name_snapshot || item.project?.name || "—"}</div>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: "12px", color: "#64748b" }}>{fmtDate(item.valid_until)}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize", background: bg, color }}>{item.status}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link href={`/crm/dashboard/proposals/${item.id}`} target="_blank">
                          <button style={{ padding: "6px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer" }} title="View / Print"><Eye size={13} /></button>
                        </Link>
                        <Link href={`/crm/dashboard/proposals/edit/${item.id}`}>
                          <button style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }}><Edit2 size={13} /></button>
                        </Link>
                        <button onClick={() => handleDelete(item.id, item.title)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}><Trash2 size={13} /></button>
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
          <div className="crm-modal" style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? "Edit Proposal" : "New Proposal"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Project <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    <option value="">Select project…</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name} — {p.client_name_snapshot || p.client?.full_name || ""}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Status</label>
                  <select {...F("status")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input {...F("title")} required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Valid Until</label>
                <input {...F("valid_until")} type="date" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Services</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {services.map(s => {
                    const sel = form.services.includes(s.id);
                    return <button key={s.id} type="button" onClick={() => toggleSvc(s.id)} style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", border: sel ? "none" : "1.5px solid #e2e8f0", background: sel ? "#22c55e" : "#f8fafc", color: sel ? "#fff" : "#475569", cursor: "pointer" }}>{s.name}</button>;
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Content</label>
                <textarea {...F("content")} rows={5} placeholder="Proposal details, scope of work, deliverables…" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Notes</label>
                <textarea {...F("notes")} rows={2} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update" : "Create Proposal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
