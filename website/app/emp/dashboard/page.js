"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Calendar, FileText, DollarSign, Bell, ArrowRight, Clock } from "lucide-react";
import EMP_API from "@/utils/empApi";

const fmt = (n) => `₹${Number(n||0).toLocaleString("en-IN")}`;

export default function EmpDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [time,    setTime]    = useState(new Date());
  const [checkingIn, setCheckingIn] = useState(false);
  const [todayAtt,   setTodayAtt]   = useState(null);
  const [attMsg,     setAttMsg]     = useState("");

  useEffect(()=>{ const iv=setInterval(()=>setTime(new Date()),1000); return ()=>clearInterval(iv); },[]);

  const load = useCallback(async () => {
    try { setLoading(true); const { data:d } = await EMP_API.get("/dashboard"); setData(d); setTodayAtt(d.today_attendance); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAttendance = async () => {
    setCheckingIn(true); setAttMsg("");
    try {
      if (!todayAtt || !todayAtt.check_in) {
        const { data } = await EMP_API.post("/attendance/checkin");
        setTodayAtt(data); setAttMsg("✅ Checked in!");
      } else if (!todayAtt.check_out) {
        const { data } = await EMP_API.post("/attendance/checkout");
        setTodayAtt(data); setAttMsg("✅ Checked out!");
      }
    } catch (e) { setAttMsg("❌ " + (e.response?.data?.message||"Failed")); }
    finally { setCheckingIn(false); setTimeout(()=>setAttMsg(""),3000); }
  };

  if (loading) return (
    <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:"300px" }}>
      <div style={{ textAlign:"center" }}><div className="emp-spinner" style={{ margin:"0 auto 12px" }}/><p style={{ color:"#64748b",fontSize:14,margin:0 }}>Loading…</p></div>
    </div>
  );

  const emp   = data?.employee || {};
  const bal   = data?.leave_balance || {};
  const ms    = data?.month_summary || {};
  const slip  = data?.latest_salary_slip;
  const nextPay = data?.next_payday;

  const hasCheckedIn  = !!todayAtt?.check_in;
  const hasCheckedOut = !!todayAtt?.check_out;

  return (
    <div style={{ animation:"fadeIn .2s ease" }}>
      {/* Welcome */}
      <div className="emp-welcome">
        <div>
          <div style={{ fontSize:"10px",fontWeight:"800",color:"#1d4ed8",background:"#dbeafe",padding:"3px 10px",borderRadius:"20px",textTransform:"uppercase",letterSpacing:".05em",display:"inline-block",marginBottom:6 }}>{emp.status||"Active"}</div>
          <h1 style={{ fontSize:"22px",fontWeight:"800",color:"#1e3a8a",margin:"0 0 4px" }}>Hello, {emp.full_name?.split(" ")[0]} 👋</h1>
          <p style={{ fontSize:"13px",color:"#1d4ed8",margin:0 }}>{emp.employee_id} · {emp.department?.name||""}</p>
        </div>
        <div className="hrm-clock" style={{ textAlign:"right" }}>
          <div style={{ fontSize:"22px",fontWeight:"800",color:"#1e3a8a",fontVariantNumeric:"tabular-nums" }}>{time.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:true})}</div>
          <div style={{ fontSize:"11px",color:"#1d4ed8" }}>{time.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</div>
        </div>
      </div>

      {/* Punch In/Out */}
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:12,padding:"24px",background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,marginBottom:28 }}>
        <div style={{ fontSize:13,color:"#64748b",fontWeight:600 }}>
          {!hasCheckedIn ? "Not checked in today" : !hasCheckedOut ? `Checked in at ${new Date(todayAtt.check_in).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true})}` : `Worked ${todayAtt.work_hours?.toFixed(1)}h today`}
        </div>
        {attMsg && <div style={{ fontSize:13,color:attMsg.startsWith("✅")?"#15803d":"#dc2626",fontWeight:600 }}>{attMsg}</div>}
        {!hasCheckedOut && (
          <button className={`emp-checkin-btn ${hasCheckedIn?"check-out":"check-in"}`} onClick={handleAttendance} disabled={checkingIn} style={{ opacity:checkingIn?.7:1 }}>
            {checkingIn?"Processing…":hasCheckedIn?"🟥 Check Out":"🟢 Check In"}
          </button>
        )}
        {hasCheckedOut && <div style={{ padding:"12px 24px",background:"#dcfce7",color:"#15803d",borderRadius:12,fontSize:14,fontWeight:700 }}>✅ Day Complete — {todayAtt.work_hours?.toFixed(1)}h worked</div>}
      </div>

      {/* Stats */}
      <div className="emp-stats-grid">
        {[
          { label:"Present This Month", value:ms.present||0,  icon:Calendar, color:"green", href:"/emp/dashboard/attendance" },
          { label:"Leaves Balance (EL)", value:bal.el||0,      icon:FileText,  color:"blue",  href:"/emp/dashboard/leaves" },
          { label:"Last Net Salary",   value:slip?fmt(slip.net_salary):"—", icon:DollarSign, color:"purple", href:"/emp/dashboard/salary" },
          { label:"Absent This Month", value:ms.absent||0,     icon:Clock,    color:"orange", href:"/emp/dashboard/attendance" },
        ].map((s,i)=>{
          const Icon=s.icon;
          const cl = { green:{bg:"#dcfce7",c:"#16a34a"}, blue:{bg:"#dbeafe",c:"#2563eb"}, purple:{bg:"#ede9fe",c:"#7c3aed"}, orange:{bg:"#ffedd5",c:"#ea580c"} }[s.color];
          return (
            <Link key={i} href={s.href} style={{ textDecoration:"none" }}>
              <div className="emp-stat-card" style={{ cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.06)"}
                onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:"11px",fontWeight:"600",color:"#64748b",textTransform:"uppercase",letterSpacing:".05em",margin:"0 0 4px" }}>{s.label}</p>
                    <p style={{ fontSize:"26px",fontWeight:"800",color:"#0f172a",margin:0 }}>{s.value}</p>
                  </div>
                  <div className={`emp-stat-icon ${s.color}`}><Icon size={20}/></div>
                </div>
                <div style={{ fontSize:"11px",color:"#94a3b8",display:"flex",alignItems:"center",gap:4 }}>View details <ArrowRight size={10}/></div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Leave Balance + Next Pay */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:20 }}>
        <div className="emp-card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>Leave Balance</h3>
          {[["EL","Earned Leave",bal.el,12,"#2563eb"],["SL","Sick Leave",bal.sl,12,"#16a34a"],["CL","Casual Leave",bal.cl,8,"#ea580c"],["OL","Optional Leave",bal.ol,2,"#7c3aed"]].map(([code,name,v,max,color])=>(
            <div key={code} style={{ marginBottom:12 }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <span style={{ fontSize:12,fontWeight:600,color:"#374151" }}>{name}</span>
                <span style={{ fontSize:12,fontWeight:700,color }}>({v}/{max})</span>
              </div>
              <div style={{ height:6,background:"#f1f5f9",borderRadius:99 }}>
                <div style={{ height:"100%",width:`${Math.min(100,(v/max)*100)}%`,background:color,borderRadius:99,transition:"width .5s" }}/>
              </div>
            </div>
          ))}
          <Link href="/emp/dashboard/leaves" style={{ display:"inline-flex",alignItems:"center",gap:4,marginTop:8,fontSize:12,color:"#2563eb",fontWeight:600,textDecoration:"none" }}>Apply Leave <ArrowRight size={12}/></Link>
        </div>

        <div className="emp-card" style={{ padding:20 }}>
          <h3 style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 16px" }}>Salary Info</h3>
          {slip ? (
            <>
              <div style={{ fontSize:13,color:"#64748b",marginBottom:4 }}>Last slip: {slip.pay_period}</div>
              <div style={{ fontSize:28,fontWeight:800,color:"#0f172a",marginBottom:8 }}>{fmt(slip.net_salary)}</div>
              {nextPay && <div style={{ fontSize:12,color:"#16a34a",fontWeight:600,marginBottom:12 }}>Next pay: {new Date(nextPay).toLocaleDateString("en-IN",{day:"numeric",month:"long"})}</div>}
              <Link href="/emp/dashboard/salary" style={{ display:"inline-flex",alignItems:"center",gap:4,fontSize:12,color:"#2563eb",fontWeight:600,textDecoration:"none" }}>View All Slips <ArrowRight size={12}/></Link>
            </>
          ) : <div style={{ color:"#94a3b8",fontSize:13 }}>No salary slip yet</div>}
        </div>
      </div>
    </div>
  );
}
