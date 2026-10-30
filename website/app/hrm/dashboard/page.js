"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Calendar, Clock, TrendingUp, AlertCircle, CheckCircle, Activity, ArrowRight, DollarSign } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const fmt = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}) : "—";

const STAT_COLORS = {
  purple:{ bg:"#ede9fe", color:"#7c3aed" }, blue:{ bg:"#dbeafe", color:"#2563eb" },
  green: { bg:"#dcfce7", color:"#16a34a" }, orange:{ bg:"#ffedd5", color:"#ea580c" },
  red:   { bg:"#fee2e2", color:"#dc2626" }, teal:  { bg:"#ccfbf1", color:"#0d9488" },
};

export default function HrmDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [user,    setUser]    = useState({ full_name:"HR Admin", role:"hr_admin" });
  const [time,    setTime]    = useState(new Date());

  useEffect(() => { try { const u = JSON.parse(localStorage.getItem("hrm_user")||"{}"); if (u.full_name) setUser(u); } catch {} }, []);
  useEffect(() => { const iv = setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(iv); }, []);

  const load = useCallback(async () => {
    try { setLoading(true); const { data:d } = await HRM_API.get("/dashboard/stats"); setData(d); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"300px" }}>
      <div style={{ textAlign:"center" }}><div className="hrm-spinner" style={{ margin:"0 auto 12px" }}/><p style={{ color:"#64748b",fontSize:14,margin:0 }}>Loading…</p></div>
    </div>
  );

  const c = data?.counts || {};

  const statCards = [
    { label:"Total Employees",  value:c.total_employees||0,   icon:Users,       color:"purple", href:"/hrm/dashboard/employees" },
    { label:"Present Today",    value:c.present_today||0,     icon:CheckCircle, color:"green",  href:"/hrm/dashboard/attendance" },
    { label:"On Leave Today",   value:c.on_leave_today||0,    icon:Calendar,    color:"blue",   href:"/hrm/dashboard/leaves" },
    { label:"Pending Leaves",   value:c.pending_leaves||0,    icon:AlertCircle, color:"orange", href:"/hrm/dashboard/leaves" },
    { label:"Absent Today",     value:c.absent_today||0,      icon:Clock,       color:"red",    href:"/hrm/dashboard/attendance" },
    { label:"New This Month",   value:c.new_joinings_this_month||0, icon:TrendingUp, color:"teal", href:"/hrm/dashboard/employees" },
  ];

  return (
    <div style={{ animation:"fadeIn .2s ease" }}>
      {/* Welcome */}
      <div className="hrm-welcome">
        <div>
          <span style={{ fontSize:"10px",fontWeight:"800",color:"#5b21b6",background:"#ede9fe",padding:"3px 10px",borderRadius:"20px",textTransform:"uppercase",letterSpacing:".05em" }}>{user.role?.replace("_"," ")}</span>
          <h1 style={{ fontSize:"22px",fontWeight:"800",color:"#3b0764",margin:"6px 0 4px" }}>Welcome back, {user.full_name?.split(" ")[0]} 👋</h1>
          <p style={{ fontSize:"13px",color:"#5b21b6",margin:0 }}>Subham General Store HR</p>
        </div>
        <div className="hrm-clock" style={{ textAlign:"right" }}>
          <div style={{ fontSize:"22px",fontWeight:"800",color:"#3b0764",fontVariantNumeric:"tabular-nums" }}>{time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})}</div>
          <div style={{ fontSize:"11px",color:"#5b21b6" }}>{time.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</div>
        </div>
      </div>

      {/* Stats */}
      <div className="hrm-stats-grid">
        {statCards.map((s,i) => {
          const Icon = s.icon;
          const cl = STAT_COLORS[s.color];
          return (
            <Link key={i} href={s.href} style={{ textDecoration:"none" }}>
              <div className="hrm-stat-card" style={{ cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.06)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                  <div>
                    <p style={{ fontSize:"11px",fontWeight:"600",color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",margin:"0 0 4px" }}>{s.label}</p>
                    <p style={{ fontSize:"28px",fontWeight:"800",color:"#0f172a",margin:0 }}>{s.value}</p>
                  </div>
                  <div className={`hrm-stat-icon ${s.color}`}><Icon size={20}/></div>
                </div>
                <div style={{ fontSize:"11px",color:"#94a3b8",display:"flex",alignItems:"center",gap:"4px" }}><Activity size={11}/> Live data</div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Attendance Rate */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20,marginBottom:24 }}>
        <div className="hrm-card" style={{ padding:20 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
            <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:0 }}>Today's Attendance Rate</h3>
            <span style={{ fontSize:22,fontWeight:800,color:"#16a34a" }}>{data?.attendance_rate||0}%</span>
          </div>
          <div style={{ height:8,background:"#f1f5f9",borderRadius:99 }}>
            <div style={{ height:"100%",width:`${data?.attendance_rate||0}%`,background:"linear-gradient(90deg,#22c55e,#16a34a)",borderRadius:99,transition:"width .5s" }}/>
          </div>
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:8,fontSize:11,color:"#64748b" }}>
            <span>Present: {(c.present_today||0)+(c.late_today||0)}</span>
            <span>Absent: {c.absent_today||0}</span>
            <span>On Leave: {c.on_leave_today||0}</span>
          </div>
        </div>

        <div className="hrm-card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 12px" }}>Payroll Status</h3>
          {data?.payroll ? (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8 }}>
                <span style={{ fontSize:13,color:"#374151" }}>{data.payroll.pay_period||`${new Date().toLocaleString("en-IN",{month:"long"})} ${new Date().getFullYear()}`}</span>
                <span style={{ padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,textTransform:"capitalize",background:data.payroll.status==="processed"?"#dcfce7":data.payroll.status==="paid"?"#dbeafe":"#fef9c3",color:data.payroll.status==="processed"?"#15803d":data.payroll.status==="paid"?"#1d4ed8":"#a16207" }}>{data.payroll.status}</span>
              </div>
              {data.payroll.total_net>0 && <div style={{ fontSize:20,fontWeight:800,color:"#0f172a" }}>{fmt(data.payroll.total_net)}</div>}
              <div style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>Net payout — {data.payroll.total_employees||0} employees</div>
            </div>
          ) : (
            <div style={{ color:"#94a3b8",fontSize:13 }}>Payroll not started for this month</div>
          )}
          <Link href="/hrm/dashboard/payroll" style={{ display:"inline-flex",alignItems:"center",gap:4,marginTop:12,fontSize:12,color:"#7c3aed",fontWeight:600,textDecoration:"none" }}>Go to Payroll <ArrowRight size={12}/></Link>
        </div>
      </div>

      {/* 3-col: Recent Employees | Pending Leaves | Birthdays */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20 }}>
        {/* Recent Employees */}
        <div className="hrm-card">
          <div className="hrm-card-header"><span className="hrm-card-title">Recent Joinings</span><Link href="/hrm/dashboard/employees" style={{ fontSize:12,color:"#7c3aed",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:3 }}>View All <ArrowRight size={12}/></Link></div>
          {(data?.recent_employees||[]).length===0 ? <div style={{ padding:"32px 20px",textAlign:"center",color:"#94a3b8",fontSize:13 }}>No recent employees</div>
          : (data.recent_employees).map((e,i)=>(
            <Link key={i} href={`/hrm/dashboard/employees/${e.id||e._id}`} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 20px",borderBottom:"1px solid #f8fafc",textDecoration:"none" }}>
              <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,flexShrink:0 }}>{e.full_name?.[0]?.toUpperCase()}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{e.full_name}</div>
                <div style={{ fontSize:11,color:"#94a3b8" }}>{e.designation?.title||"—"} · {e.department?.name||"—"}</div>
              </div>
              <div style={{ fontSize:11,color:"#94a3b8",whiteSpace:"nowrap" }}>{fmtD(e.date_of_joining)}</div>
            </Link>
          ))}
        </div>

        {/* Pending Leaves */}
        <div className="hrm-card">
          <div className="hrm-card-header"><span className="hrm-card-title">Pending Leaves</span><Link href="/hrm/dashboard/leaves" style={{ fontSize:12,color:"#7c3aed",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:3 }}>View All <ArrowRight size={12}/></Link></div>
          {(data?.recent_leave_requests||[]).length===0 ? <div style={{ padding:"32px 20px",textAlign:"center",color:"#94a3b8",fontSize:13 }}>No pending leaves</div>
          : (data.recent_leave_requests).map((l,i)=>(
            <div key={i} style={{ padding:"12px 20px",borderBottom:"1px solid #f8fafc" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:2 }}>
                <span style={{ fontSize:13,fontWeight:600,color:"#0f172a" }}>{l.employee?.full_name||"—"}</span>
                <span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:"#fef9c3",color:"#a16207" }}>{l.leave_type?.code||"—"}</span>
              </div>
              <div style={{ fontSize:11,color:"#94a3b8" }}>{fmtD(l.from_date)} → {fmtD(l.to_date)} · {l.days} day{l.days>1?"s":""}</div>
            </div>
          ))}
        </div>

        {/* Dept Strength */}
        <div className="hrm-card">
          <div className="hrm-card-header"><span className="hrm-card-title">Dept. Strength</span><Link href="/hrm/dashboard/departments" style={{ fontSize:12,color:"#7c3aed",fontWeight:600,textDecoration:"none",display:"flex",alignItems:"center",gap:3 }}>Manage <ArrowRight size={12}/></Link></div>
          {(data?.dept_strength||[]).length===0 ? <div style={{ padding:"32px 20px",textAlign:"center",color:"#94a3b8",fontSize:13 }}>No departments</div>
          : (data.dept_strength).sort((a,b)=>b.count-a.count).slice(0,6).map((d,i)=>(
            <div key={i} style={{ padding:"10px 20px",borderBottom:"1px solid #f8fafc" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
                <span style={{ fontSize:12,fontWeight:600,color:"#374151",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"70%" }}>{d.name||"Unknown"}</span>
                <span style={{ fontSize:12,fontWeight:700,color:"#7c3aed" }}>{d.count}</span>
              </div>
              <div style={{ height:4,background:"#f1f5f9",borderRadius:99 }}>
                <div style={{ height:"100%",width:`${Math.min(100,(d.count/(c.active_employees||1))*100)}%`,background:"linear-gradient(90deg,#7c3aed,#5b21b6)",borderRadius:99 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
