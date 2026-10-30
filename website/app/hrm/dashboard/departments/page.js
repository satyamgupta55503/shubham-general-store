"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

export default function HrmDepartmentsPage() {
  const [depts,  setDepts]  = useState([]);
  const [desigs, setDesigs] = useState([]);
  const [tab,    setTab]    = useState("departments");
  const [modal,  setModal]  = useState(null); // "dept"|"desig"
  const [editObj,setEditObj]= useState(null);
  const [form,   setForm]   = useState({});
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data:d }, { data:dg }] = await Promise.all([HRM_API.get("/org/departments"), HRM_API.get("/org/designations")]);
      setDepts(d||[]); setDesigs(dg||[]);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };
  const F = (k) => ({ value:form[k]||"", onChange:(e)=>setForm(p=>({...p,[k]:e.target.value})) });

  const openDeptModal = (obj=null) => { setEditObj(obj); setForm(obj?{name:obj.name,description:obj.description||""}:{}); setErr(""); setModal("dept"); };
  const openDesigModal = (obj=null) => { setEditObj(obj); setForm(obj?{title:obj.title,level:obj.level||"junior",description:obj.description||"",department:obj.department?._id||obj.department||""}:{}); setErr(""); setModal("desig"); };

  const saveDept = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (editObj) await HRM_API.patch(`/org/departments/${editObj.id||editObj._id}`, form);
      else         await HRM_API.post("/org/departments", form);
      setModal(null); load();
    } catch (err) { setErr(err.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const saveDesig = async (e) => {
    e.preventDefault(); setSaving(true); setErr("");
    try {
      if (editObj) await HRM_API.patch(`/org/designations/${editObj.id||editObj._id}`, form);
      else         await HRM_API.post("/org/designations", form);
      setModal(null); load();
    } catch (err) { setErr(err.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const deleteDept = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await HRM_API.delete(`/org/departments/${id}`); load(); }
    catch (e) { alert(e.response?.data?.message||"Delete failed"); }
  };

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Departments & Designations</h1><p className="hrm-page-sub">Manage your organisation structure</p></div>
        <button className="hrm-btn hrm-btn-primary" onClick={()=>tab==="departments"?openDeptModal():openDesigModal()}><Plus size={15}/> Add {tab==="departments"?"Department":"Designation"}</button>
      </div>

      {/* Tabs */}
      <div className="hrm-tabs" style={{ marginBottom:20 }}>
        {["departments","designations"].map(t=>(
          <button key={t} className={`hrm-tab ${tab===t?"active":"inactive"}`} onClick={()=>setTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {/* Departments */}
      {tab==="departments" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16 }}>
          {depts.length===0 ? <div style={{ gridColumn:"1/-1",padding:"48px",textAlign:"center",color:"#94a3b8" }}>No departments yet.</div>
          : depts.map(d=>(
            <div key={d.id||d._id} className="hrm-card" style={{ padding:20 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10 }}>
                <div style={{ width:40,height:40,borderRadius:10,background:"#ede9fe",color:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16 }}>{d.name?.[0]?.toUpperCase()}</div>
                <div style={{ display:"flex",gap:6 }}>
                  <button onClick={()=>openDeptModal(d)} style={{ padding:6,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer" }}><Edit2 size={12}/></button>
                  <button onClick={()=>deleteDept(d.id||d._id,d.name)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }}><Trash2 size={12}/></button>
                </div>
              </div>
              <h3 style={{ fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 4px" }}>{d.name}</h3>
              {d.description && <p style={{ fontSize:12,color:"#64748b",margin:"0 0 10px",lineHeight:1.5 }}>{d.description}</p>}
              <div style={{ display:"flex",justifyContent:"space-between",paddingTop:10,borderTop:"1px solid #f1f5f9",fontSize:12,color:"#64748b" }}>
                <span>{d.employee_count||0} employees</span>
                {d.hod && <span>HOD: {d.hod.full_name}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Designations */}
      {tab==="designations" && (
        <div className="hrm-card">
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead><tr>{["Title","Department","Level","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {desigs.length===0 ? <tr><td colSpan={4} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No designations yet.</td></tr>
                : desigs.map(d=>(
                  <tr key={d.id||d._id}>
                    <td style={{ fontWeight:600,color:"#0f172a" }}>{d.title}</td>
                    <td style={{ color:"#374151" }}>{d.department?.name||"—"}</td>
                    <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:"#ede9fe",color:"#5b21b6" }}>{d.level||"junior"}</span></td>
                    <td>
                      <div style={{ display:"flex",gap:5 }}>
                        <button onClick={()=>openDesigModal(d)} style={{ padding:6,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer" }}><Edit2 size={12}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dept Modal */}
      {modal==="dept" && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:480 }}>
            <div className="hrm-modal-header"><h2 className="hrm-modal-title">{editObj?"Edit":"Add"} Department</h2><button className="hrm-close-btn" onClick={()=>setModal(null)}><X size={16}/></button></div>
            <form onSubmit={saveDept}>
              <div className="hrm-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
                <div><label style={lbl}>Department Name <span style={{ color:"#ef4444" }}>*</span></label><input {...F("name")} required style={inp}/></div>
                <div><label style={lbl}>Description</label><textarea {...F("description")} rows={3} style={{ ...inp,resize:"vertical" }}/></div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Saving…":editObj?"Update":"Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Desig Modal */}
      {modal==="desig" && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:480 }}>
            <div className="hrm-modal-header"><h2 className="hrm-modal-title">{editObj?"Edit":"Add"} Designation</h2><button className="hrm-close-btn" onClick={()=>setModal(null)}><X size={16}/></button></div>
            <form onSubmit={saveDesig}>
              <div className="hrm-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
                <div><label style={lbl}>Title <span style={{ color:"#ef4444" }}>*</span></label><input {...F("title")} required style={inp}/></div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Department</label><select {...F("department")} style={inp}><option value="">Select…</option>{depts.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.name}</option>)}</select></div>
                  <div><label style={lbl}>Level</label><select {...F("level")} style={inp}>{["intern","junior","mid","senior","lead","manager","director"].map(l=><option key={l} value={l}>{l}</option>)}</select></div>
                </div>
                <div><label style={lbl}>Description</label><textarea {...F("description")} rows={2} style={{ ...inp,resize:"vertical" }}/></div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setModal(null)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Saving…":editObj?"Update":"Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
