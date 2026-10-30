"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowLeft, Save, Plus, X, Zap } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const EMPTY_ITEM = { description:"", quantity:1, unit_price:0, total_price:0 };
const fmt = n => `₹${Number(n||0).toLocaleString("en-IN")}`;

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
// Fetch store customers for the "link to customer" selector (uses CRM token)
const fetchStoreCustomers = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("crm_token") : "";
  return axios.get(`${BACKEND}/api/store/customers/crm/list`, { headers: { Authorization: `Bearer ${token}` } });
};

export default function NewQuotationPage() {
  const router    = useRouter();
  const params    = useSearchParams();
  const clientId  = params.get("client")  || "";
  const projectId = params.get("project") || "";

  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [storeCustomers, setStoreCustomers] = useState([]);
  const [items,    setItems]    = useState([{ ...EMPTY_ITEM }]);
  const [form, setForm] = useState({
    project: projectId, status:"draft", valid_until:"",
    discount_type:"fixed", discount_value:0,
    cgst_rate:9, sgst_rate:9, igst_rate:0,
    hsn_sac:"998319", place_of_supply:"Chhattisgarh", notes:"",
    _projectMode: projectId ? "select" : "select",
    client_name_direct: "",
    store_customer: "",
  });
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  useEffect(() => {
    const q = clientId ? `/projects?client=${clientId}` : "/projects";
    Promise.all([CRM_API.get(q), CRM_API.get("/services"), CRM_API.get("/settings")])
      .then(([{data:p},{data:s},{data:cfg}]) => {
        setProjects(p);
        setServices(s.filter(x=>x.status==="active"));
        // Prefill GST defaults from settings
        setForm(prev => ({
          ...prev,
          cgst_rate:       cfg.default_cgst_rate ?? prev.cgst_rate,
          sgst_rate:       cfg.default_sgst_rate ?? prev.sgst_rate,
          igst_rate:       cfg.default_igst_rate ?? prev.igst_rate,
          hsn_sac:         cfg.default_hsn_sac   || prev.hsn_sac,
          place_of_supply: cfg.place_of_supply    || prev.place_of_supply,
        }));
      })
      .catch(()=>{});
    fetchStoreCustomers().then(({data}) => setStoreCustomers(data.data || [])).catch(()=>{});
  }, [clientId]);

  // ✅ Add service as line item
  const addServiceAsItem = (svc) => {
    const newItem = {
      description: svc.name + (svc.description ? ` — ${svc.description}` : ""),
      quantity:    1,
      unit_price:  svc.base_price || 0,
      total_price: svc.base_price || 0,
    };
    // If only one empty row exists, replace it; else append
    setItems(prev => {
      const hasEmpty = prev.length === 1 && !prev[0].description && !prev[0].unit_price;
      return hasEmpty ? [newItem] : [...prev, newItem];
    });
  };

  const updateItem = (i, k, v) => setItems(prev => prev.map((it,idx) => {
    if (idx!==i) return it;
    const u = {...it, [k]:v};
    u.total_price = (Number(u.quantity)||0) * (Number(u.unit_price)||0);
    return u;
  }));

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const { _projectMode, ...payload } = form;
      await CRM_API.post("/quotations", { ...payload, items: items.filter(i=>i.description) });
      if (clientId) router.push(`/crm/dashboard/clients/${clientId}`);
      else          router.push("/crm/dashboard/quotations");
    } catch (ex) { setErr(ex.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const F   = (k) => ({ value: form[k]??'', onChange: e => setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"10px 13px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  const subtotal = items.reduce((s,i)=>s+(Number(i.total_price)||0), 0);
  const disc     = form.discount_type==="percentage" ? subtotal*form.discount_value/100 : Number(form.discount_value)||0;
  const taxable  = subtotal - disc;
  const cgst     = taxable*(Number(form.cgst_rate)||0)/100;
  const sgst     = taxable*(Number(form.sgst_rate)||0)/100;
  const igst     = taxable*(Number(form.igst_rate)||0)/100;
  const grand    = taxable + cgst + sgst + igst;

  return (
    <div style={{ maxWidth:800, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:28 }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div>
          <h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:0 }}>New Quotation</h1>
          <p style={{ fontSize:13,color:"#64748b",margin:"3px 0 0" }}>Create a price quotation for a project</p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:28,display:"flex",flexDirection:"column",gap:20 }}>
          {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"11px 15px",borderRadius:8,fontSize:13 }}>{err}</div>}

          {/* Project + Valid Until */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
          {/* Project field — Select existing OR type client name */}
          <div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
              <label style={lbl}>Project / Client <span style={{fontSize:11,color:"#94a3b8",fontWeight:400}}>(optional)</span></label>
              <div style={{ display:"flex",gap:2,background:"#f1f5f9",borderRadius:8,padding:2 }}>
                {["select","name"].map(m=>(
                  <button key={m} type="button" onClick={()=>setForm(p=>({...p,_projectMode:m,project:"",client_name_direct:""}))}
                    style={{ padding:"4px 12px",borderRadius:6,border:"none",fontSize:11,fontWeight:700,cursor:"pointer",background:form._projectMode===m?"#fff":"transparent",color:form._projectMode===m?"#0f172a":"#64748b",boxShadow:form._projectMode===m?"0 1px 4px rgba(0,0,0,.1)":"none" }}>
                    {m==="select"?"Select Project":"Enter Name"}
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
                style={inp} placeholder="e.g. Rahul Sharma or ABC Technologies"/>
            )}
            <p style={{fontSize:11,color:"#94a3b8",margin:"5px 0 0"}}>
              {(!form._projectMode||form._projectMode==="select") ? "Select from existing projects, or switch to 'Enter Name' to type directly" : "This name will appear on the quotation as the client"}
            </p>
          </div>
            <div>
              <label style={lbl}>Valid Until</label>
              <input type="date" {...F("valid_until")} style={inp}/>
            </div>
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
              When linked, this quotation will appear in the customer&apos;s store profile under &quot;My Quotations&quot;.
            </p>
          </div>

          {/* HSN + Place of Supply */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
            <div><label style={lbl}>HSN/SAC Code</label><input {...F("hsn_sac")} style={inp} placeholder="998319"/></div>
            <div><label style={lbl}>Place of Supply</label><input {...F("place_of_supply")} style={inp} placeholder="Chhattisgarh"/></div>
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
                    style={{ display:"flex",alignItems:"center",gap:6,padding:"6px 14px",borderRadius:20,border:"1.5px solid #22c55e",background:"#fff",color:"#15803d",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .15s" }}
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
              <button type="button" onClick={()=>setItems(p=>[...p,{...EMPTY_ITEM}])} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#f0fdf4",color:"#16a34a",border:"1px solid #bbf7d0",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer" }}>
                <Plus size={13}/> Add Row
              </button>
            </div>
            <div style={{ border:"1px solid #e2e8f0",borderRadius:10,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse",fontSize:13 }}>
                <thead><tr style={{background:"#f8fafc"}}>
                  {["Description","Qty","Unit Price (₹)","Total (₹)",""].map(h=><th key={h} style={{padding:"9px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {items.map((it,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"7px 8px"}}><input value={it.description} onChange={e=>updateItem(i,"description",e.target.value)} placeholder="Service / deliverable" style={{width:"100%",padding:"7px 10px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none",fontFamily:"inherit"}}/></td>
                      <td style={{padding:"7px 8px",width:70}}><input type="number" min="1" value={it.quantity} onChange={e=>updateItem(i,"quantity",e.target.value)} style={{width:"100%",padding:"7px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"inherit"}}/></td>
                      <td style={{padding:"7px 8px",width:130}}><input type="number" min="0" value={it.unit_price} onChange={e=>updateItem(i,"unit_price",e.target.value)} style={{width:"100%",padding:"7px 8px",border:"1px solid #e2e8f0",borderRadius:7,fontSize:13,outline:"none",textAlign:"right",fontFamily:"inherit"}}/></td>
                      <td style={{padding:"7px 12px",fontWeight:700,textAlign:"right",whiteSpace:"nowrap"}}>{fmt(it.total_price)}</td>
                      <td style={{padding:"7px 8px",width:32}}>{items.length>1&&<button type="button" onClick={()=>setItems(p=>p.filter((_,idx)=>idx!==i))} style={{background:"none",border:"none",color:"#dc2626",cursor:"pointer",padding:3}}><X size={14}/></button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax & Discount */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12 }}>
            {[["cgst_rate","CGST %"],["sgst_rate","SGST %"],["igst_rate","IGST %"],["discount_value","Discount"]].map(([k,l])=>(
              <div key={k}>
                <label style={{...lbl,marginBottom:4}}>{l}</label>
                <input type="number" min="0" step="0.01" {...F(k)} style={{...inp,padding:"8px 10px"}}/>
              </div>
            ))}
            <div>
              <label style={{...lbl,marginBottom:4}}>Disc. Type</label>
              <select {...F("discount_type")} style={{...inp,padding:"8px 10px"}}>
                <option value="fixed">Fixed ₹</option>
                <option value="percentage">%</option>
              </select>
            </div>
          </div>

          {/* Grand Total Summary */}
          <div style={{ background:"#f8fafc",borderRadius:10,padding:"16px 18px" }}>
            {[["Subtotal",fmt(subtotal)],disc>0&&["Discount",`-${fmt(disc)}`],disc>0&&["Taxable Amount",fmt(taxable)],cgst>0&&[`CGST (${form.cgst_rate}%)`,fmt(cgst)],sgst>0&&[`SGST (${form.sgst_rate}%)`,fmt(sgst)],igst>0&&[`IGST (${form.igst_rate}%)`,fmt(igst)]].filter(Boolean).map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:6}}><span style={{color:"#64748b"}}>{l}</span><span style={{fontWeight:600}}>{v}</span></div>
            ))}
            <div style={{ display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"2px solid #e2e8f0",fontSize:15,fontWeight:800 }}>
              <span style={{color:"#0f172a"}}>Grand Total</span>
              <span style={{color:"#15803d"}}>{fmt(grand)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={lbl}>Notes</label>
            <textarea {...F("notes")} rows={3} style={{...inp,resize:"vertical"}} placeholder="Terms, payment conditions…"/>
          </div>
        </div>

        <div style={{ display:"flex",justifyContent:"flex-end",gap:12,marginTop:20 }}>
          <button type="button" onClick={()=>router.back()} style={{padding:"10px 20px",background:"#f1f5f9",color:"#374151",border:"none",borderRadius:9,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cancel</button>
          <button type="submit" disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"10px 22px",background:saving?"#86efac":"#22c55e",color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer"}}>
            <Save size={14}/>{saving?"Saving…":"Create Quotation"}
          </button>
        </div>
      </form>
    </div>
  );
}
