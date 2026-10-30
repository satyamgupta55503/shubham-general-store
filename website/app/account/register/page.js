"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const { register, customer } = useCustomerAuth();

  const [type, setType] = useState("retail"); // retail | wholesale
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "",
    businessName: "", gstin: "", businessType: "", businessAddress: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [done, setDone]       = useState(false);  // show pending-approval screen

  useEffect(() => {
    if (customer) router.push("/account");
  }, [customer, router]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (type === "wholesale" && !form.businessName.trim()) { toast.error("Business name is required for wholesale"); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, password: form.password, phone: form.phone,
        customerType: type,
        ...(type === "wholesale" ? {
          businessName: form.businessName, gstin: form.gstin,
          businessType: form.businessType, businessAddress: form.businessAddress,
        } : {}),
      };
      const { message } = await register(payload);
      toast.success("Registration submitted!");
      setDone(true);  // show pending-approval screen
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Pending approval success screen ──
  if (done) {
    return (
      <StoreLayout>
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "60px 20px", textAlign: "center" }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: "#f0fdf4",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>Registration Submitted</h1>
          <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: "0 0 24px" }}>
            Your account is now <strong style={{ color: "#d97706" }}>pending admin approval</strong>.
            You'll be able to log in once an admin approves your account. Please check back soon.
          </p>
          <Link href="/account/login" style={{
            display: "inline-block", padding: "12px 28px", background: "#16a34a", color: "#fff",
            borderRadius: 10, textDecoration: "none", fontSize: 15, fontWeight: 800,
          }}>
            Go to Login
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(22px,4vw,26px)", fontWeight: 900, color: "#111827", margin: "0 0 6px" }}>Create Account</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Join Subham General Store</p>
        </div>

        {/* Account type toggle */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          {[
            { v: "retail",    title: "Retail",    sub: "For personal / home use" },
            { v: "wholesale", title: "Wholesale", sub: "For shops / bulk buyers" },
          ].map(opt => (
            <button key={opt.v} type="button" onClick={() => setType(opt.v)} style={{
              flex: 1, padding: "14px 12px", borderRadius: 12, cursor: "pointer", textAlign: "left",
              border: type === opt.v ? "2px solid #16a34a" : "2px solid #e5e7eb",
              background: type === opt.v ? "#f0fdf4" : "#fff", transition: "all .2s",
            }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: type === opt.v ? "#16a34a" : "#111827" }}>{opt.title}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{opt.sub}</div>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{
          background: "#fff", borderRadius: 20, padding: 24,
          boxShadow: "0 4px 32px rgba(0,0,0,.08)", border: "1px solid #f3f4f6",
        }}>
          {/* Common fields */}
          <Field label="Full Name *"><input type="text" required placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} style={inp} /></Field>
          <Field label="Email *"><input type="email" required placeholder="your@email.com" value={form.email} onChange={e => set("email", e.target.value)} style={inp} /></Field>
          <Field label="Phone Number"><input type="tel" placeholder="+91 XXXXXXXXXX" value={form.phone} onChange={e => set("phone", e.target.value)} style={inp} /></Field>

          {/* Wholesale fields */}
          {type === "wholesale" && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: 16, marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>
                Business Details
              </div>
              <Field label="Business / Shop Name *"><input type="text" required placeholder="e.g. Sharma Kirana Store" value={form.businessName} onChange={e => set("businessName", e.target.value)} style={inp} /></Field>
              <Field label="GSTIN (optional)"><input type="text" placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e => set("gstin", e.target.value)} style={inp} /></Field>
              <Field label="Business Type"><input type="text" placeholder="e.g. Kirana, Restaurant, Reseller" value={form.businessType} onChange={e => set("businessType", e.target.value)} style={inp} /></Field>
              <Field label="Business Address"><textarea placeholder="Shop address" value={form.businessAddress} onChange={e => set("businessAddress", e.target.value)} style={{ ...inp, minHeight: 56, resize: "vertical" }} /></Field>
              <p style={{ fontSize: 11, color: "#15803d", margin: "4px 0 0", lineHeight: 1.5 }}>
                Wholesale accounts need admin approval for thok (bulk) pricing &amp; credit. You can still shop at retail prices meanwhile.
              </p>
            </div>
          )}

          {/* Password */}
          <Field label="Password *">
            <div style={{ position: "relative" }}>
              <input type={showPw ? "text" : "password"} required placeholder="Min 6 characters" value={form.password} onChange={e => set("password", e.target.value)} style={{ ...inp, paddingRight: 60 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#16a34a" }}>
                {showPw ? "HIDE" : "SHOW"}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password *">
            <input type="password" required placeholder="Repeat password" value={form.confirm} onChange={e => set("confirm", e.target.value)}
              style={{ ...inp, borderColor: form.confirm && form.password !== form.confirm ? "#ef4444" : "#e5e7eb" }} />
            {form.confirm && form.password !== form.confirm && (
              <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0" }}>Passwords don't match</p>
            )}
          </Field>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px", marginTop: 6,
            background: loading ? "#d1fae5" : "#16a34a",
            color: "#fff", border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 4px 16px rgba(22,163,74,.3)",
          }}>
            {loading ? "Creating Account..." : `Create ${type === "wholesale" ? "Wholesale" : "Retail"} Account →`}
          </button>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "#6b7280" }}>
            Already have an account?{" "}
            <Link href="/account/login" style={{ color: "#16a34a", fontWeight: 700, textDecoration: "none" }}>Login →</Link>
          </p>
        </form>
      </div>
    </StoreLayout>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const inp = {
  width: "100%", border: "1px solid #e5e7eb", borderRadius: 10,
  padding: "11px 14px", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};
