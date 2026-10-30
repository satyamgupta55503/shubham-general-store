"use client";
import { useState } from "react";
import Link   from "next/link";
import { useRouter } from "next/navigation";
import StoreLayout   from "@/components/store/layout/StoreLayout";
import { useCart }   from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const router = useRouter();
  const [clearing, setClearing] = useState(false);

  const subtotal  = cart.subtotal || 0;
  const shipping  = subtotal > 0 && subtotal < 499 ? 40 : 0;
  const total     = subtotal + shipping;
  const savings   = cart.items?.reduce((s, i) => {
    const orig = i.product?.price ?? i.price;
    return s + (orig - i.price) * i.quantity;
  }, 0) || 0;

  const handleClear = async () => {
    setClearing(true);
    await clearCart();
    setClearing(false);
  };

  if (loading) return (
    <StoreLayout>
      <div style={{ textAlign:"center", padding:"80px 20px" }}>
        <div style={{ fontSize:48, marginBottom:12 }}></div>
        <p style={{ color:"#9ca3af" }}>Loading your cart...</p>
      </div>
    </StoreLayout>
  );

  if (!cart.items || cart.items.length === 0) return (
    <StoreLayout>
      <div style={{ maxWidth:600, margin:"0 auto", padding:"80px 20px", textAlign:"center" }}>
        <div style={{ fontSize:80, marginBottom:20 }}></div>
        <h2 style={{ fontSize:26, fontWeight:800, color:"#111827", margin:"0 0 10px" }}>Your cart is empty</h2>
        <p style={{ color:"#9ca3af", marginBottom:28 }}>Add some fresh groceries to your cart to get started!</p>
        <Link href="/products" style={{
          display:"inline-block", padding:"14px 32px",
          background:"#16a34a", color:"#fff",
          borderRadius:50, textDecoration:"none",
          fontSize:15, fontWeight:800,
          boxShadow:"0 6px 20px rgba(22,163,74,.3)",
        }}>
          Start Shopping →
        </Link>
      </div>
    </StoreLayout>
  );

  return (
    <StoreLayout>
      <div style={{ maxWidth:1280, margin:"0 auto", padding:"32px 20px" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"#111827", margin:"0 0 4px" }}>My Cart</h1>
            <p style={{ fontSize:14, color:"#6b7280", margin:0 }}>{cart.items.length} item{cart.items.length!==1?"s":""}</p>
          </div>
          <button onClick={handleClear} disabled={clearing} style={{
            border:"1px solid #fecaca", background:"#fef2f2",
            color:"#ef4444", padding:"8px 16px", borderRadius:8,
            cursor:"pointer", fontSize:13, fontWeight:600,
          }}>
            {clearing ? "Clearing..." : " Clear Cart"}
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap:24, alignItems:"start" }} className="cart-grid">
          {/* Items list */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {cart.items.map(item => (
              <CartItem key={item._id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}

            {/* Continue shopping */}
            <Link href="/products" style={{
              display:"inline-flex", alignItems:"center", gap:6,
              color:"#16a34a", textDecoration:"none",
              fontSize:14, fontWeight:600, marginTop:8, padding:"6px 0",
            }}>
              ← Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div style={{
            background:"#fff", borderRadius:20, padding:24,
            border:"1px solid #e5e7eb",
            boxShadow:"0 4px 24px rgba(0,0,0,.06)",
            position:"sticky", top:100,
          }}>
            <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:"0 0 20px" }}>Order Summary</h2>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
              <SummaryRow label="Subtotal" value={`₹${subtotal}`} />
              <SummaryRow
                label="Delivery"
                value={shipping === 0 ? "FREE " : `₹${shipping}`}
                valueColor={shipping === 0 ? "#16a34a" : undefined}
              />
              {savings > 0 && <SummaryRow label="You Save" value={`-₹${savings}`} valueColor="#16a34a" />}
            </div>

            {subtotal < 499 && subtotal > 0 && (
              <div style={{
                background:"#fff7ed", borderRadius:10, padding:"10px 14px",
                marginBottom:16, border:"1px solid #fed7aa",
              }}>
                <p style={{ margin:0, fontSize:12, color:"#d97706", fontWeight:600 }}>
                  Add ₹{499 - subtotal} more for FREE delivery! 
                </p>
                <div style={{ marginTop:6, background:"#e5e7eb", borderRadius:20, height:6, overflow:"hidden" }}>
                  <div style={{ height:"100%", background:"#f59e0b", width:`${Math.min((subtotal/499)*100,100)}%`, transition:"width .3s" }} />
                </div>
              </div>
            )}

            <div style={{ borderTop:"2px solid #f3f4f6", paddingTop:16, marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:16, fontWeight:800, color:"#111827" }}>Total</span>
                <span style={{ fontSize:20, fontWeight:900, color:"#111827" }}>₹{total}</span>
              </div>
              <p style={{ fontSize:11, color:"#9ca3af", margin:"4px 0 0" }}>Inclusive of all taxes</p>
            </div>

            {customer ? (
              <button onClick={() => router.push("/checkout")} style={{
                width:"100%", padding:"14px",
                background:"#16a34a", color:"#fff",
                border:"none", borderRadius:12,
                fontSize:16, fontWeight:800, cursor:"pointer",
                boxShadow:"0 6px 20px rgba(22,163,74,.35)",
                transition:"transform .2s",
              }}>
                Proceed to Checkout →
              </button>
            ) : (
              <div>
                <Link href="/account/login?redirect=/checkout" style={{
                  display:"block", width:"100%", padding:"14px",
                  background:"#16a34a", color:"#fff",
                  border:"none", borderRadius:12, textDecoration:"none",
                  fontSize:16, fontWeight:800, textAlign:"center",
                  boxShadow:"0 6px 20px rgba(22,163,74,.35)",
                }}>
                  Login to Checkout →
                </Link>
                <p style={{ fontSize:12, color:"#9ca3af", textAlign:"center", marginTop:8 }}>
                  <Link href="/account/register" style={{ color:"#16a34a", fontWeight:600 }}>Create account</Link> for faster checkout
                </p>
              </div>
            )}

            {/* Payment icons */}
            <div style={{ marginTop:16, textAlign:"center" }}>
              <p style={{ fontSize:11, color:"#9ca3af", margin:"0 0 8px" }}>Secure Payment</p>
              <div style={{ display:"flex", justifyContent:"center", gap:8, flexWrap:"wrap" }}>
                {[" Cards", " UPI", " COD"].map(m => (
                  <span key={m} style={{
                    fontSize:11, background:"#f9fafb", border:"1px solid #e5e7eb",
                    padding:"3px 10px", borderRadius:20, color:"#6b7280",
                  }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </StoreLayout>
  );
}

function CartItem({ item, onUpdate, onRemove }) {
  const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  const [updating, setUpdating] = useState(false);

  const handleQty = async (newQty) => {
    setUpdating(true);
    await onUpdate(item._id, newQty);
    setUpdating(false);
  };

  return (
    <div style={{
      background:"#fff", borderRadius:16, padding:16,
      border:"1px solid #f3f4f6", display:"flex", gap:14, alignItems:"center",
    }}>
      {/* Image */}
      <div style={{
        width:80, height:80, borderRadius:12, background:"#f9fafb",
        display:"flex", alignItems:"center", justifyContent:"center",
        overflow:"hidden", flexShrink:0,
      }}>
        {item.thumbnail ? (
          <img src={`${API}/${item.thumbnail}`} alt={item.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
        ) : (
          <span style={{ fontSize:36 }}></span>
        )}
      </div>

      {/* Details */}
      <div style={{ flex:1, minWidth:0 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:"#111827", margin:"0 0 4px",
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {item.name}
        </h3>
        {item.packSize && <p style={{ fontSize:12, color:"#9ca3af", margin:"0 0 8px" }}>{item.packSize}</p>}
        <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
          <span style={{ fontSize:17, fontWeight:900, color:"#111827" }}>₹{item.price}</span>
          <span style={{ fontSize:13, color:"#9ca3af" }}>× {item.quantity} = </span>
          <span style={{ fontSize:15, fontWeight:800, color:"#16a34a" }}>₹{item.price * item.quantity}</span>
        </div>
      </div>

      {/* Qty controls */}
      <div style={{ display:"flex", alignItems:"center", gap:0, border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden", flexShrink:0 }}>
        <button onClick={() => handleQty(item.quantity - 1)} disabled={updating} style={cBtn}>−</button>
        <span style={{ padding:"6px 12px", fontSize:14, fontWeight:700, minWidth:32, textAlign:"center" }}>
          {item.quantity}
        </span>
        <button onClick={() => handleQty(item.quantity + 1)} disabled={updating} style={cBtn}>+</button>
      </div>

      {/* Remove */}
      <button onClick={() => onRemove(item._id)} style={{
        border:"none", background:"#fef2f2", color:"#ef4444",
        width:32, height:32, borderRadius:8, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        flexShrink:0,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>
  );
}

function SummaryRow({ label, value, valueColor }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
      <span style={{ fontSize:14, color:"#6b7280" }}>{label}</span>
      <span style={{ fontSize:14, fontWeight:700, color:valueColor || "#111827" }}>{value}</span>
    </div>
  );
}

const cBtn = {
  border:"none", background:"#f9fafb",
  padding:"6px 10px", cursor:"pointer",
  fontSize:16, fontWeight:700, color:"#374151",
};
