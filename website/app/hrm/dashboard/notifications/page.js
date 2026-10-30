"use client";
import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import HRM_API from "@/utils/hrmApi";

const EVENT_ICONS = { employee_joined:"👤",employee_resigned:"👋",leave_applied:"📋",leave_approved:"✅",leave_rejected:"❌",payroll_processed:"💰",salary_slip_generated:"🧾",user_created:"👥",access_granted:"🔓",access_revoked:"🔒",attendance_regularization:"⏰" };
const fmtDT = (d) => d?new Date(d).toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true}):"—";

export default function HrmNotificationsPage() {
  const [items,  setItems]  = useState([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState(false);
  const [loading,setLoading]= useState(false);

  const load = async () => {
    try { setLoading(true); const { data } = await HRM_API.get(`/notifications?limit=100${filter?"&is_read=false":""}`); setItems(data.notifications||[]); setUnread(data.unread_count||0); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const markAllRead = async () => { try { await HRM_API.post("/notifications/mark-all-read"); load(); } catch {} };
  const markOne = async (id) => { try { await HRM_API.patch(`/notifications/${id}/read`); load(); } catch {} };

  const timeAgo = (d) => {
    const m=Math.floor((Date.now()-new Date(d).getTime())/60000);
    if(m<1)return"just now"; if(m<60)return`${m}m ago`;
    const h=Math.floor(m/60); if(h<24)return`${h}h ago`;
    return`${Math.floor(h/24)}d ago`;
  };

  return (
    <div>
      <div className="hrm-page-header">
        <div><h1 className="hrm-page-title">Notifications</h1><p className="hrm-page-sub">{unread} unread</p></div>
        <div style={{ display:"flex",gap:8 }}>
          <button className="hrm-btn hrm-btn-outline hrm-btn-sm" onClick={load}><RefreshCw size={14}/></button>
          {unread>0&&<button className="hrm-btn hrm-btn-primary" onClick={markAllRead}><Check size={14}/>Mark All Read</button>}
        </div>
      </div>

      <div style={{ display:"flex",gap:2,background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:4,width:"fit-content",marginBottom:20 }}>
        {[false,true].map(v=>(
          <button key={String(v)} onClick={()=>setFilter(v)} style={{ padding:"7px 16px",borderRadius:8,border:"none",fontSize:13,fontWeight:600,cursor:"pointer",background:filter===v?"#7c3aed":"transparent",color:filter===v?"#fff":"#64748b" }}>{v?`Unread (${unread})`:"All"}</button>
        ))}
      </div>

      {loading?<div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      :items.length===0?<div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}><Bell size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 10px" }}/><p style={{ margin:0 }}>No notifications</p></div>
      :<div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        {items.map(n=>(
          <div key={n.id||n._id} style={{ background:"#fff",border:`1px solid ${n.is_read?"#e2e8f0":"#c4b5fd"}`,borderLeft:`4px solid ${n.is_read?"#e2e8f0":"#7c3aed"}`,borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"flex-start",gap:14 }}>
            <div style={{ fontSize:22,flexShrink:0,lineHeight:1 }}>{EVENT_ICONS[n.event_type]||"🔔"}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap",marginBottom:3 }}>
                <div style={{ fontWeight:n.is_read?500:700,color:n.is_read?"#374151":"#0f172a",fontSize:14 }}>{n.title}</div>
                <div style={{ fontSize:11,color:"#94a3b8",whiteSpace:"nowrap" }}>{timeAgo(n.created_at)}</div>
              </div>
              <p style={{ fontSize:13,color:"#64748b",margin:0 }}>{n.message}</p>
            </div>
            {!n.is_read&&<button onClick={()=>markOne(n.id||n._id)} style={{ padding:5,background:"#ede9fe",color:"#7c3aed",border:"none",borderRadius:6,cursor:"pointer",flexShrink:0 }} title="Mark read"><Check size={13}/></button>}
          </div>
        ))}
      </div>}
    </div>
  );
}
