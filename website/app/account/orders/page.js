"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STATUS_CONFIG = {
  placed:           { color:"#2563eb", bg:"#eff6ff",  label:"Order Placed",     icon:"" },
  confirmed:        { color:"#16a34a", bg:"#f0fdf4",  label:"Confirmed",        icon:"" },
  processing:       { color:"#ea580c", bg:"#fff7ed",  label:"Processing",       icon:"" },
  shipped:          { color:"#ca8a04", bg:"#fefce8",  label:"Shipped",          icon:"" },
  out_for_delivery: { color:"#d97706", bg:"#fefce8",  label:"Out for Delivery", icon:"" },
  delivered:        { color:"#16a34a", bg:"#f0fdf4",  label:"Delivered",        icon:"" },
  cancelled:        { color:"#dc2626", bg:"#fef2f2",  label:"Cancelled",        icon:"" },
  returned:         { color:"#6b7280", bg:"#f3f4f6",  label:"Returned",         icon:"↩" },
};

export default function OrdersPage() {
  const { token, customer } = useCustomerAuth();
  const router = useRouter();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [filter,  setFilter]  = useState("");

  useEffect(() => {
    if (!token) router.push("/account/login");
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({ page, limit:10 });
    if (filter) params.set("status", filter);
    axios.get(`${API}/api/store/orders/my?${params}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => { setOrders(r.data.data||[]); setTotal(r.data.pagination?.total||0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token, page, filter]);

  return (
    <StoreLayout>
      <div style={{ maxWidth:900, margin:"0 auto", padding:"32px 20px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <Link href="/account" style={{ color:"#6b7280", textDecoration:"none", fontSize:13 }}>← My Account</Link>
          <span style={{ color:"#d1d5db" }}>/</span>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#111827", margin:0 }}>My Orders ({total})</h1>
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
          {[
            { value:"", label:"All Orders" },
            { value:"placed",    label:"Placed" },
            { value:"processing",label:"Processing" },
            { value:"shipped",   label:"Shipped" },
            { value:"delivered", label:"Delivered" },
            { value:"cancelled", label:"Cancelled" },
          ].map(f => (
            <button key={f.value} onClick={() => { setFilter(f.value); setPage(1); }} style={{
              padding:"6px 14px", borderRadius:20,
              border: filter===f.value ? "none" : "1px solid #e5e7eb",
              background: filter===f.value ? "#16a34a" : "#fff",
              color: filter===f.value ? "#fff" : "#374151",
              fontSize:13, fontWeight:600, cursor:"pointer",
              transition:"all .2s",
            }}>
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <div style={{ fontSize:40 }}></div>
            <p style={{ color:"#9ca3af", marginTop:8 }}>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:60, marginBottom:16 }}></div>
            <h3 style={{ color:"#374151", fontSize:20 }}>No orders yet</h3>
            <p style={{ color:"#9ca3af", marginBottom:20 }}>Start shopping to see your orders here</p>
            <Link href="/products" style={{
              display:"inline-block", padding:"10px 24px",
              background:"#16a34a", color:"#fff", borderRadius:8,
              textDecoration:"none", fontWeight:700,
            }}>
              Shop Now →
            </Link>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {orders.map(order => {
              const sc = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
              return (
                <Link key={order._id} href={`/account/orders/${order._id}`} style={{ textDecoration:"none" }}>
                  <div style={{
                    background:"#fff", borderRadius:16, padding:20,
                    border:"1px solid #f3f4f6",
                    boxShadow:"0 2px 8px rgba(0,0,0,.04)",
                    transition:"all .2s", cursor:"pointer",
                  }}
                    className="order-list-card"
                  >
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:16 }}>{sc.icon}</span>
                          <span style={{ fontSize:15, fontWeight:800, color:"#111827" }}>{order.orderNumber}</span>
                          <span style={{
                            fontSize:11, fontWeight:700, padding:"2px 10px", borderRadius:20,
                            background:sc.bg, color:sc.color, textTransform:"uppercase",
                          }}>
                            {sc.label}
                          </span>
                        </div>
                        <div style={{ fontSize:13, color:"#9ca3af" }}>
                          Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:18, fontWeight:900, color:"#111827" }}>₹{order.totalAmount}</div>
                        <div style={{ fontSize:12, color:"#9ca3af" }}>{order.items?.length} item{order.items?.length!==1?"s":""}</div>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
                      {order.items?.slice(0,4).map((item,i) => (
                        <span key={i} style={{
                          fontSize:12, color:"#6b7280",
                          background:"#f9fafb", padding:"3px 10px",
                          borderRadius:20, border:"1px solid #e5e7eb",
                        }}>
                          {item.name} ×{item.quantity}
                        </span>
                      ))}
                      {order.items?.length > 4 && (
                        <span style={{ fontSize:12, color:"#9ca3af" }}>+{order.items.length-4} more</span>
                      )}
                    </div>

                    <div style={{ marginTop:10, fontSize:12, color:"#16a34a", fontWeight:700 }}>
                      View Order Details →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {Math.ceil(total/10) > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:24 }}>
            {Array(Math.ceil(total/10)).fill(0).map((_,i) => (
              <button key={i} onClick={() => setPage(i+1)} style={{
                width:36, height:36, borderRadius:8,
                border: page===i+1?"none":"1px solid #e5e7eb",
                background: page===i+1?"#16a34a":"#fff",
                color: page===i+1?"#fff":"#374151",
                cursor:"pointer", fontWeight:600,
              }}>
                {i+1}
              </button>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
