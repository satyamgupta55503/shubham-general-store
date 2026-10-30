"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Edit2, Save, X, KeyRound, UserX, UserCheck,
  Mail, Phone, MapPin, Calendar, DollarSign, Briefcase,
  RefreshCw, AlertCircle, Building2, CreditCard, Shield, Camera, Trash2
} from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const STATUS_STYLE = {
  active:        { bg:"#dcfce7", c:"#15803d" },
  probation:     { bg:"#fef9c3", c:"#a16207" },
  notice_period: { bg:"#ffedd5", c:"#c2410c" },
  resigned:      { bg:"#fee2e2", c:"#dc2626" },
  terminated:    { bg:"#f1f5f9", c:"#475569" },
};
const fmt  = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

const TABS = [
  { key:"overview",     label:"Overview" },
  { key:"personal",     label:"Personal" },
  { key:"salary",       label:"Salary & Bank" },
  { key:"attendance",   label:"Attendance" },
  { key:"leaves",       label:"Leaves" },
];

export default function HrmEmployeeDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();

  const [emp,        setEmp]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("overview");
  const [editMode,   setEditMode]   = useState(false);
  const [form,       setForm]       = useState({});
  const [saving,     setSaving]     = useState(false);
  const [saveErr,    setSaveErr]    = useState("");
  const [saveOk,     setSaveOk]     = useState("");
  const [depts,      setDepts]      = useState([]);
  const [desigs,     setDesigs]     = useState([]);
  const [hrmUser,    setHrmUser]    = useState({});

  /* attendance & leaves summary */
  const [attSummary, setAttSummary] = useState(null);
  const [attRecords, setAttRecords] = useState([]);
  const [leaves,     setLeaves]     = useState([]);
  const [attMonth,   setAttMonth]   = useState(new Date().getMonth()+1);
  const [attYear,    setAttYear]    = useState(new Date().getFullYear());

  /* modals */
  const [resetPwModal,   setResetPwModal]   = useState(false);
  const [deactivateModal,setDeactivateModal]= useState(false);
  const [deactReason,    setDeactReason]    = useState("resigned");
  const [pwResult,       setPwResult]       = useState("");

  /* photo upload */
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMsg,       setPhotoMsg]       = useState("");

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("hrm_user")||"{}"); setHrmUser(u); } catch {}
  }, []);

  const loadEmp = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data:e }, { data:d }, { data:dg }] = await Promise.all([
        HRM_API.get(`/employees/${id}`),
        HRM_API.get("/org/departments"),
        HRM_API.get("/org/designations"),
      ]);
      setEmp(e);
      setDepts(d||[]);
      setDesigs(dg||[]);
      setForm({
        full_name:               e.full_name||"",
        phone:                   e.phone||"",
        personal_email:          e.personal_email||"",
        department:              e.department?._id||e.department||"",
        designation:             e.designation?._id||e.designation||"",
        employment_type:         e.employment_type||"full_time",
        status:                  e.status||"active",
        date_of_joining:         e.date_of_joining ? e.date_of_joining.split("T")[0] : "",
        date_of_birth:           e.date_of_birth   ? e.date_of_birth.split("T")[0]   : "",
        gender:                  e.gender||"",
        blood_group:             e.blood_group||"",
        current_address:         e.current_address||"",
        permanent_address:       e.permanent_address||"",
        emergency_contact_name:  e.emergency_contact_name||"",
        emergency_contact_phone: e.emergency_contact_phone||"",
        bank_name:               e.bank_name||"",
        account_number:          e.account_number||"",
        ifsc_code:               e.ifsc_code||"",
        upi_id:                  e.upi_id||"",
        pf_number:               e.pf_number||"",
        esi_number:              e.esi_number||"",
        uan_number:              e.uan_number||"",
        current_ctc:             e.current_ctc||0,
        current_basic:           e.current_basic||0,
        notes:                   e.notes||"",
      });
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { loadEmp(); }, [loadEmp]);

  /* Load attendance when tab switches — use monthly endpoint filtered by employee */
  const loadAttendance = useCallback(async () => {
    try {
      const { data } = await HRM_API.get("/attendance/monthly", { params:{ employee_id:id, month:attMonth, year:attYear } });
      // monthly returns { report:[{ employee, summary, records }] }
      const empReport = (data.report||[]).find(r=>
        (r.employee?.id||r.employee?._id||r.employee)?.toString() === id
      ) || (data.report||[])[0];
      if (empReport) {
        setAttRecords(empReport.records||[]);
        setAttSummary(empReport.summary||{});
      } else {
        setAttRecords([]); setAttSummary({});
      }
    } catch {}
  }, [id, attMonth, attYear]);

  const loadLeaves = useCallback(async () => {
    try {
      const { data } = await HRM_API.get("/leaves", { params:{ employee_id:id, status:"" } });
      setLeaves(data.leaves||[]);
    } catch {}
  }, [id]);

  useEffect(() => {
    if (tab === "attendance") loadAttendance();
    if (tab === "leaves")     loadLeaves();
  }, [tab, loadAttendance, loadLeaves]);

  const handleSave = async () => {
    setSaving(true); setSaveErr(""); setSaveOk("");
    try {
      const payload = { ...form };
      // Only dept_manager cannot edit salary/bank — hr_admin and hr_manager both can
      if (hrmUser.role === "dept_manager") {
        delete payload.current_ctc; delete payload.current_basic;
        delete payload.account_number; delete payload.ifsc_code;
        delete payload.bank_name; delete payload.pf_number;
        delete payload.esi_number; delete payload.uan_number;
        delete payload.upi_id;
      }
      const { data } = await HRM_API.patch(`/employees/${id}`, payload);
      setEmp(data); setEditMode(false);
      setSaveOk("Employee updated successfully!");
      setTimeout(()=>setSaveOk(""),3000);
    } catch (err) { setSaveErr(err.response?.data?.message||"Update failed"); }
    finally { setSaving(false); }
  };

  const handleResetPw = async () => {
    try {
      const { data } = await HRM_API.post(`/employees/${id}/reset-password`);
      setPwResult(`New temp password: ${data.temp_password}`);
    } catch (err) { setPwResult("❌ " + (err.response?.data?.message||"Failed")); }
  };

  const handleDeactivate = async () => {
    try {
      await HRM_API.put(`/employees/${id}/deactivate`, { reason:deactReason });
      setDeactivateModal(false); loadEmp();
    } catch (err) { alert(err.response?.data?.message||"Failed"); }
  };

  /* Photo handlers */
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true); setPhotoMsg("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      const { data } = await HRM_API.post(`/employees/${id}/photo`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEmp(prev => ({ ...prev, profile_image: data.profile_image }));
      setPhotoMsg("✅ Photo updated!");
    } catch (ex) {
      setPhotoMsg("❌ " + (ex.response?.data?.message || "Upload failed"));
    } finally {
      setPhotoUploading(false);
      e.target.value = "";
      setTimeout(() => setPhotoMsg(""), 3000);
    }
  };

  const handleDeletePhoto = async () => {
    if (!confirm("Remove this employee's profile photo?")) return;
    setPhotoUploading(true); setPhotoMsg("");
    try {
      await HRM_API.delete(`/employees/${id}/photo`);
      setEmp(prev => ({ ...prev, profile_image: null }));
      setPhotoMsg("✅ Photo removed");
    } catch (ex) {
      setPhotoMsg("❌ " + (ex.response?.data?.message || "Remove failed"));
    } finally {
      setPhotoUploading(false);
      setTimeout(() => setPhotoMsg(""), 3000);
    }
  };

  const F   = (k)  => ({ value:form[k]||"", onChange:(e)=>setForm(p=>({...p,[k]:e.target.value})) });
  const Fn  = (k)  => ({ ...F(k), type:"number", value:form[k]||0, onChange:(e)=>setForm(p=>({...p,[k]:Number(e.target.value)})) });
  const inp = { width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" };
  const lbl = { display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5 };
  const row = { display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"300px" }}>
      <div style={{ textAlign:"center" }}>
        <div className="hrm-spinner" style={{ margin:"0 auto 12px" }}/>
        <p style={{ color:"#64748b",fontSize:14,margin:0 }}>Loading employee…</p>
      </div>
    </div>
  );

  if (!emp) return (
    <div style={{ padding:"48px",textAlign:"center" }}>
      <AlertCircle size={40} color="#dc2626" style={{ display:"block",margin:"0 auto 12px" }}/>
      <p style={{ color:"#dc2626",fontWeight:600 }}>Employee not found</p>
      <button onClick={()=>router.back()} className="hrm-btn hrm-btn-outline" style={{ marginTop:12 }}>Go Back</button>
    </div>
  );

  const st = STATUS_STYLE[emp.status]||{bg:"#f1f5f9",c:"#475569"};
  const initials = emp.full_name?.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()||"E";
  const isAdmin   = hrmUser.role === "hr_admin";
  const canViewSalaryBank = hrmUser.role === "hr_admin" || hrmUser.role === "hr_manager";

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        <button onClick={()=>router.back()} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:13,fontWeight:600,color:"#475569",cursor:"pointer" }}>
          <ArrowLeft size={14}/> Back
        </button>
        <div style={{ flex:1 }}/>
        {saveOk && <div style={{ padding:"8px 14px",background:"#dcfce7",color:"#15803d",borderRadius:8,fontSize:12,fontWeight:600 }}>✅ {saveOk}</div>}
        {saveErr && <div style={{ padding:"8px 14px",background:"#fee2e2",color:"#dc2626",borderRadius:8,fontSize:12,fontWeight:600 }}>❌ {saveErr}</div>}
        {editMode ? (
          <>
            <button onClick={()=>{setEditMode(false);setSaveErr("");}} className="hrm-btn hrm-btn-outline"><X size={14}/> Cancel</button>
            <button onClick={handleSave} className="hrm-btn hrm-btn-primary" disabled={saving}><Save size={14}/>{saving?"Saving…":"Save Changes"}</button>
          </>
        ) : (
          <>
            <button onClick={()=>setEditMode(true)} className="hrm-btn hrm-btn-outline"><Edit2 size={14}/> Edit</button>
            {isAdmin && emp.status==="active" && <button onClick={()=>setResetPwModal(true)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#fef9c3",color:"#a16207",border:"1px solid #fde68a",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}><KeyRound size={14}/> Reset Password</button>}
            {emp.status==="active" && <button onClick={()=>setDeactivateModal(true)} style={{ display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"#fee2e2",color:"#dc2626",border:"1px solid #fecaca",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer" }}><UserX size={14}/> Deactivate</button>}
          </>
        )}
      </div>

      {/* Profile Card */}
      <div className="hrm-card" style={{ padding:24,marginBottom:20 }}>
        <div style={{ display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>

          {/* ── Avatar with upload overlay ── */}
          <div style={{ position:"relative",flexShrink:0 }}>
            {emp.profile_image ? (
              <img
                src={`${process.env.NEXT_PUBLIC_BACKEND_URL||"http://localhost:5000"}/${emp.profile_image}`}
                alt={emp.full_name}
                style={{ width:72,height:72,borderRadius:"50%",objectFit:"cover",border:"3px solid #ede9fe" }}
              />
            ) : (
              <div style={{ width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontSize:26,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center" }}>
                {initials}
              </div>
            )}
            {/* Camera overlay — HR can upload */}
            <label
              htmlFor="hrm-photo-upload"
              title="Upload photo"
              style={{ position:"absolute",bottom:0,right:0,width:24,height:24,borderRadius:"50%",background:"#7c3aed",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"2px solid #fff",opacity:photoUploading?0.5:1 }}>
              <Camera size={12}/>
            </label>
            <input id="hrm-photo-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoUpload} style={{ display:"none" }}/>
          </div>

          {/* Name + meta */}
          <div style={{ flex:1,minWidth:0 }}>
            {editMode ? (
              <input {...F("full_name")} style={{ ...inp,fontSize:20,fontWeight:700,marginBottom:8 }} placeholder="Full Name"/>
            ) : (
              <h1 style={{ fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px" }}>{emp.full_name}</h1>
            )}
            <div style={{ display:"flex",gap:10,flexWrap:"wrap",alignItems:"center",fontSize:13,color:"#64748b" }}>
              <span style={{ background:"#ede9fe",color:"#5b21b6",padding:"2px 10px",borderRadius:20,fontWeight:700,fontSize:11 }}>{emp.employee_id}</span>
              <span>{emp.designation?.title||"—"}</span>
              <span>·</span>
              <span>{emp.department?.name||"—"}</span>
              <span>·</span>
              <span style={{ textTransform:"capitalize" }}>{emp.employment_type?.replace(/_/g," ")||"—"}</span>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:6,flexWrap:"wrap",fontSize:12,color:"#94a3b8" }}>
              <span><Mail size={11} style={{ verticalAlign:"middle",marginRight:3 }}/>{emp.work_email}</span>
              {emp.phone && <span><Phone size={11} style={{ verticalAlign:"middle",marginRight:3 }}/>{emp.phone}</span>}
              <span><Calendar size={11} style={{ verticalAlign:"middle",marginRight:3 }}/>Joined {fmtD(emp.date_of_joining)}</span>
            </div>
            {/* Photo msg + remove button */}
            <div style={{ display:"flex",gap:8,alignItems:"center",marginTop:6,flexWrap:"wrap" }}>
              {photoMsg && <span style={{ fontSize:12,fontWeight:600,color:photoMsg.startsWith("✅")?"#15803d":"#dc2626" }}>{photoMsg}</span>}
              {emp.profile_image && !photoUploading && (
                <button onClick={handleDeletePhoto} style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 10px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer" }}>
                  <Trash2 size={11}/> Remove Photo
                </button>
              )}
              {photoUploading && <span style={{ fontSize:11,color:"#94a3b8" }}>Uploading…</span>}
            </div>
          </div>

          <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8 }}>
            {editMode ? (
              <select {...F("status")} style={{ ...inp,width:"auto",minWidth:130 }}>
                {["active","probation","notice_period","resigned","terminated"].map(s=><option key={s} value={s}>{s.replace(/_/g," ")}</option>)}
              </select>
            ) : (
              <span style={{ padding:"5px 14px",borderRadius:20,fontWeight:700,fontSize:12,textTransform:"capitalize",background:st.bg,color:st.c }}>{emp.status?.replace(/_/g," ")}</span>
            )}
            {canViewSalaryBank && emp.current_ctc > 0 && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:11,color:"#94a3b8" }}>Annual CTC</div>
                <div style={{ fontSize:18,fontWeight:800,color:"#0f172a" }}>{fmt(emp.current_ctc)}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="hrm-tabs" style={{ marginBottom:20 }}>
        {TABS.map(t=>(
          <button key={t.key} className={`hrm-tab ${tab===t.key?"active":"inactive"}`} onClick={()=>setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab==="overview" && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20 }}>

          {/* Work Info */}
          <div className="hrm-card" style={{ padding:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
              <Briefcase size={16} color="#7c3aed"/><h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>Work Information</h3>
            </div>
            {editMode ? (
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div><label style={lbl}>Department</label>
                  <select {...F("department")} style={inp}><option value="">—</option>{depts.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.name}</option>)}</select>
                </div>
                <div><label style={lbl}>Designation</label>
                  <select {...F("designation")} style={inp}><option value="">—</option>{desigs.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.title}</option>)}</select>
                </div>
                <div><label style={lbl}>Employment Type</label>
                  <select {...F("employment_type")} style={inp}>{["full_time","part_time","intern","freelancer","contract"].map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}</select>
                </div>
                <div><label style={lbl}>Date of Joining</label><input type="date" {...F("date_of_joining")} style={inp}/></div>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10,fontSize:13 }}>
                {[
                  [Building2, "Department",      emp.department?.name||"—"],
                  [Briefcase, "Designation",     emp.designation?.title||"—"],
                  [Shield,    "Employment Type", emp.employment_type?.replace(/_/g," ")||"—"],
                  [Calendar,  "Date of Joining", fmtD(emp.date_of_joining)],
                  [Calendar,  "Last Working Day",fmtD(emp.last_working_day)],
                ].map(([Icon,l,v])=>(
                  <div key={l} style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <Icon size={13} color="#94a3b8" style={{ flexShrink:0 }}/>
                    <span style={{ color:"#64748b",minWidth:120,flexShrink:0 }}>{l}:</span>
                    <span style={{ fontWeight:600,color:"#0f172a",textTransform:"capitalize" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contact */}
          <div className="hrm-card" style={{ padding:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
              <Phone size={16} color="#7c3aed"/><h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>Contact</h3>
            </div>
            {editMode ? (
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div><label style={lbl}>Work Email</label><input value={emp.work_email} disabled style={{ ...inp,background:"#f8fafc",color:"#94a3b8" }}/></div>
                <div><label style={lbl}>Personal Email</label><input type="email" {...F("personal_email")} style={inp}/></div>
                <div><label style={lbl}>Phone</label><input {...F("phone")} style={inp}/></div>
                <div><label style={lbl}>Current Address</label><textarea {...F("current_address")} rows={2} style={{ ...inp,resize:"vertical" }}/></div>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10,fontSize:13 }}>
                {[
                  [Mail,    "Work Email",     emp.work_email],
                  [Mail,    "Personal Email", emp.personal_email||"—"],
                  [Phone,   "Phone",          emp.phone||"—"],
                  [MapPin,  "Address",        emp.current_address||"—"],
                ].map(([Icon,l,v])=>(
                  <div key={l} style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
                    <Icon size={13} color="#94a3b8" style={{ flexShrink:0,marginTop:2 }}/>
                    <span style={{ color:"#64748b",minWidth:100,flexShrink:0 }}>{l}:</span>
                    <span style={{ fontWeight:600,color:"#0f172a",wordBreak:"break-all" }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency */}
          <div className="hrm-card" style={{ padding:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
              <AlertCircle size={16} color="#7c3aed"/><h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>Emergency Contact</h3>
            </div>
            {editMode ? (
              <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                <div><label style={lbl}>Contact Name</label><input {...F("emergency_contact_name")} style={inp}/></div>
                <div><label style={lbl}>Contact Phone</label><input {...F("emergency_contact_phone")} style={inp}/></div>
              </div>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:10,fontSize:13 }}>
                <div style={{ display:"flex",gap:10 }}><span style={{ color:"#64748b",minWidth:60 }}>Name:</span><span style={{ fontWeight:600,color:"#0f172a" }}>{emp.emergency_contact_name||"—"}</span></div>
                <div style={{ display:"flex",gap:10 }}><span style={{ color:"#64748b",minWidth:60 }}>Phone:</span><span style={{ fontWeight:600,color:"#0f172a" }}>{emp.emergency_contact_phone||"—"}</span></div>
              </div>
            )}
          </div>

          {/* Salary preview (admin + manager) */}
          {canViewSalaryBank && (
            <div className="hrm-card" style={{ padding:20 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
                <DollarSign size={16} color="#7c3aed"/><h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>Salary</h3>
              </div>
              {editMode ? (
                <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                  <div><label style={lbl}>Annual CTC (₹)</label><input type="number" {...Fn("current_ctc")} style={inp}/></div>
                  <div><label style={lbl}>Monthly Basic (₹)</label><input type="number" {...Fn("current_basic")} style={inp}/></div>
                </div>
              ) : (
                <div style={{ display:"flex",flexDirection:"column",gap:10,fontSize:13 }}>
                  <div style={{ display:"flex",gap:10 }}><span style={{ color:"#64748b",minWidth:90 }}>Annual CTC:</span><span style={{ fontWeight:700,color:"#0f172a" }}>{fmt(emp.current_ctc)}</span></div>
                  <div style={{ display:"flex",gap:10 }}><span style={{ color:"#64748b",minWidth:90 }}>Monthly Basic:</span><span style={{ fontWeight:700,color:"#0f172a" }}>{fmt(emp.current_basic)}</span></div>
                  <div style={{ display:"flex",gap:10 }}><span style={{ color:"#64748b",minWidth:90 }}>Monthly Gross:</span><span style={{ fontWeight:700,color:"#7c3aed" }}>{fmt(emp.current_ctc/12)}</span></div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="hrm-card" style={{ padding:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
              <Edit2 size={16} color="#7c3aed"/><h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>Notes</h3>
            </div>
            {editMode ? (
              <textarea {...F("notes")} rows={4} placeholder="Internal HR notes…" style={{ ...inp,resize:"vertical" }}/>
            ) : (
              <p style={{ fontSize:13,color:emp.notes?"#374151":"#94a3b8",lineHeight:1.6,margin:0 }}>{emp.notes||"No notes added."}</p>
            )}
          </div>
        </div>
      )}

      {/* ── PERSONAL TAB ── */}
      {tab==="personal" && (
        <div style={{ maxWidth:600 }}>
          <div className="hrm-card" style={{ padding:24,display:"flex",flexDirection:"column",gap:16 }}>
            <div style={row}>
              <div><label style={lbl}>Date of Birth</label>
                {editMode ? <input type="date" {...F("date_of_birth")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{fmtD(emp.date_of_birth)}</div>}
              </div>
              <div><label style={lbl}>Gender</label>
                {editMode ? <select {...F("gender")} style={inp}><option value="">—</option>{["male","female","other"].map(g=><option key={g} value={g}>{g.charAt(0).toUpperCase()+g.slice(1)}</option>)}</select>
                : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0",textTransform:"capitalize" }}>{emp.gender||"—"}</div>}
              </div>
            </div>
            <div style={row}>
              <div><label style={lbl}>Blood Group</label>
                {editMode ? <select {...F("blood_group")} style={inp}><option value="">—</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b} value={b}>{b}</option>)}</select>
                : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.blood_group||"—"}</div>}
              </div>
            </div>
            <div><label style={lbl}>Current Address</label>
              {editMode ? <textarea {...F("current_address")} rows={2} style={{ ...inp,resize:"vertical" }}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0",lineHeight:1.5 }}>{emp.current_address||"—"}</div>}
            </div>
            <div><label style={lbl}>Permanent Address</label>
              {editMode ? <textarea {...F("permanent_address")} rows={2} style={{ ...inp,resize:"vertical" }}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0",lineHeight:1.5 }}>{emp.permanent_address||"—"}</div>}
            </div>
            <div style={row}>
              <div><label style={lbl}>Emergency Contact</label>
                {editMode ? <input {...F("emergency_contact_name")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.emergency_contact_name||"—"}</div>}
              </div>
              <div><label style={lbl}>Emergency Phone</label>
                {editMode ? <input {...F("emergency_contact_phone")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.emergency_contact_phone||"—"}</div>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SALARY & BANK TAB ── */}
      {tab==="salary" && (
        <div style={{ maxWidth:600 }}>
          {canViewSalaryBank ? (
            <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
              {/* Salary */}
              <div className="hrm-card" style={{ padding:24 }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}><DollarSign size={15} color="#7c3aed"/>Salary Details</h3>
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  <div style={row}>
                    <div><label style={lbl}>Annual CTC (₹)</label>
                      {editMode && canViewSalaryBank ? <input type="number" {...Fn("current_ctc")} style={inp}/> : <div style={{ fontSize:15,fontWeight:800,color:"#0f172a",padding:"6px 0" }}>{fmt(emp.current_ctc)}</div>}
                    </div>
                    <div><label style={lbl}>Monthly Basic (₹)</label>
                      {editMode && canViewSalaryBank ? <input type="number" {...Fn("current_basic")} style={inp}/> : <div style={{ fontSize:15,fontWeight:800,color:"#0f172a",padding:"6px 0" }}>{fmt(emp.current_basic)}</div>}
                    </div>
                  </div>
                  <div style={{ padding:"12px 16px",background:"#f5f3ff",borderRadius:8,fontSize:12,color:"#5b21b6",display:"flex",gap:16,flexWrap:"wrap" }}>
                    <span>Monthly Gross ≈ <strong>{fmt(Math.round(emp.current_ctc/12))}</strong></span>
                    <span>PF (12%) ≈ <strong>-{fmt(Math.round(emp.current_basic*0.12))}</strong></span>
                    <span>Net ≈ <strong>{fmt(Math.round(emp.current_ctc/12 - emp.current_basic*0.24 - 200))}</strong></span>
                  </div>
                </div>
              </div>

              {/* Bank */}
              <div className="hrm-card" style={{ padding:24 }}>
                <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px",display:"flex",alignItems:"center",gap:8 }}><CreditCard size={15} color="#7c3aed"/>Bank Details</h3>
                <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                  <div style={row}>
                    <div><label style={lbl}>Bank Name</label>
                      {editMode && canViewSalaryBank ? <input {...F("bank_name")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.bank_name||"—"}</div>}
                    </div>
                    <div><label style={lbl}>Account Number</label>
                      {editMode && canViewSalaryBank ? <input {...F("account_number")} style={inp} placeholder="Full account number"/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.account_number ? (editMode ? emp.account_number : `XXXX XXXX ${emp.account_number.slice(-4)}`) : "—"}</div>}
                    </div>
                  </div>
                  <div style={row}>
                    <div><label style={lbl}>IFSC Code</label>
                      {editMode && canViewSalaryBank ? <input {...F("ifsc_code")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.ifsc_code||"—"}</div>}
                    </div>
                    <div><label style={lbl}>UPI ID</label>
                      {editMode && canViewSalaryBank ? <input {...F("upi_id")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.upi_id||"—"}</div>}
                    </div>
                  </div>
                  <div style={row}>
                    <div><label style={lbl}>PF Number</label>
                      {editMode && canViewSalaryBank ? <input {...F("pf_number")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.pf_number||"—"}</div>}
                    </div>
                    <div><label style={lbl}>ESI Number</label>
                      {editMode && canViewSalaryBank ? <input {...F("esi_number")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.esi_number||"—"}</div>}
                    </div>
                  </div>
                  <div style={row}>
                    <div><label style={lbl}>UAN Number</label>
                      {editMode && canViewSalaryBank ? <input {...F("uan_number")} style={inp}/> : <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",padding:"9px 0" }}>{emp.uan_number||"—"}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ padding:"48px",textAlign:"center",background:"#fffbeb",borderRadius:12,border:"1px solid #fde68a" }}>
              <Shield size={32} color="#a16207" style={{ display:"block",margin:"0 auto 10px" }}/>
              <p style={{ fontSize:14,color:"#92400e",fontWeight:600,margin:0 }}>Bank and salary details are not accessible for your role</p>
            </div>
          )}
        </div>
      )}

      {/* ── ATTENDANCE TAB ── */}
      {tab==="attendance" && (
        <div>
          <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center" }}>
            <select value={attMonth} onChange={e=>setAttMonth(Number(e.target.value))} style={{ padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
              {Array.from({length:12},(_,i)=>new Date(2024,i)).map((d,i)=><option key={i} value={i+1}>{d.toLocaleString("en-IN",{month:"long"})}</option>)}
            </select>
            <select value={attYear} onChange={e=>setAttYear(Number(e.target.value))} style={{ padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
              {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={loadAttendance} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={13}/></button>
          </div>

          {attSummary && (
            <div style={{ display:"flex",gap:10,marginBottom:20,flexWrap:"wrap" }}>
              {[["Present",(attSummary.present||0)+(attSummary.late||0),"#dcfce7","#15803d"],["Late",attSummary.late,"#fef9c3","#a16207"],["Absent",attSummary.absent,"#fee2e2","#dc2626"],["On Leave",attSummary.on_leave,"#dbeafe","#1d4ed8"],["WFH",attSummary.wfh,"#ede9fe","#7c3aed"]].map(([l,v,bg,c])=>(
                <div key={l} style={{ padding:"8px 16px",borderRadius:20,background:bg,color:c,fontSize:12,fontWeight:700 }}>{l}: {v||0}</div>
              ))}
            </div>
          )}

          <div className="hrm-card">
            <div className="hrm-table-wrap">
              <table className="hrm-table">
                <thead><tr>{["Date","Employee","Check In","Check Out","Hours","Status"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {attRecords.length===0
                    ? <tr><td colSpan={6} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No attendance records found</td></tr>
                    : attRecords.map((r,i)=>{
                        const s  = r.status||"absent";
                        const SC = { present:{bg:"#dcfce7",c:"#15803d"},late:{bg:"#fef9c3",c:"#a16207"},absent:{bg:"#fee2e2",c:"#dc2626"},on_leave:{bg:"#dbeafe",c:"#1d4ed8"},wfh:{bg:"#ede9fe",c:"#7c3aed"},half_day:{bg:"#ffedd5",c:"#c2410c"},holiday:{bg:"#f1f5f9",c:"#475569"},weekly_off:{bg:"#f1f5f9",c:"#94a3b8"} };
                        const sc = SC[s]||{bg:"#f1f5f9",c:"#475569"};
                        const fmtT = (d)=>d?new Date(d).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true}):"—";
                        return (
                          <tr key={i}>
                            <td style={{ fontWeight:600,color:"#0f172a",fontSize:12 }}>{fmtD(r.date)}</td>
                            <td style={{ fontSize:12,color:"#374151" }}>{emp.full_name}</td>
                            <td style={{ fontSize:12,color:"#374151" }}>{fmtT(r.check_in)}</td>
                            <td style={{ fontSize:12,color:"#374151" }}>{fmtT(r.check_out)}</td>
                            <td style={{ fontSize:12,color:"#374151" }}>{r.work_hours?.toFixed(1)||"0.0"}h</td>
                            <td><span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,textTransform:"capitalize",background:sc.bg,color:sc.c }}>{s.replace(/_/g," ")}</span></td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── LEAVES TAB ── */}
      {tab==="leaves" && (
        <div>
          <div style={{ display:"flex",justifyContent:"flex-end",marginBottom:16 }}>
            <button onClick={loadLeaves} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={13}/></button>
          </div>
          <div className="hrm-card">
            <div className="hrm-table-wrap">
              <table className="hrm-table">
                <thead><tr>{["Leave Type","Dates","Days","Status","Reason"].map(h=><th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {leaves.length===0
                    ? <tr><td colSpan={5} style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>No leave records found</td></tr>
                    : leaves.map(l=>{
                        const ST = { pending:{bg:"#fef9c3",c:"#a16207"},approved:{bg:"#dcfce7",c:"#15803d"},rejected:{bg:"#fee2e2",c:"#dc2626"},cancelled:{bg:"#f1f5f9",c:"#475569"} };
                        const st2 = ST[l.status]||{bg:"#f1f5f9",c:"#475569"};
                        return (
                          <tr key={l.id||l._id}>
                            <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,background:"#ede9fe",color:"#5b21b6" }}>{l.leave_type?.code||l.leave_type_code||"—"}</span></td>
                            <td style={{ fontSize:12,color:"#374151" }}>{fmtD(l.from_date)} → {fmtD(l.to_date)}</td>
                            <td style={{ fontWeight:600,color:"#0f172a" }}>{l.days}</td>
                            <td><span style={{ padding:"3px 9px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:st2.bg,color:st2.c }}>{l.status}</span></td>
                            <td style={{ fontSize:12,color:"#64748b",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }} title={l.reason}>{l.reason||"—"}</td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {resetPwModal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:420 }}>
            <div className="hrm-modal-header">
              <h2 className="hrm-modal-title">Reset EMP Password</h2>
              <button className="hrm-close-btn" onClick={()=>{setResetPwModal(false);setPwResult("");}}><X size={16}/></button>
            </div>
            <div className="hrm-modal-body">
              <p style={{ fontSize:13,color:"#374151",margin:"0 0 14px" }}>
                This resets <strong>{emp.full_name}</strong>'s EMP portal password to a temporary one. Share it securely.
              </p>
              {pwResult ? (
                <div style={{ padding:"12px 16px",background:pwResult.startsWith("❌")?"#fee2e2":"#dcfce7",color:pwResult.startsWith("❌")?"#dc2626":"#15803d",borderRadius:8,fontSize:13,fontWeight:600,fontFamily:"monospace" }}>{pwResult}</div>
              ) : (
                <button onClick={handleResetPw} className="hrm-btn hrm-btn-primary" style={{ width:"100%" }}><KeyRound size={14}/> Generate New Password</button>
              )}
            </div>
            <div className="hrm-modal-footer">
              <button className="hrm-btn hrm-btn-outline" onClick={()=>{setResetPwModal(false);setPwResult("");}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DEACTIVATE MODAL ── */}
      {deactivateModal && (
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{ maxWidth:420 }}>
            <div className="hrm-modal-header">
              <h2 className="hrm-modal-title">Deactivate Employee</h2>
              <button className="hrm-close-btn" onClick={()=>setDeactivateModal(false)}><X size={16}/></button>
            </div>
            <div className="hrm-modal-body">
              <p style={{ fontSize:13,color:"#374151",marginBottom:14 }}>Deactivate <strong>{emp.full_name}</strong>?</p>
              <label style={lbl}>Separation Reason</label>
              <select value={deactReason} onChange={e=>setDeactReason(e.target.value)} style={inp}>
                <option value="resigned">Resigned</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            <div className="hrm-modal-footer">
              <button className="hrm-btn hrm-btn-outline" onClick={()=>setDeactivateModal(false)}>Cancel</button>
              <button onClick={handleDeactivate} style={{ display:"flex",alignItems:"center",gap:6,padding:"9px 18px",background:"#dc2626",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer" }}><UserX size={14}/>Confirm Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
