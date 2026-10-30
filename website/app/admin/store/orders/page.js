"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const getToken = () => typeof window !== "undefined" ? localStorage.getItem("token") : "";

const STATUS_OPTS = ["placed","confirmed","processing","shipped","out_for_delivery","delivered","cancelled","returned"];
const STATUS_COLORS = {
  placed:{bg:"#eff6ff",color:"#2563eb"}, confirmed:{bg:"#f0fdf4",color:"#16a34a"},
  processing:{bg:"#fff7ed",color:"#ea580c"}, shipped:{bg:"#fefce8",color:"#ca8a04"},
  out_for_delivery:{bg:"#fefce8",color:"#d97706"}, delivered:{bg:"#f0fdf4",color:"#16a34a"},
  cancelled:{bg:"#fef2f2",color:"#dc2626"}, returned:{bg:"#f3f4f6",color:"#6b7280"},
};

export default function AdminOrdersPage() {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [stats,     setStats]     = useState(null);
  const [page,      setPage]      = useState(1);
  const [total,     setTotal]     = useState(0);
  const [filter,     setFilter]     = useState("");
  const [typeFilter, setTypeFilter] = useState("");  // "" | retail | wholesale
  const [newStatus,  setNewStatus]  = useState("");
  const [note,       setNote]       = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [updating,   setUpdating]   = useState(false);

  const LIMIT = 25;

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit:LIMIT });
    if (filter)     params.set("status", filter);
    if (typeFilter) params.set("type", typeFilter);
    axios.get(`${API}/api/store/orders/admin/all?${params}`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r => { setOrders(r.data.data||[]); setTotal(r.data.pagination?.total||0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, filter, typeFilter]);

  useEffect(() => {
    load();
    axios.get(`${API}/api/store/orders/admin/dashboard`, { headers:{ Authorization:`Bearer ${getToken()}` } })
      .then(r => setStats(r.data.data))
      .catch(() => {});
  }, [load]);

  const openOrder = (o) => {
    setSelected(o);
    setNewStatus(o.orderStatus);
    setNote("");
    setTrackingNo(o.trackingNumber || "");
    setDeliveryDate(o.deliveryDate ? new Date(o.deliveryDate).toISOString().slice(0,10) : "");
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const payload = { status: newStatus, note };
      if (trackingNo)   payload.trackingNumber = trackingNo;
      if (deliveryDate) payload.deliveryDate   = deliveryDate;
      const r = await axios.put(`${API}/api/store/orders/admin/${selected._id}/status`,
        payload,
        { headers:{ Authorization:`Bearer ${getToken()}` } }
      );
      toast.success("Status updated!");
      setSelected(r.data.data);
      setNote("");
      load();
    } catch { toast.error("Update failed"); }
    finally { setUpdating(false); }
  };

  return (
    <div style={{ padding:24 }}>
      <Toaster position="top-right" />
      <h1 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 20px" }}>📦 Orders</h1>

      {/* Stats */}
      {stats && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:12, marginBottom:24 }}>
          {[
            { label:"Total Orders",    value:stats.totalOrders,    icon:"📋", color:"#2563eb" },
            { label:"Pending",         value:stats.pendingOrders,  icon:"⏳", color:"#d97706" },
            { label:"Total Customers", value:stats.totalCustomers, icon:"👥", color:"#7c3aed" },
            { label:"Revenue",         value:`₹${stats.totalRevenue}`, icon:"💰", color:"#16a34a" },
          ].map(s => (
            <div key={s.label} style={{ background:"#fff", borderRadius:14, padding:"16px 18px", border:"1px solid #f3f4f6" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:22, fontWeight:900, color:s.color }}>{s.value}</div>
              <div style={{ fontSize:11, color:"#9ca3af", fontWeight:600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Type filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
        {[{v:"",l:"All Types"},{v:"retail",l:"Retail"},{v:"wholesale",l:"Wholesale"}].map(f => (
          <button key={f.v} onClick={() => { setTypeFilter(f.v); setPage(1); }} style={{
            padding:"5px 14px", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer",
            border: typeFilter===f.v?"none":"1px solid #e5e7eb",
            background: typeFilter===f.v?"#2563eb":"#fff",
            color: typeFilter===f.v?"#fff":"#374151",
          }}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Status filter tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16, flexWrap:"wrap" }}>
        {[{v:"",l:"All"},...STATUS_OPTS.map(s=>({v:s,l:s.replace("_"," ")}))].map(f => (
          <button key={f.v} onClick={() => { setFilter(f.v); setPage(1); }} style={{
            padding:"5px 12px", borderRadius:20, fontSize:12, fontWeight:700, cursor:"pointer",
            border: filter===f.v?"none":"1px solid #e5e7eb",
            background: filter===f.v?"#16a34a":"#fff",
            color: filter===f.v?"#fff":"#374151",
            textTransform:"capitalize",
          }}>
            {f.l}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Loading...</div>
      ) : (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #e5e7eb", overflow:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:700 }}>
            <thead>
              <tr style={{ background:"#f9fafb", borderBottom:"1px solid #e5e7eb" }}>
                {["Order #","Customer","Items","Total","Payment","Status","Date","Actions"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length===0 ? (
                <tr><td colSpan={8} style={{ textAlign:"center", padding:40, color:"#9ca3af" }}>No orders found</td></tr>
              ) : orders.map(o => {
                const sc = STATUS_COLORS[o.orderStatus] || {bg:"#f3f4f6",color:"#6b7280"};
                return (
                  <tr key={o._id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                    <td style={{ padding:"11px 12px", fontWeight:800, fontSize:13, color:"#111827", whiteSpace:"nowrap" }}>{o.orderNumber}</td>
                    <td style={{ padding:"11px 12px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>{o.customer?.name||"—"}</div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{o.customer?.phone||""}</div>
                    </td>
                    <td style={{ padding:"11px 12px", fontSize:13, color:"#6b7280" }}>{o.items?.length}</td>
                    <td style={{ padding:"11px 12px", fontSize:14, fontWeight:800, color:"#111827" }}>₹{o.totalAmount}</td>
                    <td style={{ padding:"11px 12px" }}>
                      <span style={{ fontSize:11, fontWeight:700, textTransform:"capitalize",
                        background:o.paymentStatus==="paid"?"#f0fdf4":"#fff7ed",
                        color:o.paymentStatus==="paid"?"#16a34a":"#d97706",
                        padding:"2px 8px", borderRadius:20 }}>
                        {o.paymentStatus}
                      </span>
                    </td>
                    <td style={{ padding:"11px 12px" }}>
                      <span style={{ fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20,
                        background:sc.bg, color:sc.color, textTransform:"capitalize", whiteSpace:"nowrap" }}>
                        {o.orderStatus.replace("_"," ")}
                      </span>
                    </td>
                    <td style={{ padding:"11px 12px", fontSize:12, color:"#9ca3af", whiteSpace:"nowrap" }}>
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding:"11px 12px" }}>
                      <button onClick={() => openOrder(o)} style={{ background:"#eff6ff", color:"#2563eb", border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:700, cursor:"pointer" }}>
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {Math.ceil(total/LIMIT) > 1 && (
        <div style={{ display:"flex", gap:6, marginTop:14 }}>
          {Array(Math.ceil(total/LIMIT)).fill(0).map((_,i) => (
            <button key={i} onClick={() => setPage(i+1)} style={{
              width:32, height:32, borderRadius:6,
              border:page===i+1?"none":"1px solid #e5e7eb",
              background:page===i+1?"#16a34a":"#fff",
              color:page===i+1?"#fff":"#374151",
              cursor:"pointer", fontSize:13, fontWeight:700,
            }}>
              {i+1}
            </button>
          ))}
        </div>
      )}

      {/* Order detail drawer */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.4)", zIndex:1000,
          display:"flex", justifyContent:"flex-end" }} onClick={() => setSelected(null)}>
          <div style={{ background:"#fff", width:"100%", maxWidth:500, height:"100%", overflowY:"auto", padding:24 }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, margin:0 }}>{selected.orderNumber}</h2>
              <button onClick={() => setSelected(null)} style={{ border:"none", background:"none", fontSize:22, cursor:"pointer" }}>×</button>
            </div>

            {/* Customer */}
            <Section title="Customer">
              <p style={info}><b>Name:</b> {selected.customer?.name}</p>
              <p style={info}><b>Email:</b> {selected.customer?.email}</p>
              <p style={info}><b>Phone:</b> {selected.customer?.phone}</p>
            </Section>

            {/* Address */}
            <Section title="Delivery Address">
              <p style={{ ...info, lineHeight:1.7 }}>
                {selected.shippingAddress?.fullName} · {selected.shippingAddress?.phone}<br/>
                {selected.shippingAddress?.line1}, {selected.shippingAddress?.city}, {selected.shippingAddress?.state} - {selected.shippingAddress?.pincode}
              </p>
            </Section>

            {/* Items */}
            <Section title={`Items (${selected.items?.length})`}>
              {selected.items?.map((item,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", paddingBottom:8, borderBottom:"1px solid #f3f4f6", marginBottom:8 }}>
                  <span style={{ fontSize:13, color:"#374151" }}>{item.name} ×{item.quantity}</span>
                  <span style={{ fontSize:13, fontWeight:700 }}>₹{item.itemTotal}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, paddingTop:8, borderTop:"2px solid #e5e7eb" }}>
                <span style={{ fontSize:15, fontWeight:800 }}>Total</span>
                <span style={{ fontSize:15, fontWeight:900, color:"#16a34a" }}>₹{selected.totalAmount}</span>
              </div>
            </Section>

            {/* Update status */}
            <Section title="Update Status">
              <label style={fieldLabel}>Status</label>
              <select value={newStatus} onChange={e=>setNewStatus(e.target.value)}
                style={fieldInput}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>

              <label style={fieldLabel}>Note (shown to customer)</label>
              <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Packed and ready to ship"
                style={fieldInput} />

              <div style={{ display:"flex", gap:10 }}>
                <div style={{ flex:1 }}>
                  <label style={fieldLabel}>Tracking No.</label>
                  <input value={trackingNo} onChange={e=>setTrackingNo(e.target.value)} placeholder="Optional"
                    style={fieldInput} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={fieldLabel}>Delivery Date</label>
                  <input type="date" value={deliveryDate} onChange={e=>setDeliveryDate(e.target.value)}
                    style={fieldInput} />
                </div>
              </div>

              <button onClick={handleUpdateStatus} disabled={updating} style={{
                width:"100%", marginTop:4, padding:"10px 16px", background:"#16a34a", color:"#fff",
                border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:700,
                opacity: updating ? .5 : 1,
              }}>
                {updating ? "Updating..." : "Save Status Update"}
              </button>
            </Section>

            {/* Status history timeline */}
            <Section title={`Tracking History (${selected.statusHistory?.length || 0})`}>
              {(!selected.statusHistory || selected.statusHistory.length === 0) ? (
                <p style={{ ...info, color:"#9ca3af" }}>No updates yet.</p>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                  {[...selected.statusHistory].reverse().map((h, i, arr) => {
                    const sc = STATUS_COLORS[h.status] || {bg:"#f3f4f6",color:"#6b7280"};
                    const latest = i === 0;
                    return (
                      <div key={i} style={{ display:"flex", gap:12 }}>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                          <div style={{ width:12, height:12, borderRadius:"50%", background:sc.color,
                            boxShadow: latest ? `0 0 0 4px ${sc.bg}` : "none", marginTop:4, flexShrink:0 }} />
                          {i < arr.length-1 && <div style={{ width:2, flex:1, background:"#e5e7eb", minHeight:22 }} />}
                        </div>
                        <div style={{ paddingBottom:14 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"#111827", textTransform:"capitalize" }}>
                            {h.status?.replace("_"," ")}
                          </div>
                          {h.note && <div style={{ fontSize:12, color:"#6b7280", marginTop:1 }}>{h.note}</div>}
                          <div style={{ fontSize:11, color:"#9ca3af", marginTop:2 }}>
                            {new Date(h.updatedAt).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Section>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom:20, background:"#f9fafb", borderRadius:12, padding:14 }}>
      <h4 style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", margin:"0 0 10px", letterSpacing:".05em" }}>{title}</h4>
      {children}
    </div>
  );
}

const info = { margin:"0 0 4px", fontSize:13, color:"#374151" };
const fieldLabel = { display:"block", fontSize:11, fontWeight:700, color:"#6b7280", margin:"0 0 4px" };
const fieldInput = { width:"100%", boxSizing:"border-box", border:"1px solid #e5e7eb", borderRadius:8, padding:"8px 12px", fontSize:13, outline:"none", marginBottom:12 };
