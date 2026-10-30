"use client";
import React, { useState, useEffect } from "react";
import { Bell, Check, RefreshCw } from "lucide-react";
import EMP_API from "@/utils/empApi";

const EVENT_ICONS = { leave_approved:"✅",leave_rejected:"❌",leave_applied:"📋",payroll_processed:"💰",salary_slip_generated:"🧾",attendance_regularization:"⏰",employee_joined:"👤",user_created:"👥" };
const fmtDT = (d) => d?new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}):"—";

export default function EmpNotificationsPage() {
  const [items,   setItems]   = useState([]);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try { setLoading(true); const { data } = await EMP_API.get("/notifications?limit=100"); setItems(data.notifications||[]); setUnread(data.unread_count||0); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => { try { await EMP_API.post("/notifications/mark-all-read"); load(); } catch {} };

  const timeAgo = (d) => {
    const m=Math.floor((Date.now()-new Date(d).getTime())/60000);
    if(m<1)return"just now"; if(m<60)return`${m}m ago`;
    const h=Math.floor(m/60); if(h<24)return`${h}h ago`;
    return`${Math.floor(h/24)}d ago`;
  };

  return (
    <div>
      <div className="emp-page-header">
        <div><h1 className="emp-page-title">Notifications</h1><p className="emp-page-sub">{unread} unread</p></div>
        <div style={{ display:"flex",gap:8 }}>
          <button className="emp-btn emp-btn-outline" style={{ fontSize:12,padding:"7px 12px" }} onClick={load}><RefreshCw size={13}/></button>
          {unread>0&&<button className="emp-btn emp-btn-primary" onClick={markAll}><Check size={14}/>Mark All Read</button>}
        </div>
      </div>

      {loading?<div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      :items.length===0?<div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}><Bell size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/><p style={{ margin:0 }}>No notifications yet</p></div>
      :<div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {items.map(n=>(
          <div key={n.id||n._id} style={{ background:"#fff",border:`1px solid ${n.is_read?"#e2e8f0":"#93c5fd"}`,borderLeft:`4px solid ${n.is_read?"#e2e8f0":"#2563eb"}`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:14 }}>
            <div style={{ fontSize:22,flexShrink:0,lineHeight:1 }}>{EVENT_ICONS[n.event_type]||"🔔"}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap",marginBottom:3 }}>
                <div style={{ fontWeight:n.is_read?500:700,color:"#0f172a",fontSize:14 }}>{n.title}</div>
                <div style={{ fontSize:11,color:"#94a3b8",whiteSpace:"nowrap" }}>{timeAgo(n.created_at)}</div>
              </div>
              <p style={{ fontSize:13,color:"#64748b",margin:0 }}>{n.message}</p>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
