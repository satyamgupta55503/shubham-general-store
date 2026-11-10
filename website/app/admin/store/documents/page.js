"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Folder, FolderPlus, FileText, FileImage, File as FileIcon, Upload, Search, Grid3x3, List,
  Eye, Download, Pencil, FolderInput, Trash2, X, ChevronRight, Home, ExternalLink, Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const BASE = `${API}/api/store/documents`;
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");
const hdr = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXT = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"];
const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp";
const GREEN = "#16a34a";

const fmtSize = (b = 0) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`);
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "");
const errMsg = (e, fb) => e?.response?.data?.message || fb;
const extOf = (n = "") => (n.includes(".") ? n.split(".").pop().toLowerCase() : "");

const downloadUrl = (f) =>
  f.resource_type !== "raw" && f.url.includes("/upload/") ? f.url.replace("/upload/", "/upload/fl_attachment/") : f.url;
const officeUrl = (url) => `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;

function TypeIcon({ kind, size = 28 }) {
  if (kind === "pdf") return <FileText size={size} color="#dc2626" aria-hidden="true" />;
  if (kind === "doc") return <FileText size={size} color="#2563eb" aria-hidden="true" />;
  if (kind === "image") return <FileImage size={size} color="#9333ea" aria-hidden="true" />;
  return <FileIcon size={size} color="#6b7280" aria-hidden="true" />;
}

export default function AdminDocumentsPage() {
  const [folderId, setFolderId] = useState("");           // "" = root
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [order, setOrder] = useState("asc");
  const [view, setView] = useState("grid");
  const [dragOver, setDragOver] = useState(false);
  const [upload, setUpload] = useState(null);             // { percent, count }
  const [nameModal, setNameModal] = useState(null);       // { type: 'newFolder'|'folder'|'file', item?, value }
  const [moveModal, setMoveModal] = useState(null);       // { type, item }
  const [viewer, setViewer] = useState(null);
  const fileInput = useRef(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort: sortKey, order };
      const fp = { ...params, parent: folderId || "root" };
      const flp = { ...params, folder: folderId || "root" };
      if (query) { fp.search = query; flp.search = query; }
      const [fr, fl] = await Promise.all([
        axios.get(`${BASE}/folders`, { ...hdr(), params: fp }),
        axios.get(`${BASE}/files`, { ...hdr(), params: flp }),
      ]);
      setFolders(fr.data.data || []);
      setBreadcrumb(fr.data.breadcrumb || []);
      setFiles(fl.data.data || []);
    } catch (e) {
      toast.error(errMsg(e, "Failed to load documents"));
    } finally {
      setLoading(false);
    }
  }, [folderId, query, sortKey, order]);
  useEffect(() => { load(); }, [load]);

  const changeSort = (v) => {
    const [k, o] = v.split(":");
    setSortKey(k); setOrder(o);
  };

  // ---- uploads ----
  const uploadFiles = (list) => {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    const valid = [];
    picked.forEach((f) => {
      if (!ALLOWED_EXT.includes(extOf(f.name))) toast.error(`${f.name}: only PDF, Word and image (jpg, png, webp) files are allowed`);
      else if (f.size > MAX_BYTES) toast.error(`${f.name}: larger than 10 MB`);
      else valid.push(f);
    });
    if (valid.length > 10) { toast.error("You can upload up to 10 files at a time"); valid.length = 10; }
    if (!valid.length) return;

    const fd = new FormData();
    valid.forEach((f) => fd.append("files", f));
    if (folderId) fd.append("folder", folderId);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE}/files`);
    xhr.setRequestHeader("Authorization", `Bearer ${getToken()}`);
    setUpload({ percent: 0, count: valid.length });
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) setUpload({ percent: Math.round((ev.loaded / ev.total) * 100), count: valid.length });
    };
    xhr.onload = () => {
      setUpload(null);
      let body = {};
      try { body = JSON.parse(xhr.responseText); } catch { /* ignore */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        const ok = (body.data || []).length;
        if (ok) toast.success(`${ok} file${ok > 1 ? "s" : ""} uploaded`);
        (body.failed || []).forEach((f) => toast.error(`${f.name}: ${f.message}`));
        load();
      } else {
        toast.error(body.message || "Upload failed");
      }
    };
    xhr.onerror = () => { setUpload(null); toast.error("Network error during upload"); };
    xhr.send(fd);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  // ---- folder / file actions ----
  const submitName = async (e) => {
    e.preventDefault();
    const { type, item, value } = nameModal;
    const name = value.trim();
    if (!name) { toast.error("Name is required"); return; }
    try {
      if (type === "newFolder") {
        await axios.post(`${BASE}/folders`, { name, parent: folderId || null }, hdr());
        toast.success("Folder created");
      } else if (type === "folder") {
        await axios.put(`${BASE}/folders/${item._id}`, { name }, hdr());
        toast.success("Folder renamed");
      } else {
        await axios.put(`${BASE}/files/${item._id}`, { name }, hdr());
        toast.success("File renamed");
      }
      setNameModal(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, "Save failed"));
    }
  };

  const removeFolder = async (f) => {
    if (!confirm(`Delete folder "${f.name}"?`)) return;
    try {
      await axios.delete(`${BASE}/folders/${f._id}`, hdr());
      toast.success("Folder deleted");
      load();
    } catch (err) {
      toast.error(errMsg(err, "Delete failed"), { duration: 6000 });
    }
  };

  const removeFile = async (f) => {
    if (!confirm(`Delete "${f.name}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`${BASE}/files/${f._id}`, hdr());
      toast.success("File deleted");
      load();
    } catch (err) {
      toast.error(errMsg(err, "Delete failed"));
    }
  };

  const doMove = async (target) => {
    const { type, item } = moveModal;
    try {
      if (type === "folder") await axios.put(`${BASE}/folders/${item._id}`, { parent: target || "root" }, hdr());
      else await axios.put(`${BASE}/files/${item._id}`, { folder: target || "root" }, hdr());
      toast.success("Moved");
      setMoveModal(null);
      load();
    } catch (err) {
      toast.error(errMsg(err, "Move failed"));
    }
  };

  const openFile = (f) => setViewer(f);
  const searching = !!query;
  const empty = !loading && folders.length === 0 && files.length === 0;

  return (
    <div style={{ padding: "clamp(16px,3vw,24px)", fontFamily: "Inter,sans-serif" }}>
      <Toaster position="top-right" />
      <style>{`
        .docs-btn:focus-visible,.docs-card:focus-visible,.docs-icon:focus-visible,.docs-input:focus-visible,.docs-crumb:focus-visible{outline:2px solid ${GREEN};outline-offset:2px}
        .docs-card:hover{border-color:${GREEN}}
        .docs-spin{animation:docsspin 1s linear infinite}
        @keyframes docsspin{to{transform:rotate(360deg)}}
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Documents</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
            Store PDF, Word and image files in folders and open them any time.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="docs-btn" onClick={() => setNameModal({ type: "newFolder", value: "" })} style={btnOutline}>
            <FolderPlus size={16} aria-hidden="true" /> New Folder
          </button>
          <button className="docs-btn" onClick={() => fileInput.current?.click()} disabled={!!upload} style={{ ...btnGreen, opacity: upload ? 0.7 : 1 }}>
            <Upload size={16} aria-hidden="true" /> Upload Files
          </button>
          <input ref={fileInput} type="file" multiple accept={ACCEPT} aria-label="Choose files to upload" style={{ display: "none" }}
            onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }} />
        </div>
      </div>

      {/* toolbar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 380 }}>
          <Search size={16} color="#9ca3af" aria-hidden="true" style={{ position: "absolute", left: 10, top: 11 }} />
          <input className="docs-input" type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search all documents" aria-label="Search all documents" style={{ ...inputStyle, paddingLeft: 32 }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280" }}>
          Sort
          <select className="docs-input" value={`${sortKey}:${order}`} onChange={(e) => changeSort(e.target.value)} style={{ ...inputStyle, width: "auto" }}>
            <option value="name:asc">Name (A-Z)</option>
            <option value="name:desc">Name (Z-A)</option>
            <option value="date:desc">Newest first</option>
            <option value="date:asc">Oldest first</option>
            <option value="size:desc">Largest first</option>
            <option value="size:asc">Smallest first</option>
          </select>
        </label>
        <div role="group" aria-label="View mode" style={{ display: "flex", gap: 4 }}>
          <button className="docs-icon" onClick={() => setView("grid")} aria-label="Grid view" aria-pressed={view === "grid"} style={toggleBtn(view === "grid")}><Grid3x3 size={16} /></button>
          <button className="docs-icon" onClick={() => setView("list")} aria-label="List view" aria-pressed={view === "list"} style={toggleBtn(view === "list")}><List size={16} /></button>
        </div>
      </div>

      {/* breadcrumb */}
      {searching ? (
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
          Search results for &quot;{query}&quot; in all documents.{" "}
          <button className="docs-btn" onClick={() => setSearch("")} style={linkBtn}>Clear search</button>
        </div>
      ) : (
        <nav aria-label="Folder path" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4, marginBottom: 12, fontSize: 13 }}>
          <button className="docs-crumb" onClick={() => setFolderId("")} style={crumbBtn(!folderId)} aria-current={!folderId ? "page" : undefined}>
            <Home size={14} aria-hidden="true" /> All Documents
          </button>
          {breadcrumb.map((b, i) => (
            <span key={b._id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ChevronRight size={14} color="#9ca3af" aria-hidden="true" />
              <button className="docs-crumb" onClick={() => setFolderId(b._id)} style={crumbBtn(i === breadcrumb.length - 1)}
                aria-current={i === breadcrumb.length - 1 ? "page" : undefined}>{b.name}</button>
            </span>
          ))}
        </nav>
      )}

      {/* drop zone / content */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false); }}
        onDrop={onDrop}
        style={{ position: "relative", minHeight: 260, borderRadius: 16, border: `2px dashed ${dragOver ? GREEN : "#e5e7eb"}`, background: dragOver ? "#f0fdf4" : "#fff", padding: 16 }}
      >
        {upload && (
          <div role="status" aria-live="polite" style={{ marginBottom: 14, padding: 12, background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0" }}>
            <div style={{ fontSize: 13, color: "#15803d", fontWeight: 600, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={14} className="docs-spin" aria-hidden="true" />
              {upload.percent >= 100 ? "Processing" : "Uploading"} {upload.count} file{upload.count > 1 ? "s" : ""} ({upload.percent}%)
            </div>
            <div style={{ height: 6, background: "#dcfce7", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${upload.percent}%`, height: "100%", background: GREEN, transition: "width .2s" }} />
            </div>
          </div>
        )}

        {loading ? (
          <div role="status" style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading...</div>
        ) : empty ? (
          <div style={{ textAlign: "center", padding: "50px 10px", color: "#9ca3af" }}>
            <Upload size={32} aria-hidden="true" />
            <p style={{ margin: "10px 0 0", fontSize: 14 }}>
              {searching ? "No documents match your search." : "This folder is empty. Drag and drop files here, or use Upload Files."}
            </p>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <>
                <h2 style={sectionH}>Folders</h2>
                <div style={view === "grid" ? gridStyle : listStyle}>
                  {folders.map((f) => (
                    <div key={f._id} className="docs-card" style={cardStyle(view)}>
                      <button className="docs-btn" onClick={() => { setSearch(""); setFolderId(f._id); }} aria-label={`Open folder ${f.name}`}
                        style={{ ...openArea, flex: 1 }}>
                        <Folder size={view === "grid" ? 34 : 24} color="#d97706" fill="#fde68a" aria-hidden="true" />
                        <span style={{ minWidth: 0, textAlign: "left" }}>
                          <span style={nameText}>{f.name}</span>
                          <span style={metaText}>{f.folderCount || 0} folders, {f.fileCount || 0} files</span>
                        </span>
                      </button>
                      <div style={{ display: "flex", gap: 2 }}>
                        <IconBtn label={`Rename folder ${f.name}`} onClick={() => setNameModal({ type: "folder", item: f, value: f.name })}><Pencil size={15} /></IconBtn>
                        <IconBtn label={`Move folder ${f.name}`} onClick={() => setMoveModal({ type: "folder", item: f })}><FolderInput size={15} /></IconBtn>
                        <IconBtn label={`Delete folder ${f.name}`} danger onClick={() => removeFolder(f)}><Trash2 size={15} /></IconBtn>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {files.length > 0 && (
              <>
                <h2 style={{ ...sectionH, marginTop: folders.length ? 20 : 0 }}>Files</h2>
                <div style={view === "grid" ? gridStyle : listStyle}>
                  {files.map((f) => (
                    <div key={f._id} className="docs-card" style={cardStyle(view)}>
                      <button className="docs-btn" onClick={() => openFile(f)} aria-label={`Open ${f.name}`} style={{ ...openArea, flex: 1 }}>
                        <TypeIcon kind={f.kind} size={view === "grid" ? 34 : 24} />
                        <span style={{ minWidth: 0, textAlign: "left" }}>
                          <span style={nameText}>{f.name}</span>
                          <span style={metaText}>
                            {(f.format || "").toUpperCase()} - {fmtSize(f.bytes)} - {fmtDate(f.createdAt)}
                            {searching && f.folderName ? ` - in ${f.folderName}` : ""}
                          </span>
                        </span>
                      </button>
                      <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <IconBtn label={`View ${f.name}`} onClick={() => openFile(f)}><Eye size={15} /></IconBtn>
                        <a className="docs-icon" href={downloadUrl(f)} download={f.originalName || f.name} target="_blank" rel="noopener noreferrer"
                          aria-label={`Download ${f.name}`} style={{ ...iconBtn(false), textDecoration: "none" }}><Download size={15} /></a>
                        <IconBtn label={`Rename ${f.name}`} onClick={() => setNameModal({ type: "file", item: f, value: f.name })}><Pencil size={15} /></IconBtn>
                        <IconBtn label={`Move ${f.name}`} onClick={() => setMoveModal({ type: "file", item: f })}><FolderInput size={15} /></IconBtn>
                        <IconBtn label={`Delete ${f.name}`} danger onClick={() => removeFile(f)}><Trash2 size={15} /></IconBtn>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Allowed: PDF, Word (.doc, .docx), JPG, PNG, WEBP. Up to 10 MB per file.</p>

      {nameModal && (
        <Modal title={nameModal.type === "newFolder" ? "New folder" : nameModal.type === "folder" ? "Rename folder" : "Rename file"} onClose={() => setNameModal(null)}>
          <form onSubmit={submitName}>
            <label htmlFor="doc-name" style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Name</label>
            <input id="doc-name" className="docs-input" autoFocus value={nameModal.value} maxLength={120}
              onChange={(e) => setNameModal((p) => ({ ...p, value: e.target.value }))} style={{ ...inputStyle, marginTop: 6 }} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              <button type="button" className="docs-btn" onClick={() => setNameModal(null)} style={btnOutline}>Cancel</button>
              <button type="submit" className="docs-btn" style={btnGreen}>Save</button>
            </div>
          </form>
        </Modal>
      )}

      {moveModal && <MoveModal modal={moveModal} onClose={() => setMoveModal(null)} onMove={doMove} />}
      {viewer && <ViewerModal file={viewer} onClose={() => setViewer(null)} />}
    </div>
  );
}

function IconBtn({ label, onClick, danger, children }) {
  return (
    <button type="button" className="docs-icon" onClick={onClick} aria-label={label} title={label} style={iconBtn(danger)}>{children}</button>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}>
      <div role="dialog" aria-modal="true" aria-label={title}
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: wide ? 1000 : 420, maxHeight: "94vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "14px 18px", borderBottom: "1px solid #f3f4f6" }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</h2>
          <button type="button" className="docs-icon" onClick={onClose} aria-label="Close" style={iconBtn(false)}><X size={18} /></button>
        </div>
        <div style={{ padding: 18, overflow: "auto", flex: 1, display: "flex", flexDirection: "column" }}>{children}</div>
      </div>
    </div>
  );
}

function MoveModal({ modal, onClose, onMove }) {
  const [current, setCurrent] = useState("");
  const [list, setList] = useState([]);
  const [crumbs, setCrumbs] = useState([]);
  const [busy, setBusy] = useState(true);
  const { type, item } = modal;

  useEffect(() => {
    setBusy(true);
    axios.get(`${BASE}/folders`, { ...hdr(), params: { parent: current || "root" } })
      .then((r) => { setList(r.data.data || []); setCrumbs(r.data.breadcrumb || []); })
      .catch((e) => toast.error(errMsg(e, "Failed to load folders")))
      .finally(() => setBusy(false));
  }, [current]);

  const visible = list.filter((f) => !(type === "folder" && f._id === item._id));

  return (
    <Modal title={`Move "${item.name}"`} onClose={onClose}>
      <nav aria-label="Destination path" style={{ display: "flex", flexWrap: "wrap", gap: 4, fontSize: 13, marginBottom: 10 }}>
        <button type="button" className="docs-crumb" onClick={() => setCurrent("")} style={crumbBtn(!current)}>All Documents</button>
        {crumbs.map((c) => (
          <span key={c._id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ChevronRight size={14} color="#9ca3af" aria-hidden="true" />
            <button type="button" className="docs-crumb" onClick={() => setCurrent(c._id)} style={crumbBtn(c._id === current)}>{c.name}</button>
          </span>
        ))}
      </nav>
      <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, minHeight: 120, maxHeight: 260, overflow: "auto" }}>
        {busy ? <div style={{ padding: 20, color: "#9ca3af", textAlign: "center" }}>Loading...</div>
          : visible.length === 0 ? <div style={{ padding: 20, color: "#9ca3af", textAlign: "center", fontSize: 13 }}>No subfolders here.</div>
          : visible.map((f) => (
            <button key={f._id} type="button" className="docs-btn" onClick={() => setCurrent(f._id)}
              style={{ ...openArea, width: "100%", padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
              <Folder size={18} color="#d97706" fill="#fde68a" aria-hidden="true" />
              <span style={{ ...nameText, flex: 1, textAlign: "left" }}>{f.name}</span>
              <ChevronRight size={14} color="#9ca3af" aria-hidden="true" />
            </button>
          ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <button type="button" className="docs-btn" onClick={onClose} style={btnOutline}>Cancel</button>
        <button type="button" className="docs-btn" onClick={() => onMove(current)} style={btnGreen}>Move here</button>
      </div>
    </Modal>
  );
}

function ViewerModal({ file, onClose }) {
  const isPdf = file.kind === "pdf";
  const isImg = file.kind === "image";
  const isDoc = file.kind === "doc";
  const [docFailed, setDocFailed] = useState(false);
  return (
    <Modal title={file.name} onClose={onClose} wide>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <a className="docs-btn" href={isDoc ? officeUrl(file.url) : file.url} target="_blank" rel="noopener noreferrer" style={{ ...btnOutline, textDecoration: "none" }}>
          <ExternalLink size={15} aria-hidden="true" /> Open in new tab
        </a>
        <a className="docs-btn" href={downloadUrl(file)} download={file.originalName || file.name} target="_blank" rel="noopener noreferrer" style={{ ...btnGreen, textDecoration: "none" }}>
          <Download size={15} aria-hidden="true" /> Download
        </a>
      </div>
      <div style={{ flex: 1, minHeight: "60vh", background: "#f9fafb", borderRadius: 10, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {isPdf && <iframe title={file.name} src={file.url} style={{ width: "100%", height: "70vh", border: 0 }} />}
        {isImg && <img src={file.url} alt={file.name} style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }} />}
        {isDoc && (
          docFailed ? (
            <p style={{ color: "#6b7280", fontSize: 14, padding: 20, textAlign: "center" }}>
              The Word preview could not be loaded. Please use Download or Open in new tab.
            </p>
          ) : (
            <iframe title={file.name} src={officeUrl(file.url)} onError={() => setDocFailed(true)} style={{ width: "100%", height: "70vh", border: 0 }} />
          )
        )}
        {!isPdf && !isImg && !isDoc && <p style={{ color: "#6b7280", padding: 20 }}>Preview is not available. Use Download.</p>}
      </div>
      {isDoc && (
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "8px 0 0" }}>
          Word preview uses Office Online and works only when the file link is publicly reachable. If it stays blank, use Download.
        </p>
      )}
    </Modal>
  );
}

/* ---------- styles ---------- */
const btnGreen = { display: "inline-flex", alignItems: "center", gap: 6, background: GREEN, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const btnOutline = { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" };
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "9px 12px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 14, background: "#fff", color: "#111827" };
const linkBtn = { background: "none", border: "none", color: GREEN, fontWeight: 700, cursor: "pointer", padding: 0, fontSize: 13 };
const sectionH = { fontSize: 12, fontWeight: 800, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em", margin: "0 0 10px" };
const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: 12 };
const listStyle = { display: "flex", flexDirection: "column", gap: 8 };
const cardStyle = (view) => ({
  display: "flex", flexDirection: view === "grid" ? "column" : "row", alignItems: view === "grid" ? "stretch" : "center",
  gap: 6, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 10, flexWrap: view === "grid" ? "nowrap" : "wrap",
});
const openArea = { display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, minWidth: 0 };
const nameText = { display: "block", fontSize: 14, fontWeight: 700, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" };
const metaText = { display: "block", fontSize: 11, color: "#9ca3af", marginTop: 2 };
const iconBtn = (danger) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "none", border: "none", borderRadius: 8, cursor: "pointer", color: danger ? "#dc2626" : "#4b5563" });
const toggleBtn = (on) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, border: `1px solid ${on ? GREEN : "#d1d5db"}`, background: on ? "#f0fdf4" : "#fff", color: on ? GREEN : "#6b7280", cursor: "pointer" });
const crumbBtn = (active) => ({ display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", padding: "4px 6px", borderRadius: 6, fontSize: 13, fontWeight: active ? 800 : 600, color: active ? "#111827" : GREEN });
