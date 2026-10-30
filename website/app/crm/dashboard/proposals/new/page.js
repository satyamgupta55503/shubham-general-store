"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const STATUS_OPTS = ["draft","sent","accepted","rejected"];

export default function NewProposalPage() {
  const router   = useRouter();
  const params   = useSearchParams();
  const clientId  = params.get("client")  || "";
  const projectId = params.get("project") || "";

  const [projects,  setProjects]  = useState([]);
  const [services,  setServices]  = useState([]);
  const [form, setForm] = useState({
    project: projectId, title: "", content: "",
    status: "draft", valid_until: "", notes: "", services: [],
    _projectMode: "select", client_name_direct: "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  useEffect(() => {
    const q = clientId ? `/projects?client=${clientId}` : "/projects";
    Promise.all([CRM_API.get(q), CRM_API.get("/services")])
      .then(([{data:p},{data:s}]) => { setProjects(p); setServices(s); })
      .catch(() => {});
  }, [clientId]);

  const toggleSvc = (id) => setForm(p => ({
    ...p, services: p.services.includes(id) ? p.services.filter(s=>s!==id) : [...p.services, id]
  }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const { _projectMode, ...payload } = form;
      await CRM_API.post("/proposals", payload);
      if (clientId) router.push(`/crm/dashboard/clients/${clientId}`);
      else          router.push("/crm/dashboard/proposals");
    } catch (ex) { setErr(ex.response?.data?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const F   = (k) => ({ value: form[k]||"", onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%", padding:"10px 13px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:13, outline:"none", fontFamily:"inherit" };
  const lbl = { display:"block", fontSize:12, fontWeight:600, color:"#374151", marginBottom:5 };

  return (
    <div style={{ maxWidth:740, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:0 }}>New Proposal</h1>
          <p style={{ fontSize:13, color:"#64748b", margin:"3px 0 0" }}>Create a proposal for a project</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, padding:28, display:"flex", flexDirection:"column", gap:20 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"11px 15px",borderRadius:8,fontSize:13 }}>{err}</div>}

          {/* Project + Status */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
                <label style={lbl}>Project / Client <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(optional)</span></label>
                <div style={{ display:"flex",gap:2,background:"#f1f5f9",borderRadius:8,padding:2 }}>
                  {["select","name"].map(m=>(
                    <button key={m} type="button" onClick={()=>setForm(p=>({...p,_projectMode:m,project:"",client_name_direct:""}))}
                      style={{ padding:"3px 10px",borderRadius:6,border:"none",fontSize:10,fontWeight:700,cursor:"pointer",background:form._projectMode===m?"#fff":"transparent",color:form._projectMode===m?"#0f172a":"#64748b" }}>
                      {m==="select"?"Select":"Name"}
                    </button>
                  ))}
                </div>
              </div>
              {(!form._projectMode || form._projectMode==="select") ? (
                <select value={form.project} onChange={e=>setForm(p=>({...p,project:e.target.value}))} style={inp}>
                  <option value="">— None (no project) —</option>
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name} {p.client_name_snapshot?`— ${p.client_name_snapshot}`:""}</option>)}
                </select>
              ) : (
                <input value={form.client_name_direct||""} onChange={e=>setForm(p=>({...p,client_name_direct:e.target.value}))}
                  style={inp} placeholder="e.g. ABC Technologies"/>
              )}
            </div>
            <div>
              <label style={lbl}>Status</label>
              <select {...F("status")} style={inp}>
                {STATUS_OPTS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Title + Valid Until */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <label style={lbl}>Proposal Title <span style={{color:"#ef4444"}}>*</span></label>
              <input {...F("title")} required style={inp} placeholder="e.g. Digital Marketing Strategy — Q1 2027"/>
            </div>
            <div>
              <label style={lbl}>Valid Until</label>
              <input type="date" {...F("valid_until")} style={inp}/>
            </div>
          </div>

          {/* Services */}
          <div>
            <label style={{...lbl, marginBottom:10}}>Services <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(select all that apply)</span></label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {services.filter(s=>s.status==="active").map(s=>{
                const sel = form.services.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={()=>toggleSvc(s.id)}
                    style={{ padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600, border:sel?"none":"1.5px solid #e2e8f0", background:sel?"#22c55e":"#f8fafc", color:sel?"#fff":"#475569", cursor:"pointer", transition:"all .15s" }}>
                    {s.name}
                  </button>
                );
              })}
              {services.filter(s=>s.status==="active").length===0 && <span style={{fontSize:12,color:"#94a3b8"}}>No active services. Add them from Services page.</span>}
            </div>
          </div>

          {/* Content / Scope */}
          <div>
            <label style={lbl}>Content / Scope of Work <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(detailed proposal body)</span></label>
            <textarea {...F("content")} rows={8} style={{...inp, resize:"vertical"}}
              placeholder={`Outline the full proposal here:\n• Scope of work\n• Deliverables\n• Timeline\n• Pricing rationale\n• Terms & conditions`}/>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Internal Notes <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(not shown on PDF)</span></label>
            <textarea {...F("notes")} rows={3} style={{...inp, resize:"vertical"}} placeholder="Internal notes for team…"/>
          </div>
        </div>

        <div style={{ display:"flex", justifyContent:"flex-end", gap:12, marginTop:20 }}>
          <button type="button" onClick={()=>router.back()} style={{ padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer" }}>Cancel</button>
          <button type="submit" disabled={saving} style={{ display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer" }}>
            <Save size={14}/>{saving?"Saving…":"Create Proposal"}
          </button>
        </div>
      </form>
    </div>
  );
}
