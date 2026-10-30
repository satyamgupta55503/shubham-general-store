"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit2, Eye, UserX, RefreshCw, X } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const STATUS_STYLE = { active:{bg:"#dcfce7",c:"#15803d"}, probation:{bg:"#fef9c3",c:"#a16207"}, notice_period:{bg:"#ffedd5",c:"#c2410c"}, resigned:{bg:"#fee2e2",c:"#dc2626"}, terminated:{bg:"#f1f5f9",c:"#475569"} };
const EMP_TYPES = ["full_time","part_time","intern","freelancer","contract"];
const EMPTY = { full_name:"", work_email:"", personal_email:"", phone:"", department:"", designation:"", employment_type:"full_time", date_of_joining:"", current_ctc:"", current_basic:"", notes:"" };

export default function HrmEmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [depts,     setDepts]     = useState([]);
  const [desigs,    setDesigs]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [filterDept,  setFilterDept]  = useState("");
  const [filterStatus,setFilterStatus]= useState("active");
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState(EMPTY);
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = { status:filterStatus||undefined, department:filterDept||undefined, search:search||undefined };
      const [{ data:e }, { data:d }, { data:dg }] = await Promise.all([
        HRM_API.get("/employees", { params }),
        HRM_API.get("/org/departments"),
        HRM_API.get("/org/designations"),
      ]);
      setEmployees(e.employees||[]); setTotal(e.total||0);
      setDepts(d||[]); setDesigs(dg||[]);
    } catch {} finally { setLoading(false); }
  }, [search, filterDept, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (ev) => {
    ev.preventDefault(); setSaving(true); setErr("");
    try {
      await HRM_API.post("/employees", form);
      setModal(false); setForm(EMPTY); load();
    } catch (e) { setErr(e.response?.data?.message||"Save failed"); }
    finally { setSaving(false); }
  };

  const deactivate = async (id, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try { await HRM_API.put(`/employees/${id}/deactivate`, { reason:"resigned" }); load(); }
    catch (e) { alert(e.response?.data?.message||"Failed"); }
  };

  const F = (k) => ({ value:form[k]||"", onChange:(e)=>setForm(p=>({...p,[k]:e.target.value})) });
  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Employees</h1><p className="hrm-page-sub">{total} total</p></div>
        <button className="hrm-btn hrm-btn-primary" onClick={()=>{ setForm(EMPTY); setErr(""); setModal(true); }}><Plus size={15}/> Add Employee</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
        <div className="hrm-search-bar"><Search size={15} color="#94a3b8"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees…" style={{ border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,minWidth:0,fontFamily:"inherit" }}/></div>
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{ ...inp, width:"auto",minWidth:140 }}>
          <option value="">All Departments</option>
          {depts.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ ...inp, width:"auto",minWidth:120 }}>
          <option value="">All Status</option>
          {["active","probation","notice_period","resigned","terminated"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
        </select>
        <button onClick={load} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={14}/></button>
      </div>

      {/* Table */}
      <div className="hrm-card">
        <div className="hrm-table-wrap">
          <table className="hrm-table">
            <thead>
              <tr>{["Employee","Department","Designation","Type","Status","Actions"].map(h=><th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</td></tr>
              : employees.length===0 ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No employees found.</td></tr>
              : employees.map(e=>{
                const st = STATUS_STYLE[e.status]||{bg:"#f1f5f9",c:"#475569"};
                return (
                  <tr key={e.id||e._id} onClick={()=>router.push(`/hrm/dashboard/employees/${e.id||e._id}`)} style={{ cursor:"pointer" }}>
                    <td>
                      <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0 }}>{e.full_name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div style={{ fontWeight:600,color:"#0f172a" }}>{e.full_name}</div>
                          <div style={{ fontSize:11,color:"#94a3b8" }}>{e.employee_id} · {e.work_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:"#374151" }}>{e.department?.name||"—"}</td>
                    <td style={{ color:"#374151" }}>{e.designation?.title||"—"}</td>
                    <td style={{ textTransform:"capitalize",color:"#374151",fontSize:12 }}>{e.employment_type?.replace(/_/g," ")||"—"}</td>
                    <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st.bg,color:st.c }}>{e.status?.replace(/_/g," ")}</span></td>
                    <td>
                      <div style={{ display:"flex",gap:5 }} onClick={ev=>ev.stopPropagation()}>
                        <button onClick={()=>router.push(`/hrm/dashboard/employees/${e.id||e._id}`)} style={{ padding:6,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer" }} title="View"><Eye size={13}/></button>
                        {e.status==="active" && <button onClick={()=>deactivate(e.id||e._id,e.full_name)} style={{ padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer" }} title="Deactivate"><UserX size={13}/></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {modal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:640 }}>
            <div className="hrm-modal-header"><h2 className="hrm-modal-title">Add New Employee</h2><button className="hrm-close-btn" onClick={()=>setModal(false)}><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="hrm-modal-body" style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {err && <div style={{ background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13 }}>{err}</div>}
                <div className="hrm-form-row">
                  <div><label style={lbl}>Full Name <span style={{ color:"#ef4444" }}>*</span></label><input {...F("full_name")} required style={inp}/></div>
                  <div><label style={lbl}>Work Email <span style={{ color:"#ef4444" }}>*</span></label><input type="email" {...F("work_email")} required style={inp}/></div>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Personal Email</label><input type="email" {...F("personal_email")} style={inp}/></div>
                  <div><label style={lbl}>Phone</label><input {...F("phone")} style={inp}/></div>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Department</label><select {...F("department")} style={inp}><option value="">Select…</option>{depts.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.name}</option>)}</select></div>
                  <div><label style={lbl}>Designation</label><select {...F("designation")} style={inp}><option value="">Select…</option>{desigs.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.title}</option>)}</select></div>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Employment Type</label><select {...F("employment_type")} style={inp}>{EMP_TYPES.map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}</select></div>
                  <div><label style={lbl}>Date of Joining</label><input type="date" {...F("date_of_joining")} style={inp}/></div>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Annual CTC (₹)</label><input type="number" {...F("current_ctc")} placeholder="420000" style={inp}/></div>
                  <div><label style={lbl}>Monthly Basic (₹)</label><input type="number" {...F("current_basic")} placeholder="20000" style={inp}/></div>
                </div>
                <div><label style={lbl}>Notes</label><textarea {...F("notes")} rows={2} style={{ ...inp,resize:"vertical" }}/></div>
                <div style={{ padding:"10px 14px",background:"#fef9c3",borderRadius:8,fontSize:12,color:"#92400e" }}>⚠️ A temporary password will be auto-generated for the EMP portal login. Share it securely with the employee.</div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Saving…":"Create Employee"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
