"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import MediaUploader from "@/components/admin/MediaUploader";
import { optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");
const hdr = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const COLORS = ["#16a34a", "#dc2626", "#2563eb", "#ea580c", "#9333ea", "#0891b2", "#d97706", "#0f766e", "#be123c", "#475569"];
const slugify = (s) => s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const emptyBrand = {
  name: "", slug: "", tagline: "", description: "", logo: "", banner: "", color: "#16a34a", website: "",
  isDealer: true, dealerType: "Authorised Dealer", dealerSince: "",
  productLines: [], sortOrder: 0, isActive: true, isFeatured: false,
};

export default function AdminBrandsPage() {
  const [brands, setBrands]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);   // null | brand object (with _id when editing)
  const [saving, setSaving]   = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/api/store/brands/admin/all`, hdr())
      .then((r) => setBrands(r.data.data || []))
      .catch(() => toast.error("Failed to load brands"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    const b = editing;
    if (!b.name.trim() || !b.slug.trim()) { toast.error("Name and slug are required"); return; }
    // clean product lines: drop blanks, make sure each has a slug
    const productLines = (b.productLines || [])
      .filter((l) => l.name.trim())
      .map((l, i) => ({ ...l, name: l.name.trim(), slug: l.slug?.trim() || slugify(l.name), sortOrder: i }));
    const slugs = productLines.map((l) => l.slug);
    if (new Set(slugs).size !== slugs.length) { toast.error("Two product types have the same name"); return; }

    setSaving(true);
    try {
      const body = { ...b, productLines, sortOrder: Number(b.sortOrder) || 0 };
      if (b._id) await axios.put(`${API}/api/store/brands/admin/${b._id}`, body, hdr());
      else       await axios.post(`${API}/api/store/brands/admin`, body, hdr());
      toast.success(b._id ? "Brand updated" : "Brand created");
      setEditing(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (b) => {
    if (!confirm(`Delete brand "${b.name}"?\nIts products stay in the store but are unlinked from this brand.`)) return;
    try {
      await axios.delete(`${API}/api/store/brands/admin/${b._id}`, hdr());
      toast.success("Brand deleted");
      load();
    } catch {
      toast.error("Delete failed");
    }
  };

  const set = (k, v) => setEditing((p) => ({ ...p, [k]: v }));
  const setLine = (i, k, v) =>
    setEditing((p) => ({ ...p, productLines: p.productLines.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)) }));

  return (
    <div style={{ padding: "clamp(16px,3vw,24px)", fontFamily: "Inter,sans-serif" }}>
      <Toaster position="top-right" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Brands</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Dealer brands (Sunder, Nirma, Hulchal…) with their own product types. Link products to a brand in Products.
          </p>
        </div>
        <button onClick={() => setEditing({ ...emptyBrand, sortOrder: brands.length + 1 })} style={btnGreen}>+ Add Brand</button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading…</div>
      ) : brands.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", background: "#fff", borderRadius: 16, border: "1px dashed #d1d5db" }}>
          No brands yet. Click &quot;Add Brand&quot; to create the first one.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {brands.map((b) => (
            <div key={b._id} style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", padding: 16, borderTop: `4px solid ${b.color || "#16a34a"}` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, overflow: "hidden", background: b.logo ? "#fff" : (b.color || "#16a34a"), border: "1px solid #eef0f2", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20 }}>
                  {b.logo ? <img src={optimizedImage(b.logo, 96)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : b.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>/brands/{b.slug}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {b.isDealer && <Pill bg="#f0fdf4" color="#15803d">{b.dealerType || "Dealer"}</Pill>}
                <Pill bg={b.isActive ? "#f0fdf4" : "#f3f4f6"} color={b.isActive ? "#16a34a" : "#6b7280"}>{b.isActive ? "Active" : "Hidden"}</Pill>
                {b.isFeatured && <Pill bg="#fff7ed" color="#ea580c">Featured</Pill>}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 12, minHeight: 32 }}>
                {b.productLines?.length
                  ? `${b.productLines.length} product types: ${b.productLines.slice(0, 4).map((l) => l.name).join(", ")}${b.productLines.length > 4 ? "…" : ""}`
                  : "No product types yet"}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing({ ...emptyBrand, ...b })} style={btnBlue}>Edit</button>
                <a href={`/brands/${b.slug}`} target="_blank" rel="noopener noreferrer" style={{ ...btnGray, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>View</a>
                <button onClick={() => remove(b)} style={btnRed}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit modal ── */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
          onClick={() => !saving && setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 720, maxHeight: "92vh", overflowY: "auto", padding: "clamp(16px,3vw,26px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{editing._id ? "Edit brand" : "Add brand"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close" style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            <form onSubmit={save}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
                <Field label="Brand name *">
                  <input value={editing.name} required style={inp}
                    onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value, slug: p._id ? p.slug : slugify(e.target.value) }))} />
                </Field>
                <Field label="Slug (web address) *">
                  <input value={editing.slug} required style={inp} onChange={(e) => set("slug", slugify(e.target.value))} />
                </Field>
                <Field label="Tagline" full>
                  <input value={editing.tagline} style={inp} placeholder="e.g. Biscuits & Namkeen" onChange={(e) => set("tagline", e.target.value)} />
                </Field>
                <Field label="Description" full>
                  <textarea value={editing.description} rows={3} style={{ ...inp, resize: "vertical" }} onChange={(e) => set("description", e.target.value)} />
                </Field>
              </div>

              <Section title="Look">
                <div style={{ display: "grid", gap: 14 }}>
                  <MediaUploader kind="image" folder="general" label="Logo" value={editing.logo} onChange={(v) => set("logo", v)} />
                  <MediaUploader kind="image" folder="general" label="Banner (optional, wide image)" value={editing.banner} onChange={(v) => set("banner", v)} />
                  <div>
                    <div style={lbl}>Brand colour</div>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => set("color", c)} aria-label={`Colour ${c}`}
                          style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: editing.color === c ? "3px solid #111" : "2px solid #fff", boxShadow: "0 0 0 1px #e5e7eb" }} />
                      ))}
                      <input type="color" value={editing.color} onChange={(e) => set("color", e.target.value)} aria-label="Custom colour"
                        style={{ width: 32, height: 32, border: "none", padding: 0, background: "none", cursor: "pointer" }} />
                    </div>
                  </div>
                </div>
              </Section>

              <Section title="Dealership">
                <label style={check}><input type="checkbox" checked={editing.isDealer} onChange={(e) => set("isDealer", e.target.checked)} style={{ accentColor: "#16a34a" }} /> We are an authorised dealer of this brand</label>
                {editing.isDealer && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginTop: 10 }}>
                    <Field label="Dealer type">
                      <input value={editing.dealerType} style={inp} placeholder="Authorised Dealer / Distributor" onChange={(e) => set("dealerType", e.target.value)} />
                    </Field>
                    <Field label="Dealer since (optional)">
                      <input value={editing.dealerSince} style={inp} placeholder="e.g. 2015" onChange={(e) => set("dealerSince", e.target.value)} />
                    </Field>
                  </div>
                )}
              </Section>

              <Section title="Product types inside this brand">
                <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 10px" }}>
                  These become the filters on the brand page (e.g. Sunder → Biscuit, Namkeen, Chips). Assign each product to one in Products.
                </p>
                {(editing.productLines || []).map((l, i) => (
                  <div key={l._id || i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <input value={l.name} placeholder="Type name (e.g. Namkeen)" style={{ ...inp, flex: "1 1 160px" }}
                      onChange={(e) => setLine(i, "name", e.target.value)}
                      onBlur={() => !l.slug && l.name && setLine(i, "slug", slugify(l.name))} />
                    <input value={l.description || ""} placeholder="Short note (optional)" style={{ ...inp, flex: "2 1 200px" }}
                      onChange={(e) => setLine(i, "description", e.target.value)} />
                    <button type="button" aria-label="Remove type" style={btnRed}
                      onClick={() => setEditing((p) => ({ ...p, productLines: p.productLines.filter((_, idx) => idx !== i) }))}>×</button>
                  </div>
                ))}
                <button type="button" style={btnDashed}
                  onClick={() => setEditing((p) => ({ ...p, productLines: [...(p.productLines || []), { name: "", slug: "", description: "" }] }))}>
                  + Add product type
                </button>
              </Section>

              <Section title="Visibility">
                <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
                  <label style={check}><input type="checkbox" checked={editing.isActive} onChange={(e) => set("isActive", e.target.checked)} style={{ accentColor: "#16a34a" }} /> Show on website</label>
                  <label style={check}><input type="checkbox" checked={editing.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} style={{ accentColor: "#16a34a" }} /> Featured</label>
                  <label style={{ ...check, gap: 8 }}>Order
                    <input type="number" value={editing.sortOrder} style={{ ...inp, width: 80 }} onChange={(e) => set("sortOrder", e.target.value)} />
                  </label>
                </div>
              </Section>

              <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button type="button" onClick={() => setEditing(null)} style={btnGray}>Cancel</button>
                <button type="submit" disabled={saving} style={{ ...btnGreen, opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : editing._id ? "Update brand" : "Create brand"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid #f3f4f6", marginTop: 18, paddingTop: 14 }}>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#111827", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}
function Field({ label, children, full }) {
  return (<div style={full ? { gridColumn: "1 / -1" } : undefined}><label style={lbl}>{label}</label>{children}</div>);
}
function Pill({ bg, color, children }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, background: bg, color }}>{children}</span>;
}

const lbl = { fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 5 };
const inp = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const check = { display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#374151" };
const btnGreen = { background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnGray  = { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnBlue  = { background: "#eff6ff", color: "#2563eb", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnRed   = { background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnDashed = { background: "#f0fdf4", color: "#16a34a", border: "2px dashed #86efac", borderRadius: 10, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" };
