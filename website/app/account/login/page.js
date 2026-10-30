"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast from "react-hot-toast";

function LoginContent() {
  const router     = useRouter();
  const sp         = useSearchParams();
  const redirect   = sp.get("redirect") || "/account";
  const { login, customer } = useCustomerAuth();
  const [form, setForm]   = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  useEffect(() => {
    if (customer) router.push(redirect);
  }, [customer, redirect, router]);

  const [pending, setPending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPending(false);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      router.push(redirect);
    } catch (err) {
      const data = err.response?.data;
      if (data?.pendingApproval) {
        setPending(true);
      }
      toast.error(data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth:440, margin:"0 auto", padding:"48px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{
          width:64, height:64, borderRadius:16,
          background:"linear-gradient(135deg,#16a34a,#15803d)",
          display:"flex", alignItems:"center", justifyContent:"center",
          margin:"0 auto 16px",
          boxShadow:"0 8px 24px rgba(22,163,74,.3)",
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <h1 style={{ fontSize:26, fontWeight:900, color:"#111827", margin:"0 0 6px" }}>Welcome Back!</h1>
        <p style={{ fontSize:14, color:"#6b7280", margin:0 }}>Login to your Subham Store account</p>
      </div>

      {/* Pending approval banner */}
      {pending && (
        <div style={{
          background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:12,
          padding:"14px 16px", marginBottom:16, display:"flex", gap:12, alignItems:"flex-start",
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink:0, marginTop:1 }}>
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"#b45309" }}>Account Pending Approval</div>
            <div style={{ fontSize:13, color:"#92400e", marginTop:2, lineHeight:1.5 }}>
              Your account hasn't been approved by an admin yet. You'll be able to log in once approved.
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{
        background:"#fff", borderRadius:20, padding:28,
        boxShadow:"0 4px 32px rgba(0,0,0,.08)",
        border:"1px solid #f3f4f6",
      }}>
        <div style={{ marginBottom:16 }}>
          <label style={labelStyle}>Email Address</label>
          <input type="email" required placeholder="your@email.com"
            value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))}
            style={inputStyle} />
        </div>

        <div style={{ marginBottom:20 }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position:"relative" }}>
            <input
              type={showPw?"text":"password"} required placeholder="Your password"
              value={form.password} onChange={e => setForm(f=>({...f,password:e.target.value}))}
              style={{ ...inputStyle, paddingRight:44 }}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{
              position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
              border:"none", background:"none", cursor:"pointer", fontSize:12, fontWeight:700, color:"#16a34a",
            }}>
              {showPw ? "HIDE" : "SHOW"}
            </button>
          </div>
          <div style={{ textAlign:"right", marginTop:6 }}>
            <Link href="/account/forgot-password" style={{ fontSize:12, color:"#16a34a", textDecoration:"none", fontWeight:600 }}>
              Forgot password?
            </Link>
          </div>
        </div>

        <button type="submit" disabled={loading} style={{
          width:"100%", padding:"13px",
          background: loading ? "#d1fae5" : "#16a34a",
          color:"#fff", border:"none", borderRadius:10,
          fontSize:15, fontWeight:800, cursor: loading ? "not-allowed" : "pointer",
          boxShadow:"0 4px 16px rgba(22,163,74,.3)",
          transition:"all .2s",
        }}>
          {loading ? "Logging in..." : "Login to My Account →"}
        </button>

        <p style={{ textAlign:"center", marginTop:20, fontSize:14, color:"#6b7280" }}>
          New customer?{" "}
          <Link href="/account/register" style={{ color:"#16a34a", fontWeight:700, textDecoration:"none" }}>
            Create account →
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <StoreLayout>
      <Suspense>
        <LoginContent />
      </Suspense>
    </StoreLayout>
  );
}

const labelStyle = { fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:6 };
const inputStyle = {
  width:"100%", border:"1px solid #e5e7eb", borderRadius:10,
  padding:"11px 14px", fontSize:14, outline:"none", boxSizing:"border-box",
  transition:"border .2s",
};
