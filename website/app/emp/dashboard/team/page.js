"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Search, Users, Mail, Phone } from "lucide-react";
import EMP_API from "@/utils/empApi";

const STATUS_COLOR = {
  active:    "#16a34a",
  probation: "#a16207",
};

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const AVATAR_COLORS = [
  "#7c3aed","#2563eb","#0d9488","#ea580c","#dc2626","#16a34a","#a16207","#0891b2","#9333ea","#c026d3",
];

export default function EmpTeamPage() {
  const [grouped,  setGrouped]  = useState({});
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [search,   setSearch]   = useState("");
  const [depts,    setDepts]    = useState([]);
  const [filterDept, setFilterDept] = useState("");
  const [selected,   setSelected]   = useState(null); // profile popup

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (search)     params.search     = search;
      if (filterDept) params.department = filterDept;
      const { data } = await EMP_API.get("/team", { params });
      setGrouped(data.grouped||{});
      setTotal(data.total||0);
      if (!depts.length) setDepts(Object.keys(data.grouped||{}));
    } catch {} finally { setLoading(false); }
  }, [search, filterDept]);

  useEffect(() => { load(); }, [load]);

  const getColor = (name) => AVATAR_COLORS[name?.charCodeAt(0)%AVATAR_COLORS.length] || "#7c3aed";

  return (
    <div>
      <div className="emp-page-header">
        <div><h1 className="emp-page-title">Team Directory</h1><p className="emp-page-sub">{total} colleagues</p></div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
        <div className="emp-search-bar" style={{ maxWidth:320 }}>
          <Search size={15} color="#94a3b8"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email…" style={{ border:"none",background:"transparent",outline:"none",fontSize:13,flex:1,fontFamily:"inherit" }}/>
        </div>
        <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",fontFamily:"inherit",background:"#f8fafc" }}>
          <option value="">All Departments</option>
          {depts.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading team…</div>
      ) : total===0 ? (
        <div style={{ padding:"64px",textAlign:"center",color:"#94a3b8" }}>
          <Users size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 12px" }}/>
          <p style={{ margin:0 }}>No colleagues found{search?` for "${search}`:""}</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dept, members]) => (
          <div key={dept} style={{ marginBottom:32 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
              <h2 style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:0 }}>{dept}</h2>
              <span style={{ background:"#dbeafe",color:"#1d4ed8",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700 }}>{members.length}</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:14 }}>
              {members.map(m => {
                const color = getColor(m.full_name);
                return (
                  <div key={m.id} className="emp-team-card" onClick={()=>setSelected(m)} style={{ cursor:"pointer" }}>
                    {/* Avatar */}
                    {m.profile_image ? (
                      <img src={`${BASE_URL}/${m.profile_image}`} alt={m.full_name} style={{ width:56,height:56,borderRadius:"50%",objectFit:"cover",border:`2px solid ${color}33`,margin:"0 auto 12px",display:"block" }} onError={e=>{e.target.style.display="none";}}/>
                    ) : (
                      <div style={{ width:56,height:56,borderRadius:"50%",background:color,color:"#fff",fontSize:20,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px" }}>{m.initials}</div>
                    )}
                    <div style={{ fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.full_name}</div>
                    <div style={{ fontSize:11,color:"#64748b",marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{m.designation}</div>
                    <span style={{ padding:"2px 9px",borderRadius:20,fontSize:10,fontWeight:700,background:m.status==="active"?"#dcfce7":"#fef9c3",color:STATUS_COLOR[m.status]||"#64748b",textTransform:"capitalize",display:"inline-block" }}>{m.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Member popup */}
      {selected && (
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,.45)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20 }} onClick={()=>setSelected(null)}>
          <div style={{ background:"#fff",borderRadius:20,padding:32,maxWidth:380,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,.15)",textAlign:"center" }} onClick={e=>e.stopPropagation()}>
            {selected.profile_image ? (
              <img src={`${BASE_URL}/${selected.profile_image}`} alt={selected.full_name} style={{ width:72,height:72,borderRadius:"50%",objectFit:"cover",border:`3px solid ${getColor(selected.full_name)}33`,margin:"0 auto 16px",display:"block" }} onError={e=>{e.target.style.display="none";}}/>
            ) : (
              <div style={{ width:72,height:72,borderRadius:"50%",background:getColor(selected.full_name),color:"#fff",fontSize:26,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>{selected.initials}</div>
            )}
            <h2 style={{ fontSize:20,fontWeight:800,color:"#0f172a",margin:"0 0 4px" }}>{selected.full_name}</h2>
            <p style={{ fontSize:13,color:"#64748b",margin:"0 0 4px" }}>{selected.designation}</p>
            <p style={{ fontSize:12,color:"#94a3b8",margin:"0 0 16px" }}>{selected.department} · {selected.employee_id}</p>
            <span style={{ padding:"4px 12px",borderRadius:20,fontSize:12,fontWeight:700,background:selected.status==="active"?"#dcfce7":"#fef9c3",color:STATUS_COLOR[selected.status]||"#64748b",textTransform:"capitalize" }}>{selected.status}</span>

            <div style={{ marginTop:20,display:"flex",flexDirection:"column",gap:10,textAlign:"left" }}>
              {selected.work_email && (
                <a href={`mailto:${selected.work_email}`} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f8fafc",borderRadius:10,textDecoration:"none",color:"#0f172a",fontSize:13 }}>
                  <Mail size={14} color="#2563eb"/><span style={{ overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{selected.work_email}</span>
                </a>
              )}
              {selected.phone && (
                <a href={`tel:${selected.phone}`} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#f8fafc",borderRadius:10,textDecoration:"none",color:"#0f172a",fontSize:13 }}>
                  <Phone size={14} color="#2563eb"/>{selected.phone}
                </a>
              )}
              {selected.date_of_joining && (
                <div style={{ display:"flex",gap:10,padding:"10px 14px",background:"#f8fafc",borderRadius:10,fontSize:13,color:"#374151" }}>
                  <span style={{ color:"#94a3b8" }}>Joined:</span>
                  <span style={{ fontWeight:600 }}>{new Date(selected.date_of_joining).toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"})}</span>
                </div>
              )}
            </div>

            <button onClick={()=>setSelected(null)} style={{ marginTop:20,width:"100%",padding:"10px",background:"#f1f5f9",border:"none",borderRadius:10,fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer" }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
