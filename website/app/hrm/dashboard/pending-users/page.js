"use client";
import React, { useState, useEffect } from "react";
import { Check, X, UserX, RefreshCw } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const ALL_PAGES = ["dashboard","employees","departments","attendance","leaves","payroll","history","notifications","settings"];

export default function HrmPendingUsersPage() {
  const [pending, setPending] = useState([]);
  const [active,  setActive]  = useState([]);
  const [tab,     setTab]     = useState("pending");
  const [loading, setLoading] = useState(false);
  const [approveModal, setApproveModal] = useState(null);
  const [roleForm, setRoleForm] = useState({ role:"hr_manager", page_access:[] });
  const [saving,   setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data:p }, { data:a }] = await Promise.all([HRM_API.get("/auth/pending-users"), HRM_API.get("/auth/users")]);
      setPending(p||[]); setActive(a||[]);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const approve = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await HRM_API.put(`/auth/users/${approveModal._id||approveModal.id}/approve`, roleForm);
      setApproveModal(null); load();
    } catch (err) { alert(err.response?.data?.message||"Failed"); }
    finally { setSaving(false); }
  };

  const reject = async (id, name) => {
    if (!confirm(`Reject "${name}"?`)) return;
    try { await HRM_API.delete(`/auth/users/${id}/reject`); load(); } catch {}
  };

  const deactivate = async (id, name) => {
    if (!confirm(`Deactivate "${name}"?`)) return;
    try { await HRM_API.put(`/auth/users/${id}/deactivate`); load(); } catch {}
  };

  const togglePage = (p) => setRoleForm(prev => ({ ...prev, page_access: prev.page_access.includes(p) ? prev.page_access.filter(x=>x!==p) : [...prev.page_access,p] }));
  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN") : "—";

  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">User Management</h1><p className="hrm-page-sub">{pending.length} pending · {active.length} active HR users</p></div>
        <button className="hrm-btn hrm-btn-outline hrm-btn-sm" onClick={load}><RefreshCw size={14}/></button>
      </div>

      <div className="hrm-tabs" style={{ marginBottom:20 }}>
        <button className={`hrm-tab ${tab==="pending"?"active":"inactive"}`} onClick={()=>setTab("pending")}>
          Pending {pending.length>0?<span style={{ background:"#ef4444",color:"#fff",fontSize:10,fontWeight:700,padding:"1px 5px",borderRadius:10,marginLeft:4 }}>{pending.length}</span>:null}
        </button>
        <button className={`hrm-tab ${tab==="active"?"active":"inactive"}`} onClick={()=>setTab("active")}>Active Users</button>
      </div>

      {tab==="pending" && (
        pending.length===0 ? <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No pending approvals</div>
        : <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {pending.map(u=>(
            <div key={u.id||u._id} style={{ background:"#fff",border:"1.5px solid #fde68a",borderRadius:12,padding:"18px 20px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap" }}>
              <div style={{ width:42,height:42,borderRadius:"50%",background:"#fef9c3",color:"#a16207",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,flexShrink:0 }}>{u.full_name?.[0]?.toUpperCase()}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontWeight:700,color:"#0f172a",fontSize:15 }}>{u.full_name}</div>
                <div style={{ fontSize:13,color:"#64748b" }}>{u.email} · Registered {fmtD(u.created_at)}</div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>{ setApproveModal(u); setRoleForm({ role:"hr_manager", page_access:[] }); }} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"#7c3aed",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}><Check size={14}/> Approve</button>
                <button onClick={()=>reject(u.id||u._id,u.full_name)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}><X size={14}/> Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==="active" && (
        <div className="hrm-card">
          <div className="hrm-table-wrap">
            <table className="hrm-table">
              <thead><tr>{["User","Role","Joined","Actions"].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {active.map(u=>(
                  <tr key={u.id||u._id}>
                    <td>
                      <div style={{ fontWeight:600,color:"#0f172a" }}>{u.full_name}</div>
                      <div style={{ fontSize:11,color:"#94a3b8" }}>{u.email}</div>
                    </td>
                    <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:"#ede9fe",color:"#5b21b6" }}>{u.role?.replace("_"," ")}</span></td>
                    <td style={{ fontSize:12,color:"#64748b" }}>{fmtD(u.created_at)}</td>
                    <td><button onClick={()=>deactivate(u.id||u._id,u.full_name)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontSize:12,fontWeight:600,cursor:"pointer" }}><UserX size={13}/> Deactivate</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {approveModal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:500 }}>
            <div className="hrm-modal-header"><h2 className="hrm-modal-title">Approve — {approveModal.full_name}</h2><button className="hrm-close-btn" onClick={()=>setApproveModal(null)}><X size={16}/></button></div>
            <form onSubmit={approve}>
              <div className="hrm-modal-body" style={{ display:"flex",flexDirection:"column",gap:16 }}>
                <div><label style={{ display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 }}>Assign Role</label>
                  <select value={roleForm.role} onChange={e=>setRoleForm(p=>({...p,role:e.target.value}))} style={inp}>
                    {["hr_admin","hr_manager","dept_manager"].map(r=><option key={r} value={r}>{r.replace("_"," ")}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <label style={{ fontSize:12,fontWeight:600,color:"#374151" }}>Page Access</label>
                    <button type="button" onClick={()=>setRoleForm(p=>({ ...p, page_access:p.page_access.length===ALL_PAGES.length?[]:ALL_PAGES }))} style={{ fontSize:11,color:"#7c3aed",fontWeight:600,background:"none",border:"none",cursor:"pointer" }}>
                      {roleForm.page_access.length===ALL_PAGES.length?"Deselect All":"Select All"}
                    </button>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                    {ALL_PAGES.map(page=>(
                      <label key={page} style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:12,color:"#374151",textTransform:"capitalize",userSelect:"none" }}>
                        <input type="checkbox" checked={roleForm.page_access.includes(page)} onChange={()=>togglePage(page)} style={{ width:14,height:14,accentColor:"#7c3aed" }}/>{page.replace("_"," ")}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setApproveModal(null)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Approving…":"Approve & Grant Access"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
