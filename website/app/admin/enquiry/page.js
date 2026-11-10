"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const API_URL = BACKEND + "/api/enquiry";

const TYPE_META = {
  contact: { label: "Contact", bg: "#eff6ff", color: "#2563eb" },
  career:  { label: "Job application", bg: "#f5f3ff", color: "#7c3aed" },
  dealer:  { label: "Dealer", bg: "#fff7ed", color: "#ea580c" },
};
const typeOf = (e) => (TYPE_META[e.type] ? e.type : "contact"); // old records have no type

const fmtDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "";

export default function EnquiryCMS() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [unreadIds, setUnreadIds] = useState([]);
  const [tab, setTab] = useState("all");

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/send`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      clearTimeout(timeoutId);
      if (response.status === 401) throw new Error("Session expired. Please log in again.");
      if (!response.ok) throw new Error("Failed to fetch data from backend");
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.data || data.enquiries || [];
      setEnquiries(list);

      const read = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
      setUnreadIds(list.map((i) => i._id || i.id).filter((id) => !read.includes(id)));
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err.name === "AbortError" ? "Request timed out. Please try refreshing." : err.message);
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const counts = useMemo(() => {
    const c = { all: enquiries.length, contact: 0, career: 0, dealer: 0 };
    enquiries.forEach((e) => { c[typeOf(e)] += 1; });
    return c;
  }, [enquiries]);

  const visible = useMemo(
    () => (tab === "all" ? enquiries : enquiries.filter((e) => typeOf(e) === tab)),
    [enquiries, tab]
  );

  // Viewing a message clears its unread dot and updates the header badge
  const handleView = (enquiry) => {
    const id = enquiry._id || enquiry.id;
    setSelected(enquiry);
    if (unreadIds.includes(id)) {
      setUnreadIds((prev) => prev.filter((x) => x !== id));
      const read = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
      if (!read.includes(id)) {
        read.push(id);
        localStorage.setItem("readEnquiries", JSON.stringify(read));
      }
      window.dispatchEvent(new Event("cms_navigated"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error();
      setEnquiries((prev) => prev.filter((e) => (e._id || e.id) !== id));
      setUnreadIds((prev) => prev.filter((x) => x !== id));
      const read = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
      localStorage.setItem("readEnquiries", JSON.stringify(read.filter((x) => x !== id)));
      if ((selected?._id || selected?.id) === id) setSelected(null);
      window.dispatchEvent(new Event("cms_navigated"));
    } catch {
      alert("Failed to delete enquiry.");
    }
  };

  const TABS = [
    { key: "all", label: "All" },
    { key: "contact", label: "Contact" },
    { key: "career", label: "Job applications" },
    { key: "dealer", label: "Dealer" },
  ];

  return (
    <div style={{ padding: "clamp(14px,3vw,30px)", fontFamily: "Inter, sans-serif", background: "#f8f9fa", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>Enquiries</h1>
          <p style={{ color: "#6B7280", margin: "4px 0 0", fontSize: 14 }}>
            Messages and job applications sent from the website&apos;s Contact and Careers pages.
          </p>
        </div>
        <button onClick={fetchEnquiries} style={{ padding: "10px 16px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          Refresh
        </button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "7px 14px", borderRadius: 50, fontSize: 13, fontWeight: 700, cursor: "pointer",
            border: tab === t.key ? "none" : "1px solid #e5e7eb",
            background: tab === t.key ? "#16a34a" : "#fff", color: tab === t.key ? "#fff" : "#374151",
          }}>
            {t.label} <span style={{ opacity: 0.75, fontWeight: 600 }}>({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center", color: "#4B5563", padding: 40 }}>Loading enquiries…</p>}
      {error && <p style={{ textAlign: "center", color: "#EF4444", fontWeight: 700, padding: 20 }}>Error: {error}</p>}

      {!loading && !error && (
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: 14, border: "1px solid #e5e7eb" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 680 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["", "Type", "From", "Details", "Received", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 36, textAlign: "center", color: "#9CA3AF" }}>No enquiries found.</td></tr>
              ) : visible.map((e) => {
                const id = e._id || e.id;
                const unread = unreadIds.includes(id);
                const tm = TYPE_META[typeOf(e)];
                const preview = e.type === "career" ? [e.position || "General application", e.experience].filter(Boolean).join(" · ") : (e.subject || e.message);
                return (
                  <tr key={id} style={{ borderBottom: "1px solid #F3F4F6", background: unread ? "#F0FDF4" : "transparent" }}>
                    <td style={{ padding: "12px 14px", width: 24 }}>
                      {unread && <span title="New" style={{ height: 8, width: 8, background: "#16a34a", borderRadius: "50%", display: "inline-block" }} />}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 50, background: tm.bg, color: tm.color, whiteSpace: "nowrap" }}>{tm.label}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ fontWeight: unread ? 800 : 600, color: "#111827", fontSize: 14 }}>{e.name}</div>
                      <div style={{ fontSize: 12, color: "#6B7280" }}>{e.phone || e.email}</div>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#4B5563", fontSize: 13, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}</td>
                    <td style={{ padding: "12px 14px", color: "#9CA3AF", fontSize: 12, whiteSpace: "nowrap" }}>{fmtDate(e.createdAt)}</td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <button onClick={() => handleView(e)} style={{ marginRight: 8, padding: "6px 12px", background: "#ecfdf5", color: "#047857", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>View</button>
                      <button onClick={() => handleDelete(id)} style={{ padding: "6px 12px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 12 }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: 12 }}>
          <div onClick={(ev) => ev.stopPropagation()} style={{ background: "#fff", padding: "clamp(18px,3vw,28px)", borderRadius: 16, width: 540, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 18, color: "#111827" }}>
                {selected.type === "career" ? "Job application" : "Enquiry details"}
              </h2>
              <button onClick={() => setSelected(null)} aria-label="Close" style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>

            <Row label="Name" value={selected.name} />
            <Row label="Email" value={<a href={`mailto:${selected.email}`} style={link}>{selected.email}</a>} />
            {selected.phone && <Row label="Phone" value={<a href={`tel:${selected.phone}`} style={link}>{selected.phone}</a>} />}
            {selected.subject && <Row label="Topic" value={selected.subject} />}
            {selected.type === "career" && (
              <>
                <Row label="Applying for" value={selected.position || "General application"} />
                {selected.experience && <Row label="Experience" value={selected.experience} />}
                {selected.resumeUrl && (
                  <Row label="Resume" value={<a href={selected.resumeUrl} target="_blank" rel="noopener noreferrer" style={link}>Open resume link ↗</a>} />
                )}
              </>
            )}
            <Row label="Received" value={fmtDate(selected.createdAt)} />

            {selected.message && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>{selected.type === "career" ? "About the applicant" : "Message"}</div>
                <p style={{ background: "#F3F4F6", padding: 14, borderRadius: 8, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-line", margin: 0 }}>{selected.message}</p>
              </div>
            )}

            <div style={{ textAlign: "right", marginTop: 18 }}>
              <button onClick={() => setSelected(null)} style={{ padding: "9px 18px", background: "#6B7280", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const link = { color: "#2563eb", textDecoration: "none", fontWeight: 600, wordBreak: "break-all" };

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #f3f4f6", fontSize: 14 }}>
      <span style={{ width: 110, flexShrink: 0, color: "#6b7280", fontWeight: 600 }}>{label}</span>
      <span style={{ color: "#111827", minWidth: 0 }}>{value}</span>
    </div>
  );
}
