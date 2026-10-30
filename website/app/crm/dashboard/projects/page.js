"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Briefcase, Search, Eye } from "lucide-react";
import Link from "next/link";
import CRM_API from "@/utils/crmApi";

const EMPTY = { client: "", name: "", services: [], project_type: "retainer", budget_range: "", start_date: "", expected_end_date: "", status: "active", notes: "", project_type_other: "" };
const STATUS_MAP = { active:["#dcfce7","#15803d"], on_hold:["#fef9c3","#a16207"], completed:["#dbeafe","#1d4ed8"], cancelled:["#fee2e2","#dc2626"] };
const TYPE_MAP = { retainer:"Retainer", one_time:"One Time", campaign:"Campaign", audit:"Audit", consultation:"Consultation", other:"Other" };

export default function CrmProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
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
      const [{ data: p }, { data: c }, { data: s }] = await Promise.all([
        CRM_API.get("/projects", { params }),
        CRM_API.get("/clients"),
        CRM_API.get("/services"),
      ]);
      setProjects(p); setClients(c); setServices(s);
    } catch { setProjects([]); } finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.client_name_snapshot?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(""); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...EMPTY, ...p, client: p.client?.id || p.client || "", services: p.services?.map(s => s.id || s) || [], start_date: p.start_date ? p.start_date.split("T")[0] : "", expected_end_date: p.expected_end_date ? p.expected_end_date.split("T")[0] : "" });
    setError(""); setModal(true);
  };
  const closeModal = () => { setModal(false); setEditing(null); setForm(EMPTY); setError(""); };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const { project_type_other, ...payload } = form;
      if (payload.project_type === "other" && project_type_other?.trim()) {
        payload.project_type = project_type_other.trim();
      }
      if (editing) await CRM_API.patch(`/projects/${editing.id}`, payload);
      else await CRM_API.post("/projects", payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"?`)) return;
    try { await CRM_API.delete(`/projects/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const F = (k) => ({ value: form[k] ?? "", onChange: e => setForm(p => ({ ...p, [k]: e.target.value })) });

  const toggleService = (id) => setForm(p => ({
    ...p, services: p.services.includes(id) ? p.services.filter(s => s !== id) : [...p.services, id]
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px" }}>Projects</h1>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>{filtered.length} project{filtered.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/crm/dashboard/projects/new" style={{ display:"flex",alignItems:"center",gap:"6px",padding:"10px 18px",background:"#22c55e",color:"#fff",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"700",cursor:"pointer",textDecoration:"none" }}>
          <Plus size={16} /> New Project
        </Link>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f8fafc", border: "1.5px solid #e2e8f0", borderRadius: "9px", padding: "8px 14px", flex: 1, minWidth: "200px", maxWidth: "340px" }}>
          <Search size={15} color="#94a3b8" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", flex: 1, minWidth: 0, fontFamily: "inherit" }} />
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
                {["Project", "Client", "Type", "Services", "Timeline", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: ".05em", color: "#64748b", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "#94a3b8" }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: "48px", textAlign: "center" }}>
                  <Briefcase size={40} color="#e2e8f0" style={{ display: "block", margin: "0 auto 10px" }} />
                  <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>No projects found.</p>
                </td></tr>
              ) : filtered.map(p => {
                const [bg, color] = STATUS_MAP[p.status] || ["#f1f5f9","#475569"];
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f8fafc" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>{p.name}</div>
                      {p.budget_range && <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.budget_range}</div>}
                    </td>
                    <td style={{ padding: "13px 16px", color: "#374151" }}>{p.client?.full_name || p.client_name_snapshot || "—"}</td>
                    <td style={{ padding: "13px 16px", color: "#374151", textTransform: "capitalize" }}>{TYPE_MAP[p.project_type] || p.project_type || "—"}</td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {(p.services || []).slice(0, 3).map((s, i) => (
                          <span key={i} style={{ background: "#f1f5f9", color: "#475569", padding: "2px 7px", borderRadius: "20px", fontSize: "10px", fontWeight: "600" }}>
                            {s.name || s}
                          </span>
                        ))}
                        {(p.services || []).length > 3 && <span style={{ fontSize: "10px", color: "#94a3b8" }}>+{p.services.length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ fontSize: "12px", color: "#374151" }}>{fmtDate(p.start_date)}</div>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>→ {fmtDate(p.expected_end_date)}</div>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{ display: "inline-flex", padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "capitalize", background: bg, color }}>{p.status?.replace(/_/g," ")}</span>
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Link href={`/crm/dashboard/projects/${p.id}`}><button style={{ padding: "6px", background: "#dcfce7", color: "#16a34a", border: "none", borderRadius: "6px", cursor: "pointer" }} title="View"><Eye size={13} /></button></Link>
                        <button onClick={() => openEdit(p)} style={{ padding: "6px", background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: "6px", cursor: "pointer" }}><Edit2 size={13} /></button>
                        <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: "6px", background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: "6px", cursor: "pointer" }}><Trash2 size={13} /></button>
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
          <div className="crm-modal" style={{ maxWidth: "620px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f1f5f9", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
              <h2 style={{ fontSize: "17px", fontWeight: "700", color: "#0f172a", margin: 0 }}>{editing ? "Edit Project" : "New Project"}</h2>
              <button onClick={closeModal} style={{ background: "#f1f5f9", border: "none", width: "30px", height: "30px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleSave} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {error && <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px 14px", borderRadius: "8px", fontSize: "13px" }}>{error}</div>}
              <div className="crm-form-row">
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Client <span style={{ color: "#ef4444" }}>*</span></label>
                  <select value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    <option value="">Select client…</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}{c.company_name ? ` — ${c.company_name}` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Project Name <span style={{ color: "#ef4444" }}>*</span></label>
                  <input {...F("name")} required style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Project Type</label>
                  <select {...F("project_type")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {Object.entries(TYPE_MAP).map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  {form.project_type === "other" && (
                    <input
                      value={form.project_type_other||""}
                      onChange={e => setForm(p=>({...p,project_type_other:e.target.value}))}
                      placeholder="Please specify…"
                      required
                      style={{ width:"100%",marginTop:8,padding:"9px 12px",border:"1.5px solid #8b5cf6",borderRadius:"8px",fontSize:"13px",outline:"none",fontFamily:"inherit" }}
                    />
                  )}
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Status</label>
                  <select {...F("status")} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }}>
                    {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{s.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Start Date</label>
                  <input {...F("start_date")} type="date" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Expected End Date</label>
                  <input {...F("expected_end_date")} type="date" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Budget Range</label>
                <input {...F("budget_range")} placeholder="e.g. ₹20,000–₹50,000/month" style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", fontFamily: "inherit" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Services Included</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {services.map(s => {
                    const sel = form.services.includes(s.id);
                    return (
                      <button key={s.id} type="button" onClick={() => toggleService(s.id)}
                        style={{ padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", border: sel ? "none" : "1.5px solid #e2e8f0", background: sel ? "#22c55e" : "#f8fafc", color: sel ? "#fff" : "#475569", cursor: "pointer" }}>
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>Notes</label>
                <textarea {...F("notes")} rows={3} style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", fontSize: "13px", outline: "none", resize: "vertical", fontFamily: "inherit" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal} style={{ padding: "9px 18px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: "9px 20px", background: saving ? "#86efac" : "#22c55e", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: "700", cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "Saving…" : editing ? "Update Project" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
