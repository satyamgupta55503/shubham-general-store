"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, X, CreditCard, Search, Filter, Clock, Link2, LinkIcon } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const MODES = [
  { v:"upi",          l:"UPI"          },
  { v:"bank_transfer",l:"Bank Transfer" },
  { v:"neft",         l:"NEFT / IMPS"  },
  { v:"cheque",       l:"Cheque"       },
  { v:"cash",         l:"Cash"         },
  { v:"razorpay",     l:"Razorpay"     },
  { v:"paypal",       l:"PayPal"       },
  { v:"other",        l:"Other"        },
];
const MODE_COLOR = { upi:"#ede9fe",bank_transfer:"#dbeafe",neft:"#dbeafe",cheque:"#fef9c3",cash:"#dcfce7",razorpay:"#ffedd5",paypal:"#dbeafe",other:"#f1f5f9" };
const MODE_TEXT  = { upi:"#5b21b6",bank_transfer:"#1d4ed8",neft:"#1d4ed8",cheque:"#a16207",cash:"#15803d",razorpay:"#c2410c",paypal:"#1d4ed8",other:"#475569" };

const fmt     = n  => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtDate = d  => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtTime = d  => d ? new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}) : "";

/* ── Return current datetime as value for <input type="datetime-local"> ── */
const nowLocal = () => {
  const d = new Date();
  // Offset for local timezone
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 16);
};

export default function CrmPaymentsPage() {
  const [payments,    setPayments]    = useState([]);
  const [invoices,    setInvoices]    = useState([]);   // outstanding only
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [filterMode,  setFilterMode]  = useState("");
  const [modal,       setModal]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");

  /* ── Form state ── */
  const [invoiceMode, setInvoiceMode] = useState(true); // true = linked to invoice, false = direct
  const [form, setForm] = useState({
    invoice:             "",
    client_name_direct:  "",
    description:         "",
    amount_paid:         "",
    payment_datetime:    "",   // datetime-local value
    payment_mode:        "upi",
    reference_number:    "",
    notes:               "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data:p }, { data:inv }] = await Promise.all([
        CRM_API.get("/payments"),
        CRM_API.get("/invoices"),
      ]);
      setPayments(p);
      setAllInvoices(inv);
      setInvoices(inv.filter(i => ["issued","partial","overdue"].includes(i.status)));
    } catch { setPayments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = payments.filter(p => {
    const s = search.toLowerCase();
    const matchSearch = !search ||
      p.invoice?.invoice_number?.toLowerCase().includes(s) ||
      p.invoice?.client_name_snapshot?.toLowerCase().includes(s) ||
      p.client_name_direct?.toLowerCase().includes(s) ||
      p.reference_number?.toLowerCase().includes(s) ||
      p.description?.toLowerCase().includes(s);
    const matchMode = !filterMode || p.payment_mode === filterMode;
    return matchSearch && matchMode;
  });

  /* ── Open modal — auto-fill datetime ── */
  const openModal = () => {
    setInvoiceMode(true);
    setForm({
      invoice: "", client_name_direct: "", description: "",
      amount_paid: "", payment_datetime: nowLocal(),
      payment_mode: "upi", reference_number: "", notes: "",
    });
    setError(""); setModal(true);
  };

  /* ── When invoice is selected, auto-fill amount with balance due ── */
  const handleInvoiceChange = (invId) => {
    const inv = invoices.find(i => (i.id||i._id) === invId);
    setForm(p => ({
      ...p,
      invoice: invId,
      amount_paid: inv ? String(inv.balance_due) : p.amount_paid,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setError("");
    try {
      const payload = {
        invoice:            invoiceMode ? form.invoice || null : null,
        client_name_direct: !invoiceMode ? form.client_name_direct : "",
        description:        form.description,
        amount_paid:        Number(form.amount_paid),
        payment_date:       form.payment_datetime ? new Date(form.payment_datetime).toISOString() : new Date().toISOString(),
        payment_mode:       form.payment_mode,
        reference_number:   form.reference_number,
        notes:              form.notes,
      };
      await CRM_API.post("/payments", payload);
      closeModal(); load();
    } catch (err) { setError(err.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this payment? Invoice balance will be recalculated.")) return;
    try { await CRM_API.delete(`/payments/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const closeModal = () => { setModal(false); setError(""); };

  const selectedInv = invoices.find(i => (i.id||i._id) === form.invoice);

  const total     = payments.reduce((s,p) => s + (Number(p.amount_paid)||0), 0);
  const thisMonth = payments.filter(p => {
    if (!p.payment_date) return false;
    const d = new Date(p.payment_date); const n = new Date();
    return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear();
  }).reduce((s,p) => s + (Number(p.amount_paid)||0), 0);

  const inp = { width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color .15s" };
  const lbl = { display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:5,letterSpacing:".02em" };
  const focusGreen = e => e.target.style.borderColor = "#22c55e";
  const blurGray   = e => e.target.style.borderColor = "#e2e8f0";

  return (
    <div style={{ fontFamily:"'Inter',sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 3px" }}>Payments</h1>
          <p style={{ fontSize:13,color:"#64748b",margin:0 }}>
            {payments.length} records · Total: <strong style={{color:"#15803d"}}>{fmt(total)}</strong>
            {" "}· This month: <strong style={{color:"#1d4ed8"}}>{fmt(thisMonth)}</strong>
          </p>
        </div>
        <button onClick={openModal} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 18px",background:"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}>
          <Plus size={16}/> Record Payment
        </button>
      </div>

      {/* ── Summary cards ── */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:12,marginBottom:20 }}>
        {[
          ["Total Received",   fmt(total),     "#15803d","#f0fdf4","#bbf7d0"],
          ["This Month",       fmt(thisMonth), "#1d4ed8","#eff6ff","#bfdbfe"],
          ["Pending Invoices", `${invoices.length}`, "#c2410c","#fff7ed","#fed7aa"],
          ["Outstanding",      fmt(invoices.reduce((s,i)=>s+(Number(i.balance_due)||0),0)), "#dc2626","#fef2f2","#fecaca"],
        ].map(([l,v,color,bg,border])=>(
          <div key={l} style={{ background:bg,border:`1px solid ${border}`,borderRadius:12,padding:"14px 16px" }}>
            <p style={{ fontSize:10,fontWeight:700,color,textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 4px" }}>{l}</p>
            <p style={{ fontSize:20,fontWeight:800,color,margin:0 }}>{v}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={{ display:"flex",gap:10,marginBottom:18,flexWrap:"wrap",alignItems:"center" }}>
        <div style={{ display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:9,padding:"8px 14px",flex:"1 1 200px",maxWidth:340 }}>
          <Search size={14} color="#94a3b8" style={{flexShrink:0}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoice, client, reference…"
            style={{ border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,fontFamily:"inherit" }}/>
        </div>
        <select value={filterMode} onChange={e=>setFilterMode(e.target.value)}
          style={{ padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,background:"#f8fafc",outline:"none",fontFamily:"inherit" }}>
          <option value="">All Modes</option>
          {MODES.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
            <thead>
              <tr style={{ background:"#f8fafc" }}>
                {["Invoice / Client","Amount","Date & Time","Mode","Reference","Actions"].map(h=>(
                  <th key={h} style={{ padding:"10px 14px",textAlign:"left",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:".05em",color:"#64748b",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding:48,textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
              ) : filtered.length===0 ? (
                <tr><td colSpan={6} style={{ padding:48,textAlign:"center" }}>
                  <CreditCard size={36} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/>
                  <p style={{ color:"#94a3b8",margin:0 }}>No payments {search||filterMode?"match filters":"recorded yet"}.</p>
                </td></tr>
              ) : filtered.map(p=>(
                <tr key={p.id||p._id} style={{ borderBottom:"1px solid #f8fafc",transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="#fafafa"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

                  {/* Invoice / Client */}
                  <td style={{ padding:"11px 14px" }}>
                    {p.invoice ? (
                      <div>
                        <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{p.invoice.invoice_number}</div>
                        <div style={{ fontSize:11,color:"#64748b" }}>{p.invoice.client_name_snapshot}</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                          <span style={{ fontSize:9,fontWeight:800,background:"#f0fdf4",color:"#16a34a",padding:"2px 6px",borderRadius:4,border:"1px solid #bbf7d0",letterSpacing:".05em" }}>DIRECT</span>
                          <span style={{ fontSize:13,fontWeight:600,color:"#1e293b" }}>{p.client_name_direct||"—"}</span>
                        </div>
                        {p.description && <div style={{ fontSize:11,color:"#94a3b8",marginTop:1 }}>{p.description}</div>}
                      </div>
                    )}
                  </td>

                  {/* Amount */}
                  <td style={{ padding:"11px 14px",fontWeight:800,color:"#16a34a",fontSize:14 }}>{fmt(p.amount_paid)}</td>

                  {/* Date & Time */}
                  <td style={{ padding:"11px 14px" }}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#1e293b" }}>{fmtDate(p.payment_date)}</div>
                    {fmtTime(p.payment_date) && (
                      <div style={{ fontSize:10,color:"#94a3b8",display:"flex",alignItems:"center",gap:3,marginTop:1 }}>
                        <Clock size={9}/> {fmtTime(p.payment_date)}
                      </div>
                    )}
                  </td>

                  {/* Mode */}
                  <td style={{ padding:"11px 14px" }}>
                    <span style={{ background:MODE_COLOR[p.payment_mode]||"#f1f5f9",color:MODE_TEXT[p.payment_mode]||"#475569",padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700 }}>
                      {MODES.find(m=>m.v===p.payment_mode)?.l||p.payment_mode}
                    </span>
                  </td>

                  {/* Reference */}
                  <td style={{ padding:"11px 14px",color:"#64748b",fontSize:12 }}>{p.reference_number||"—"}</td>

                  {/* Actions */}
                  <td style={{ padding:"11px 14px" }}>
                    <button onClick={()=>handleDelete(p.id||p._id)} title="Delete"
                      style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer",display:"flex",alignItems:"center" }}>
                      <Trash2 size={13}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RECORD PAYMENT MODAL
      ══════════════════════════════════════════ */}
      {modal && (
        <div className="crm-modal-overlay">
          <div className="crm-modal" style={{ maxWidth:560 }}>

            {/* Modal Header */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 22px",borderBottom:"1px solid #f1f5f9",position:"sticky",top:0,background:"#fff",zIndex:1 }}>
              <div>
                <h2 style={{ fontSize:16,fontWeight:800,color:"#0f172a",margin:0 }}>Record Payment</h2>
                <p style={{ fontSize:11,color:"#94a3b8",margin:"2px 0 0" }}>Date & time auto-filled · Invoice optional</p>
              </div>
              <button onClick={closeModal} style={{ background:"#f1f5f9",border:"none",width:30,height:30,borderRadius:7,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>
                <X size={15}/>
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding:"20px 22px",display:"flex",flexDirection:"column",gap:16 }}>
              {error && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{error}</div>}

              {/* ── Invoice / Direct toggle ── */}
              <div style={{ display:"flex",gap:8,background:"#f8fafc",borderRadius:10,padding:4 }}>
                <button type="button" onClick={()=>setInvoiceMode(true)}
                  style={{ flex:1,padding:"8px 12px",borderRadius:7,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",
                    background:invoiceMode?"#fff":"transparent",color:invoiceMode?"#0f172a":"#64748b",
                    boxShadow:invoiceMode?"0 1px 4px rgba(0,0,0,.08)":"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
                  <LinkIcon size={12}/> Link to Invoice
                </button>
                <button type="button" onClick={()=>setInvoiceMode(false)}
                  style={{ flex:1,padding:"8px 12px",borderRadius:7,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",transition:"all .15s",
                    background:!invoiceMode?"#fff":"transparent",color:!invoiceMode?"#0f172a":"#64748b",
                    boxShadow:!invoiceMode?"0 1px 4px rgba(0,0,0,.08)":"none",display:"flex",alignItems:"center",justifyContent:"center",gap:5 }}>
                  <CreditCard size={12}/> Direct Payment
                </button>
              </div>

              {/* ── Invoice-linked mode ── */}
              {invoiceMode ? (
                <div>
                  <label style={lbl}>Invoice <span style={{color:"#6b7280",fontWeight:400}}>(optional — leave blank for advance/misc)</span></label>
                  <select value={form.invoice} onChange={e=>handleInvoiceChange(e.target.value)}
                    style={inp} onFocus={focusGreen} onBlur={blurGray}>
                    <option value="">— No invoice (advance / misc payment) —</option>
                    {invoices.length===0
                      ? <option disabled>No outstanding invoices</option>
                      : invoices.map(i=>(
                        <option key={i.id||i._id} value={i.id||i._id}>
                          {i.invoice_number} · {i.client_name_snapshot} · Balance: {fmt(i.balance_due)}
                        </option>
                      ))
                    }
                  </select>
                  {selectedInv && (
                    <div style={{ marginTop:7,padding:"9px 14px",background:"#f0fdf4",borderRadius:8,fontSize:12,display:"flex",gap:16,flexWrap:"wrap" }}>
                      <span>Grand Total: <strong>{fmt(selectedInv.grand_total)}</strong></span>
                      <span>Paid So Far: <strong style={{color:"#15803d"}}>{fmt(selectedInv.amount_paid)}</strong></span>
                      <span>Balance Due: <strong style={{color:"#dc2626"}}>{fmt(selectedInv.balance_due)}</strong></span>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Direct payment mode ── */
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <div>
                    <label style={lbl}>Client / Payer Name <span style={{color:"#ef4444"}}>*</span></label>
                    <input value={form.client_name_direct} onChange={e=>setForm(p=>({...p,client_name_direct:e.target.value}))}
                      required={!invoiceMode} placeholder="e.g. Rahul Sharma / Technology Lead"
                      style={inp} onFocus={focusGreen} onBlur={blurGray}/>
                  </div>
                  <div>
                    <label style={lbl}>Description / Purpose</label>
                    <input value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                      placeholder="e.g. Advance payment for Website project"
                      style={inp} onFocus={focusGreen} onBlur={blurGray}/>
                  </div>
                </div>
              )}

              {/* ── Amount + DateTime (auto-filled) ── */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div>
                  <label style={lbl}>Amount (₹) <span style={{color:"#ef4444"}}>*</span></label>
                  <input value={form.amount_paid} onChange={e=>setForm(p=>({...p,amount_paid:e.target.value}))}
                    type="number" min="0.01" step="0.01" required
                    placeholder={selectedInv ? String(selectedInv.balance_due) : "0.00"}
                    style={inp} onFocus={focusGreen} onBlur={blurGray}/>
                  {selectedInv && (
                    <p style={{fontSize:10,color:"#16a34a",margin:"3px 0 0",display:"flex",alignItems:"center",gap:4}}>
                      ✓ Balance due: {fmt(selectedInv.balance_due)}
                    </p>
                  )}
                </div>
                <div>
                  <label style={lbl}>
                    Date & Time <span style={{color:"#ef4444"}}>*</span>
                    <span style={{fontWeight:400,color:"#16a34a",marginLeft:6,fontSize:10}}>⚡ Auto-filled</span>
                  </label>
                  <input value={form.payment_datetime}
                    onChange={e=>setForm(p=>({...p,payment_datetime:e.target.value}))}
                    type="datetime-local" required
                    style={inp} onFocus={focusGreen} onBlur={blurGray}/>
                </div>
              </div>

              {/* ── Mode + Reference ── */}
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
                <div>
                  <label style={lbl}>Payment Mode</label>
                  <select value={form.payment_mode} onChange={e=>setForm(p=>({...p,payment_mode:e.target.value}))}
                    style={inp} onFocus={focusGreen} onBlur={blurGray}>
                    {MODES.map(m=><option key={m.v} value={m.v}>{m.l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Reference / UTR / Txn ID</label>
                  <input value={form.reference_number} onChange={e=>setForm(p=>({...p,reference_number:e.target.value}))}
                    placeholder="TXN123456" style={inp} onFocus={focusGreen} onBlur={blurGray}/>
                </div>
              </div>

              {/* ── Notes ── */}
              <div>
                <label style={lbl}>Notes</label>
                <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))}
                  rows={2} placeholder="Optional notes…"
                  style={{...inp,resize:"vertical"}} onFocus={focusGreen} onBlur={blurGray}/>
              </div>

              {/* ── Submit ── */}
              <div style={{ display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:"1px solid #f1f5f9" }}>
                <button type="button" onClick={closeModal}
                  style={{ padding:"9px 18px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding:"9px 22px",background:saving?"#86efac":"linear-gradient(135deg,#22c55e,#16a34a)",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6 }}>
                  {saving ? "Saving…" : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
