"use client";

import React, { useState, useEffect } from "react";
import API from "@/utils/api";
import { Plus, Trash2, Save, X, Image, Loader2, Eye, EyeOff, GripVertical } from "lucide-react";

const PAGES = ["home", "about", "services", "portfolio", "workshops", "blog", "faq", "contact", "quote", "navbar", "footer"];
const POSITIONS = [
  { value: "top-left", label: "◸" }, { value: "top-center", label: "▴" }, { value: "top-right", label: "◹" },
  { value: "center-left", label: "◂" }, { value: "center", label: "●" }, { value: "center-right", label: "▸" },
  { value: "bottom-left", label: "◺" }, { value: "bottom-center", label: "▾" }, { value: "bottom-right", label: "◿" },
];

const UPLOADS_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/uploads";

export default function SlidesPage() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState("");
  const [filterPage, setFilterPage] = useState("");
  const [form, setForm] = useState({
    page: "home", order: 0, miniTitle: "", title: "", subtitle: "", paragraph: "",
    contentPosition: "center", bgColor: "", bgGradient: "", linkUrl: "", linkText: "",
    overlayOpacity: 0.5, isActive: true,
  });

  useEffect(() => { fetchSlides(); }, [filterPage]);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const params = filterPage ? `?page=${filterPage}` : "";
      const { data } = await API.get(`/slides${params}`);
      setSlides(data || []);
    } catch (err) { /* ignore */ }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setForm({ page: "home", order: 0, miniTitle: "", title: "", subtitle: "", paragraph: "", contentPosition: "center", bgColor: "", bgGradient: "", linkUrl: "", linkText: "", overlayOpacity: 0.5, isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await API.put(`/slides/${editingId}`, form);
        notify("Slide updated!");
      } else {
        await API.post("/slides", form);
        notify("Slide created!");
      }
      resetForm();
      fetchSlides();
    } catch (err) { notify("Failed to save slide"); }
    finally { setSaving(false); }
  };

  const handleEdit = (slide) => {
    setForm({
      page: slide.page, order: slide.order, miniTitle: slide.miniTitle, title: slide.title,
      subtitle: slide.subtitle, paragraph: slide.paragraph, contentPosition: slide.contentPosition,
      bgColor: slide.bgColor, bgGradient: slide.bgGradient, linkUrl: slide.linkUrl,
      linkText: slide.linkText, overlayOpacity: slide.overlayOpacity, isActive: slide.isActive,
    });
    setEditingId(slide._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this slide?")) return;
    try { await API.delete(`/slides/${id}`); notify("Deleted"); fetchSlides(); }
    catch (err) { notify("Delete failed"); }
  };

  const handleImageUpload = async (slideId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("backgroundImage", file);
    try {
      await API.put(`/slides/${slideId}/image`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      notify("Image uploaded!");
      fetchSlides();
    } catch (err) { notify("Upload failed"); }
  };

  const toggleActive = async (slide) => {
    try {
      await API.put(`/slides/${slide._id}`, { isActive: !slide.isActive });
      fetchSlides();
    } catch (err) { /* ignore */ }
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1100px", margin: "0 auto" }}>
      {notification && <div style={{ background: "#ecfccb", border: "1px solid #bef264", color: "#3f6212", padding: "10px 16px", borderRadius: "8px", marginBottom: "16px", fontSize: "12px", fontWeight: "600" }}>{notification}</div>}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05", margin: 0 }}>Slides / CMS</h1>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>Manage slides for all pages — hero sections, banners, content blocks</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} style={{ background: "#8ce600", color: "#1a2e05", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
          <Plus size={14} /> Add Slide
        </button>
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
        <button onClick={() => setFilterPage("")} style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer", background: !filterPage ? "#8ce600" : "#f3f4f6", color: !filterPage ? "#1a2e05" : "#6b7280", border: "none" }}>All</button>
        {PAGES.map((p) => (
          <button key={p} onClick={() => setFilterPage(p)} style={{ padding: "5px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer", background: filterPage === p ? "#8ce600" : "#f3f4f6", color: filterPage === p ? "#1a2e05" : "#6b7280", border: "none", textTransform: "capitalize" }}>{p}</button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginBottom: "20px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>{editingId ? "Edit Slide" : "Add Slide"}</h3>
            <button onClick={resetForm} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
            {/* Page */}
            <div>
              <label style={labelStyle}>Page</label>
              <select value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} style={inputStyle}>
                {PAGES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            {/* Order */}
            <div>
              <label style={labelStyle}>Order</label>
              <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} style={inputStyle} />
            </div>
            {/* Active */}
            <div>
              <label style={labelStyle}>Active / Visible</label>
              <select value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })} style={inputStyle}>
                <option value="true">Active</option>
                <option value="false">Hidden</option>
              </select>
            </div>
            {/* Mini Title */}
            <div>
              <label style={labelStyle}>Mini Title</label>
              <input type="text" value={form.miniTitle} onChange={(e) => setForm({ ...form, miniTitle: e.target.value })} style={inputStyle} placeholder="Small text above title" />
            </div>
            {/* Title */}
            <div>
              <label style={labelStyle}>Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Main heading" />
            </div>
            {/* Subtitle */}
            <div>
              <label style={labelStyle}>Subtitle</label>
              <input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} style={inputStyle} placeholder="Secondary heading" />
            </div>
            {/* Paragraph */}
            <div style={{ gridColumn: "span 3" }}>
              <label style={labelStyle}>Paragraph</label>
              <textarea value={form.paragraph} onChange={(e) => setForm({ ...form, paragraph: e.target.value })} style={{ ...inputStyle, height: "70px", resize: "vertical" }} placeholder="Description text..." />
            </div>
            {/* Content Position */}
            <div>
              <label style={labelStyle}>Content Position</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                {POSITIONS.map((pos) => (
                  <button key={pos.value} onClick={() => setForm({ ...form, contentPosition: pos.value })} style={{ padding: "6px", borderRadius: "4px", border: form.contentPosition === pos.value ? "2px solid #8ce600" : "1px solid #e5e7eb", background: form.contentPosition === pos.value ? "#f0fdf4" : "#fff", cursor: "pointer", fontSize: "14px" }}>
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>
            {/* BG Color */}
            <div>
              <label style={labelStyle}>BG Color</label>
              <div style={{ display: "flex", gap: "6px" }}>
                <input type="color" value={form.bgColor || "#ffffff"} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} style={{ width: "40px", height: "34px", border: "none", cursor: "pointer" }} />
                <input type="text" value={form.bgColor} onChange={(e) => setForm({ ...form, bgColor: e.target.value })} style={inputStyle} placeholder="#000000" />
              </div>
            </div>
            {/* BG Gradient */}
            <div>
              <label style={labelStyle}>BG Gradient</label>
              <input type="text" value={form.bgGradient} onChange={(e) => setForm({ ...form, bgGradient: e.target.value })} style={inputStyle} placeholder="linear-gradient(135deg, #000, #333)" />
            </div>
            {/* Link URL */}
            <div>
              <label style={labelStyle}>Link URL</label>
              <input type="text" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} style={inputStyle} placeholder="https://..." />
            </div>
            {/* Link Text */}
            <div>
              <label style={labelStyle}>Link Text</label>
              <input type="text" value={form.linkText} onChange={(e) => setForm({ ...form, linkText: e.target.value })} style={inputStyle} placeholder="Learn More" />
            </div>
            {/* Overlay Opacity */}
            <div>
              <label style={labelStyle}>Overlay Opacity (0–1)</label>
              <input type="number" min="0" max="1" step="0.1" value={form.overlayOpacity} onChange={(e) => setForm({ ...form, overlayOpacity: Number(e.target.value) })} style={inputStyle} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
            <button onClick={resetForm} style={{ background: "#f3f4f6", color: "#6b7280", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "600", fontSize: "12px", cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving} style={{ background: "#8ce600", color: "#1a2e05", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Save size={13} />}
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}><Loader2 size={20} color="#8ce600" style={{ animation: "spin 1s linear infinite" }} /></div>
        ) : slides.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
            <Image size={28} style={{ opacity: 0.3, marginBottom: "8px" }} />
            <p style={{ fontSize: "13px" }}>No slides yet. Click "Add Slide" to create one.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Page</th>
                <th style={thStyle}>Title</th>
                <th style={thStyle}>Position</th>
                <th style={thStyle}>BG</th>
                <th style={thStyle}>Image</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slides.map((slide) => (
                <tr key={slide._id} style={{ borderBottom: "1px solid #f8f9fa" }}>
                  <td style={tdStyle}><span style={{ fontSize: "12px", fontWeight: "600" }}>{slide.order}</span></td>
                  <td style={tdStyle}><span style={{ fontSize: "10px", fontWeight: "600", background: "#f0fdf4", color: "#15803d", padding: "3px 8px", borderRadius: "10px", textTransform: "capitalize" }}>{slide.page}</span></td>
                  <td style={tdStyle}>
                    <div>
                      {slide.miniTitle && <div style={{ fontSize: "9px", color: "#9ca3af" }}>{slide.miniTitle}</div>}
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a2e05" }}>{slide.title || "Untitled"}</div>
                      {slide.subtitle && <div style={{ fontSize: "10px", color: "#6b7280" }}>{slide.subtitle}</div>}
                    </div>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: "10px", color: "#6b7280" }}>{slide.contentPosition}</span></td>
                  <td style={tdStyle}>
                    {slide.bgColor && <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: slide.bgColor, border: "1px solid #e5e7eb" }} />}
                    {slide.bgGradient && <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: slide.bgGradient, border: "1px solid #e5e7eb" }} />}
                  </td>
                  <td style={tdStyle}>
                    {slide.backgroundImage ? (
                      <img src={`${UPLOADS_URL}/${slide.backgroundImage}`} alt="" style={{ width: "40px", height: "28px", objectFit: "cover", borderRadius: "4px" }} />
                    ) : (
                      <label style={{ cursor: "pointer", fontSize: "10px", color: "#6b7280", background: "#f3f4f6", padding: "4px 8px", borderRadius: "4px" }}>
                        Upload
                        <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(slide._id, e.target.files[0])} />
                      </label>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => toggleActive(slide)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                      {slide.isActive ? <Eye size={14} color="#15803d" /> : <EyeOff size={14} color="#dc2626" />}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEdit(slide)} style={btnStyle}>Edit</button>
                      <button onClick={() => handleDelete(slide._id)} style={{ ...btnStyle, background: "#fee2e2", color: "#dc2626" }}><Trash2 size={11} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "10px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase" };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box" };
const thStyle = { textAlign: "left", padding: "10px 12px", fontSize: "10px", fontWeight: "600", color: "#9ca3af", textTransform: "uppercase" };
const tdStyle = { padding: "10px 12px", verticalAlign: "middle" };
const btnStyle = { background: "#f1f5f9", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer", color: "#374151" };
