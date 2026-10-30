"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, X, Clock, CheckCircle, Circle,
  AlertCircle, Loader, RefreshCw, ChevronDown, ChevronUp,
  Send, MessageSquare, AlertTriangle
} from "lucide-react";
import EMP_API from "@/utils/empApi";

/* ─────────────────────── Constants ─────────────────────── */
const CATS = { design:"🎨",development:"💻",meeting:"🤝",research:"🔍",review:"📋",client:"👤",admin:"📁",other:"📌" };
const CAT_LIST = [
  {v:"design",l:"🎨 Design"},{v:"development",l:"💻 Development"},{v:"meeting",l:"🤝 Meeting"},
  {v:"research",l:"🔍 Research"},{v:"review",l:"📋 Review"},{v:"client",l:"👤 Client"},
  {v:"admin",l:"📁 Admin"},{v:"other",l:"📌 Other"},
];
const STATUS_CFG = {
  todo:        {label:"To Do",       bg:"#f1f5f9",c:"#475569", icon:Circle},
  in_progress: {label:"In Progress", bg:"#dbeafe",c:"#1d4ed8", icon:Loader},
  done:        {label:"Done",        bg:"#dcfce7",c:"#15803d", icon:CheckCircle},
  blocked:     {label:"Blocked",     bg:"#fee2e2",c:"#dc2626", icon:AlertCircle},
  cancelled:   {label:"Cancelled",   bg:"#f8fafc",c:"#94a3b8", icon:Circle},
};
const PRI_CFG = {
  urgent:{label:"🔴 Urgent",bg:"#fef2f2",c:"#dc2626"},
  high:  {label:"🟠 High",  bg:"#fff7ed",c:"#ea580c"},
  medium:{label:"🟡 Medium",bg:"#fefce8",c:"#a16207"},
  low:   {label:"🟢 Low",   bg:"#f0fdf4",c:"#15803d"},
};
const NEXT_STATUS = {todo:"in_progress",in_progress:"done",done:"todo",blocked:"todo"};
const fmtD  = (d) => d?new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}):"—";
const fmtDT = (d) => d?new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:true}):"—";
const fmtDur= (m) => { if(!m)return""; return m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}`; };
const TODAY = new Date().toISOString().split("T")[0];
const EMPTY = {title:"",description:"",category:"other",start_time:"",end_time:"",priority:"medium",project_name:"",project_tag:"",status:"todo",estimated_hours:""};

export default function EmpTasksPage() {
  const [section,    setSection]    = useState("own");  // "own" | "assigned"
  /* own tasks */
  const [ownTasks,   setOwnTasks]   = useState([]);
  const [history,    setHistory]    = useState({});
  const [summary,    setSummary]    = useState({own:{},assigned:{}});
  const [date,       setDate]       = useState(TODAY);
  const [ownTab,     setOwnTab]     = useState("today");
  const [histDays,   setHistDays]   = useState(7);
  const [loading,    setLoading]    = useState(false);
  const [modal,      setModal]      = useState(false);
  const [editTask,   setEditTask]   = useState(null);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);
  const [err,        setErr]        = useState("");
  const [expanded,   setExpanded]   = useState({});
  /* assigned tasks */
  const [assigned,   setAssigned]   = useState([]);
  const [assDetail,  setAssDetail]  = useState(null);  // detail/comment modal
  const [commentText,setCommentText]= useState("");
  const [assTab,     setAssTab]     = useState("active"); // active | history
  const [assHistory, setAssHistory] = useState([]);

  /* Load own tasks */
  const loadOwn = useCallback(async()=>{
    try{
      setLoading(true);
      const [{data:t},{data:s}]=await Promise.all([
        EMP_API.get("/tasks",{params:{date}}),
        EMP_API.get("/tasks/summary",{params:{date}}),
      ]);
      setOwnTasks(t||[]); setSummary(s||{own:{},assigned:{}});
    }catch{}finally{setLoading(false);}
  },[date]);

  const loadOwnHistory=useCallback(async()=>{
    try{
      setLoading(true);
      const from=new Date(); from.setDate(from.getDate()-(histDays-1)); from.setHours(0,0,0,0);
      const {data}=await EMP_API.get("/tasks/history",{params:{from:from.toISOString().split("T")[0],to:TODAY}});
      setHistory(data.grouped||{});
    }catch{}finally{setLoading(false);}
  },[histDays]);

  /* Load assigned tasks */
  const loadAssigned=useCallback(async()=>{
    try{
      setLoading(true);
      const {data}=await EMP_API.get("/tasks/assigned");
      setAssigned(data||[]);
    }catch{}finally{setLoading(false);}
  },[]);

  const loadAssignedHistory=useCallback(async()=>{
    try{
      setLoading(true);
      const {data}=await EMP_API.get("/tasks/assigned-history");
      setAssHistory(data||[]);
    }catch{}finally{setLoading(false);}
  },[]);

  useEffect(()=>{
    if(section==="own"){
      if(ownTab==="today") loadOwn();
      else loadOwnHistory();
    } else {
      if(assTab==="active") loadAssigned();
      else loadAssignedHistory();
    }
  },[section,ownTab,assTab,loadOwn,loadOwnHistory,loadAssigned,loadAssignedHistory]);

  /* open modal */
  const openModal=(task=null)=>{
    setEditTask(task);
    setForm(task?{title:task.title,description:task.description||"",category:task.category||"other",start_time:task.start_time||"",end_time:task.end_time||"",priority:task.priority||"medium",project_name:task.project_name||"",project_tag:task.project_tag||"",status:task.status||"todo",estimated_hours:task.estimated_hours||""}:{...EMPTY,start_time:new Date().toTimeString().slice(0,5)});
    setErr(""); setModal(true);
  };

  /* save */
  const handleSave=async(e)=>{
    e.preventDefault(); setSaving(true); setErr("");
    try{
      if(editTask) await EMP_API.patch(`/tasks/${editTask.id||editTask._id}`,form);
      else         await EMP_API.post("/tasks",{...form,date});
      setModal(false); loadOwn();
    }catch(ex){setErr(ex.response?.data?.message||"Save failed");}
    finally{setSaving(false);}
  };

  /* cycle status */
  const cycleStatus=async(task)=>{
    const next=NEXT_STATUS[task.status]||"todo";
    try{
      await EMP_API.patch(`/tasks/${task.id||task._id}`,{status:next});
      setOwnTasks(prev=>prev.map(t=>(t.id||t._id)===(task.id||task._id)?{...t,status:next}:t));
    }catch{}
  };

  /* update assigned task status */
  const updateAssignedStatus=async(task,status)=>{
    try{
      await EMP_API.patch(`/tasks/${task.id||task._id}`,{status});
      setAssigned(prev=>prev.map(t=>(t.id||t._id)===(task.id||task._id)?{...t,status}:t));
      if(assDetail&&(assDetail.id||assDetail._id)===(task.id||task._id)) setAssDetail(prev=>({...prev,status}));
    }catch{}
  };

  /* delete own */
  const handleDelete=async(id)=>{
    if(!confirm("Delete this task?"))return;
    try{await EMP_API.delete(`/tasks/${id}`); loadOwn();}catch{}
  };

  /* comment */
  const handleComment=async()=>{
    if(!commentText.trim()||!assDetail)return;
    try{
      const {data}=await EMP_API.post(`/tasks/${assDetail.id||assDetail._id}/comment`,{text:commentText});
      setCommentText(""); setAssDetail(data);
      setAssigned(prev=>prev.map(t=>(t.id||t._id)===(data.id||data._id)?data:t));
    }catch{}
  };

  const previewDuration=(()=>{
    if(!form.start_time||!form.end_time)return"";
    const[sh,sm]=form.start_time.split(":").map(Number);
    const[eh,em]=form.end_time.split(":").map(Number);
    const m=(eh*60+em)-(sh*60+sm);
    return m>0?fmtDur(m):"";
  })();

  const inp={width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit"};
  const lbl={display:"block",fontSize:12,fontWeight:600,color:"#374151",marginBottom:5};

  const overdueCount=assigned.filter(t=>t.is_overdue).length;
  const s=summary.own||{};

  return(
    <div>
      {/* Header */}
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">My Tasks</h1>
          <p className="emp-page-sub">Apna kaam log karo · HR ke assigned tasks dekho</p>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>section==="own"?(ownTab==="today"?loadOwn():loadOwnHistory()):(assTab==="active"?loadAssigned():loadAssignedHistory())} className="emp-btn emp-btn-outline" style={{padding:"8px 12px"}}><RefreshCw size={13}/></button>
          {section==="own"&&ownTab==="today"&&<button onClick={()=>openModal()} className="emp-btn emp-btn-primary"><Plus size={15}/>Add Task</button>}
        </div>
      </div>

      {/* Section toggle */}
      <div style={{display:"flex",gap:2,background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:4,width:"fit-content",marginBottom:20}}>
        <button onClick={()=>setSection("own")} style={{padding:"9px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:section==="own"?"#2563eb":"transparent",color:section==="own"?"#fff":"#64748b"}}>
          📋 My Daily Log
        </button>
        <button onClick={()=>setSection("assigned")} style={{padding:"9px 18px",borderRadius:8,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",background:section==="assigned"?"#2563eb":"transparent",color:section==="assigned"?"#fff":"#64748b",display:"flex",alignItems:"center",gap:6}}>
          📌 HR Assigned
          {(assigned.filter(t=>t.status!=="done"&&t.status!=="cancelled").length>0||overdueCount>0)&&(
            <span style={{background:overdueCount>0?"#dc2626":"#2563eb",color:"#fff",fontSize:10,fontWeight:800,padding:"1px 6px",borderRadius:10,minWidth:18,textAlign:"center"}}>
              {overdueCount>0?overdueCount:assigned.filter(t=>t.status!=="done"&&t.status!=="cancelled").length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════ MY DAILY LOG SECTION ══════════ */}
      {section==="own"&&(
        <>
          {/* Stats */}
          {ownTab==="today"&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))",gap:10,marginBottom:20}}>
              {[["Total",s.total||0,"#2563eb"],["Done",s.done||0,"#15803d"],["In Progress",s.in_progress||0,"#1d4ed8"],["To Do",s.todo||0,"#475569"],["Blocked",s.blocked||0,"#dc2626"],["Hours",`${s.total_hours||0}h`,"#7c3aed"]].map(([l,v,c])=>(
                <div key={l} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"12px 14px"}}>
                  <p style={{fontSize:9,fontWeight:700,color:"#64748b",textTransform:"uppercase",margin:"0 0 3px",lineHeight:1.3}}>{l}</p>
                  <p style={{fontSize:20,fontWeight:800,color:c,margin:0}}>{v}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sub-tabs */}
          <div className="emp-tabs" style={{marginBottom:16}}>
            <button className={`emp-tab ${ownTab==="today"?"active":"inactive"}`} onClick={()=>setOwnTab("today")}>📅 Today</button>
            <button className={`emp-tab ${ownTab==="history"?"active":"inactive"}`} onClick={()=>setOwnTab("history")}>📂 History</button>
          </div>

          {/* Today */}
          {ownTab==="today"&&(
            <>
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{padding:"8px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                {date!==TODAY&&<button onClick={()=>setDate(TODAY)} style={{fontSize:12,color:"#2563eb",fontWeight:600,background:"none",border:"none",cursor:"pointer"}}>← Today</button>}
              </div>

              {loading?<div style={{padding:"48px",textAlign:"center",color:"#94a3b8"}}>Loading…</div>
              :ownTasks.length===0?(
                <div style={{padding:"64px",textAlign:"center",color:"#94a3b8"}}>
                  <div style={{fontSize:48,marginBottom:12}}>📋</div>
                  <p style={{margin:"0 0 16px",fontSize:15,fontWeight:600}}>No tasks for {date===TODAY?"today":date}</p>
                  <button onClick={()=>openModal()} className="emp-btn emp-btn-primary"><Plus size={14}/>Add First Task</button>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {ownTasks.map(task=>{
                    const st=STATUS_CFG[task.status]||STATUS_CFG.todo;
                    const pri=PRI_CFG[task.priority]||PRI_CFG.medium;
                    const StatusIcon=st.icon;
                    return(
                      <div key={task.id||task._id} className="emp-task-card">
                        <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                          <button onClick={()=>cycleStatus(task)} style={{padding:0,background:"none",border:"none",cursor:"pointer",flexShrink:0,marginTop:2,color:st.c}} title={`Mark as ${NEXT_STATUS[task.status]?.replace("_"," ")}`}>
                            <StatusIcon size={20} fill={task.status==="done"?st.c:"none"}/>
                          </button>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                              <span style={{fontSize:14,fontWeight:task.status==="done"?500:700,color:task.status==="done"?"#94a3b8":"#0f172a",textDecoration:task.status==="done"?"line-through":"none",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"50vw"}}>{task.title}</span>
                              <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:st.bg,color:st.c,whiteSpace:"nowrap"}}>{st.label}</span>
                              <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:pri.bg,color:pri.c,whiteSpace:"nowrap"}}>{task.priority}</span>
                            </div>
                            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap",fontSize:12,color:"#64748b"}}>
                              <span>{CATS[task.category]||"📌"} {task.category}</span>
                              {(task.start_time||task.end_time)&&(
                                <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                                  <Clock size={11}/>{task.start_time||"?"}{task.end_time&&` → ${task.end_time}`}
                                  {task.duration_minutes>0&&<strong style={{color:"#374151"}}> ({fmtDur(task.duration_minutes)})</strong>}
                                </span>
                              )}
                              {task.project_name&&<span>📁 {task.project_name}</span>}
                            </div>
                            {task.description&&<p style={{fontSize:12,color:"#64748b",margin:"5px 0 0",lineHeight:1.5}}>{task.description}</p>}
                          </div>
                          <div style={{display:"flex",gap:4,flexShrink:0}}>
                            <button onClick={()=>openModal(task)} style={{padding:6,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer"}}><Edit2 size={12}/></button>
                            <button onClick={()=>handleDelete(task.id||task._id)} style={{padding:6,background:"#fee2e2",color:"#dc2626",border:"none",borderRadius:6,cursor:"pointer"}}><Trash2 size={12}/></button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {s.total>0&&(
                    <div style={{padding:"11px 16px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:13,flexWrap:"wrap",gap:8}}>
                      <span style={{color:"#1d4ed8",fontWeight:600}}>{s.done}/{s.total} tasks done</span>
                      <span style={{color:"#1d4ed8",fontWeight:700}}>⏱ {s.total_hours}h logged</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* History */}
          {ownTab==="history"&&(
            <>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                {[7,14,30].map(d=><button key={d} onClick={()=>setHistDays(d)} className={`emp-btn emp-btn-sm ${histDays===d?"emp-btn-primary":"emp-btn-outline"}`}>Last {d}d</button>)}
              </div>
              {loading?<div style={{padding:"48px",textAlign:"center",color:"#94a3b8"}}>Loading…</div>
              :Object.keys(history).length===0?<div style={{padding:"64px",textAlign:"center",color:"#94a3b8"}}>No history found</div>
              :<div style={{display:"flex",flexDirection:"column",gap:12}}>
                {Object.entries(history).sort(([a],[b])=>b.localeCompare(a)).map(([dk,dayTasks])=>{
                  const isOpen=!!expanded[dk];
                  const done=dayTasks.filter(t=>t.status==="done").length;
                  const hours=+(dayTasks.reduce((s,t)=>s+(t.duration_minutes||0),0)/60).toFixed(1);
                  const dLabel=new Date(dk+"T00:00:00").toLocaleDateString("en-IN",{weekday:"short",day:"2-digit",month:"short",year:"numeric"});
                  return(
                    <div key={dk} className="emp-card">
                      <div style={{display:"flex",alignItems:"center",gap:12,padding:"13px 18px",cursor:"pointer"}} onClick={()=>setExpanded(p=>({...p,[dk]:!isOpen}))}>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:700,color:"#0f172a"}}>{dLabel}</div>
                          <div style={{fontSize:11,color:"#64748b"}}>{dayTasks.length} tasks · {done} done · {hours}h</div>
                        </div>
                        <div style={{minWidth:80}}>
                          <div style={{height:5,background:"#f1f5f9",borderRadius:99}}><div style={{height:"100%",width:`${dayTasks.length?Math.round((done/dayTasks.length)*100):0}%`,background:"#2563eb",borderRadius:99}}/></div>
                          <div style={{fontSize:10,color:"#94a3b8",textAlign:"right",marginTop:2}}>{dayTasks.length?Math.round((done/dayTasks.length)*100):0}%</div>
                        </div>
                        {isOpen?<ChevronUp size={14} color="#94a3b8"/>:<ChevronDown size={14} color="#94a3b8"/>}
                      </div>
                      {isOpen&&dayTasks.map(task=>{
                        const st=STATUS_CFG[task.status]||STATUS_CFG.todo;
                        return(
                          <div key={task.id||task._id} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"10px 18px",borderTop:"1px solid #f8fafc"}}>
                            <span style={{fontSize:16,flexShrink:0}}>{CATS[task.category]||"📌"}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{task.title}</div>
                              <div style={{fontSize:11,color:"#94a3b8",marginTop:2,display:"flex",gap:8,flexWrap:"wrap"}}>
                                {(task.start_time||task.end_time)&&<span><Clock size={10} style={{verticalAlign:"middle"}}/> {task.start_time||"?"}{task.end_time&&` → ${task.end_time}`} {task.duration_minutes>0&&`(${fmtDur(task.duration_minutes)})`}</span>}
                                {task.project_name&&<span>📁 {task.project_name}</span>}
                              </div>
                            </div>
                            <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:st.bg,color:st.c,flexShrink:0}}>{st.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>}
            </>
          )}
        </>
      )}

      {/* ══════════ HR ASSIGNED SECTION ══════════ */}
      {section==="assigned"&&(
        <>
          <div className="emp-tabs" style={{marginBottom:16}}>
            <button className={`emp-tab ${assTab==="active"?"active":"inactive"}`} onClick={()=>setAssTab("active")}>
              🔴 Active {assigned.filter(t=>t.status!=="done"&&t.status!=="cancelled").length>0&&<span style={{background:"#2563eb",color:"#fff",fontSize:10,fontWeight:800,padding:"1px 5px",borderRadius:10,marginLeft:4}}>{assigned.filter(t=>t.status!=="done"&&t.status!=="cancelled").length}</span>}
            </button>
            <button className={`emp-tab ${assTab==="history"?"active":"inactive"}`} onClick={()=>setAssTab("history")}>✅ Completed</button>
          </div>

          {overdueCount>0&&assTab==="active"&&(
            <div style={{background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:10,padding:"12px 16px",marginBottom:16,display:"flex",gap:8,alignItems:"center"}}>
              <AlertTriangle size={16} color="#dc2626"/>
              <span style={{fontSize:13,fontWeight:700,color:"#dc2626"}}>{overdueCount} task{overdueCount>1?"s are":" is"} overdue! Please update status or contact HR.</span>
            </div>
          )}

          {loading?<div style={{padding:"48px",textAlign:"center",color:"#94a3b8"}}>Loading…</div>
          :(assTab==="active"?assigned:assHistory).length===0?(
            <div style={{padding:"64px",textAlign:"center",color:"#94a3b8"}}>
              <div style={{fontSize:40,marginBottom:10}}>📌</div>
              <p style={{margin:0}}>{assTab==="active"?"No active assigned tasks":"No completed tasks found"}</p>
            </div>
          ):(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {(assTab==="active"?assigned:assHistory).map(task=>{
                const st=STATUS_CFG[task.status]||STATUS_CFG.todo;
                const pri=PRI_CFG[task.priority]||PRI_CFG.medium;
                const isOver=task.is_overdue;
                return(
                  <div key={task.id||task._id} style={{background:"#fff",border:`1px solid ${isOver?"#fca5a5":"#e2e8f0"}`,borderTop:`3px solid ${isOver?"#dc2626":task.priority==="urgent"?"#dc2626":task.priority==="high"?"#ea580c":"#2563eb"}`,borderRadius:12,padding:18}}>
                    {/* Assigned by */}
                    <div style={{fontSize:11,color:"#94a3b8",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>Assigned by <strong style={{color:"#7c3aed"}}>{task.assigned_by_name||"HR"}</strong></span>
                      <span style={{padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:pri.bg,color:pri.c}}>{pri.label}</span>
                    </div>

                    <h3 style={{fontSize:14,fontWeight:800,color:"#0f172a",margin:"0 0 6px",lineHeight:1.35}}>{task.title}</h3>

                    {isOver&&<div style={{fontSize:11,fontWeight:700,color:"#dc2626",marginBottom:6}}>⚠️ OVERDUE — update your status!</div>}

                    {task.description&&<p style={{fontSize:12,color:"#64748b",margin:"0 0 10px",lineHeight:1.6}}>{task.description}</p>}

                    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10,fontSize:12,color:"#64748b"}}>
                      <span>{CATS[task.category]||"📌"} {task.category}</span>
                      {task.project_name&&<span>📁 {task.project_name}</span>}
                      {task.due_date&&<span style={{color:isOver?"#dc2626":"#64748b"}}>📅 Due: {fmtD(task.due_date)}</span>}
                      {task.estimated_hours>0&&<span>⏱ Est: {task.estimated_hours}h</span>}
                    </div>

                    {/* Status update buttons */}
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:11,fontWeight:600,color:"#374151",marginBottom:6}}>Update Status:</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {Object.entries(STATUS_CFG).filter(([k])=>k!=="cancelled").map(([k,v])=>(
                          <button key={k} onClick={()=>updateAssignedStatus(task,k)}
                            style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,border:`1.5px solid ${task.status===k?v.c:"#e2e8f0"}`,background:task.status===k?v.bg:"#fff",color:task.status===k?v.c:"#94a3b8",cursor:"pointer",transition:"all .15s"}}>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comments count + open */}
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{setAssDetail(task);setCommentText("");}}
                        style={{flex:1,padding:"8px 0",background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                        <MessageSquare size={13}/>
                        {task.comments?.length>0?`${task.comments.length} Comment${task.comments.length>1?"s":""}` : "Add Comment"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ── ADD/EDIT OWN TASK MODAL ── */}
      {modal&&(
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{maxWidth:520}}>
            <div className="emp-modal-header"><h2 className="emp-modal-title">{editTask?"Edit Task":"Add Task"}</h2><button className="emp-close-btn" onClick={()=>setModal(false)}><X size={16}/></button></div>
            <form onSubmit={handleSave}>
              <div className="emp-modal-body" style={{display:"flex",flexDirection:"column",gap:14}}>
                {err&&<div style={{background:"#fee2e2",color:"#dc2626",padding:"10px 14px",borderRadius:8,fontSize:13}}>{err}</div>}
                <div><label style={lbl}>Title <span style={{color:"#ef4444"}}>*</span></label><input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} required style={inp} placeholder="e.g. Design social media banners"/></div>
                <div className="emp-form-row">
                  <div><label style={lbl}>Category</label><select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={inp}>{CAT_LIST.map(c=><option key={c.v} value={c.v}>{c.l}</option>)}</select></div>
                  <div><label style={lbl}>Priority</label><select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={inp}>{Object.entries(PRI_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}</select></div>
                </div>
                <div className="emp-form-row">
                  <div><label style={lbl}>Start Time</label><input type="time" value={form.start_time} onChange={e=>setForm(p=>({...p,start_time:e.target.value}))} style={inp}/></div>
                  <div><label style={lbl}>End Time</label><input type="time" value={form.end_time} onChange={e=>setForm(p=>({...p,end_time:e.target.value}))} style={inp}/></div>
                </div>
                {previewDuration&&<div style={{marginTop:-10,padding:"7px 12px",background:"#eff6ff",borderRadius:7,fontSize:12,color:"#1d4ed8",fontWeight:600}}>⏱ Duration: {previewDuration}</div>}
                <div>
                  <label style={lbl}>Status</label>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {Object.entries(STATUS_CFG).filter(([k])=>k!=="cancelled").map(([k,v])=>(
                      <label key={k} style={{display:"flex",alignItems:"center",gap:5,cursor:"pointer",padding:"6px 11px",borderRadius:8,border:`1.5px solid ${form.status===k?v.c:"#e2e8f0"}`,background:form.status===k?v.bg:"#fff",fontSize:12,fontWeight:600,color:form.status===k?v.c:"#374151"}}>
                        <input type="radio" name="status" value={k} checked={form.status===k} onChange={()=>setForm(p=>({...p,status:k}))} style={{display:"none"}}/>{v.label}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="emp-form-row">
                  <div><label style={lbl}>Project Name</label><input value={form.project_name} onChange={e=>setForm(p=>({...p,project_name:e.target.value}))} style={inp} placeholder="e.g. Store Campaign"/></div>
                  <div><label style={lbl}>Est. Hours</label><input type="number" value={form.estimated_hours} onChange={e=>setForm(p=>({...p,estimated_hours:e.target.value}))} style={inp} min="0" step="0.5" placeholder="2"/></div>
                </div>
                <div><label style={lbl}>Notes</label><textarea value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={3} style={{...inp,resize:"vertical"}} placeholder="Details, blockers, links…"/></div>
              </div>
              <div className="emp-modal-footer">
                <button type="button" className="emp-btn emp-btn-outline" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="emp-btn emp-btn-primary" disabled={saving}>{saving?"Saving…":editTask?"Update":"Add Task"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COMMENT MODAL (Assigned Task) ── */}
      {assDetail&&(
        <div className="emp-modal-overlay">
          <div className="emp-modal" style={{maxWidth:500}}>
            <div className="emp-modal-header">
              <div>
                <h2 className="emp-modal-title">{assDetail.title}</h2>
                <div style={{fontSize:12,color:"#64748b",marginTop:3}}>
                  Assigned by <strong style={{color:"#7c3aed"}}>{assDetail.assigned_by_name||"HR"}</strong> ·{" "}
                  <span style={{padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700,background:STATUS_CFG[assDetail.status]?.bg,color:STATUS_CFG[assDetail.status]?.c}}>{STATUS_CFG[assDetail.status]?.label}</span>
                </div>
              </div>
              <button className="emp-close-btn" onClick={()=>setAssDetail(null)}><X size={16}/></button>
            </div>
            <div className="emp-modal-body">
              {assDetail.description&&<div style={{background:"#f8fafc",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#374151",marginBottom:16,lineHeight:1.6}}>{assDetail.description}</div>}

              {/* Task meta */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16,fontSize:12}}>
                {[["Due Date",fmtD(assDetail.due_date)],["Priority",assDetail.priority],["Project",assDetail.project_name||"—"],["Est. Hours",assDetail.estimated_hours?`${assDetail.estimated_hours}h`:"—"]].map(([l,v])=>(
                  <div key={l} style={{background:"#f8fafc",borderRadius:7,padding:"8px 12px"}}>
                    <div style={{fontSize:10,color:"#94a3b8",fontWeight:700,textTransform:"uppercase",marginBottom:2}}>{l}</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#0f172a",textTransform:"capitalize"}}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Comments */}
              <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,marginBottom:14}}>
                {(!assDetail.comments||assDetail.comments.length===0)
                  ?<div style={{textAlign:"center",color:"#94a3b8",fontSize:13,padding:16}}>No comments yet. Ask a question or share an update!</div>
                  :assDetail.comments.map((c,i)=>(
                    <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:c.author_role==="hr"?"#ede9fe":"#dbeafe",color:c.author_role==="hr"?"#7c3aed":"#2563eb",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{c.author_name?.[0]?.toUpperCase()}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:3}}>
                          <span style={{fontSize:12,fontWeight:700,color:"#0f172a"}}>{c.author_name}</span>
                          <span style={{fontSize:10,padding:"1px 7px",borderRadius:20,background:c.author_role==="hr"?"#ede9fe":"#dbeafe",color:c.author_role==="hr"?"#5b21b6":"#1d4ed8",fontWeight:700}}>{c.author_role==="hr"?"HR":"You"}</span>
                          <span style={{fontSize:10,color:"#94a3b8"}}>{fmtDT(c.created_at)}</span>
                        </div>
                        <div style={{fontSize:13,color:"#374151",lineHeight:1.5,background:"#f8fafc",borderRadius:8,padding:"8px 12px"}}>{c.text}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
              <div style={{display:"flex",gap:8}}>
                <input value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Type a message to HR…"
                  onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&handleComment()}
                  style={{...inp,flex:1}}/>
                <button onClick={handleComment} disabled={!commentText.trim()} className="emp-btn emp-btn-primary" style={{padding:"9px 14px"}}><Send size={14}/></button>
              </div>
              <div style={{fontSize:11,color:"#94a3b8",marginTop:6}}>Press Enter to send</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
