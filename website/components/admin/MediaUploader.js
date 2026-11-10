"use client";
import { useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { mediaUrl } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const MB = 1024 * 1024;

const KINDS = {
  image: { accept: "image/*",          max: 10 * MB, label: "Image", btn: "Upload image" },
  pdf:   { accept: "application/pdf",  max: 10 * MB, label: "PDF",   btn: "Upload PDF"   },
  video: { accept: "video/*",          max: 50 * MB, label: "Video", btn: "Upload video" },
};

/**
 * MediaUploader — upload image / PDF / video files to Cloudinary (via the store
 * media endpoint) from any admin form.
 *
 * props:
 *  - kind:     "image" | "pdf" | "video"
 *  - value:    string URL (single) or string[] (multiple)
 *  - onChange: (nextValue) => void
 *  - multiple: allow several files (value is an array)
 *  - folder:   "products" | "categories" | "homepage" | "documents" | "videos" | "general"
 */
export default function MediaUploader({ kind = "image", value, onChange, multiple = false, folder = "general", label }) {
  const cfg = KINDS[kind] || KINDS.image;
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const list = multiple ? (Array.isArray(value) ? value : []) : value ? [value] : [];

  const upload = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    for (const f of files) {
      if (f.size > cfg.max) {
        toast.error(`${f.name}: ${cfg.label} must be under ${cfg.max / MB} MB`);
        return;
      }
    }

    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));

    setBusy(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
      const res = await axios.post(`${API}/api/store/media/upload?folder=${folder}`, fd, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      const urls = (Array.isArray(data) ? data : [data]).map((d) => d.url);
      onChange(multiple ? [...list, ...urls] : urls[0]);
      toast.success(`${cfg.label} uploaded`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeAt = (i) => {
    if (multiple) onChange(list.filter((_, idx) => idx !== i));
    else onChange("");
  };

  return (
    <div>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 6 }}>{label}</div>}

      {list.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
          {list.map((url, i) => (
            <div key={url + i} style={{ position: "relative" }}>
              {kind === "image" && (
                <img src={mediaUrl(url)} alt="" style={{ width: 84, height: 84, objectFit: "cover", borderRadius: 10, border: "1px solid #e5e7eb" }} />
              )}
              {kind === "video" && (
                <video src={mediaUrl(url)} style={{ width: 140, height: 84, objectFit: "cover", borderRadius: 10, background: "#000" }} muted controls />
              )}
              {kind === "pdf" && (
                <a href={mediaUrl(url)} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10,
                  border: "1px solid #e5e7eb", background: "#f9fafb", color: "#374151",
                  textDecoration: "none", fontSize: 13, fontWeight: 600,
                }}>
                  PDF document &rarr;
                </a>
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                aria-label="Remove"
                style={{ position: "absolute", top: -8, right: -8, width: 22, height: 22, borderRadius: "50%", border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontSize: 13, lineHeight: 1 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <label style={{
        display: "inline-block", cursor: busy ? "wait" : "pointer",
        background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb",
        borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600,
        opacity: busy ? 0.6 : 1,
      }}>
        {busy ? "Uploading…" : multiple && list.length ? `+ Add more ${cfg.label.toLowerCase()}s` : cfg.btn}
        <input
          ref={inputRef}
          type="file"
          accept={cfg.accept}
          multiple={multiple}
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
          style={{ display: "none" }}
        />
      </label>
      <span style={{ marginLeft: 10, fontSize: 11, color: "#9ca3af" }}>max {cfg.max / MB} MB</span>
    </div>
  );
}
