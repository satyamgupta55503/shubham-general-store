"use client";
import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STATUS_STEPS = ["placed","confirmed","processing","shipped","out_for_delivery","delivered"];

function OrderDetailContent() {
  const { id }   = useParams();
  const sp       = useSearchParams();
  const success  = sp.get("success");
  const router   = useRouter();
  const { token } = useCustomerAuth();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!token) { router.push("/account/login"); return; }
    axios.get(`${API}/api/store/orders/my/${id}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setOrder(r.data.data))
      .catch(() => router.push("/account/orders"))
      .finally(() => setLoading(false));
  }, [id, token, router]);

  const handleCancel = async () => {
    if (!confirm("Cancel this order?")) return;
    setCancelling(true);
    try {
      const r = await axios.post(`${API}/api/store/orders/my/${id}/cancel`,
        { reason:"Cancelled by customer" },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setOrder(r.data.data);
      toast.success("Order cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Cannot cancel");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign:"center", padding:80 }}>
      <div style={{ fontSize:40 }}></div>
      <p style={{ color:"#9ca3af" }}>Loading order...</p>
    </div>
  );
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled" || order.orderStatus === "returned";

  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding:"32px 20px" }}>
      {/* Success banner */}
      {success && (
        <div style={{
          background:"linear-gradient(135deg,#16a34a,#15803d)",
          borderRadius:16, padding:"20px 24px", marginBottom:24,
          display:"flex", alignItems:"center", gap:16, color:"#fff",
        }}>
          <span style={{ fontSize:36 }}></span>
          <div>
            <div style={{ fontSize:18, fontWeight:800 }}>Order Placed Successfully!</div>
            <div style={{ fontSize:13, opacity:.8 }}>Thank you for shopping with Subham General Store. We'll confirm your order shortly.</div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{ display:"flex", gap:6, marginBottom:24, fontSize:13, color:"#6b7280", alignItems:"center" }}>
        <Link href="/account/orders" style={{ color:"#6b7280", textDecoration:"none" }}>← My Orders</Link>
        <span>/</span>
        <span style={{ color:"#111827", fontWeight:600 }}>{order.orderNumber}</span>
      </div>

      {/* Status tracker */}
      {!isCancelled && (
        <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #f3f4f6", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:"#111827", margin:"0 0 20px" }}>Order Progress</h2>
          <div style={{ display:"flex", alignItems:"center", gap:0, overflow:"auto" }}>
            {STATUS_STEPS.map((s, i) => {
              const done    = currentStep >= i;
              const current = currentStep === i;
              const labels  = ["Placed","Confirmed","Processing","Shipped","Out for Delivery","Delivered"];
              return (
                <div key={s} style={{ display:"flex", alignItems:"center", flex:1 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:80 }}>
                    <div style={{
                      width:40, height:40, borderRadius:"50%",
                      background: done ? "#16a34a" : "#e5e7eb",
                      color: done ? "#fff" : "#9ca3af",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:16, fontWeight:800,
                      boxShadow: current ? "0 0 0 4px rgba(22,163,74,.2)" : "none",
                      transition:"all .3s",
                    }}>
                      {done ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : i + 1}
                    </div>
                    <span style={{
                      fontSize:10, fontWeight:700, marginTop:6, textAlign:"center",
                      color: done ? "#16a34a" : "#9ca3af",
                    }}>
                      {labels[i]}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length-1 && (
                    <div style={{ flex:1, height:3, background: currentStep>i?"#16a34a":"#e5e7eb", transition:"background .3s" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div style={{ background:"#fef2f2", borderRadius:16, padding:16, marginBottom:20, border:"1px solid #fecaca" }}>
          <div style={{ fontSize:16, fontWeight:800, color:"#dc2626" }}>Order {order.orderStatus === "returned" ? "Returned" : "Cancelled"}</div>
          {order.cancelReason && <div style={{ fontSize:13, color:"#9ca3af", marginTop:4 }}>Reason: {order.cancelReason}</div>}
          {order.returnReason && <div style={{ fontSize:13, color:"#9ca3af", marginTop:4 }}>Reason: {order.returnReason}</div>}
        </div>
      )}

      {/* Tracking history — date + time + note of every update */}
      {order.statusHistory?.length > 0 && (
        <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #f3f4f6", marginBottom:20 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:"#111827", margin:"0 0 18px" }}>Tracking Updates</h2>
          <div style={{ display:"flex", flexDirection:"column" }}>
            {[...order.statusHistory].reverse().map((h, i, arr) => {
              const latest = i === 0;
              const isCancel = h.status === "cancelled" || h.status === "returned";
              const dotColor = isCancel ? "#dc2626" : "#16a34a";
              return (
                <div key={i} style={{ display:"flex", gap:14 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{
                      width:14, height:14, borderRadius:"50%", background:dotColor, marginTop:4, flexShrink:0,
                      boxShadow: latest ? `0 0 0 4px ${isCancel ? "rgba(220,38,38,.15)" : "rgba(22,163,74,.15)"}` : "none",
                    }} />
                    {i < arr.length-1 && <div style={{ width:2, flex:1, background:"#e5e7eb", minHeight:26 }} />}
                  </div>
                  <div style={{ paddingBottom:16 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#111827", textTransform:"capitalize" }}>
                      {h.status?.replace("_"," ")}
                    </div>
                    {h.note && <div style={{ fontSize:13, color:"#6b7280", marginTop:2 }}>{h.note}</div>}
                    <div style={{ fontSize:12, color:"#9ca3af", marginTop:3 }}>
                      {new Date(h.updatedAt).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="order-detail-grid">
        {/* Left */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Items */}
          <div style={{ background:"#fff", borderRadius:20, padding:20, border:"1px solid #f3f4f6" }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#111827", margin:"0 0 16px" }}>
              Items ({order.items?.length})
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"center", paddingBottom:12, borderBottom:"1px solid #f9fafb" }}>
                  <div style={{
                    width:56, height:56, borderRadius:10, background:"#f9fafb",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:24, flexShrink:0,
                  }}>
                    {item.thumbnail ? (
                      <img src={`${API}/${item.thumbnail}`} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:10 }} />
                    ) : ""}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:"#111827" }}>{item.name}</div>
                    {item.packSize && <div style={{ fontSize:11, color:"#9ca3af" }}>{item.packSize}</div>}
                    <div style={{ fontSize:13, color:"#6b7280" }}>₹{item.price} × {item.quantity}</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#111827" }}>₹{item.itemTotal}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div style={{ background:"#fff", borderRadius:20, padding:20, border:"1px solid #f3f4f6" }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#111827", margin:"0 0 12px" }}> Delivery Address</h3>
            <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.7 }}>
              <strong>{order.shippingAddress?.fullName}</strong><br/>
              {order.shippingAddress?.phone}<br/>
              {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}<br/>
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
          </div>

          {/* Cancel button */}
          {["placed","confirmed"].includes(order.orderStatus) && (
            <button onClick={handleCancel} disabled={cancelling} style={{
              padding:"11px", border:"1px solid #fecaca",
              background:"#fef2f2", color:"#dc2626",
              borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer",
            }}>
              {cancelling ? "Cancelling..." : " Cancel Order"}
            </button>
          )}
        </div>

        {/* Right: summary */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:"#fff", borderRadius:20, padding:20, border:"1px solid #f3f4f6" }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#111827", margin:"0 0 14px" }}> Price Summary</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Subtotal",  value:`₹${order.subtotal}` },
                { label:"Shipping",  value:order.shippingCharge===0?"FREE":  `₹${order.shippingCharge}`, color:order.shippingCharge===0?"#16a34a":undefined },
                { label:"Discount",  value:order.discount>0?`-₹${order.discount}`:null, color:"#16a34a" },
              ].filter(r=>r.value).map(r => (
                <div key={r.label} style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:13, color:"#6b7280" }}>{r.label}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:r.color||"#111827" }}>{r.value}</span>
                </div>
              ))}
              <div style={{ borderTop:"2px solid #f3f4f6", paddingTop:10, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:15, fontWeight:800, color:"#111827" }}>Total</span>
                <span style={{ fontSize:18, fontWeight:900, color:"#111827" }}>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div style={{ background:"#fff", borderRadius:20, padding:20, border:"1px solid #f3f4f6" }}>
            <h3 style={{ fontSize:16, fontWeight:800, color:"#111827", margin:"0 0 12px" }}> Order Info</h3>
            {[
              { label:"Order #",   value:order.orderNumber },
              { label:"Date",      value:new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) },
              { label:"Payment",   value:order.paymentMethod==="cod"?"Cash on Delivery":order.paymentMethod.toUpperCase() },
              { label:"Pay Status",value:order.paymentStatus },
            ].map(r => (
              <div key={r.label} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#9ca3af" }}>{r.label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#374151", textTransform:"capitalize" }}>{r.value}</span>
              </div>
            ))}
            {order.trackingNumber && (
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#9ca3af" }}>Tracking</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#16a34a" }}>{order.trackingNumber}</span>
              </div>
            )}
            {order.deliveryDate && (
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#9ca3af" }}>Est. Delivery</span>
                <span style={{ fontSize:12, fontWeight:700, color:"#374151" }}>
                  {new Date(order.deliveryDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <StoreLayout>
      <Suspense>
        <OrderDetailContent />
      </Suspense>
    </StoreLayout>
  );
}
