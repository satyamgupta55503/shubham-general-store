"use client";
import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileText, ExternalLink, Sheet, FileDown } from "lucide-react";
import {
  toCSV, downloadCSV, openInGoogleSheets,
  getExportFilename,
} from "@/utils/exportUtils";

/**
 * ExportButton — dropdown export menu for any CRM list page.
 *
 * Props:
 *   data      — array of row objects
 *   columns   — column definitions from exportUtils
 *   type      — string label: "Quotations" | "Invoices" | "Proposals" | "FollowUps"
 *   sheetsId  — optional Google Sheets ID from settings
 *   disabled  — disable when no data
 */
export default function ExportButton({ data = [], columns, type, sheetsId = "", disabled }) {
  const [open, setOpen]       = useState(false);
  const [copied, setCopied]   = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleCSV = () => {
    const csv = toCSV(data, columns);
    downloadCSV(csv, getExportFilename(type));
    setOpen(false);
  };

  const handleSheets = () => {
    const csv = toCSV(data, columns);
    openInGoogleSheets(csv, getExportFilename(type), sheetsId);
    setOpen(false);
  };

  const handleCopy = async () => {
    const csv = toCSV(data, columns);
    try {
      await navigator.clipboard.writeText(csv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
    setOpen(false);
  };

  const menuItems = [
    {
      icon: <FileDown size={14} />,
      label: "Download CSV",
      sub:   "Excel & Sheets compatible",
      color: "#16a34a",
      bg:    "#f0fdf4",
      onClick: handleCSV,
    },
    {
      icon: <ExternalLink size={14} />,
      label: "Open in Google Sheets",
      sub:   sheetsId ? "Opens your linked sheet" : "Downloads CSV + opens new Sheet",
      color: "#0891b2",
      bg:    "#ecfeff",
      onClick: handleSheets,
    },
    {
      icon: <FileText size={14} />,
      label: copied ? "Copied!" : "Copy as CSV text",
      sub:   "Paste into any spreadsheet",
      color: "#7c3aed",
      bg:    "#f5f3ff",
      onClick: handleCopy,
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(p => !p)}
        disabled={disabled || data.length === 0}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 14px",
          background: data.length === 0 ? "#f1f5f9" : "#fff",
          border: "1.5px solid #e2e8f0",
          borderRadius: 8,
          fontSize: 12, fontWeight: 600,
          color: data.length === 0 ? "#94a3b8" : "#374151",
          cursor: data.length === 0 ? "not-allowed" : "pointer",
          transition: "all .15s",
        }}
        onMouseEnter={e => { if (data.length > 0) { e.currentTarget.style.borderColor = "#22c55e"; e.currentTarget.style.color = "#16a34a"; } }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.color = data.length===0?"#94a3b8":"#374151"; }}
      >
        <Download size={13} />
        Export
        {data.length > 0 && <span style={{ fontSize: 10, background: "#dcfce7", color: "#16a34a", padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>{data.length}</span>}
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 260, background: "#fff",
          border: "1px solid #e2e8f0", borderRadius: 12,
          boxShadow: "0 10px 36px rgba(0,0,0,.10)",
          zIndex: 500, padding: 6,
          animation: "ddFade .15s ease",
        }}>
          <div style={{ padding: "8px 10px 6px", borderBottom: "1px solid #f1f5f9", marginBottom: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".06em", margin: 0 }}>
              Export {data.length} {type}
            </p>
          </div>

          {menuItems.map((item, i) => (
            <button key={i} onClick={item.onClick}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", background: "none", border: "none",
                borderRadius: 8, cursor: "pointer", textAlign: "left",
                transition: "background .12s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = item.bg}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <div style={{ width: 30, height: 30, borderRadius: 7, background: item.bg, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{item.label}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{item.sub}</div>
              </div>
            </button>
          ))}

          <div style={{ padding: "6px 10px 2px", borderTop: "1px solid #f1f5f9", marginTop: 4 }}>
            <p style={{ fontSize: 10, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
              💡 Tip: Import CSV in Google Sheets via <em>File → Import</em>
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes ddFade { from { opacity:0; transform:translateY(-4px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
