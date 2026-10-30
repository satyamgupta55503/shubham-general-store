"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API      = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");

const GRADIENTS = [
  { label: "Green",  value: "linear-gradient(135deg,#16a34a,#15803d)" },
  { label: "Blue",   value: "linear-gradient(135deg,#2563eb,#1d4ed8)" },
  { label: "Orange", value: "linear-gradient(135deg,#ea580c,#dc2626)" },
  { label: "Purple", value: "linear-gradient(135deg,#7c3aed,#5b21b6)" },
  { label: "Cyan",   value: "linear-gradient(135deg,#0891b2,#0e7490)" },
];
const HERO_BGS = [
  { label: "Green soft",  value: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)" },
  { label: "Orange soft", value: "linear-gradient(135deg,#fff7ed 0%,#fed7aa 50%,#fdba74 100%)" },
  { label: "Blue soft",   value: "linear-gradient(135deg,#eff6ff 0%,#dbeafe 50%,#bfdbfe 100%)" },
];

export default function AdminStoreHomepage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState("hero");

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/api/store/homepage`)
      .then(r => setData(r.data.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/store/homepage/admin`, data, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      toast.success("Homepage saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // Generic image upload — returns stored path
  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await axios.post(`${API}/api/store/homepage/admin/upload`, fd, {
      headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "multipart/form-data" },
    });
    return res.data.path;
  };

  if (loading || !data) {
    return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Loading homepage editor…</div>;
  }

  // ── Mutation helpers ──
  const set = (updater) => setData(prev => { const copy = structuredClone(prev); updater(copy); return copy; });

  const TABS = [
    { id: "promo",     label: "Promo Bar" },
    { id: "hero",      label: "Hero Slides" },
    { id: "stats",     label: "Hero Stats" },
    { id: "offers",    label: "Offer Banners" },
    { id: "headings",  label: "Section Titles" },
    { id: "sections",  label: "Toggles" },
    { id: "newsletter",label: "Newsletter" },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1000, fontFamily: "Inter,sans-serif" }}>
      <Toaster position="top-right" />

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Store Homepage</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Edit hero slides, banners, images and text shown on the store homepage.</p>
        </div>
        <button onClick={save} disabled={saving} style={btnGreen}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", borderBottom: "2px solid #e5e7eb", marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            border: "none", background: "none", cursor: "pointer",
            padding: "9px 14px", fontSize: 13, fontWeight: 700,
            color: tab === t.id ? "#16a34a" : "#6b7280",
            borderBottom: tab === t.id ? "3px solid #16a34a" : "3px solid transparent",
            marginBottom: -2, whiteSpace: "nowrap",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PROMO BAR ── */}
      {tab === "promo" && (
        <Card title="Top Promo Bar">
          <Toggle label="Show promo bar" checked={data.promoBar?.enabled} onChange={v => set(d => { d.promoBar.enabled = v; })} />
          <Field label="Promo text">
            <input style={inp} value={data.promoBar?.text || ""} onChange={e => set(d => { d.promoBar.text = e.target.value; })} />
          </Field>
        </Card>
      )}

      {/* ── HERO SLIDES ── */}
      {tab === "hero" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.heroSlides?.map((slide, i) => (
            <Card key={slide._id || i} title={`Slide ${i + 1}`} onDelete={() => set(d => { d.heroSlides.splice(i, 1); })}>
              <div style={grid2}>
                <Field label="Tag (small label)"><input style={inp} value={slide.tag} onChange={e => set(d => { d.heroSlides[i].tag = e.target.value; })} /></Field>
                <Field label="Accent color"><input type="color" style={{ ...inp, height: 38, padding: 2 }} value={slide.accent} onChange={e => set(d => { d.heroSlides[i].accent = e.target.value; })} /></Field>
              </div>
              <Field label="Title (use Enter for line breaks)">
                <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} value={slide.title} onChange={e => set(d => { d.heroSlides[i].title = e.target.value; })} />
              </Field>
              <Field label="Description">
                <textarea style={{ ...inp, minHeight: 50, resize: "vertical" }} value={slide.description} onChange={e => set(d => { d.heroSlides[i].description = e.target.value; })} />
              </Field>

              {/* Image upload */}
              <Field label="Hero image (optional — shows in side box)">
                <ImageUpload value={slide.image} onUpload={uploadImage} onChange={path => set(d => { d.heroSlides[i].image = path; })} />
              </Field>

              {/* Background gradient */}
              <Field label="Background gradient">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {HERO_BGS.map(g => (
                    <button key={g.label} type="button" onClick={() => set(d => { d.heroSlides[i].bgGradient = g.value; })} style={{
                      padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600,
                      border: slide.bgGradient === g.value ? "2px solid #16a34a" : "1px solid #e5e7eb",
                      background: g.value, color: "#374151",
                    }}>{g.label}</button>
                  ))}
                </div>
              </Field>

              {/* CTAs */}
              <div style={grid2}>
                <Field label="Button 1 text"><input style={inp} value={slide.cta1Label} onChange={e => set(d => { d.heroSlides[i].cta1Label = e.target.value; })} /></Field>
                <Field label="Button 1 link"><input style={inp} value={slide.cta1Link} onChange={e => set(d => { d.heroSlides[i].cta1Link = e.target.value; })} /></Field>
                <Field label="Button 2 text"><input style={inp} value={slide.cta2Label} onChange={e => set(d => { d.heroSlides[i].cta2Label = e.target.value; })} /></Field>
                <Field label="Button 2 link"><input style={inp} value={slide.cta2Link} onChange={e => set(d => { d.heroSlides[i].cta2Link = e.target.value; })} /></Field>
              </div>

              <Field label="Item chips (comma separated)">
                <input style={inp} value={(slide.chips || []).join(", ")} onChange={e => set(d => { d.heroSlides[i].chips = e.target.value.split(",").map(s => s.trim()).filter(Boolean); })} />
              </Field>

              <Toggle label="Slide active" checked={slide.isActive} onChange={v => set(d => { d.heroSlides[i].isActive = v; })} />
            </Card>
          ))}
          <button onClick={() => set(d => { d.heroSlides.push({ tag: "", title: "New Slide", description: "", image: "", accent: "#16a34a", bgGradient: HERO_BGS[0].value, cta1Label: "Shop Now", cta1Link: "/products", cta2Label: "Categories", cta2Link: "/categories", chips: [], sortOrder: d.heroSlides.length, isActive: true }); })} style={btnDashed}>
            + Add Hero Slide
          </button>
        </div>
      )}

      {/* ── HERO STATS ── */}
      {tab === "stats" && (
        <Card title="Hero Stats (shown in side box)">
          {data.heroStats?.map((st, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-end" }}>
              <Field label="Value" style={{ flex: 1, margin: 0 }}><input style={inp} value={st.value} onChange={e => set(d => { d.heroStats[i].value = e.target.value; })} /></Field>
              <Field label="Label" style={{ flex: 2, margin: 0 }}><input style={inp} value={st.label} onChange={e => set(d => { d.heroStats[i].label = e.target.value; })} /></Field>
              <button onClick={() => set(d => { d.heroStats.splice(i, 1); })} style={btnSmRed}>Del</button>
            </div>
          ))}
          <button onClick={() => set(d => { d.heroStats.push({ value: "", label: "" }); })} style={btnDashed}>+ Add Stat</button>
        </Card>
      )}

      {/* ── OFFER BANNERS ── */}
      {tab === "offers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.offerBanners?.map((b, i) => (
            <Card key={b._id || i} title={`Banner ${i + 1}`} onDelete={() => set(d => { d.offerBanners.splice(i, 1); })}>
              <div style={grid2}>
                <Field label="Tag"><input style={inp} value={b.tag} onChange={e => set(d => { d.offerBanners[i].tag = e.target.value; })} /></Field>
                <Field label="Link"><input style={inp} value={b.link} onChange={e => set(d => { d.offerBanners[i].link = e.target.value; })} /></Field>
              </div>
              <Field label="Title (Enter for line breaks)"><textarea style={{ ...inp, minHeight: 50, resize: "vertical" }} value={b.title} onChange={e => set(d => { d.offerBanners[i].title = e.target.value; })} /></Field>
              <Field label="Subtitle"><input style={inp} value={b.subtitle} onChange={e => set(d => { d.offerBanners[i].subtitle = e.target.value; })} /></Field>
              <Field label="Background gradient">
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {GRADIENTS.map(g => (
                    <button key={g.label} type="button" onClick={() => set(d => { d.offerBanners[i].bgGradient = g.value; })} style={{
                      padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700,
                      border: b.bgGradient === g.value ? "2px solid #111827" : "1px solid #e5e7eb",
                      background: g.value, color: "#fff",
                    }}>{g.label}</button>
                  ))}
                </div>
              </Field>
              <Field label="Banner image (optional)">
                <ImageUpload value={b.image} onUpload={uploadImage} onChange={path => set(d => { d.offerBanners[i].image = path; })} />
              </Field>
              <Toggle label="Banner active" checked={b.isActive} onChange={v => set(d => { d.offerBanners[i].isActive = v; })} />
            </Card>
          ))}
          <button onClick={() => set(d => { d.offerBanners.push({ tag: "", title: "New Offer", subtitle: "", image: "", bgGradient: GRADIENTS[0].value, link: "/products", sortOrder: d.offerBanners.length, isActive: true }); })} style={btnDashed}>
            + Add Offer Banner
          </button>
        </div>
      )}

      {/* ── SECTION HEADINGS ── */}
      {tab === "headings" && (
        <Card title="Section Titles">
          {[
            ["categoriesTitle", "Categories title"], ["categoriesSubtitle", "Categories subtitle"],
            ["featuredTitle", "Featured title"], ["featuredSubtitle", "Featured subtitle"],
            ["offersTitle", "Offers title"],
            ["bestSellersTitle", "Best Sellers title"], ["bestSellersSubtitle", "Best Sellers subtitle"],
          ].map(([key, label]) => (
            <Field key={key} label={label}>
              <input style={inp} value={data.headings?.[key] || ""} onChange={e => set(d => { d.headings[key] = e.target.value; })} />
            </Field>
          ))}
        </Card>
      )}

      {/* ── SECTION TOGGLES ── */}
      {tab === "sections" && (
        <Card title="Show / Hide Homepage Sections">
          {[
            ["showCategories", "Categories strip"], ["showFeatured", "Featured products"],
            ["showOffers", "Offer banners"], ["showBestSellers", "Best sellers"],
            ["showWhyChooseUs", "Why choose us"], ["showTestimonials", "Testimonials"],
            ["showNewsletter", "Newsletter bar"],
          ].map(([key, label]) => (
            <Toggle key={key} label={label} checked={data.sections?.[key]} onChange={v => set(d => { d.sections[key] = v; })} />
          ))}
        </Card>
      )}

      {/* ── NEWSLETTER ── */}
      {tab === "newsletter" && (
        <Card title="Newsletter Section">
          <Field label="Heading"><input style={inp} value={data.newsletter?.heading || ""} onChange={e => set(d => { d.newsletter.heading = e.target.value; })} /></Field>
          <Field label="Subtext"><textarea style={{ ...inp, minHeight: 60, resize: "vertical" }} value={data.newsletter?.subtext || ""} onChange={e => set(d => { d.newsletter.subtext = e.target.value; })} /></Field>
        </Card>
      )}

      {/* Sticky save bar (mobile friendly) */}
      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
        <button onClick={save} disabled={saving} style={btnGreen}>{saving ? "Saving…" : "Save Changes"}</button>
      </div>
    </div>
  );
}

// ── Image upload component ──
function ImageUpload({ value, onUpload, onChange }) {
  const [uploading, setUploading] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const path = await onUpload(file);
      onChange(path);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      {value ? (
        <div style={{ position: "relative" }}>
          <img src={`${API}/${value}`} alt="preview" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
          <button onClick={() => onChange("")} style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13 }}>×</button>
        </div>
      ) : (
        <div style={{ width: 90, height: 90, borderRadius: 10, border: "2px dashed #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 11 }}>No image</div>
      )}
      <label style={{ ...btnGray, cursor: uploading ? "wait" : "pointer", display: "inline-block" }}>
        {uploading ? "Uploading…" : "Upload Image"}
        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} style={{ display: "none" }} />
      </label>
    </div>
  );
}

// ── Reusable UI ──
function Card({ title, children, onDelete }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb", padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>{title}</h3>
        {onDelete && <button onClick={onDelete} style={btnSmRed}>Delete</button>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, style }) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 12 }}>
      <span onClick={() => onChange(!checked)} style={{
        width: 42, height: 24, borderRadius: 20, position: "relative", transition: "background .2s",
        background: checked ? "#16a34a" : "#d1d5db", flexShrink: 0,
      }}>
        <span style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
      </span>
      <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{label}</span>
    </label>
  );
}

const inp = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
// grid2 collapses to 1 column under 640px via media query in globals.css
const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 };
const btnGreen  = { background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnGray   = { background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 };
const btnDashed = { background: "#f0fdf4", color: "#16a34a", border: "2px dashed #16a34a", borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" };
const btnSmRed  = { background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" };
