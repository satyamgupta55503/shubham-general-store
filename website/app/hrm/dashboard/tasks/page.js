"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, X, Clock, CheckCircle, RefreshCw,
  Search, ChevronDown, ChevronUp, MessageSquare, Send,
  AlertTriangle, Users, BarChart2, Calendar, Filter
} from "lucide-react";
import HRM_API from "@/utils/hrmApi";

/* ─────────────────────── Constants ─────────────────────── */
const CATS = { design:"🎨",development:"💻",meeting:"🤝",research:"🔍",review:"📋",client:"👤",admin:"📁",other:"📌" };
const CAT_LIST = [
  {v:"design",l:"🎨 Design"},{v:"development",l:"💻 Development"},{v:"meeting",l:"🤝 Meeting"},
  {v:"research",l:"🔍 Research"},{v:"review",l:"📋 Review"},{v:"client",l:"👤 Client"},
  {v:"admin",l:"📁 Admin"},{v:"other",l:"📌 Other"},
];
const STATUS_CFG = {
  todo:        {label:"To Do",       bg:"#f1f5f9",c:"#475569"},
  in_progress: {label:"In Progress", bg:"#dbeafe",c:"#1d4ed8"},
  done:        {label:"Done",        bg:"#dcfce7",c:"#15803d"},
  blocked:     {label:"Blocked",     bg:"#fee2e2",c:"#dc2626"},
  cancelled:   {label:"Cancelled",   bg:"#f8fafc",c:"#94a3b8"},
};
const PRI_CFG = {
  urgent:{label:"🔴 Urgent",bg:"#fef2f2",c:"#dc2626"},
  high:  {label:"🟠 High",  bg:"#fff7ed",c:"#ea580c"},
  medium:{label:"🟡 Med",   bg:"#fefce8",c:"#a16207"},
  low:   {label:"🟢 Low",   bg:"#f0fdf4",c:"#15803d"},
};
const fmtD  = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
const fmtDT = (d) => d ? new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}) : "—";
const fmtDur= (m) => { if(!m)return""; return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}`; };
const TODAY = new Date().toISOString().split("T")[0];

const EMPTY_ASSIGN = {
  employee_ids:[],title:"",description:"",category:"other",
  priority:"medium",due_date:"",date:TODAY,estimated_hours:"",
  project_name:"",project_tag:"",
};

/* ─────────────────────── Component ─────────────────────── */
export default function HrmTasksPage() {
  const [tab,        setTab]       = useState("daily");
  /* daily */
  const [date,       setDate]      = useState(TODAY);
  const [dailyData,  setDailyData] = useState([]);
  const [teamSum,    setTeamSum]   = useState(null);
  const [expanded,   setExpanded]  = useState({});
  const [filterDept, setFilterDept]= useState("");
  const [search,     setSearch]    = useState("");
  const [depts,      setDepts]     = useState([]);
  /* assign */
  const [empList,    setEmpList]   = useState([]);
  const [assignForm, setAssignForm]= useState(EMPTY_ASSIGN);
  const [saving,     setSaving]    = useState(false);
  const [assignMsg,  setAssignMsg] = useState("");
  const [bulkMode,   setBulkMode]  = useState(false);
  /* assigned tasks board */
  const [assigned,   setAssigned]  = useState([]);
  const [aFilter,    setAFilter]   = useState({status:"",priority:"",employee_id:"",overdue:""});
  const [commentTask,setCommentTask]= useState(null);
  const [commentText,setCommentText]= useState("");
  const [editTask,   setEditTask]  = useState(null);
  const [editForm,   setEditForm]  = useState({});
  const [loading,    setLoading]   = useState(false);

  /* bootstrap */
  useEffect(()=>{
    Promise.all([
      HRM_API.get("/org/departments"),
      HRM_API.get("/employees",{params:{status:"active",limit:200}}),
    ]).then(([{data:d},{data:e}])=>{
      setDepts(d||[]); setEmpList(e.employees||[]);
    }).catch(()=>{});
  },[]);

  /* load daily */
  const loadDaily = useCallback(async()=>{
    try{
      setLoading(true);
      const p={date}; if(filterDept) p.department=filterDept;
      const [{data:d},{data:s}]=await Promise.all([
        HRM_API.get("/tasks/daily",{params:p}),
        HRM_API.get("/tasks/summary",{params:{date}}),
      ]);
      setDailyData(d.employees||[]); setTeamSum(s);
    }catch{}finally{setLoading(false);}
  },[date,filterDept]);

  /* load assigned */
  const loadAssigned = useCallback(async()=>{
    try{
      setLoading(true);
      const p={};
      if(aFilter.status)      p.status=aFilter.status;
      if(aFilter.priority)    p.priority=aFilter.priority;
      if(aFilter.employee_id) p.employee_id=aFilter.employee_id;
      if(aFilter.overdue)     p.overdue=aFilter.overdue;
      const {data}=await HRM_API.get("/tasks/assigned",{params:p});
      setAssigned(data||[]);
    }catch{}finally{setLoading(false);}
  },[aFilter]);

  useEffect(()=>{ if(tab==="daily")    loadDaily();   },[tab,loadDaily]);
  useEffect(()=>{ if(tab==="assigned") loadAssigned();},[tab,loadAssigned]);

  /* assign submit */
  const handleAssign = async(e)=>{
    e.preventDefault(); setSaving(true); setAssignMsg("");
    try{
      if(bulkMode){
        if(!assignForm.employee_ids.length){setAssignMsg("❌ Select at least one employee");setSaving(false);return;}
        await HRM_API.post("/tasks/bulk-assign",{...assignForm});
        setAssignMsg(`✅ Task assigned to ${assignForm.employee_ids.length} employee(s)`);
      } else {
        if(!assignForm.employee_ids[0]){setAssignMsg("❌ Select employee");setSaving(false);return;}
        await HRM_API.post("/tasks/assign",{...assignForm,employee_id:assignForm.employee_ids[0]});
        setAssignMsg("✅ Task assigned successfully!");
      }
      setAssignForm(EMPTY_ASSIGN);
      if(tab==="assigned") loadAssigned();
    }catch(ex){setAssignMsg("❌ "+(ex.response?.data?.message||"Failed"));}
    finally{setSaving(false); setTimeout(()=>setAssignMsg(""),4000);}
  };

  /* toggle emp in bulk list */
  const toggleEmp=(id)=>setAssignForm(p=>({
    ...p,employee_ids:p.employee_ids.includes(id)?p.employee_ids.filter(x=>x!==id):[...p.employee_ids,id]
  }));

  /* update assigned task */
  const handleUpdate=async(e)=>{
    e.preventDefault(); setSaving(true);
    try{
      await HRM_API.patch(`/tasks/assigned/${editTask.id||editTask._id}`,editForm);
      setEditTask(null); loadAssigned();
    }catch{}finally{setSaving(false);}
  };

  /* delete assigned */
  const handleDelete=async(id)=>{
    if(!confirm("Delete this task?"))return;
    try{await HRM_API.delete(`/tasks/assigned/${id}`); loadAssigned();}catch{}
  };

  /* add comment */
  const handleComment=async()=>{
    if(!commentText.trim())return;
    try{
      await HRM_API.post(`/tasks/${commentTask.id||commentTask._id}/comment`,{text:commentText});
      setCommentText("");
      const {data}=await HRM_API.get("/tasks/assigned",{params:{...aFilter}});
      setAssigned(data||[]);
      const updated=data.find(t=>(t.id||t._id)===(commentTask.id||commentTask._id));
      if(updated) setCommentTask(updated);
    }catch{}
  };

  const filtered=dailyData.filter(({employee:e})=>
    !search||e.full_name.toLowerCase().includes(search.toLowerCase())||e.employee_id?.toLowerCase().includes(search.toLowerCase())
  );

  const inp={width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit"};
  const lbl={display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5};

  /* kanban column */
  const KanbanCol=({title,color,bg,tasks,onEdit,onDelete,onComment})=>(
    <div style={{flex:1,minWidth:200,background:bg,borderRadius:12,padding:12}}>
      <div style={{fontSize:12,fontWeight:800,color,textTransform:"uppercase",letterSpacing:".07em",marginBottom:10,display:"flex",justifyContent:"space-between"}}>
        <span>{title}</span><span style={{background:color,color:"#fff",borderRadius:20,padding:"1px 7px",fontSize:10}}>{tasks.length}</span>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {tasks.map(t=>{
          const pri=PRI_CFG[t.priority]||PRI_CFG.medium;
          const isOver=t.is_overdue;
          return(
            <div key={t.id||t._id} style={{background:"#fff",borderRadius:9,padding:"12px 14px",boxShadow:"0 1px 4px rgba(0,0,0,.07)",borderLeft:`3px solid ${isOver?"#dc2626":color}`}}>
              <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4,lineHeight:1.35}}>{t.title}</div>
              <div style={{fontSize:11,color:"#64748b",marginBottom:6}}>{t.employee?.full_name||"—"}</div>
              {isOver&&<div style={{fontSize:10,fontWeight:700,color:"#dc2626",marginBottom:4}}>⚠️ OVERDUE</div>}
              <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                <span style={{padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700,background:pri.bg,color:pri.c}}>{pri.label}</span>
                <span style={{fontSize:10,color:"#94a3b8"}}>{CATS[t.category]||"📌"} {t.category}</span>
              </div>
              {t.due_date&&<div style={{fontSize:11,color:isOver?"#dc2626":"#64748b",marginBottom:6}}>📅 Due: {fmtD(t.due_date)}</div>}
              {t.project_name&&<div style={{fontSize:11,color:"#7c3aed",marginBottom:6}}>📁 {t.project_name}</div>}
              {t.estimated_hours>0&&<div style={{fontSize:11,color:"#64748b",marginBottom:6}}>⏱ Est: {t.estimated_hours}h</div>}
              {t.comments?.length>0&&<div style={{fontSize:11,color:"#64748b",marginBottom:6}}>💬 {t.comments.length} comment{t.comments.length>1?"s":""}</div>}
              <div style={{display:"flex",gap:5,marginTop:4}}>
                <button onClick={()=>onComment(t)} style={{flex:1,padding:"5px 0",background:"#eff6ff",color:"#2563eb",border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>💬 Comment</button>
                <button onClick={()=>{setEditTask(t);setEditForm({title:t.title,description:t.description||"",category:t.category,priority:t.priority,status:t.status,due_date:t.due_date?new Date(t.due_date).toISOString().split("T")[0]:"",estimated_hours:t.estimated_hours||"",project_name:t.project_name||"",project_tag:t.project_tag||"",hr_note:t.hr_note||""});}} style={{padding:"5px 8px",background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer"}}><Edit2 size={11}/></button>
                <button onClick={()=>onDelete(t.id||t._id)} style={{padding:"5px 8px",background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer"}}><Trash2 size={11}/></button>
              </div>
            </div>
          );
        })}
        {tasks.length===0&&<div style={{fontSize:12,color:"#94a3b8",textAlign:"center",padding:"20px 0"}}>No tasks</div>}
      </div>
    </div>
  );

  const statusGroups={
    todo:       assigned.filter(t=>t.status==="todo"),
    in_progress:assigned.filter(t=>t.status==="in_progress"),
    blocked:    assigned.filter(t=>t.status==="blocked"),
    done:       assigned.filter(t=>t.status==="done"),
  };

  return(
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Task Management</h1><p className="hrm-page-sub">Assign tasks, track progress, view daily logs</p></div>
        <button onClick={()=>tab==="daily"?loadDaily():loadAssigned()} className="hrm-btn hrm-btn-outline hrm-btn-sm"><RefreshCw size={13}/></button>
      </div>

      {/* Tabs */}
      <div className="hrm-tabs" style={{marginBottom:20}}>
        <button className={`hrm-tab ${tab==="daily"?"active":"inactive"}`} onClick={()=>setTab("daily")}>📅 Daily Log</button>
        <button className={`hrm-tab ${tab==="assign"?"active":"inactive"}`} onClick={()=>setTab("assign")}>➕ Assign Task</button>
        <button className={`hrm-tab ${tab==="assigned"?"active":"inactive"}`} onClick={()=>setTab("assigned")}>📋 Assigned Tasks {assigned.filter(t=>t.is_overdue).length>0&&<span style={{background:"#dc2626",color:"#fff",fontSize:9,fontWeight:800,padding:"1px 5px",borderRadius:10,marginLeft:4}}>{assigned.filter(t=>t.is_overdue).length} overdue</span>}</button>
      </div>

      {/* ── DAILY LOG TAB ── */}
      {tab==="daily"&&(
        <>
          {/* Filters */}
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
            <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit",background:"#f8fafc"}}>
              <option value="">All Departments</option>
              {depts.map(d=><option key={d.id||d._id} value={d.id||d._id}>{d.name}</option>)}
            </select>
            <div className="hrm-search-bar" style={{maxWidth:240}}>
              <Search size={13} color="#94a3b8"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee…" style={{border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,fontFamily:"inherit"}}/>
            </div>
          </div>

          {/* Team summary */}
          {teamSum&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10,marginBottom:20}}>
              {[["Total Emp",teamSum.total_employees,"#7c3aed"],["Submitted",teamSum.submitted_today,"#15803d"],["No Log",teamSum.no_submission,"#dc2626"],["Tasks",teamSum.total_own_tasks,"#2563eb"],["Done",teamSum.total_done,"#15803d"],["Hours",`${teamSum.total_hours}h`,"#0d9488"],["Completion",`${teamSum.completion_rate}%`,"#a16207"],["Pending Assigned",teamSum.pending_assigned,"#ea580c"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 12px"}}>
                  <p style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",margin:"0 0 3px",letterSpacing:".05em",lineHeight:1.3}}>{l}</p>
                  <p style={{fontSize:18,fontWeight:800,color:c,margin:0}}>{v??0}</p>
                </div>
              ))}
            </div>
          )}

          {loading?<div style={{padding:"48px",textAlign:"center",color:"#94a3b8"}}>Loading…</div>
          :filtered.length===0?<div style={{padding:"48px",textAlign:"center",color:"#94a3b8"}}>No data for this date</div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map(({employee:emp,tasks,summary:s})=>{
              const isOpen=!!expanded[emp.id];
              const pct=s.total?Math.round((s.done/s.total)*100):0;
              return(
                <div key={emp.id} className="hrm-card">
                  <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 20px",cursor:"pointer"}} onClick={()=>setExpanded(p=>({...p,[emp.id]:!isOpen}))}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {emp.full_name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>{emp.full_name}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{emp.employee_id} · {emp.department} · {emp.designation}</div>
                    </div>
                    <div style={{display:"flex",gap:14,alignItems:"center"}}>
                      {[["Tasks",s.total,"#0f172a"],["Done",s.done,"#15803d"],["Hrs",s.total_hours+"h","#0d9488"]].map(([l,v,c])=>(
                        <div key={l} style={{textAlign:"center"}}>
                          <div style={{fontSize:15,fontWeight:800,color:s.total>0?c:"#94a3b8"}}>{v}</div>
                          <div style={{fontSize:9,color:"#94a3b8",textTransform:"uppercase"}}>{l}</div>
                        </div>
                      ))}
                      <div style={{minWidth:70}}>
                        <div style={{height:5,background:"#f1f5f9",borderRadius:99}}><div style={{height:"100%",width:`${pct}%`,background:pct===100?"#16a34a":"#7c3aed",borderRadius:99}}/></div>
                        <div style={{fontSize:10,color:"#64748b",textAlign:"right",marginTop:2}}>{pct}%</div>
                      </div>
                      {s.total===0&&<span style={{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:"#fee2e2",color:"#dc2626"}}>No log</span>}
                      {isOpen?<ChevronUp size={14} color="#94a3b8"/>:<ChevronDown size={14} color="#94a3b8"/>}
                    </div>
                  </div>
                  {isOpen&&(tasks.length===0
                    ?<div style={{padding:"18px 20px",borderTop:"1px solid #f1f5f9",color:"#94a3b8",fontSize:13}}>No tasks logged</div>
                    :tasks.map(t=>{
                      const st=STATUS_CFG[t.status]||STATUS_CFG.todo;
                      return(
                        <div key={t.id||t._id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"11px 20px",borderTop:"1px solid #f8fafc"}}>
                          <span style={{fontSize:18,flexShrink:0}}>{CATS[t.category]||"📌"}</span>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{t.title}</div>
                            <div style={{display:"flex",gap:8,fontSize:11,color:"#94a3b8",marginTop:3,flexWrap:"wrap"}}>
                              {(t.start_time||t.end_time)&&<span><Clock size={10} style={{verticalAlign:"middle"}}/> {t.start_time||"?"}{t.end_time&&` → ${t.end_time}`} {t.duration_minutes>0&&`(${fmtDur(t.duration_minutes)})`}</span>}
                              {t.project_name&&<span>📁 {t.project_name}</span>}
                              {t.description&&<span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{t.description}</span>}
                            </div>
                          </div>
                          <span style={{padding:"3px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:st.bg,color:st.c,flexShrink:0}}>{st.label}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>}
        </>
      )}

      {/* ── ASSIGN TASK TAB ── */}
      {tab==="assign"&&(
        <div style={{maxWidth:680}}>
          <div style={{display:"flex",gap:2,background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:3,width:"fit-content",marginBottom:20}}>
            {[false,true].map(b=>(
              <button key={String(b)} onClick={()=>{setBulkMode(b);setAssignForm(EMPTY_ASSIGN);}} style={{padding:"7px 16px",borderRadius:8,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:bulkMode===b?"#7c3aed":"transparent",color:bulkMode===b?"#fff":"#64748b"}}>
                {b?"👥 Assign to Multiple":"👤 Assign to One"}
              </button>
            ))}
          </div>

          {assignMsg&&<div style={{padding:"12px 16px",borderRadius:9,fontSize:13,marginBottom:16,background:assignMsg.startsWith("✅")?"#dcfce7":"#fee2e2",color:assignMsg.startsWith("✅")?"#15803d":"#dc2626"}}>{assignMsg}</div>}

          <form onSubmit={handleAssign} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:24,display:"flex",flexDirection:"column",gap:14}}>

            {/* Employee selection */}
            <div>
              <label style={lbl}>{bulkMode?"Select Employees":"Select Employee"} <span style={{color:"#ef4444"}}>*</span></label>
              {bulkMode?(
                <div style={{maxHeight:200,overflowY:"auto",border:"1.5px solid #e2e8f0",borderRadius:8,padding:8}}>
                  {empList.map(e=>(
                    <label key={e.id||e._id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:6,cursor:"pointer",background:assignForm.employee_ids.includes(e.id||e._id)?"#f5f3ff":"transparent"}}>
                      <input type="checkbox" checked={assignForm.employee_ids.includes(e.id||e._id)} onChange={()=>toggleEmp(e.id||e._id)} style={{accentColor:"#7c3aed"}}/>
                      <div style={{width:24,height:24,borderRadius:"50%",background:"#ede9fe",color:"#7c3aed",fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{e.full_name?.[0]}</div>
                      <span style={{fontSize:13,color:"#374151"}}>{e.full_name}</span>
                      <span style={{fontSize:11,color:"#94a3b8",marginLeft:"auto"}}>{e.department?.name||"—"}</span>
                    </label>
                  ))}
                </div>
              ):(
                <select value={assignForm.employee_ids[0]||""} onChange={e=>setAssignForm(p=>({...p,employee_ids:[e.target.value]}))} style={inp} required>
                  <option value="">Choose employee…</option>
                  {empList.map(e=><option key={e.id||e._id} value={e.id||e._id}>{e.full_name} ({e.employee_id}) — {e.department?.name||"—"}</option>)}
                </select>
              )}
              {bulkMode&&assignForm.employee_ids.length>0&&<div style={{fontSize:11,color:"#7c3aed",marginTop:4,fontWeight:600}}>{assignForm.employee_ids.length} employee(s) selected</div>}
            </div>

            {/* Title */}
            <div>
              <label style={lbl}>Task Title <span style={{color:"#ef4444"}}>*</span></label>
              <input value={assignForm.title} onChange={e=>setAssignForm(p=>({...p,title:e.target.value}))} required style={inp} placeholder="e.g. Create social media banners for October campaign"/>
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description / Instructions</label>
              <textarea value={assignForm.description} onChange={e=>setAssignForm(p=>({...p,description:e.target.value}))} rows={3} style={{...inp,resize:"vertical"}} placeholder="Detailed instructions, references, expected output…"/>
            </div>

            {/* Cat + Priority */}
            <div className="hrm-form-row">
              <div>
                <label style={lbl}>Category</label>
                <select value={assignForm.category} onChange={e=>setAssignForm(p=>({...p,category:e.target.value}))} style={inp}>
                  {CAT_LIST.map(c=><option key={c.v} value={c.v}>{c.l}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Priority</label>
                <select value={assignForm.priority} onChange={e=>setAssignForm(p=>({...p,priority:e.target.value}))} style={inp}>
                  {Object.entries(PRI_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div className="hrm-form-row">
              <div>
                <label style={lbl}>Task Date</label>
                <input type="date" value={assignForm.date} onChange={e=>setAssignForm(p=>({...p,date:e.target.value}))} style={inp}/>
              </div>
              <div>
                <label style={lbl}>Due Date <span style={{fontSize:10,color:"#94a3b8"}}>(deadline)</span></label>
                <input type="date" value={assignForm.due_date} onChange={e=>setAssignForm(p=>({...p,due_date:e.target.value}))} style={inp} min={TODAY}/>
              </div>
            </div>

            {/* Project + Estimate */}
            <div className="hrm-form-row">
              <div>
                <label style={lbl}>Project Name</label>
                <input value={assignForm.project_name} onChange={e=>setAssignForm(p=>({...p,project_name:e.target.value}))} style={inp} placeholder="e.g. Store Project"/>
              </div>
              <div>
                <label style={lbl}>Estimated Hours</label>
                <input type="number" value={assignForm.estimated_hours} onChange={e=>setAssignForm(p=>({...p,estimated_hours:e.target.value}))} style={inp} placeholder="2" min="0" step="0.5"/>
              </div>
            </div>

            <button type="submit" className="hrm-btn hrm-btn-primary" style={{alignSelf:"flex-start"}} disabled={saving}>
              {saving?"Assigning…":bulkMode?"👥 Assign to All Selected":"➕ Assign Task"}
            </button>
          </form>
        </div>
      )}

      {/* ── ASSIGNED TASKS BOARD (KANBAN) ── */}
      {tab==="assigned"&&(
        <>
          {/* Filters */}
          <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
            <Filter size={13} color="#94a3b8"/>
            {[["status",["","todo","in_progress","done","blocked","cancelled"]],["priority",["","urgent","high","medium","low"]]].map(([key,opts])=>(
              <select key={key} value={aFilter[key]} onChange={e=>setAFilter(p=>({...p,[key]:e.target.value}))}
                style={{padding:"7px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,outline:"none",fontFamily:"inherit",background:"#f8fafc",textTransform:"capitalize"}}>
                {opts.map(o=><option key={o} value={o}>{o||`All ${key}`}</option>)}
              </select>
            ))}
            <select value={aFilter.employee_id} onChange={e=>setAFilter(p=>({...p,employee_id:e.target.value}))} style={{padding:"7px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:12,outline:"none",fontFamily:"inherit",background:"#f8fafc",minWidth:160}}>
              <option value="">All Employees</option>
              {empList.map(e=><option key={e.id||e._id} value={e.id||e._id}>{e.full_name}</option>)}
            </select>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#dc2626",fontWeight:600,cursor:"pointer"}}>
              <input type="checkbox" checked={aFilter.overdue==="true"} onChange={e=>setAFilter(p=>({...p,overdue:e.target.checked?"true":""}))} style={{accentColor:"#dc2626"}}/>
              ⚠️ Overdue Only
            </label>
          </div>

          {/* Summary strip */}
          <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
            {[["Total",assigned.length,"#374151"],["To Do",statusGroups.todo.length,"#475569"],["In Progress",statusGroups.in_progress.length,"#1d4ed8"],["Blocked",statusGroups.blocked.length,"#dc2626"],["Done",statusGroups.done.length,"#15803d"],["Overdue",assigned.filter(t=>t.is_overdue).length,"#dc2626"]].map(([l,v,c])=>(
              <div key={l} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 14px",textAlign:"center"}}>
                <div style={{fontSize:16,fontWeight:800,color:c}}>{v}</div>
                <div style={{fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".05em"}}>{l}</div>
              </div>
            ))}
          </div>

          {loading?<div style={{padding:"48px",textAlign:"center",color:"#94a3b8"}}>Loading…</div>:(
            <div style={{display:"flex",gap:14,overflowX:"auto",paddingBottom:12}}>
              <KanbanCol title="To Do"      color="#475569" bg="#f8fafc"   tasks={statusGroups.todo}        onEdit={()=>{}} onDelete={handleDelete} onComment={setCommentTask}/>
              <KanbanCol title="In Progress" color="#1d4ed8" bg="#eff6ff"  tasks={statusGroups.in_progress} onEdit={()=>{}} onDelete={handleDelete} onComment={setCommentTask}/>
              <KanbanCol title="Blocked"    color="#dc2626" bg="#fff5f5"   tasks={statusGroups.blocked}     onEdit={()=>{}} onDelete={handleDelete} onComment={setCommentTask}/>
              <KanbanCol title="Done"       color="#15803d" bg="#f0fdf4"   tasks={statusGroups.done}        onEdit={()=>{}} onDelete={handleDelete} onComment={setCommentTask}/>
            </div>
          )}
        </>
      )}

      {/* ── COMMENT MODAL ── */}
      {commentTask&&(
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{maxWidth:500}}>
            <div className="hrm-modal-header">
              <div>
                <h2 className="hrm-modal-title">{commentTask.title}</h2>
                <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{commentTask.employee?.full_name||"—"} · {STATUS_CFG[commentTask.status]?.label}</div>
              </div>
              <button className="hrm-close-btn" onClick={()=>setCommentTask(null)}><X size={16}/></button>
            </div>
            <div className="hrm-modal-body">
              {commentTask.description&&<div style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#374151",marginBottom:16,lineHeight:1.6}}>{commentTask.description}</div>}
              {/* Comments */}
              <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {(!commentTask.comments||commentTask.comments.length===0)
                  ?<div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:16}}>No comments yet</div>
                  :commentTask.comments.map((c,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:c.author_role==="hr"?"#ede9fe":"#dbeafe",color:c.author_role==="hr"?"#7c3aed":"#2563eb",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.author_name?.[0]?.toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#0f172a"}}>{c.author_name}</span>
                          <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:c.author_role==="hr"?"#ede9fe":"#dbeafe",color:c.author_role==="hr"?"#5b21b6":"#1d4ed8",fontWeight:700}}>{c.author_role==="hr"?"HR":"Employee"}</span>
                          <span style={{fontSize:10,color:"#94a3b8"}}>{fmtDT(c.created_at)}</span>
                        </div>
                        <div style={{fontSize:13,color:"#374151",lineHeight:1.5}}>{c.text}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
              {/* Add comment */}
              <div style={{display:"flex",gap:8}}>
                <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Add a comment or note…"
                  onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&handleComment()}
                  style={{...inp,flex:1}}/>
                <button onClick={handleComment} disabled={!commentText.trim()} className="hrm-btn hrm-btn-primary" style={{padding:"9px 14px"}}><Send size={14}/></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT ASSIGNED TASK MODAL ── */}
      {editTask&&(
        <div className="hrm-modal-overlay">
          <div className="hrm-modal" style={{maxWidth:520}}>
            <div className="hrm-modal-header"><h2 className="hrm-modal-title">Edit Task</h2><button className="hrm-close-btn" onClick={()=>setEditTask(null)}><X size={16}/></button></div>
            <form onSubmit={handleUpdate}>
              <div className="hrm-modal-body" style={{display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={lbl}>Title</label><input value={editForm.title} onChange={e=>setEditForm(p=>({...p,title:e.target.value}))} style={inp}/></div>
                <div><label style={lbl}>Description</label><textarea value={editForm.description} onChange={e=>setEditForm(p=>({...p,description:e.target.value}))} rows={3} style={{...inp,resize:"vertical"}}/></div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Status</label>
                    <select value={editForm.status} onChange={e=>setEditForm(p=>({...p,status:e.target.value}))} style={inp}>
                      {Object.entries(STATUS_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div><label style={lbl}>Priority</label>
                    <select value={editForm.priority} onChange={e=>setEditForm(p=>({...p,priority:e.target.value}))} style={inp}>
                      {Object.entries(PRI_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Due Date</label><input type="date" value={editForm.due_date} onChange={e=>setEditForm(p=>({...p,due_date:e.target.value}))} style={inp}/></div>
                  <div><label style={lbl}>Est. Hours</label><input type="number" value={editForm.estimated_hours} onChange={e=>setEditForm(p=>({...p,estimated_hours:e.target.value}))} style={inp} min="0" step="0.5"/></div>
                </div>
                <div className="hrm-form-row">
                  <div><label style={lbl}>Project Name</label><input value={editForm.project_name} onChange={e=>setEditForm(p=>({...p,project_name:e.target.value}))} style={inp}/></div>
                </div>
                <div><label style={lbl}>HR Note <span style={{fontSize:10,color:"#94a3b8"}}>(internal)</span></label><textarea value={editForm.hr_note} onChange={e=>setEditForm(p=>({...p,hr_note:e.target.value}))} rows={2} style={{...inp,resize:"vertical"}} placeholder="Internal note for HR only…"/></div>
              </div>
              <div className="hrm-modal-footer">
                <button type="button" className="hrm-btn hrm-btn-outline" onClick={()=>setEditTask(null)}>Cancel</button>
                <button type="submit" className="hrm-btn hrm-btn-primary" disabled={saving}>{saving?"Saving…":"Update Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
