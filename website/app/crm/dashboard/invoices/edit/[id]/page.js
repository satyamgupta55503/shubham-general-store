"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Plus, X, Zap } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY_ITEM = { description:"", quantity:1, unit_price:0, total_price:0 };
const INV_TYPES  = ["full","advance","milestone","final","monthly_retainer"];
const INV_STATUS = ["draft","issued","partial","paid","overdue","cancelled"];
const fmt = n => `₹${Number(n||0).toLocaleString("en-IN")}`;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const fetchStoreCustomers = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  return axios.get(`${BACKEND}/api/store/customers/crm/list`, { headers: { Authorization: `Bearer ${token}` } });
};

export default function EditInvoicePage() {
  const { id }  = useParams();
  const router  = useRouter();
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [storeCustomers, setStoreCustomers] = useState([]);
  const [items,    setItems]    = useState([{ ...EMPTY_ITEM }]);
  const [form,     setForm]     = useState(null);
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const [saveOk,   setSaveOk]   = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data:inv }, { data:proj }, { data:svcs }] = await Promise.all([
        CRM_API.get(`/invoices/${id}`),
        CRM_API.get("/projects"),
        CRM_API.get("/services"),
      ]);
      setProjects(proj);
      setServices(svcs.filter(s=>s.status==="active"));
      fetchStoreCustomers().then(({data}) => setStoreCustomers(data.data || [])).catch(()=>{});
      setForm({
        project:       inv.project?.id||inv.project||"",
        invoice_type:  inv.invoice_type||"full",
        invoice_date:  inv.invoice_date ? inv.invoice_date.split("T")[0] : "",
        due_date:      inv.due_date     ? inv.due_date.split("T")[0]     : "",
        status:        inv.status||"draft",
        milestone_label: inv.milestone_label||"",
        cgst_rate:     inv.cgst_rate??9,
        sgst_rate:     inv.sgst_rate??9,
        igst_rate:     inv.igst_rate||0,
        hsn_sac:       inv.hsn_sac||"998319",
        place_of_supply: inv.place_of_supply||"Chhattisgarh",
        notes:         inv.notes||"",
        _projectMode:  "select",
        client_name_direct: "",
        store_customer: inv.store_customer?._id || inv.store_customer || "",
      });
      setItems(inv.items?.length ? inv.items.map(it=>({description:it.description||"",quantity:it.quantity||1,unit_price:it.unit_price||0,total_price:it.total_price||0})) : [{ ...EMPTY_ITEM }]);
    } catch { router.replace("/crm/dashboard/invoices"); }
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  const updateItem = (i, k, v) => setItems(prev => prev.map((it,idx) => {
    if (idx!==i) return it;
    const u = {...it, [k]:v};
    u.total_price = (Number(u.quantity)||0) * (Number(u.unit_price)||0);
    return u;
  }));

  // ✅ Add service as line item
  const addServiceAsItem = (svc) => {
    const newItem = {
      description: svc.name + (svc.description ? ` — ${svc.description}` : ""),
      quantity: 1, unit_price: svc.base_price||0, total_price: svc.base_price||0,
    };
    setItems(prev => {
      const hasEmpty = prev.length===1 && !prev[0].description && !prev[0].unit_price;
      return hasEmpty ? [newItem] : [...prev, newItem];
    });
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr(""); setSaveOk("");
    try {
      const { _projectMode, ...payload } = form;
      await CRM_API.patch(`/invoices/${id}`, { ...payload, items: items.filter(i=>i.description) });
      setSaveOk("Saved!"); setTimeout(()=>setSaveOk(""),3000);
    } catch (ex) { setErr(ex.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const F   = (k) => ({ value: form?.[k]??'', onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  if (!form) return <div style={{padding:48,textAlign:"center",color:"#94a3b8"}}>Loading…</div>;

  const subtotal = items.reduce((s,i)=>s+(Number(i.total_price)||0), 0);
  const cgst = subtotal*(Number(form.cgst_rate)||0)/100;
  const sgst = subtotal*(Number(form.sgst_rate)||0)/100;
  const igst = subtotal*(Number(form.igst_rate)||0)/100;
  const grand = subtotal + cgst + sgst + igst;

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div style={{flex:1}}><h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:0 }}>Edit Invoice</h1></div>
        {saveOk && <span style={{fontSize:12,fontWeight:600,color:"#15803d",background:"#dcfce7",padding:"6px 12px",borderRadius:8}}>✅ {saveOk}</span>}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:28,display:"flex",flexDirection:"column",gap:20 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"11px 15px",borderRadius:8,fontSize:13 }}>{err}</div>}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>
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
                  {projects.map(p=><option key={p.id} value={p.id}>{p.name}{p.client_name_snapshot?` — ${p.client_name_snapshot}`:""}</option>)}
                </select>
              ) : (
                <input value={form.client_name_direct||""} onChange={e=>setForm(p=>({...p,client_name_direct:e.target.value}))}
                  style={inp} placeholder="e.g. ABC Technologies"/>
              )}
            </div>
            <div><label style={lbl}>Invoice Type</label>
              <select {...F("invoice_type")} style={inp}>{INV_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}</select>
            </div>
            <div><label style={lbl}>Status</label>
              <select {...F("status")} style={inp}>{INV_STATUS.map(s=><option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}</select>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16 }}>
            <div><label style={lbl}>Invoice Date</label><input type="date" {...F("invoice_date")} style={inp}/></div>
            <div><label style={lbl}>Due Date</label><input type="date" {...F("due_date")} style={inp}/></div>
            <div><label style={lbl}>Milestone Label</label><input {...F("milestone_label")} style={inp} placeholder="Month 1 / Phase 1"/></div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div><label style={lbl}>HSN/SAC</label><input {...F("hsn_sac")} style={inp}/></div>
            <div><label style={lbl}>Place of Supply</label><input {...F("place_of_supply")} style={inp}/></div>
          </div>
          {/* Link to Store Customer */}
          <div style={{ background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"14px 16px" }}>
            <label style={lbl}>Link to Store Customer <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(optional)</span></label>
            <select {...F("store_customer")} style={inp}>
              <option value="">— Not linked (CRM only) —</option>
              {storeCustomers.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} · {c.phone || c.email}{c.customerType === "wholesale" ? " (Wholesale)" : ""}
                </option>
              ))}
            </select>
            <p style={{fontSize:11,color:"#1d4ed8",margin:"6px 0 0"}}>
              When linked, this invoice shows in the customer&apos;s store profile under &quot;My Invoices&quot;.
            </p>
          </div>
          {/* ✅ Services Quick-Add */}
          {services.length > 0 && (
            <div style={{ background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"14px 16px" }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:10 }}>
                <Zap size={14} color="#16a34a"/>
                <span style={{ fontSize:12,fontWeight:700,color:"#15803d",textTransform:"uppercase",letterSpacing:".05em" }}>Quick Add from Services</span>
                <span style={{ fontSize:11,color:"#16a34a" }}>— Click to add as line item</span>
              </div>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {services.map(svc => (
                  <button key={svc.id} type="button" onClick={() => addServiceAsItem(svc)}
                    style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,border:"1.5px solid #22c55e",background:"#fff",color:"#15803d",fontSize:12,fontWeight:600,cursor:"pointer" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="#22c55e";e.currentTarget.style.color="#fff";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#fff";e.currentTarget.style.color="#15803d";}}>
                    <Plus size={12}/>
                    {svc.name}
                    {svc.base_price > 0 && <span style={{ fontSize:11,opacity:.8 }}> · {fmt(svc.base_price)}{svc.price_unit==="monthly"?"/mo":svc.price_unit==="per_hour"?"/hr":svc.price_unit==="one_time"?" OT":""}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Line Items */}
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <label style={{...lbl,margin:0}}>Line Items</label>
              <button type="button" onClick={()=>setItems(p=>[...p,{...EMPTY_ITEM}])} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer" }}><Plus size={13}/> Add Row</button>
            </div>
            <div style={{ border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr style={{background:"#f8fafc"}}>{["Description","Qty","Unit Price (₹)","Total (₹)",""].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}</tr></thead>
                <tbody>
                  {items.map((it,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"7px 8px"}}><input value={it.description} onChange={e=>updateItem(i,"description",e.target.value)} placeholder="Service" style={{width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none",fontFamily:"inherit"}}/></td>
                      <td style={{padding:"7px 8px",width:70}}><input type="number" min="1" value={it.quantity} onChange={e=>updateItem(i,"quantity",e.target.value)} style={{width:"100%",padding:"7px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"inherit"}}/></td>
                      <td style={{padding:"7px 8px",width:130}}><input type="number" min="0" value={it.unit_price} onChange={e=>updateItem(i,"unit_price",e.target.value)} style={{width:"100%",padding:"7px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"inherit"}}/></td>
                      <td style={{padding:"7px 12px",fontWeight:700,textAlign:"right"}}>{fmt(it.total_price)}</td>
                      <td style={{padding:"7px 8px",width:32}}>{items.length>1&&<button type="button" onClick={()=>setItems(p=>p.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer"}}><X size={14}/></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
            {[["cgst_rate","CGST %"],["sgst_rate","SGST %"],["igst_rate","IGST %"]].map(([k,l])=>(
              <div key={k}><label style={{...lbl,marginBottom:4}}>{l}</label><input type="number" min="0" step="0.01" {...F(k)} style={{...inp,padding:"8px 10px"}}/></div>
            ))}
          </div>
          <div style={{ background:"#f8fafc",borderRadius:10,padding:"16px 18px",display:"flex",justifyContent:"space-between",fontSize:15,fontWeight:800 }}>
            <span style={{color:"#0f172a"}}>Grand Total</span>
            <span style={{color:"#15803d"}}>{fmt(grand)}</span>
          </div>
          <div><label style={lbl}>Notes</label><textarea {...F("notes")} rows={3} style={{...inp,resize:"vertical"}}/></div>
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
