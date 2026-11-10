"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : "");
const getRole  = () => (typeof window !== "undefined" ? localStorage.getItem("role") : "");
const authHdr  = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

function fmtDateTime(dt) {
  return new Date(dt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [tab, setTab]             = useState("all"); // all | retail | wholesale | pending
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [detailId, setDetailId]   = useState(null);

  const canWrite = ["superadmin", "admin"].includes(getRole());
  const LIMIT = 30;

  const load = useCallback(() => {
    setLoading(true);
    let url;
    if (tab === "pending") {
      url = `${API}/api/store/customers/admin/pending`;
    } else {
      const params = new URLSearchParams({ page, limit: LIMIT });
      if (search) params.set("search", search);
      if (tab === "retail" || tab === "wholesale") params.set("type", tab);
      url = `${API}/api/store/customers/admin/all?${params}`;
    }
    axios.get(url, authHdr())
      .then(r => { setCustomers(r.data.data || []); setTotal(r.data.pagination?.total || r.data.data?.length || 0); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [tab, page, search]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (id, current) => {
    try {
      await axios.put(`${API}/api/store/customers/admin/${id}/status`, {}, authHdr());
      toast.success(current ? "Deactivated" : "Activated");
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  const deleteCustomer = async (c) => {
    if (!confirm(`Delete customer "${c.name}" (${c.email}) permanently?\n\nThis cannot be undone. Customers with orders or khata entries cannot be deleted - suspend them instead.`)) return;
    try {
      await axios.delete(`${API}/api/store/customers/admin/${c._id}`, authHdr());
      toast.success("Customer deleted");
      if (detailId === c._id) setDetailId(null);
      load();
    } catch (e) { toast.error(e.response?.data?.message || "Delete failed", { duration: 6000 }); }
  };

  return (
    <div style={{ padding: 24 }}>
      <Toaster position="top-right" />
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Customers</h1>
      <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>Retail &amp; wholesale customers, approvals, and khata management.</p>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { v: "all", l: "All" },
          { v: "retail", l: "Retail" },
          { v: "wholesale", l: "Wholesale" },
          { v: "pending", l: "Pending Approval" },
        ].map(t => (
          <button key={t.v} onClick={() => { setTab(t.v); setPage(1); }} style={{
            padding: "7px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: tab === t.v ? "none" : "1px solid #e5e7eb",
            background: tab === t.v ? "#16a34a" : "#fff",
            color: tab === t.v ? "#fff" : "#374151",
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {tab !== "pending" && (
        <input type="text" placeholder="Search name, email, phone, business..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", marginBottom: 16, width: "min(340px, 100%)", boxSizing: "border-box" }} />
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>Loading…</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", background: "#fff", borderRadius: 16, border: "1px solid #f3f4f6" }}>
          {tab === "pending" ? "No pending wholesale approvals." : "No customers found."}
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                {["Customer", "Type", "Phone", "Orders", "Outstanding", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c._id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{c.businessName || c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, textTransform: "capitalize",
                      background: c.customerType === "wholesale" ? "#eff6ff" : "#f0fdf4",
                      color: c.customerType === "wholesale" ? "#2563eb" : "#16a34a",
                    }}>
                      {c.customerType}{c.customerType === "wholesale" && !c.isApproved ? " (pending)" : ""}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, color: "#6b7280" }}>{c.phone || "—"}</td>
                  <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700 }}>{c.totalOrders || 0}</td>
                  <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 700, color: c.outstandingBalance > 0 ? "#d97706" : "#16a34a" }}>
                    ₹{c.outstandingBalance || 0}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: c.isActive ? "#f0fdf4" : "#fef2f2", color: c.isActive ? "#16a34a" : "#dc2626" }}>
                      {c.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button onClick={() => setDetailId(c._id)} style={btnSm("#eff6ff", "#2563eb")}>Manage</button>
                      {canWrite && !c.isApproved && (
                        <ApproveButton id={c._id} type={c.customerType} onDone={load} />
                      )}
                      {canWrite && c.isApproved && (
                        <button onClick={() => toggleStatus(c._id, c.isActive)} style={btnSm(c.isActive ? "#fef2f2" : "#f0fdf4", c.isActive ? "#dc2626" : "#16a34a")}>
                          {c.isActive ? "Suspend" : "Activate"}
                        </button>
                      )}
                      {canWrite && c.isApproved && (
                        <button
                          onClick={() => deleteCustomer(c)}
                          aria-label={`Delete customer ${c.name}`}
                          title="Delete customer permanently"
                          style={{ ...btnSm("#fff", "#dc2626"), border: "1px solid #fecaca" }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {tab !== "pending" && Math.ceil(total / LIMIT) > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 14, flexWrap: "wrap" }}>
          {Array(Math.ceil(total / LIMIT)).fill(0).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} style={{
              width: 32, height: 32, borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer",
              border: page === i + 1 ? "none" : "1px solid #e5e7eb",
              background: page === i + 1 ? "#16a34a" : "#fff",
              color: page === i + 1 ? "#fff" : "#374151",
            }}>{i + 1}</button>
          ))}
        </div>
      )}

      {/* Detail drawer */}
      {detailId && (
        <CustomerDetailDrawer
          customerId={detailId}
          canWrite={canWrite}
          onDelete={(c) => deleteCustomer(c)}
          onClose={() => { setDetailId(null); load(); }}
        />
      )}
    </div>
  );
}

// ── Approve + Reject buttons ──
function ApproveButton({ id, type, onDone }) {
  const [busy, setBusy] = useState(false);

  const approve = async () => {
    let creditLimit = 0;
    if (type === "wholesale") {
      const credit = prompt("Set credit limit for this wholesale account (₹). Enter 0 for no credit:", "0");
      if (credit === null) return;
      creditLimit = Number(credit) || 0;
    }
    setBusy(true);
    try {
      await axios.put(`${API}/api/store/customers/admin/${id}/approve`, { creditLimit }, authHdr());
      toast.success("Account approved — customer can now log in");
      onDone();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  const reject = async () => {
    if (!confirm("Reject this registration? The account will be permanently removed.")) return;
    setBusy(true);
    try {
      await axios.delete(`${API}/api/store/customers/admin/${id}/reject`, authHdr());
      toast.success("Registration rejected");
      onDone();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <>
      <button onClick={approve} disabled={busy} style={btnSm("#f0fdf4", "#16a34a")}>{busy ? "…" : "Approve"}</button>
      <button onClick={reject}  disabled={busy} style={btnSm("#fef2f2", "#dc2626")}>Reject</button>
    </>
  );
}

// ── Customer detail + ledger drawer ──
function CustomerDetailDrawer({ customerId, canWrite, onClose, onDelete }) {
  const [customer, setCustomer] = useState(null);
  const [ledger, setLedger]     = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("ledger"); // ledger | orders
  const [showAdd, setShowAdd]   = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, lRes] = await Promise.all([
        axios.get(`${API}/api/store/customers/admin/${customerId}`, authHdr()),
        axios.get(`${API}/api/store/ledger/admin/${customerId}`, authHdr()),
      ]);
      setCustomer(cRes.data.data);
      setLedger(lRes.data.data);
      // orders by this customer
      const oRes = await axios.get(`${API}/api/store/orders/admin/all?limit=50`, authHdr());
      setOrders((oRes.data.data || []).filter(o => (o.customer?._id || o.customer) === customerId));
    } catch { toast.error("Failed to load details"); }
    finally { setLoading(false); }
  }, [customerId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const deleteEntry = async (entryId) => {
    if (!confirm("Remove this ledger entry?")) return;
    try {
      await axios.delete(`${API}/api/store/ledger/admin/${customerId}/entry/${entryId}`, authHdr());
      toast.success("Entry removed");
      loadAll();
    } catch (e) { toast.error(e.response?.data?.message || "Failed"); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", zIndex: 1300, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#fff", width: "min(560px, 100%)", height: "100%", overflowY: "auto", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Customer Details</h2>
          <button onClick={onClose} style={{ border: "none", background: "#f3f4f6", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        {loading || !customer ? (
          <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>Loading…</div>
        ) : (
          <>
            {/* Profile */}
            <div style={{ background: "#f9fafb", borderRadius: 12, padding: 16, marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{customer.name}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{customer.email} · {customer.phone || "no phone"}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <Tag text={customer.customerType} color={customer.customerType === "wholesale" ? "#2563eb" : "#16a34a"} />
                {customer.customerType === "wholesale" && <Tag text={customer.isApproved ? "Approved" : "Pending"} color={customer.isApproved ? "#16a34a" : "#d97706"} />}
              </div>
              {customer.customerType === "wholesale" && (
                <div style={{ marginTop: 12, display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <MetaItem label="Business" value={customer.businessName || "—"} />
                  <MetaItem label="GSTIN" value={customer.gstin || "—"} />
                  <MetaItem label="Credit Limit" value={`₹${customer.creditLimit || 0}`} />
                </div>
              )}
              {canWrite && customer.isApproved && onDelete && (
                <button
                  onClick={() => onDelete(customer)}
                  style={{ ...btnSm("#fef2f2", "#dc2626"), marginTop: 14, padding: "7px 14px" }}
                >
                  Delete customer
                </button>
              )}
            </div>

            {/* Ledger summary (wholesale) */}
            {customer.customerType === "wholesale" && ledger && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                <MiniStat label="Baaki" value={`₹${ledger.totalBaaki}`} color="#dc2626" />
                <MiniStat label="Jama" value={`₹${ledger.totalJama}`} color="#16a34a" />
                <MiniStat label="Balance" value={`₹${ledger.balance}`} color={ledger.balance > 0 ? "#d97706" : "#16a34a"} />
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 14 }}>
              {customer.customerType === "wholesale" && <TabBtn active={tab === "ledger"} onClick={() => setTab("ledger")}>Khata</TabBtn>}
              <TabBtn active={tab === "orders"} onClick={() => setTab("orders")}>Orders ({orders.length})</TabBtn>
            </div>

            {/* Ledger tab */}
            {tab === "ledger" && customer.customerType === "wholesale" && (
              <>
                {canWrite && (
                  <button onClick={() => setShowAdd(true)} style={{ ...btnSm("#16a34a", "#fff"), padding: "8px 16px", marginBottom: 14 }}>
                    + Add Entry (Jama / Baaki)
                  </button>
                )}
                {(ledger?.entries || []).length === 0 ? (
                  <div style={{ color: "#9ca3af", fontSize: 13, padding: 20, textAlign: "center" }}>No ledger entries yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {ledger.entries.map(e => (
                      <div key={e._id} style={{ border: "1px solid #f3f4f6", borderRadius: 10, padding: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: e.type === "jama" ? "#16a34a" : "#dc2626" }}>
                            {e.type === "jama" ? "Jama (Payment)" : "Baaki (Due)"} · ₹{e.amount}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{fmtDateTime(e.entryDate)}</div>
                          {e.note && <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{e.note}</div>}
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                            Balance: ₹{e.balanceAfter} · by {e.createdByName || e.source}
                          </div>
                        </div>
                        {canWrite && e.source !== "system" && (
                          <button onClick={() => deleteEntry(e._id)} style={btnSm("#fef2f2", "#dc2626")}>Del</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Orders tab */}
            {tab === "orders" && (
              orders.length === 0 ? (
                <div style={{ color: "#9ca3af", fontSize: 13, padding: 20, textAlign: "center" }}>No orders.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {orders.map(o => (
                    <div key={o._id} style={{ border: "1px solid #f3f4f6", borderRadius: 10, padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{o.orderNumber}</span>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>₹{o.totalAmount}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                        {fmtDateTime(o.createdAt)} · {o.orderType} · {o.orderStatus} · {o.paymentStatus}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Add entry modal */}
            {showAdd && (
              <AddEntryModal customerId={customerId} onClose={() => setShowAdd(false)} onDone={() => { setShowAdd(false); loadAll(); }} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Add ledger entry modal ──
function AddEntryModal({ customerId, onClose, onDone }) {
  const [form, setForm] = useState({ type: "jama", amount: "", note: "", paymentMethod: "cash", reference: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { toast.error("Enter a valid amount"); return; }
    setBusy(true);
    try {
      await axios.post(`${API}/api/store/ledger/admin/${customerId}/entry`, form, authHdr());
      toast.success(`${form.type === "jama" ? "Payment" : "Due"} recorded`);
      onDone();
    } catch (e2) { toast.error(e2.response?.data?.message || "Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <form onClick={e => e.stopPropagation()} onSubmit={submit} style={{ background: "#fff", borderRadius: 16, padding: 24, width: "min(420px, 100%)" }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 16px" }}>Add Ledger Entry</h3>

        {/* Type toggle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {[{ v: "jama", l: "Jama (Payment In)", c: "#16a34a" }, { v: "baaki", l: "Baaki (Due)", c: "#dc2626" }].map(t => (
            <button key={t.v} type="button" onClick={() => setForm(f => ({ ...f, type: t.v }))} style={{
              flex: 1, padding: "10px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700,
              border: form.type === t.v ? `2px solid ${t.c}` : "2px solid #e5e7eb",
              background: form.type === t.v ? `${t.c}12` : "#fff", color: form.type === t.v ? t.c : "#374151",
            }}>{t.l}</button>
          ))}
        </div>

        <Field label="Amount (₹) *"><input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inp} autoFocus /></Field>
        {form.type === "jama" && (
          <Field label="Payment Method">
            <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} style={inp}>
              {["cash", "upi", "bank", "cheque", "online", "adjustment"].map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
        )}
        <Field label="Reference (optional)"><input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} style={inp} placeholder="e.g. UPI txn id, bill no" /></Field>
        <Field label="Note (optional)"><input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={inp} /></Field>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 11, border: "1px solid #e5e7eb", background: "#fff", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button type="submit" disabled={busy} style={{ flex: 2, padding: 11, border: "none", background: "#16a34a", color: "#fff", borderRadius: 10, fontWeight: 800, cursor: "pointer" }}>
            {busy ? "Saving…" : "Save Entry"}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Small UI helpers ──
const btnSm = (bg, color) => ({ background: bg, color, border: "none", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" });
const inp = { width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 12px", fontSize: 13, outline: "none", boxSizing: "border-box" };

function Field({ label, children }) { return <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 5 }}>{label}</label>{children}</div>; }
function Tag({ text, color }) { return <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, background: `${color}15`, color, textTransform: "capitalize" }}>{text}</span>; }
function MetaItem({ label, value }) { return <div><div style={{ fontSize: 10, color: "#9ca3af", textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{value}</div></div>; }
function MiniStat({ label, value, color }) { return <div style={{ background: `${color}10`, borderRadius: 10, padding: "12px", textAlign: "center" }}><div style={{ fontSize: 16, fontWeight: 900, color }}>{value}</div><div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div></div>; }
function TabBtn({ active, onClick, children }) { return <button onClick={onClick} style={{ border: "none", background: "none", cursor: "pointer", padding: "9px 16px", fontSize: 13, fontWeight: 700, color: active ? "#16a34a" : "#6b7280", borderBottom: active ? "3px solid #16a34a" : "3px solid transparent", marginBottom: -2 }}>{children}</button>; }
