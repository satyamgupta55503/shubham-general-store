"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const BASE_MENU = [
  { href:"/account",            label:"My Profile"    },
  { href:"/account/orders",     label:"My Orders"     },
  { href:"/account/quotations", label:"My Quotations" },
  { href:"/account/invoices",   label:"My Invoices"   },
  { href:"/account/addresses",  label:"Addresses"     },
  { href:"/account/wishlist",   label:"Wishlist"      },
];

export default function AccountPage() {
  const { customer, token, logout, refreshMe } = useCustomerAuth();
  const router = useRouter();
  const [editing,  setEditing]  = useState(false);
  const [form,     setForm]     = useState({ name:"", phone:"", gender:"", dob:"" });
  const [saving,   setSaving]   = useState(false);
  const [orders,   setOrders]   = useState([]);

  useEffect(() => {
    if (!token) router.push("/account/login");
  }, [token, router]);

  useEffect(() => {
    if (customer) {
      setForm({ name:customer.name||"", phone:customer.phone||"", gender:customer.gender||"", dob:customer.dob ? customer.dob.slice(0,10) : "" });
    }
  }, [customer]);

  useEffect(() => {
    if (!token) return;
    axios.get(`${API}/api/store/orders/my?limit=5`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setOrders(r.data.data || []))
      .catch(() => {});
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/api/store/customers/me`, form, { headers:{ Authorization:`Bearer ${token}` } });
      await refreshMe();
      toast.success("Profile updated!");
      setEditing(false);
    } catch {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!customer) return (
    <StoreLayout>
      <div style={{ textAlign:"center", padding:80 }}>
        <div style={{ fontSize:48, marginBottom:12 }}></div>
        <p style={{ color:"#9ca3af" }}>Loading your profile...</p>
      </div>
    </StoreLayout>
  );

  return (
    <StoreLayout>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 20px" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#111827", margin:"0 0 28px" }}>My Account</h1>

        <div className="account-grid">
          {/* Sidebar */}
          <aside>
            {/* Profile card */}
            <div style={{ background:"linear-gradient(135deg,#16a34a,#15803d)", borderRadius:20, padding:20, textAlign:"center", marginBottom:12, color:"#fff" }}>
              <div style={{
                width:64, height:64, borderRadius:"50%",
                background:"rgba(255,255,255,.2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 10px", fontSize:28,
              }}>
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight:800, fontSize:15 }}>{customer.name}</div>
              <div style={{ fontSize:11, opacity:.8, marginTop:2 }}>{customer.email}</div>
            </div>

            {/* Nav */}
            <div style={{ background:"#fff", borderRadius:16, overflow:"hidden", border:"1px solid #f3f4f6" }}>
              {[
                ...BASE_MENU,
                ...(customer?.customerType === "wholesale" ? [{ href:"/account/ledger", label:"Khata / Ledger" }] : []),
              ].map(m => (
                <Link key={m.href} href={m.href} className="account-nav-link" style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"12px 16px", textDecoration:"none",
                  fontSize:14, fontWeight:600,
                  color:"#374151",
                  borderBottom:"1px solid #f9fafb",
                }}>
                  <span>{m.icon}</span> {m.label}
                </Link>
              ))}
              <button onClick={() => { logout(); router.push("/"); }} style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"12px 16px", width:"100%",
                border:"none", background:"none", cursor:"pointer",
                fontSize:14, fontWeight:600, color:"#ef4444", textAlign:"left",
              }}>
                 Logout
              </button>
            </div>
          </aside>

          {/* Main */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            {/* Wholesale account banner */}
            {customer.customerType === "wholesale" && (
              <div style={{
                background: customer.isApproved ? "linear-gradient(135deg,#16a34a,#15803d)" : "linear-gradient(135deg,#d97706,#b45309)",
                borderRadius: 16, padding: "16px 20px", color: "#fff",
                display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, opacity: .9 }}>Wholesale Account {customer.businessName ? `· ${customer.businessName}` : ""}</div>
                  <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>
                    {customer.isApproved ? "Approved — thok (bulk) prices active" : "Pending admin approval for thok prices"}
                  </div>
                </div>
                {customer.isApproved && (
                  <Link href="/account/ledger" style={{
                    background: "rgba(255,255,255,.2)", color: "#fff", textDecoration: "none",
                    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                  }}>
                    Khata: ₹{customer.outstandingBalance || 0} due →
                  </Link>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="account-stats-grid" style={{ marginBottom: 20 }}>
              {[
                { value: customer.totalOrders || 0,        label: "Total Orders" },
                { value: `₹${customer.totalSpent || 0}`,   label: "Total Spent" },
                ...(customer.customerType === "wholesale"
                  ? [{ value: `₹${customer.outstandingBalance || 0}`, label: "Outstanding (Baaki)" }]
                  : [{ value: customer.wishlist?.length || 0, label: "Wishlist Items" }]),
              ].map(s => (
                <div key={s.label} style={{
                  background: "#fff", borderRadius: 16, padding: "20px 16px", textAlign: "center",
                  border: "1px solid #f3f4f6",
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Profile form */}
            <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #f3f4f6" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:0 }}>Personal Information</h2>
                <button onClick={() => setEditing(!editing)} style={{
                  border:"1px solid #e5e7eb", background:editing?"#fef2f2":"#f9fafb",
                  color:editing?"#ef4444":"#374151",
                  padding:"6px 14px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
                }}>
                  {editing ? "Cancel" : " Edit"}
                </button>
              </div>

              <div className="profile-form-grid">
                {[
                  { key:"name",   label:"Full Name",   type:"text" },
                  { key:"phone",  label:"Phone",        type:"tel" },
                  { key:"gender", label:"Gender",       type:"select", opts:[{v:"",l:"Prefer not to say"},{v:"male",l:"Male"},{v:"female",l:"Female"},{v:"other",l:"Other"}] },
                  { key:"dob",    label:"Date of Birth",type:"date" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:4 }}>{f.label}</label>
                    {f.type === "select" ? (
                      <select value={form[f.key]} disabled={!editing}
                        onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                        style={{ ...fi, background:editing?"#fff":"#f9fafb" }}>
                        {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={form[f.key]} disabled={!editing}
                        onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                        style={{ ...fi, background:editing?"#fff":"#f9fafb" }} />
                    )}
                  </div>
                ))}

                <div style={{ gridColumn:"1/-1" }}>
                  <label style={{ fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:4 }}>Email</label>
                  <input type="email" value={customer.email} disabled style={{ ...fi, background:"#f9fafb", color:"#9ca3af" }} />
                </div>
              </div>

              {editing && (
                <button onClick={handleSave} disabled={saving} style={{
                  marginTop:16, padding:"11px 28px",
                  background:"#16a34a", color:"#fff",
                  border:"none", borderRadius:10, fontSize:14, fontWeight:800, cursor:"pointer",
                }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #f3f4f6" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                  <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:0 }}>Recent Orders</h2>
                  <Link href="/account/orders" style={{ fontSize:13, color:"#16a34a", textDecoration:"none", fontWeight:700 }}>
                    View All →
                  </Link>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {orders.map(o => (
                    <Link key={o._id} href={`/account/orders/${o._id}`} className="order-preview-link" style={{
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      padding:"12px 14px", borderRadius:12,
                      background:"#f9fafb", border:"1px solid #f3f4f6",
                      textDecoration:"none",
                    }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{o.orderNumber}</div>
                        <div style={{ fontSize:12, color:"#9ca3af" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:14, fontWeight:800, color:"#111827" }}>₹{o.totalAmount}</div>
                        <StatusBadge status={o.orderStatus} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </StoreLayout>
  );
}

function StatusBadge({ status }) {
  const colors = {
    placed:           { bg:"#eff6ff", color:"#2563eb" },
    confirmed:        { bg:"#f0fdf4", color:"#16a34a" },
    processing:       { bg:"#fff7ed", color:"#ea580c" },
    shipped:          { bg:"#fefce8", color:"#ca8a04" },
    out_for_delivery: { bg:"#fefce8", color:"#ca8a04" },
    delivered:        { bg:"#f0fdf4", color:"#16a34a" },
    cancelled:        { bg:"#fef2f2", color:"#dc2626" },
    returned:         { bg:"#f3f4f6", color:"#6b7280" },
  };
  const c = colors[status] || { bg:"#f3f4f6", color:"#6b7280" };
  return (
    <span style={{ fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20, background:c.bg, color:c.color, textTransform:"uppercase" }}>
      {status.replace("_"," ")}
    </span>
  );
}

const fi = {
  width:"100%", border:"1px solid #e5e7eb", borderRadius:8,
  padding:"9px 12px", fontSize:13, outline:"none", boxSizing:"border-box",
};
