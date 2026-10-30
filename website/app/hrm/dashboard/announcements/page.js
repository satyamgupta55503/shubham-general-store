"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, RefreshCw, Megaphone, Eye, EyeOff } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const PRI_STYLE = {
  high:   { bg:"#fee2e2",c:"#dc2626",border:"#fecaca",label:"High"   },
  medium: { bg:"#fef9c3",c:"#a16207",border:"#fde68a",label:"Medium" },
  low:    { bg:"#dcfce7",c:"#15803d",border:"#bbf7d0",label:"Low"    },
};
const fmtDT = (d) => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}) : "—";

export default function HrmAnnouncementsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal,   setModal]   = useState(false);
  const [editObj, setEditObj] = useState(null);
  const [form,    setForm]    = useState({ title:"", body:"", priority:"medium", publish_at:"", expires_at:"" });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");
  const [view,    setView]    = useState(null); // preview modal

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await HRM_API.get("/announcements"); setItems(data||[]); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openModal = (obj=null) => {
    setEditObj(obj);
    const toLocal = (d) => d ? new Date(d).toISOString().slice(0,16) : "";
    setForm(obj
      ? { title:obj.title, body:obj.body, priority:obj.priority||"medium", publish_at:toLocal(obj.publish_at), expires_at:toLocal(obj.expires_at) }
      : { title:"", body:"", priority:"medium", publish_at:"", expires_at:"" });
    setErr(""); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      const payload = { ...form, publish_at:form.publish_at||null, expires_at:form.expires_at||null };
      if (editObj) await HRM_API.patch(`/announcements/${editObj.id||editObj._id}`, payload);
      else         await HRM_API.post("/announcements", payload);
      setModal(false); load();
    } catch (ex) { setErr(ex.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await HRM_API.delete(`/announcements/${id}`); load(); } catch {}
  };

  const toggleActive = async (item) => {
    try { await HRM_API.patch(`/announcements/${item.id||item._id}`, { is_active:!item.is_active }); load(); } catch {}
  };

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  const live = items.filter(i=>i.is_live);
  const draft = items.filter(i=>!i.is_live);

  return (
    <div>
      <div className="hrm-page-header">
        <div>
          <h1 className="hrm-page-title">Announcements</h1>
          <p className="hrm-page-sub">{live.length} live · {draft.length} draft/expired</p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={load} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={13}/></button>
          <button onClick={()=>openModal()} className="hrm-btn hrm-btn-primary"><Plus size={15}/>New Announcement</button>
        </div>
      </div>

      {loading ? <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      : items.length===0 ? (
        <div style={{ padding:"64px",textAlign:"center",color:"#94a3b8" }}>
          <Megaphone size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 12px" }}/>
          <p style={{ margin:0 }}>No announcements yet. Create one to broadcast to all employees.</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {items.map(item => {
            const ps = PRI_STYLE[item.priority]||PRI_STYLE.medium;
            return (
              <div key={item.id||item._id} style={{ background:"#fff",border:`1px solid ${item.is_live?"#e2e8f0":"#f1f5f9"}`,borderLeft:`4px solid ${item.is_live?ps.border:"#e2e8f0"}`,borderRadius:12,padding:"18px 20px",opacity:item.is_active?1:.6 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap",marginBottom:8 }}>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6 }}>
                      <span style={{ padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:ps.bg,color:ps.c }}>{ps.label} Priority</span>
                      {item.is_live
                        ? <span style={{ padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:"#dcfce7",color:"#15803d" }}>● Live</span>
                        : <span style={{ padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:"#f1f5f9",color:"#64748b" }}>{item.is_active?"Scheduled":"Inactive"}</span>}
                      {item.read_by?.length>0 && <span style={{ fontSize:11,color:"#94a3b8" }}>👁 {item.read_by.length} read</span>}
                    </div>
                    <h3 style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:0 }}>{item.title}</h3>
                  </div>
                  <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                    <button onClick={()=>setView(item)} style={{ padding:6,background:"#dbeafe",color:"#2563eb",border:"none",borderRadius:6,cursor:"pointer" }} title="Preview"><Eye size={13}/></button>
                    <button onClick={()=>toggleActive(item)} style={{ padding:6,background:item.is_active?"#fef9c3":"#dcfce7",color:item.is_active?"#a16207":"#15803d",border:"none",borderRadius:6,cursor:"pointer" }} title={item.is_active?"Deactivate":"Activate"}>{item.is_active?<EyeOff size={13}/>:<Eye size={13}/>}</button>
                    <button onClick={()=>openModal(item)} style={{ padding:6,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer" }}><Edit2 size={13}/></button>
                    <button onClick={()=>handleDelete(item.id||item._id,item.title)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }}><Trash2 size={13}/></button>
                  </div>
                </div>
                <p style={{ fontSize:13,color:"#64748b",margin:"0 0 10px",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }}>{item.body}</p>
                <div style={{ display:"flex",gap:16,fontSize:11,color:"#94a3b8",flexWrap:"wrap" }}>
                  <span>By <strong style={{ color:"#475569" }}>{item.created_by_name||"HR"}</strong></span>
                  <span>Created {fmtDT(item.created_at)}</span>
                  {item.publish_at && <span>Publishes {fmtDT(item.publish_at)}</span>}
                  {item.expires_at && <span>Expires {fmtDT(item.expires_at)}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:560 }}>
            <div className="hrm-modal-header">
              <h2 className="hrm-modal-title">{editObj?"Edit":"New"} Announcement</h2>
              <button className="hrm-close-btn" onClick={()=>setModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="hrm-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
                <div><label style={lbl}>Title <span style={{ color:"#ef4444" }}>*</span></label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required style={inp} placeholder="e.g. Office closed on Diwali"/></div>
                <div><label style={lbl}>Body <span style={{ color:"#ef4444" }}>*</span></label><textarea value={form.body} onChange={e=>setForm(p=>({...p,body:e.target.value}))} required rows={5} style={{ ...inp,resize:"vertical" }} placeholder="Full announcement text…"/></div>
                <div><label style={lbl}>Priority</label>
                  <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={inp}>
                    {Object.entries(PRI_STYLE).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Publish At <span style={{ fontSize:10,color:"#94a3b8" }}>(blank = now)</span></label><input type="datetime-local" value={form.publish_at} onChange={e=>setForm(p=>({...p,publish_at:e.target.value}))} style={inp}/></div>
                  <div><label style={lbl}>Expires At <span style={{ fontSize:10,color:"#94a3b8" }}>(blank = never)</span></label><input type="datetime-local" value={form.expires_at} onChange={e=>setForm(p=>({...p,expires_at:e.target.value}))} style={inp}/></div>
                </div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Saving…":editObj?"Update":"Publish"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {view && (
        <div className="hrm-modal-overlay" onClick={()=>setView(null)}>
          <div className="hrm-modal" style={{ maxWidth:560 }} onClick={e=>e.stopPropagation()}>
            <div className="hrm-modal-header">
              <div>
                <h2 className="hrm-modal-title">{view.title}</h2>
                <div style={{ display:"flex",gap:6,marginTop:6 }}>
                  <span style={{ padding:"2px 8px",borderRadius:20,fontSize:11,fontWeight:700,background:PRI_STYLE[view.priority]?.bg,color:PRI_STYLE[view.priority]?.c }}>{PRI_STYLE[view.priority]?.label}</span>
                  <span style={{ fontSize:11,color:"#94a3b8" }}>By {view.created_by_name||"HR"} · {fmtDT(view.created_at)}</span>
                </div>
              </div>
              <button className="hrm-close-btn" onClick={()=>setView(null)}><X size={16}/></button>
            </div>
            <div className="hrm-modal-body">
              <p style={{ fontSize:14,color:"#374151",lineHeight:1.8,whiteSpace:"pre-wrap",margin:0 }}>{view.body}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
