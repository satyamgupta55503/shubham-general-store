"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, RefreshCw, Upload, Sun } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const TYPE_STYLE = {
  national: { bg:"#fee2e2", c:"#dc2626", label:"National" },
  optional: { bg:"#fef9c3", c:"#a16207", label:"Optional" },
  regional: { bg:"#dbeafe", c:"#1d4ed8", label:"Regional" },
  company:  { bg:"#ede9fe", c:"#5b21b6", label:"Company"  },
};
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric",weekday:"short"}) : "—";

export default function HrmHolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [year,     setYear]     = useState(new Date().getFullYear());
  const [loading,  setLoading]  = useState(false);
  const [modal,    setModal]    = useState(false);
  const [editObj,  setEditObj]  = useState(null);
  const [form,     setForm]     = useState({ name:"", date:"", type:"national", description:"" });
  const [saving,   setSaving]   = useState(false);
  const [err,      setErr]      = useState("");
  const [importing,setImporting]= useState(false);
  const [msg,      setMsg]      = useState("");

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await HRM_API.get("/holidays", { params:{ year } }); setHolidays(data||[]); }
    catch {} finally { setLoading(false); }
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const openModal = (obj=null) => {
    setEditObj(obj);
    setForm(obj
      ? { name:obj.name, date:obj.date?.split("T")[0]||"", type:obj.type||"national", description:obj.description||"" }
      : { name:"", date:"", type:"national", description:"" });
    setErr(""); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (editObj) await HRM_API.patch(`/holidays/${editObj.id||editObj._id}`, form);
      else         await HRM_API.post("/holidays", form);
      setModal(false); load();
    } catch (ex) { setErr(ex.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await HRM_API.delete(`/holidays/${id}`); load(); }
    catch (ex) { alert(ex.response?.data?.message||"Delete failed"); }
  };

  const handleImport = async () => {
    if (!confirm(`Import preset holidays for ${year}? This will replace existing holidays for this year.`)) return;
    setImporting(true); setMsg("");
    try {
      const { data } = await HRM_API.post("/holidays/import-preset", { year });
      setMsg(`✅ Imported ${data.inserted} holidays for ${year}`);
      load();
    } catch (ex) { setMsg("❌ " + (ex.response?.data?.message||"Import failed")); }
    finally { setImporting(false); setTimeout(()=>setMsg(""),4000); }
  };

  // Group by month
  const byMonth = Array.from({length:12}, (_,i) => ({
    month: i, label: MONTHS[i],
    items: holidays.filter(h => new Date(h.date).getMonth() === i),
  })).filter(m => m.items.length > 0);

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div>
      <div className="hrm-page-header">
        <div>
          <h1 className="hrm-page-title">Holiday Calendar</h1>
          <p className="hrm-page-sub">{holidays.length} holidays in {year}</p>
        </div>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
            {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={handleImport} disabled={importing} className="hrm-btn hrm-btn-outline"><Upload size={14}/>{importing?"Importing…":"Import Preset"}</button>
          <button onClick={()=>openModal()} className="hrm-btn hrm-btn-primary"><Plus size={15}/>Add Holiday</button>
        </div>
      </div>

      {msg && <div style={{ padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:msg.startsWith("✅")?"#dcfce7":"#fee2e2",color:msg.startsWith("✅")?"#15803d":"#dc2626" }}>{msg}</div>}

      {/* Legend */}
      <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" }}>
        {Object.entries(TYPE_STYLE).map(([k,v])=>(
          <span key={k} style={{ padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,background:v.bg,color:v.c }}>{v.label}</span>
        ))}
      </div>

      {loading ? (
        <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      ) : holidays.length === 0 ? (
        <div style={{ padding:"64px",textAlign:"center",color:"#94a3b8" }}>
          <Sun size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 12px" }}/>
          <p style={{ margin:0 }}>No holidays for {year}. Click "Import Preset" to add India holidays.</p>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:20 }}>
          {byMonth.map(({ month, label, items }) => (
            <div key={month} className="hrm-card">
              <div className="hrm-card-header">
                <span className="hrm-card-title">{label} {year}</span>
                <span style={{ background:"#ede9fe",color:"#5b21b6",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700 }}>{items.length}</span>
              </div>
              {items.map(h => {
                const ts = TYPE_STYLE[h.type]||TYPE_STYLE.national;
                return (
                  <div key={h.id||h._id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid #f8fafc" }}>
                    <div style={{ textAlign:"center",width:40,flexShrink:0 }}>
                      <div style={{ fontSize:18,fontWeight:800,color:"#0f172a",lineHeight:1 }}>{new Date(h.date).getDate()}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",textTransform:"uppercase" }}>{new Date(h.date).toLocaleString("en-IN",{weekday:"short"})}</div>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,color:"#0f172a",fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{h.name}</div>
                      <span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:ts.bg,color:ts.c }}>{ts.label}</span>
                    </div>
                    <div style={{ display:"flex",gap:4 }}>
                      <button onClick={()=>openModal(h)} style={{ padding:5,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer" }}><Edit2 size={11}/></button>
                      <button onClick={()=>handleDelete(h.id||h._id,h.name)} style={{ padding:5,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }}><Trash2 size={11}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Upcoming strip — next 3 holidays */}
      {holidays.length > 0 && (() => {
        const upcoming = holidays.filter(h => new Date(h.date) >= new Date()).slice(0,3);
        if (!upcoming.length) return null;
        return (
          <div style={{ marginTop:24,padding:"16px 20px",background:"linear-gradient(135deg,#f5f3ff,#ede9fe)",border:"1px solid #c4b5fd",borderRadius:14,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center" }}>
            <span style={{ fontSize:12,fontWeight:700,color:"#5b21b6",textTransform:"uppercase",letterSpacing:".06em" }}>Upcoming</span>
            {upcoming.map(h => {
              const ts = TYPE_STYLE[h.type]||TYPE_STYLE.national;
              const daysLeft = Math.ceil((new Date(h.date)-new Date())/(1000*60*60*24));
              return (
                <div key={h.id} style={{ background:"#fff",borderRadius:10,padding:"10px 16px",display:"flex",gap:10,alignItems:"center" }}>
                  <div style={{ fontSize:20 }}>🎉</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#0f172a" }}>{h.name}</div>
                    <div style={{ fontSize:11,color:"#64748b" }}>{fmtD(h.date)} · <strong style={{ color:ts.c }}>{daysLeft} day{daysLeft!==1?"s":""} away</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:480 }}>
            <div className="hrm-modal-header">
              <h2 className="hrm-modal-title">{editObj?"Edit":"Add"} Holiday</h2>
              <button className="hrm-close-btn" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="hrm-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
                <div><label style={lbl}>Holiday Name <span style={{ color:"#ef4444" }}>*</span></label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required style={inp}/></div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Date <span style={{ color:"#ef4444" }}>*</span></label><input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} required style={inp}/></div>
                  <div><label style={lbl}>Type</label>
                    <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} style={inp}>
                      {Object.entries(TYPE_STYLE).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div><label style={lbl}>Description</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={{ ...inp,resize:"vertical" }}/></div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Saving…":editObj?"Update":"Add Holiday"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
