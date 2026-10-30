"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Plus, X, Trash2, ArrowLeft, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const PAYMENT_MODES = ["cash", "upi", "bank", "cheque", "online", "adjustment"];
const UNITS = ["", "kg", "g", "L", "ml", "piece", "pack", "dozen", "box", "bag", "quintal"];

function fmtDateTime(dt) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export default function CrmLedgerPage() {
  const [view, setView]       = useState("list");   // list | detail
  const [ledgers, setLedgers] = useState([]);
  const [outstanding, setOut] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  const [active, setActive]   = useState(null);     // selected ledger (detail)
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [addEntryOpen, setAddEntryOpen]   = useState(false);

  // ── Load list ──
  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await CRM_API.get("/ledger", { params: search ? { search } : {} });
      setLedgers(data.data || []);
      setOut(data.totalOutstanding || 0);
    } catch { setLedgers([]); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { if (view === "list") loadList(); }, [loadList, view]);

  // ── Open a ledger detail ──
  const openLedger = async (id) => {
    try {
      const { data } = await CRM_API.get(`/ledger/${id}`);
      setActive(data.data);
      setView("detail");
    } catch { alert("Failed to open ledger"); }
  };

  const refreshActive = async () => {
    if (!active) return;
    const { data } = await CRM_API.get(`/ledger/${active.id}`);
    setActive(data.data);
  };

  // ════════════════ LIST VIEW ════════════════
  if (view === "list") {
    return (
      <div style={{ padding: "clamp(16px,3vw,28px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>Ledger / Khata</h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>Manage client dues &amp; payments — jama / baaki records.</p>
          </div>
          <button onClick={() => setAddClientOpen(true)} style={btnPrimary}>
            <Plus size={16} /> Add Client
          </button>
        </div>

        {/* Outstanding summary */}
        <div style={{ background: "linear-gradient(135deg,#166534,#22c55e)", borderRadius: 14, padding: "18px 22px", color: "#fff", marginBottom: 20, display: "inline-block", minWidth: 240 }}>
          <div style={{ fontSize: 13, opacity: .85, display: "flex", alignItems: "center", gap: 6 }}><Wallet size={15} /> Total Outstanding</div>
          <div style={{ fontSize: 28, fontWeight: 900, marginTop: 4 }}>₹{outstanding}</div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", maxWidth: 360, marginBottom: 16 }}>
          <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search client name or phone…"
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px 9px 36px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50, color: "#94a3b8" }}>Loading…</div>
        ) : ledgers.length === 0 ? (
          <div style={{ textAlign: "center", padding: 50, color: "#94a3b8", background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9" }}>
            No ledgers yet. Click "Add Client" to start a khata.
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 560 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                  {["Client", "Phone", "Total Jama", "Total Baaki", "Balance", ""].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ledgers.map(l => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #f8fafc", cursor: "pointer" }} onClick={() => openLedger(l.id)}>
                    <td style={{ ...td, fontWeight: 700, color: "#0f172a" }}>{l.clientName}</td>
                    <td style={{ ...td, color: "#64748b" }}>{l.clientPhone || "—"}</td>
                    <td style={{ ...td, color: "#16a34a", fontWeight: 700 }}>₹{l.totalJama}</td>
                    <td style={{ ...td, color: "#dc2626", fontWeight: 700 }}>₹{l.totalBaaki}</td>
                    <td style={{ ...td, fontWeight: 800, color: l.balance > 0 ? "#d97706" : "#16a34a" }}>₹{l.balance}</td>
                    <td style={td}><button style={btnLink}>Open →</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {addClientOpen && (
          <AddClientModal onClose={() => setAddClientOpen(false)} onDone={(newLedger) => { setAddClientOpen(false); if (newLedger) openLedger(newLedger.id); else loadList(); }} />
        )}
      </div>
    );
  }

  // ════════════════ DETAIL VIEW ════════════════
  const entries = active?.entries || [];
  return (
    <div style={{ padding: "clamp(16px,3vw,28px)" }}>
      <button onClick={() => { setView("list"); setActive(null); }} style={{ ...btnLink, display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
        <ArrowLeft size={15} /> Back to all ledgers
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 4px" }}>{active?.clientName}</h1>
          {active?.clientPhone && <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>{active.clientPhone}</p>}
        </div>
        <button onClick={() => setAddEntryOpen(true)} style={btnPrimary}>
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <SummaryCard label="Total Jama (Paid)"  value={`₹${active?.totalJama || 0}`}  color="#16a34a" icon={<TrendingUp size={16} />} />
        <SummaryCard label="Total Baaki (Due)"  value={`₹${active?.totalBaaki || 0}`} color="#dc2626" icon={<TrendingDown size={16} />} />
        <SummaryCard label={active?.balance > 0 ? "Outstanding Balance" : "Settled"} value={`₹${Math.abs(active?.balance || 0)}`} color={active?.balance > 0 ? "#d97706" : "#16a34a"} icon={<Wallet size={16} />} highlight />
      </div>

      {/* Entries table */}
      {entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: 50, color: "#94a3b8", background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9" }}>
          No entries yet. Click "Add Entry" to record jama or baaki.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #f1f5f9", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
                {["Date & Time", "Item", "Qty × Rate", "Note", "Baaki (Dr)", "Jama (Cr)", "Balance", ""].map(h => <th key={h} style={th}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ ...td, whiteSpace: "nowrap", fontSize: 12, color: "#64748b" }}>{fmtDateTime(e.entryDate)}</td>
                  <td style={td}>{e.item || "—"}{e.unit && e.quantity ? ` (${e.quantity} ${e.unit})` : ""}</td>
                  <td style={{ ...td, fontSize: 12, color: "#64748b" }}>
                    {e.quantity != null && e.rate != null ? `${e.quantity} × ₹${e.rate}` : "—"}
                  </td>
                  <td style={{ ...td, fontSize: 12, color: "#64748b", maxWidth: 160 }}>
                    {e.note || "—"}{e.paymentMode ? ` · ${e.paymentMode}` : ""}
                  </td>
                  <td style={{ ...td, color: "#dc2626", fontWeight: 700 }}>{e.type === "baaki" ? `₹${e.amount}` : "—"}</td>
                  <td style={{ ...td, color: "#16a34a", fontWeight: 700 }}>{e.type === "jama" ? `₹${e.amount}` : "—"}</td>
                  <td style={{ ...td, fontWeight: 800, color: e.balanceAfter > 0 ? "#d97706" : "#16a34a" }}>₹{e.balanceAfter}</td>
                  <td style={td}>
                    <button onClick={async () => {
                      if (!confirm("Remove this entry?")) return;
                      await CRM_API.delete(`/ledger/${active.id}/entry/${e._id}`);
                      refreshActive();
                    }} style={{ border: "none", background: "#fef2f2", color: "#dc2626", borderRadius: 6, padding: 5, cursor: "pointer", display: "flex" }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addEntryOpen && (
        <AddEntryModal ledgerId={active.id} onClose={() => setAddEntryOpen(false)} onDone={() => { setAddEntryOpen(false); refreshActive(); }} />
      )}
    </div>
  );
}

// ── Add client modal ──
function AddClientModal({ onClose, onDone }) {
  const [form, setForm] = useState({ clientName: "", clientPhone: "", client: "" });
  const [clients, setClients] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    CRM_API.get("/ledger/clients/available").then(r => setClients(r.data.data || [])).catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clientName.trim()) return;
    setBusy(true);
    try {
      const { data } = await CRM_API.post("/ledger", form);
      onDone(data.data);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const pickExisting = (id) => {
    const c = clients.find(x => x.id === id);
    if (c) setForm({ clientName: c.name, clientPhone: c.phone || "", client: c.id });
  };

  return (
    <Modal title="Add Client Ledger" onClose={onClose}>
      <form onSubmit={submit}>
        {clients.length > 0 && (
          <Field label="Link existing CRM client (optional)">
            <select value={form.client} onChange={e => pickExisting(e.target.value)} style={inp}>
              <option value="">— New / manual client —</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` (${c.company})` : ""}</option>)}
            </select>
          </Field>
        )}
        <Field label="Client Name *"><input value={form.clientName} onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))} style={inp} autoFocus required /></Field>
        <Field label="Phone"><input value={form.clientPhone} onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))} style={inp} /></Field>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...btnPrimary, flex: 1, justifyContent: "center" }}>{busy ? "Saving…" : "Create Ledger"}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Add entry modal (jama / baaki) ──
function AddEntryModal({ ledgerId, onClose, onDone }) {
  const [form, setForm] = useState({
    type: "baaki", amount: "", item: "", quantity: "", unit: "", rate: "",
    note: "", reference: "", paymentMode: "cash",
  });
  const [busy, setBusy] = useState(false);

  // Auto-calc amount from qty × rate if both present and amount empty
  useEffect(() => {
    if (form.quantity && form.rate) {
      const calc = Number(form.quantity) * Number(form.rate);
      if (calc > 0) setForm(f => ({ ...f, amount: String(calc) }));
    }
  }, [form.quantity, form.rate]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { alert("Enter a valid amount"); return; }
    setBusy(true);
    try {
      await CRM_API.post(`/ledger/${ledgerId}/entry`, form);
      onDone();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <Modal title="Add Ledger Entry" onClose={onClose}>
      <form onSubmit={submit}>
        {/* Type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[{ v: "baaki", l: "Baaki (Due)", c: "#dc2626" }, { v: "jama", l: "Jama (Payment)", c: "#16a34a" }].map(t => (
            <button key={t.v} type="button" onClick={() => setForm(f => ({ ...f, type: t.v }))} style={{
              flex: 1, padding: 10, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700,
              border: form.type === t.v ? `2px solid ${t.c}` : "2px solid #e2e8f0",
              background: form.type === t.v ? `${t.c}12` : "#fff", color: form.type === t.v ? t.c : "#475569",
            }}>{t.l}</button>
          ))}
        </div>

        {/* Optional item details */}
        <div style={{ background: "#f8fafc", borderRadius: 10, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 10 }}>Item details (optional)</div>
          <Field label="Item / Saman"><input value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))} style={inp} placeholder="e.g. Rice, Cement" /></Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <Field label="Quantity"><input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} style={inp} /></Field>
            <Field label="Unit">
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={inp}>
                {UNITS.map(u => <option key={u} value={u}>{u || "—"}</option>)}
              </select>
            </Field>
            <Field label="Rate (₹)"><input type="number" value={form.rate} onChange={e => setForm(f => ({ ...f, rate: e.target.value }))} style={inp} /></Field>
          </div>
        </div>

        <Field label="Amount (₹) *"><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inp} /></Field>

        {form.type === "jama" && (
          <Field label="Payment Mode">
            <select value={form.paymentMode} onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))} style={inp}>
              {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        )}
        <Field label="Note (optional)"><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={inp} /></Field>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          <button type="submit" disabled={busy} style={{ ...btnPrimary, flex: 1, justifyContent: "center" }}>{busy ? "Saving…" : "Save Entry"}</button>
        </div>
      </form>
    </Modal>
  );
}

// ── Reusable UI ──
function Modal({ title, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 22, width: "min(460px,100%)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#0f172a" }}>{title}</h3>
          <button onClick={onClose} style={{ border: "none", background: "#f1f5f9", width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon, highlight }) {
  return (
    <div style={{ background: `${color}0d`, borderRadius: 12, padding: "16px 18px", border: highlight ? `2px solid ${color}40` : "1px solid #f1f5f9" }}>
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><span style={{ color }}>{icon}</span>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", display: "block", marginBottom: 5 }}>{label}</label>{children}</div>;
}

const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", whiteSpace: "nowrap" };
const td = { padding: "11px 14px", fontSize: 13, color: "#334155" };
const inp = { width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 11px", fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" };
const btnPrimary = { display: "inline-flex", alignItems: "center", gap: 6, background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 14, fontWeight: 700, cursor: "pointer" };
const btnGhost   = { flex: 1, padding: "9px 16px", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer", color: "#475569" };
const btnLink    = { border: "none", background: "none", color: "#16a34a", fontSize: 13, fontWeight: 700, cursor: "pointer" };
