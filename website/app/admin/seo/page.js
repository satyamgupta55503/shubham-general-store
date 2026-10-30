"use client";

import React, { useEffect, useState } from "react";
import API from "@/utils/api";
import { Pencil, Trash2, Save, X, Loader2, Search, ExternalLink } from "lucide-react";

export default function SeoAdminPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError("");
      const { data } = await API.get("/seo-submissions");
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    try {
      await API.delete(`/seo-submissions/${id}`);
      setSubmissions((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.message || err.message));
    }
  };

  const startEdit = (submission) => {
    setEditingId(submission._id);
    setEditData({
      status: submission.status || "pending",
      notes: submission.notes || "",
      performanceScore: submission.performanceScore ?? "",
      seoScore: submission.seoScore ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async (id) => {
    try {
      const payload = {
        status: editData.status,
        notes: editData.notes,
        performanceScore: editData.performanceScore === "" ? null : Number(editData.performanceScore),
        seoScore: editData.seoScore === "" ? null : Number(editData.seoScore),
      };
      const { data } = await API.put(`/seo-submissions/${id}`, payload);
      setSubmissions((prev) => prev.map((s) => (s._id === id ? data : s)));
      setEditingId(null);
      setEditData({});
    } catch (err) {
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "analyzed": return { background: "#dcfce7", color: "#15803d" };
      case "failed": return { background: "#fee2e2", color: "#dc2626" };
      default: return { background: "#fef3c7", color: "#92400e" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", flexDirection: "column", gap: "12px" }}>
        <Loader2 size={36} style={{ animation: "spin 1s linear infinite", color: "#8ce600" }} />
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Loading SEO submissions...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1200px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1a2e05", margin: 0 }}>SEO Submissions</h1>
          <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "4px" }}>Manage all URL submissions from the public SEO page</p>
        </div>
        <button onClick={fetchSubmissions} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "#15803d" }}>
          <Search size={14} /> Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: "#ffffff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <th style={thStyle}>URL</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Performance</th>
                <th style={thStyle}>SEO Score</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Submitted</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
                    <Search size={32} style={{ opacity: 0.4, marginBottom: "8px" }} />
                    <p>No SEO submissions yet.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id} style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.15s" }}>
                    {editingId === sub._id ? (
                      <>
                        <td style={tdStyle}>
                          <a href={sub.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                            {sub.url.length > 35 ? sub.url.slice(0, 35) + "..." : sub.url} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td style={tdStyle}>
                          <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} style={inputStyle}>
                            <option value="pending">Pending</option>
                            <option value="analyzed">Analyzed</option>
                            <option value="failed">Failed</option>
                          </select>
                        </td>
                        <td style={tdStyle}>
                          <input type="number" min="0" max="100" value={editData.performanceScore} onChange={(e) => setEditData({ ...editData, performanceScore: e.target.value })} style={{ ...inputStyle, width: "70px" }} placeholder="0-100" />
                        </td>
                        <td style={tdStyle}>
                          <input type="number" min="0" max="100" value={editData.seoScore} onChange={(e) => setEditData({ ...editData, seoScore: e.target.value })} style={{ ...inputStyle, width: "70px" }} placeholder="0-100" />
                        </td>
                        <td style={tdStyle}>
                          <input type="text" value={editData.notes} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} style={{ ...inputStyle, width: "120px" }} placeholder="Add notes..." />
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: "12px", color: "#6b7280" }}>{formatDate(sub.submittedAt)}</span></td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => handleSave(sub._id)} style={{ ...btnStyle, background: "#dcfce7", color: "#15803d" }}><Save size={14} /></button>
                            <button onClick={cancelEdit} style={{ ...btnStyle, background: "#f3f4f6", color: "#6b7280" }}><X size={14} /></button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={tdStyle}>
                          <a href={sub.url} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontSize: "13px", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}>
                            {sub.url.length > 35 ? sub.url.slice(0, 35) + "..." : sub.url} <ExternalLink size={12} />
                          </a>
                        </td>
                        <td style={tdStyle}>
                          <span style={{ ...getStatusStyle(sub.status), padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase" }}>
                            {sub.status}
                          </span>
                        </td>
                        <td style={tdStyle}><span style={{ fontSize: "13px", fontWeight: "600" }}>{sub.performanceScore ?? "N/A"}</span></td>
                        <td style={tdStyle}><span style={{ fontSize: "13px", fontWeight: "600" }}>{sub.seoScore ?? "N/A"}</span></td>
                        <td style={tdStyle}><span style={{ fontSize: "12px", color: "#6b7280" }}>{sub.notes || "—"}</span></td>
                        <td style={tdStyle}><span style={{ fontSize: "12px", color: "#6b7280" }}>{formatDate(sub.submittedAt)}</span></td>
                        <td style={tdStyle}>
                          <div style={{ display: "flex", gap: "6px" }}>
                            <button onClick={() => startEdit(sub)} style={{ ...btnStyle, background: "#dbeafe", color: "#2563eb" }}><Pencil size={14} /></button>
                            <button onClick={() => handleDelete(sub._id)} style={{ ...btnStyle, background: "#fee2e2", color: "#dc2626" }}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const thStyle = { textAlign: "left", padding: "12px 14px", fontSize: "11px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" };
const tdStyle = { padding: "12px 14px", verticalAlign: "middle" };
const btnStyle = { border: "none", padding: "7px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" };
const inputStyle = { padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "13px", outline: "none" };
