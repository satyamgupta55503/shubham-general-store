"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const STATUS_MAP = { active:"Active", on_hold:"On Hold", completed:"Completed", cancelled:"Cancelled" };
const TYPE_MAP   = { retainer:"Retainer", one_time:"One Time", campaign:"Campaign", audit:"Audit", consultation:"Consultation", other:"Other" };

export default function NewProjectPage() {
  const router     = useRouter();
  const params     = useSearchParams();
  const clientId   = params.get("client") || "";

  const [clients,  setClients]  = useState([]);
  const [services, setServices] = useState([]);
  const [form,     setForm]     = useState({
    client: clientId, name: "", project_type: "retainer",
    budget_range: "", start_date: "", expected_end_date: "",
    status: "active", notes: "", services: [],
    project_type_other: "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  useEffect(() => {
    Promise.all([CRM_API.get("/clients"), CRM_API.get("/services")])
      .then(([{data:c},{data:s}]) => { setClients(c); setServices(s); })
      .catch(() => {});
  }, []);

  const toggleSvc = (id) => setForm(p => ({
    ...p, services: p.services.includes(id) ? p.services.filter(s=>s!==id) : [...p.services, id]
  }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      // If "other" selected, use the custom text as project_type
      const { project_type_other, ...payload } = form;
      if (payload.project_type === "other" && project_type_other?.trim()) {
        payload.project_type = project_type_other.trim();
      }
      const { data } = await CRM_API.post("/projects", payload);
      // Go to project detail or back to client
      if (clientId) router.push(`/crm/dashboard/clients/${clientId}`);
      else router.push(`/crm/dashboard/projects/${data.id||data._id}`);
    } catch (ex) { setErr(ex.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const F   = (k) => ({ value: form[k]||"", onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div style={{ maxWidth:720,margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:0 }}>New Project</h1>
          <p style={{ fontSize:13,color:"#64748b",margin:"3px 0 0" }}>Create a project and link it to a client</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:28,display:"flex",flexDirection:"column",gap:20 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"11px 15px",borderRadius:8,fontSize:13 }}>{err}</div>}

          {/* Client + Name */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Client <span style={{color:"#ef4444"}}>*</span></label>
              <select value={form.client} onChange={e=>setForm(p=>({...p,client:e.target.value}))} required style={inp}>
                <option value="">Select client…</option>
                {clients.map(c=><option key={c.id} value={c.id}>{c.full_name}{c.company_name?` — ${c.company_name}`:""}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Project Name <span style={{color:"#ef4444"}}>*</span></label>
              <input {...F("name")} required style={inp} placeholder="e.g. SEO + SMM Campaign Q4"/>
            </div>
          </div>

          {/* Type + Status + Budget */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Project Type</label>
              <select {...F("project_type")} style={inp}>
                {Object.entries(TYPE_MAP).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
              {/* ✅ "Other" reveals a text input */}
              {form.project_type === "other" && (
                <input
                  value={form.project_type_other||""}
                  onChange={e=>setForm(p=>({...p,project_type_other:e.target.value}))}
                  style={{...inp,marginTop:8,borderColor:"#8b5cf6"}}
                  placeholder="Please specify project type…"
                  required
                  autoFocus
                />
              )}
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select {...F("status")} style={inp}>
                {Object.entries(STATUS_MAP).map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Budget Range</label>
              <input {...F("budget_range")} style={inp} placeholder="e.g. ₹20,000–₹50,000/mo"/>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Start Date</label>
              <input type="date" {...F("start_date")} style={inp}/>
            </div>
            <div>
              <label style={lbl}>Expected End Date</label>
              <input type="date" {...F("expected_end_date")} style={inp}/>
            </div>
          </div>

          {/* Services */}
          <div>
            <label style={{...lbl,marginBottom:10}}>Services Included</label>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {services.filter(s=>s.status==="active").map(s=>{
                const sel = form.services.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={()=>toggleSvc(s.id)}
                    style={{ padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:sel?"none":"1.5px solid #e2e8f0",background:sel?"#22c55e":"#f8fafc",color:sel?"#fff":"#475569",cursor:"pointer",transition:"all .15s" }}>
                    {s.name}
                  </button>
                );
              })}
              {services.filter(s=>s.status==="active").length===0 && <span style={{fontSize:12,color:"#94a3b8"}}>No active services — add from Services page first</span>}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes</label>
            <textarea {...F("notes")} rows={4} style={{...inp,resize:"vertical"}} placeholder="Project details, goals, requirements…"/>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display:"flex",justifyContent:"flex-end",gap:12,marginTop:20 }}>
          <button type="button" onClick={()=>router.back()} style={{ padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
            <Save size={14}/>{saving?"Saving…":"Create Project"}
          </button>
        </div>
      </form>
    </div>
  );
}
