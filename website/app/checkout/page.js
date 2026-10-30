"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link  from "next/link";
import StoreLayout  from "@/components/store/layout/StoreLayout";
import { useCart }  from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const STEPS = ["Address", "Payment", "Review & Place"];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart }   = useCart();
  const { customer, token, refreshMe } = useCustomerAuth();
  const [step, setStep]        = useState(0);
  const [placing, setPlacing]  = useState(false);

  const [addr, setAddr] = useState({
    fullName:"", phone:"", line1:"", line2:"", city:"", state:"", pincode:"",
  });
  const [useExisting, setUseExisting] = useState(null); // index of saved address
  const [payMethod, setPayMethod]     = useState("cod");
  const [note, setNote]               = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!token) router.push("/account/login?redirect=/checkout");
  }, [token, router]);

  // Prefill default address
  useEffect(() => {
    if (customer?.addresses?.length) {
      const def = customer.addresses.find(a => a.isDefault) || customer.addresses[0];
      setAddr({
        fullName: def.fullName,
        phone:    def.phone,
        line1:    def.line1,
        line2:    def.line2 || "",
        city:     def.city,
        state:    def.state,
        pincode:  def.pincode,
      });
      setUseExisting(0);
    }
  }, [customer]);

  if (!cart.items?.length) {
    return (
      <StoreLayout>
        <div style={{ textAlign:"center", padding:"80px 20px" }}>
          <div style={{ fontSize:60, marginBottom:16 }}></div>
          <h2 style={{ color:"#374151" }}>Your cart is empty</h2>
          <Link href="/products" style={{ display:"inline-block", marginTop:16, padding:"10px 24px", background:"#16a34a", color:"#fff", borderRadius:8, textDecoration:"none", fontWeight:700 }}>
            Shop Now
          </Link>
        </div>
      </StoreLayout>
    );
  }

  const subtotal = cart.subtotal || 0;
  const shipping = subtotal >= 499 ? 0 : 40;
  const total    = subtotal + shipping;

  const addrValid = addr.fullName && addr.phone && addr.line1 && addr.city && addr.state && addr.pincode;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await axios.post(`${API}/api/store/orders`,
        {
          shippingAddress: addr,
          paymentMethod: payMethod,
          customerNote: note,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await refreshMe();
      toast.success(" Order placed successfully!");
      router.push(`/account/orders/${res.data.data._id}?success=true`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <StoreLayout>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 20px" }}>
        <h1 style={{ fontSize:28, fontWeight:900, color:"#111827", margin:"0 0 28px" }}>Checkout</h1>

        {/* Step indicator */}
        <div className="checkout-steps" aria-label="Checkout steps" role="list">
          {STEPS.map((s, i) => (
            <div key={i} role="listitem" style={{ display:"flex", alignItems:"center", flex:1, minWidth:0 }}>
              <div style={{
                width:30, height:30, borderRadius:"50%",
                background: i <= step ? "#16a34a" : "#e5e7eb",
                color: i <= step ? "#fff" : "#9ca3af",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:12, fontWeight:800, flexShrink:0,
              }}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? "" : i+1}
              </div>
              <span className="checkout-step-label" style={{ fontSize:12, fontWeight:600, color: i===step?"#16a34a":"#9ca3af", marginLeft:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {s}
              </span>
              {i < STEPS.length-1 && (
                <div style={{ flex:1, height:2, background: i<step?"#16a34a":"#e5e7eb", margin:"0 8px", minWidth:8 }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:24, alignItems:"start" }} className="checkout-grid">
          {/* Left panel */}
          <div>
            {/* Step 0: Address */}
            {step === 0 && (
              <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #e5e7eb" }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:"0 0 20px" }}> Delivery Address</h2>

                {/* Saved addresses */}
                {customer?.addresses?.length > 0 && (
                  <div style={{ marginBottom:20 }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#6b7280", margin:"0 0 10px", textTransform:"uppercase" }}>Saved Addresses</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {customer.addresses.map((a, i) => (
                        <div key={a._id} onClick={() => {
                          setUseExisting(i);
                          setAddr({ fullName:a.fullName, phone:a.phone, line1:a.line1, line2:a.line2||"", city:a.city, state:a.state, pincode:a.pincode });
                        }} style={{
                          padding:14, borderRadius:12, cursor:"pointer",
                          border:`2px solid ${useExisting===i?"#16a34a":"#e5e7eb"}`,
                          background: useExisting===i ? "#f0fdf4" : "#fff",
                          transition:"all .2s",
                        }}>
                          <div style={{ display:"flex", justifyContent:"space-between" }}>
                            <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>{a.label || "Home"}</span>
                            {a.isDefault && <span style={{ fontSize:11, color:"#16a34a", fontWeight:700 }}>Default</span>}
                          </div>
                          <p style={{ fontSize:13, color:"#6b7280", margin:"4px 0 0", lineHeight:1.5 }}>
                            {a.fullName} · {a.phone}<br/>
                            {a.line1}, {a.city}, {a.state} - {a.pincode}
                          </p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setUseExisting(null)} style={{
                      marginTop:10, border:"1px dashed #16a34a", background:"#f0fdf4",
                      color:"#16a34a", padding:"8px 16px", borderRadius:8, cursor:"pointer", fontSize:13, fontWeight:600,
                    }}>
                      + Add New Address
                    </button>
                  </div>
                )}

                {/* Manual address form */}
                {useExisting === null && (
                  <div className="address-form-grid">
                    <Field label="Full Name *"       value={addr.fullName} onChange={v => setAddr(a=>({...a,fullName:v}))} full />
                    <Field label="Phone *"           value={addr.phone}    onChange={v => setAddr(a=>({...a,phone:v}))} type="tel" />
                    <Field label="Address Line 1 *"  value={addr.line1}    onChange={v => setAddr(a=>({...a,line1:v}))} full />
                    <Field label="Address Line 2"    value={addr.line2}    onChange={v => setAddr(a=>({...a,line2:v}))} full />
                    <Field label="City *"            value={addr.city}     onChange={v => setAddr(a=>({...a,city:v}))} />
                    <Field label="State *"           value={addr.state}    onChange={v => setAddr(a=>({...a,state:v}))} />
                    <Field label="Pincode *"         value={addr.pincode}  onChange={v => setAddr(a=>({...a,pincode:v}))} type="number" />
                  </div>
                )}

                <button
                  disabled={!addrValid}
                  onClick={() => setStep(1)}
                  style={{
                    marginTop:20, width:"100%", padding:"13px",
                    background: addrValid ? "#16a34a" : "#e5e7eb",
                    color: addrValid ? "#fff" : "#9ca3af",
                    border:"none", borderRadius:10, fontSize:15, fontWeight:800,
                    cursor: addrValid ? "pointer" : "not-allowed",
                  }}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #e5e7eb" }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:"0 0 20px" }}> Payment Method</h2>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {[
                    { value:"cod",    label:"Cash on Delivery", icon:"", desc:"Pay when your order arrives" },
                    { value:"upi",    label:"UPI",              icon:"", desc:"Pay via any UPI app" },
                    { value:"online", label:"Card / Net Banking",icon:"", desc:"Secure online payment" },
                  ].map(pm => (
                    <div key={pm.value} onClick={() => setPayMethod(pm.value)} style={{
                      padding:16, borderRadius:12, cursor:"pointer",
                      border:`2px solid ${payMethod===pm.value?"#16a34a":"#e5e7eb"}`,
                      background: payMethod===pm.value ? "#f0fdf4" : "#fff",
                      transition:"all .2s",
                      display:"flex", alignItems:"center", gap:14,
                    }}>
                      <span style={{ fontSize:24 }}>{pm.icon}</span>
                      <div>
                        <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{pm.label}</div>
                        <div style={{ fontSize:12, color:"#9ca3af" }}>{pm.desc}</div>
                      </div>
                      <div style={{ marginLeft:"auto" }}>
                        <div style={{
                          width:18, height:18, borderRadius:"50%",
                          border:`2px solid ${payMethod===pm.value?"#16a34a":"#d1d5db"}`,
                          background: payMethod===pm.value ? "#16a34a" : "#fff",
                          display:"flex", alignItems:"center", justifyContent:"center",
                        }}>
                          {payMethod===pm.value && <div style={{ width:8, height:8, borderRadius:"50%", background:"#fff" }} />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop:20 }}>
                  <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:8 }}>
                    Order Note (Optional)
                  </label>
                  <textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder="Any special instructions for delivery..."
                    rows={3} style={{
                      width:"100%", border:"1px solid #e5e7eb", borderRadius:10,
                      padding:"10px 14px", fontSize:13, outline:"none", resize:"none", boxSizing:"border-box",
                    }}
                  />
                </div>

                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  <button onClick={() => setStep(0)} style={{
                    flex:1, padding:"13px", border:"1px solid #e5e7eb",
                    background:"#fff", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer",
                  }}>
                    ← Back
                  </button>
                  <button onClick={() => setStep(2)} style={{
                    flex:2, padding:"13px", background:"#16a34a", color:"#fff",
                    border:"none", borderRadius:10, fontSize:15, fontWeight:800, cursor:"pointer",
                  }}>
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div style={{ background:"#fff", borderRadius:20, padding:24, border:"1px solid #e5e7eb" }}>
                <h2 style={{ fontSize:18, fontWeight:800, color:"#111827", margin:"0 0 20px" }}> Review Your Order</h2>

                {/* Delivery address summary */}
                <div style={{ background:"#f9fafb", borderRadius:12, padding:14, marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase" }}>Deliver To</span>
                    <button onClick={() => setStep(0)} style={{ border:"none", background:"none", color:"#16a34a", fontSize:12, fontWeight:700, cursor:"pointer" }}>Edit</button>
                  </div>
                  <p style={{ margin:0, fontSize:14, color:"#374151", lineHeight:1.6 }}>
                    <strong>{addr.fullName}</strong> · {addr.phone}<br/>
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                </div>

                {/* Payment summary */}
                <div style={{ background:"#f9fafb", borderRadius:12, padding:14, marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase" }}>Payment</span>
                    <button onClick={() => setStep(1)} style={{ border:"none", background:"none", color:"#16a34a", fontSize:12, fontWeight:700, cursor:"pointer" }}>Edit</button>
                  </div>
                  <p style={{ margin:0, fontSize:14, color:"#374151" }}>
                    {payMethod === "cod" ? " Cash on Delivery" : payMethod === "upi" ? " UPI" : " Card / Net Banking"}
                  </p>
                </div>

                {/* Items */}
                <div style={{ marginBottom:16 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:"#6b7280", textTransform:"uppercase", marginBottom:10 }}>Items ({cart.items.length})</p>
                  {cart.items.map(i => (
                    <div key={i._id} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #f3f4f6" }}>
                      <span style={{ fontSize:14, color:"#374151" }}>{i.name} × {i.quantity}</span>
                      <span style={{ fontSize:14, fontWeight:700, color:"#111827" }}>₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display:"flex", gap:10, marginTop:20 }}>
                  <button onClick={() => setStep(1)} style={{
                    flex:1, padding:"13px", border:"1px solid #e5e7eb",
                    background:"#fff", borderRadius:10, fontSize:14, fontWeight:700, cursor:"pointer",
                  }}>
                    ← Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing} style={{
                    flex:2, padding:"13px",
                    background: placing ? "#d1fae5" : "#16a34a",
                    color:"#fff", border:"none", borderRadius:10,
                    fontSize:15, fontWeight:800,
                    cursor: placing ? "not-allowed" : "pointer",
                    boxShadow:"0 4px 16px rgba(22,163,74,.35)",
                  }}>
                    {placing ? "Placing Order..." : " Place Order"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right: mini order summary */}
          <div style={{
            background:"#fff", borderRadius:20, padding:20,
            border:"1px solid #e5e7eb", position:"sticky", top:100,
          }}>
            <h3 style={{ fontSize:15, fontWeight:800, color:"#111827", margin:"0 0 16px" }}>Order Summary</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:14 }}>
              {cart.items.map(i => (
                <div key={i._id} style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {i.name} ×{i.quantity}
                  </span>
                  <span style={{ fontSize:13, fontWeight:700, color:"#111827", flexShrink:0 }}>₹{i.price * i.quantity}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop:"1px solid #f3f4f6", paddingTop:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>Subtotal</span>
                <span style={{ fontSize:13, fontWeight:700 }}>₹{subtotal}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:13, color:"#6b7280" }}>Shipping</span>
                <span style={{ fontSize:13, fontWeight:700, color: shipping===0?"#16a34a":"#111827" }}>
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", borderTop:"2px solid #f3f4f6", paddingTop:10, marginTop:6 }}>
                <span style={{ fontSize:15, fontWeight:800, color:"#111827" }}>Total</span>
                <span style={{ fontSize:18, fontWeight:900, color:"#111827" }}>₹{total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </StoreLayout>
  );
}

function Field({ label, value, onChange, type="text", full }) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : "auto" }}>
      <label style={{ fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:4 }}>{label}</label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width:"100%", border:"1px solid #e5e7eb", borderRadius:8,
          padding:"10px 12px", fontSize:14, outline:"none", boxSizing:"border-box",
        }}
      />
    </div>
  );
}
