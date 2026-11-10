"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const hdr = () => ({ headers: { Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}` } });

const EMPTY = {
  contact: { phone: "", whatsapp: "", email: "", address: "", city: "", hours: "", mapUrl: "" },
  social: { instagram: "", facebook: "", youtube: "" },
  about: { headline: "", story: "", stats: [] },
  careers: { intro: "", openings: [] },
};
const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];

export default function StoreInfoPage() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/api/store/settings/admin`, hdr())
      .then((r) => { setData({ ...EMPTY, ...r.data.data }); setDirty(false); })
      .catch(() => toast.error("Could not load store info"))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    const fn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);

  const edit = (fn) => { setData((d) => { const c = JSON.parse(JSON.stringify(d)); fn(c); return c; }); setDirty(true); };

  const save = async () => {
    setSaving(true);
    try {
      const r = await axios.put(`${API}/api/store/settings/admin`, data, hdr());
      setData({ ...EMPTY, ...r.data.data });
      setDirty(false);
      toast.success("Saved. The website will update within a minute.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#9ca3af" }}>Loading…</div>;

  const { contact, social, about, careers } = data;

  return (
    <div style={{ padding: "clamp(14px,3vw,24px)", maxWidth: 900, fontFamily: "Inter,sans-serif" }}>
      <Toaster position="top-right" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Store Info</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>Contact details, About page text and job openings. Only filled fields are shown on the website.</p>
        </div>
        <button onClick={save} disabled={saving || !dirty} style={{ ...btnGreen, opacity: saving || !dirty ? 0.55 : 1 }}>
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>

      {/* ── Contact ── */}
      <Card title="Contact details" hint="Shown on the Contact page and in the website footer.">
        <Grid>
          <F label="Phone"><input style={inp} value={contact.phone} placeholder="e.g. 98765 43210" onChange={(e) => edit((d) => { d.contact.phone = e.target.value; })} /></F>
          <F label="WhatsApp number"><input style={inp} value={contact.whatsapp} placeholder="10-digit number (India)" onChange={(e) => edit((d) => { d.contact.whatsapp = e.target.value; })} /></F>
          <F label="Email"><input style={inp} type="email" value={contact.email} placeholder="store@example.com" onChange={(e) => edit((d) => { d.contact.email = e.target.value; })} /></F>
          <F label="City"><input style={inp} value={contact.city} placeholder="e.g. Raipur" onChange={(e) => edit((d) => { d.contact.city = e.target.value; })} /></F>
          <F label="Address" full><textarea style={{ ...inp, resize: "vertical" }} rows={2} value={contact.address} onChange={(e) => edit((d) => { d.contact.address = e.target.value; })} /></F>
          <F label="Store hours" full><input style={inp} value={contact.hours} placeholder="e.g. Mon–Sat, 8:00 AM – 9:00 PM" onChange={(e) => edit((d) => { d.contact.hours = e.target.value; })} /></F>
          <F label="DIGIPIN" hint="Your location code from Mappls, e.g. 2KM-9KK-3P98. The map is made from it automatically.">
            <input style={inp} value={contact.digipin} placeholder="2KM-9KK-3P98" onChange={(e) => edit((d) => { d.contact.digipin = e.target.value.toUpperCase(); })} />
          </F>
          <F label="Mappls / map link" hint="The page opened by the “Open in Mappls” button.">
            <input style={inp} value={contact.mapLink} placeholder="https://www.mappls.com/497559" onChange={(e) => edit((d) => { d.contact.mapLink = e.target.value; })} />
          </F>
          <F label="Custom map embed (optional)" full hint="Leave empty to use the DIGIPIN map. To use Google Maps instead: Share → Embed a map → paste the link or the whole code.">
            <input style={inp} value={contact.mapUrl} placeholder="https://www.google.com/maps/embed?pb=…" onChange={(e) => edit((d) => { d.contact.mapUrl = e.target.value; })} />
          </F>
        </Grid>
      </Card>

      {/* ── Social ── */}
      <Card title="Social links" hint="Full links, starting with https://">
        <Grid>
          <F label="Instagram"><input style={inp} value={social.instagram} placeholder="https://instagram.com/…" onChange={(e) => edit((d) => { d.social.instagram = e.target.value; })} /></F>
          <F label="Facebook"><input style={inp} value={social.facebook} placeholder="https://facebook.com/…" onChange={(e) => edit((d) => { d.social.facebook = e.target.value; })} /></F>
          <F label="YouTube"><input style={inp} value={social.youtube} placeholder="https://youtube.com/…" onChange={(e) => edit((d) => { d.social.youtube = e.target.value; })} /></F>
        </Grid>
      </Card>

      {/* ── About ── */}
      <Card title="About page" hint="Leave blank to use the default text. Separate paragraphs with a blank line.">
        <F label="Headline"><input style={inp} value={about.headline} placeholder="Your neighbourhood grocery store, now online" onChange={(e) => edit((d) => { d.about.headline = e.target.value; })} /></F>
        <F label="Our story" style={{ marginTop: 12 }}>
          <textarea style={{ ...inp, resize: "vertical" }} rows={7} value={about.story} onChange={(e) => edit((d) => { d.about.story = e.target.value; })} />
        </F>
        <div style={{ marginTop: 14 }}>
          <div style={lbl}>Numbers to show (optional, e.g. &quot;10+&quot; · &quot;Years in business&quot;)</div>
          {(about.stats || []).map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input style={{ ...inp, width: 110, flexShrink: 0 }} value={s.value} placeholder="10+" onChange={(e) => edit((d) => { d.about.stats[i].value = e.target.value; })} />
              <input style={inp} value={s.label} placeholder="Years in business" onChange={(e) => edit((d) => { d.about.stats[i].label = e.target.value; })} />
              <button type="button" aria-label="Remove" style={btnRed} onClick={() => edit((d) => { d.about.stats.splice(i, 1); })}>×</button>
            </div>
          ))}
          {(about.stats || []).length < 6 && (
            <button type="button" style={btnDashed} onClick={() => edit((d) => { d.about.stats.push({ value: "", label: "" }); })}>+ Add a number</button>
          )}
        </div>
      </Card>

      {/* ── Careers ── */}
      <Card title="Careers page" hint="Job openings appear on the Careers page with an Apply button. Applications arrive in Enquiries.">
        <F label="Intro text (optional)"><textarea style={{ ...inp, resize: "vertical" }} rows={2} value={careers.intro} onChange={(e) => edit((d) => { d.careers.intro = e.target.value; })} /></F>
        <div style={{ marginTop: 14 }}>
          {(careers.openings || []).map((o, i) => (
            <div key={o._id || i} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 14, marginBottom: 12, background: o.isActive === false ? "#f9fafb" : "#fff" }}>
              <Grid>
                <F label="Job title *"><input style={inp} value={o.title} placeholder="e.g. Delivery Executive" onChange={(e) => edit((d) => { d.careers.openings[i].title = e.target.value; })} /></F>
                <F label="Type">
                  <select style={inp} value={o.type} onChange={(e) => edit((d) => { d.careers.openings[i].type = e.target.value; })}>
                    {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </F>
                <F label="Location"><input style={inp} value={o.location} placeholder="e.g. Store / On-road" onChange={(e) => edit((d) => { d.careers.openings[i].location = e.target.value; })} /></F>
                <F label="Experience"><input style={inp} value={o.experience} placeholder="e.g. 0–2 years" onChange={(e) => edit((d) => { d.careers.openings[i].experience = e.target.value; })} /></F>
                <F label="Description" full><textarea style={{ ...inp, resize: "vertical" }} rows={3} value={o.description} onChange={(e) => edit((d) => { d.careers.openings[i].description = e.target.value; })} /></F>
              </Grid>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>
                  <input type="checkbox" checked={o.isActive !== false} style={{ accentColor: "#16a34a" }} onChange={(e) => edit((d) => { d.careers.openings[i].isActive = e.target.checked; })} />
                  Show on website
                </label>
                <button type="button" style={btnRed} onClick={() => { if (confirm("Remove this opening?")) edit((d) => { d.careers.openings.splice(i, 1); }); }}>Remove</button>
              </div>
            </div>
          ))}
          <button type="button" style={btnDashed} onClick={() => edit((d) => { d.careers.openings.push({ title: "", type: "Full-time", location: "", experience: "", description: "", isActive: true }); })}>
            + Add job opening
          </button>
        </div>
      </Card>

      <div style={{ position: "sticky", bottom: 0, background: "linear-gradient(transparent, #f8faf9 40%)", padding: "18px 0 6px", display: "flex", justifyContent: "flex-end" }}>
        <button onClick={save} disabled={saving || !dirty} style={{ ...btnGreen, opacity: saving || !dirty ? 0.55 : 1 }}>
          {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, hint, children }) {
  return (
    <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "clamp(14px,3vw,22px)", marginBottom: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "#111827", margin: "0 0 3px" }}>{title}</h2>
      {hint && <p style={{ fontSize: 12.5, color: "#6b7280", margin: "0 0 14px" }}>{hint}</p>}
      {children}
    </section>
  );
}
function Grid({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: 12 }}>{children}</div>;
}
function F({ label, hint, full, children, style }) {
  return (
    <div style={{ ...(full ? { gridColumn: "1 / -1" } : {}), ...style }}>
      <label style={lbl}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11.5, color: "#9ca3af", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const lbl = { display: "block", fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 5 };
const inp = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13.5, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff" };
const btnGreen = { background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "10px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnRed = { background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnDashed = { background: "#f0fdf4", color: "#16a34a", border: "2px dashed #86efac", borderRadius: 10, padding: "9px", fontSize: 13, fontWeight: 700, cursor: "pointer", width: "100%" };
