"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const SOURCES  = ["manual","website","instagram","facebook","linkedin","referral","whatsapp","other"];
const SERVICES = [
  "SEO","Social Media Marketing","PPC / Paid Ads","Content Marketing",
  "Web Design","Branding","Email Marketing","Video Production",
  "Full Package","Other",
];
const STATUSES = [
  {v:"new",l:"New"},{v:"contacted",l:"Contacted"},
  {v:"proposal_sent",l:"Proposal Sent"},{v:"converted",l:"Converted"},{v:"lost",l:"Lost"},
];

export default function NewEnquiryPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    client_name:"", mobile_number:"", email:"", address:"",
    service_interest:"", service_interest_other:"",
    budget_range:"", notes:"", status:"new", source:"manual",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { ...form };
      // If "Other" selected, merge the custom text into service_interest
      if (form.service_interest === "Other" && form.service_interest_other?.trim()) {
        payload.service_interest = `Other: ${form.service_interest_other.trim()}`;
      }
      delete payload.service_interest_other;
      await CRM_API.post("/enquiries", payload);
      router.push("/crm/dashboard/enquiries");
    } catch (ex) { setErr(ex.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const F   = (k) => ({ value: form[k]||"", onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div style={{ maxWidth:680, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:0 }}>Log New Enquiry</h1>
          <p style={{ fontSize:13,color:"#64748b",margin:"3px 0 0" }}>Record a new lead or inquiry</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:28,display:"flex",flexDirection:"column",gap:18 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"11px 15px",borderRadius:8,fontSize:13 }}>{err}</div>}

          {/* Name + Mobile */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Client Name <span style={{color:"#ef4444"}}>*</span></label>
              <input {...F("client_name")} required style={inp} placeholder="Full name or company"/>
            </div>
            <div>
              <label style={lbl}>Mobile Number <span style={{color:"#ef4444"}}>*</span></label>
              <input {...F("mobile_number")} required style={inp} placeholder="+91 98765 43210"/>
            </div>
          </div>

          {/* Email + Budget */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" {...F("email")} style={inp} placeholder="client@example.com"/>
            </div>
            <div>
              <label style={lbl}>Budget Range</label>
              <input {...F("budget_range")} style={inp} placeholder="e.g. ₹10,000–₹30,000/month"/>
            </div>
          </div>

          {/* Service Interest */}
          <div>
            <label style={lbl}>Service Interest</label>
            <select value={form.service_interest} onChange={e=>setForm(p=>({...p,service_interest:e.target.value,service_interest_other:""}))} style={inp}>
              <option value="">Select service…</option>
              {SERVICES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
            {/* ✅ "Other" reveals a text input */}
            {form.service_interest === "Other" && (
              <div style={{ marginTop:10 }}>
                <label style={{...lbl,color:"#6d28d9"}}>Please specify <span style={{color:"#ef4444"}}>*</span></label>
                <input value={form.service_interest_other} onChange={e=>setForm(p=>({...p,service_interest_other:e.target.value}))}
                  required style={{...inp,borderColor:"#8b5cf6"}} placeholder="Describe the service needed…" autoFocus/>
              </div>
            )}
          </div>

          {/* Source + Status */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Lead Source</label>
              <select {...F("source")} style={inp}>
                {SOURCES.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select {...F("status")} style={inp}>
                {STATUSES.map(({v,l})=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={lbl}>Address / Location</label>
            <input {...F("address")} style={inp} placeholder="City or full address"/>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes / Requirements</label>
            <textarea {...F("notes")} rows={4} style={{...inp,resize:"vertical"}} placeholder="Any additional details, requirements, or context…"/>
          </div>
        </div>

        <div style={{ display:"flex",justifyContent:"flex-end",gap:12,marginTop:20 }}>
          <button type="button" onClick={()=>router.back()} style={{padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button type="submit" disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer"}}>
            <Save size={14}/>{saving?"Saving…":"Log Enquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
