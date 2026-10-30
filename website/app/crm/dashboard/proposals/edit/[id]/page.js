"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const STATUS_OPTS = ["draft","sent","accepted","rejected"];

export default function EditProposalPage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const [saveOk,   setSaveOk]   = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data:p }, { data:proj }, { data:s }] = await Promise.all([
        CRM_API.get(`/proposals/${id}`),
        CRM_API.get("/projects"),
        CRM_API.get("/services"),
      ]);
      setProjects(proj); setServices(s);
      setForm({
        project:     p.project?.id||p.project||"",
        title:       p.title||"",
        content:     p.content||"",
        status:      p.status||"draft",
        valid_until: p.valid_until ? p.valid_until.split("T")[0] : "",
        notes:       p.notes||"",
        services:    p.services?.map(s=>s.id||s)||[],
        _projectMode: "select",
        client_name_direct: "",
      });
    } catch { router.replace("/crm/dashboard/proposals"); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const toggleSvc = (sid) => setForm(p=>({
    ...p, services: p.services.includes(sid) ? p.services.filter(x=>x!==sid) : [...p.services, sid]
  }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr(""); setSaveOk("");
    try {
      const { _projectMode, ...payload } = form;
      await CRM_API.patch(`/proposals/${id}`, payload);
      setSaveOk("Saved!"); setTimeout(()=>setSaveOk(""),3000);
    } catch (ex) { setErr(ex.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const F   = (k) => ({ value: form?.[k]||"", onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  if (!form) return <div style={{padding:48,textAlign:"center",color:"#94a3b8"}}>Loading…</div>;

  return (
    <div style={{ maxWidth:740, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div style={{flex:1}}>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:0 }}>Edit Proposal</h1>
        </div>
        {saveOk && <span style={{fontSize:12,fontWeight:600,color:"#15803d",background:"#dcfce7",padding:"6px 12px",borderRadius:8}}>✅ {saveOk}</span>}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:28,display:"flex",flexDirection:"column",gap:20 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"11px 15px",borderRadius:8,fontSize:13 }}>{err}</div>}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
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
              <select {...F("status")} style={inp}>{STATUS_OPTS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div>
              <label style={lbl}>Proposal Title <span style={{color:"#ef4444"}}>*</span></label>
              <input {...F("title")} required style={inp}/>
            </div>
            <div>
              <label style={lbl}>Valid Until</label>
              <input type="date" {...F("valid_until")} style={inp}/>
            </div>
          </div>
          <div>
            <label style={{...lbl,marginBottom:10}}>Services</label>
            <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
              {services.filter(s=>s.status==="active").map(s=>{
                const sel=form.services.includes(s.id);
                return <button key={s.id} type="button" onClick={()=>toggleSvc(s.id)} style={{padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:600,border:sel?"none":"1.5px solid #e2e8f0",background:sel?"#22c55e":"#f8fafc",color:sel?"#fff":"#475569",cursor:"pointer"}}>{s.name}</button>;
              })}
            </div>
          </div>
          <div>
            <label style={lbl}>Content / Scope of Work</label>
            <textarea {...F("content")} rows={8} style={{...inp,resize:"vertical"}}/>
          </div>
          <div>
            <label style={lbl}>Internal Notes</label>
            <textarea {...F("notes")} rows={3} style={{...inp,resize:"vertical"}}/>
          </div>
        </div>
        <div style={{ display:"flex",justifyContent:"flex-end",gap:12,marginTop:20 }}>
          <button type="button" onClick={()=>router.back()} style={{padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button type="submit" disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer"}}>
            <Save size={14}/>{saving?"Saving…":"Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
