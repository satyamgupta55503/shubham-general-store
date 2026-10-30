"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, X, ChevronRight, Bell } from "lucide-react";
import CRM_API from "@/utils/crmApi";

const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "—";

/**
 * ReminderBanner — appears at the top of every CRM dashboard page.
 * Shows overdue + today's follow-ups.
 * Dismissible per session; auto-refreshes every 5 minutes.
 */
export default function ReminderBanner() {
  const [data,      setData]      = useState(null);
  const [dismissed, setDismissed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);

  const load = async () => {
    try {
      const { data: d } = await CRM_API.get("/reports/reminders");
      // If browser reminders disabled in settings, don't show banner
      if (d.disabled || d.reminder_browser_enabled === false) {
        setData(null);
        return;
      }
      setData(d);
    } catch {}
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(iv);
  }, []);

  if (!data || dismissed) return null;

  const overdueCount = data.overdue?.length || 0;
  const todayCount   = data.today?.length   || 0;
  const total        = overdueCount + todayCount;

  if (total === 0) return null;

  const isUrgent = overdueCount > 0;

  return (
    <div style={{
      background: isUrgent ? "#fef2f2" : "#fffbeb",
      border: `1px solid ${isUrgent ? "#fecaca" : "#fde68a"}`,
      borderRadius: 10,
      margin: "0 0 16px",
      overflow: "hidden",
      animation: "slideDown .25s ease",
    }}>
      {/* Main row */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px" }}>
        <div style={{
          width:32, height:32, borderRadius:8, flexShrink:0,
          background: isUrgent ? "#fee2e2" : "#fef3c7",
          color: isUrgent ? "#dc2626" : "#d97706",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>
          {isUrgent ? <AlertTriangle size={15}/> : <Clock size={15}/>}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <span style={{ fontSize:13, fontWeight:700, color: isUrgent?"#991b1b":"#92400e" }}>
            {isUrgent && overdueCount > 0 && `${overdueCount} overdue follow-up${overdueCount>1?"s":""}`}
            {isUrgent && overdueCount > 0 && todayCount > 0 && " · "}
            {todayCount > 0 && `${todayCount} due today`}
          </span>
          <span style={{ fontSize:12, color: isUrgent?"#b91c1c":"#a16207", marginLeft:8 }}>
            — action needed
          </span>
        </div>

        <div style={{ display:"flex", gap:6, flexShrink:0 }}>
          <button onClick={() => setExpanded(p=>!p)}
            style={{ padding:"4px 10px", background: isUrgent?"#dc2626":"#d97706", color:"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            {expanded ? "Hide" : "View"}
            <ChevronRight size={11} style={{ transform: expanded?"rotate(90deg)":"none", transition:"transform .2s" }}/>
          </button>
          <Link href="/crm/dashboard/followups?view=overdue"
            style={{ padding:"4px 10px", background:"transparent", color: isUrgent?"#dc2626":"#d97706", border:`1px solid ${isUrgent?"#fca5a5":"#fcd34d"}`, borderRadius:6, fontSize:11, fontWeight:700, textDecoration:"none", display:"flex", alignItems:"center", gap:3 }}>
            Open <ChevronRight size={11}/>
          </Link>
          <button onClick={() => setDismissed(true)}
            style={{ width:26, height:26, background:"transparent", border:"none", color: isUrgent?"#ef4444":"#f59e0b", cursor:"pointer", borderRadius:5, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <X size={13}/>
          </button>
        </div>
      </div>

      {/* Expanded list */}
      {expanded && (
        <div style={{ borderTop:`1px solid ${isUrgent?"#fecaca":"#fde68a"}`, padding:"8px 14px 10px" }}>
          {overdueCount > 0 && (
            <div style={{ marginBottom:8 }}>
              <p style={{ fontSize:10, fontWeight:800, color:"#dc2626", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 5px" }}>
                🔴 Overdue ({overdueCount})
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {(data.overdue||[]).slice(0,5).map((f,i)=>(
                  <Link key={i} href="/crm/dashboard/followups"
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", background:"#fff1f2", borderRadius:6, textDecoration:"none" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#dc2626", flexShrink:0 }}>🔴</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#1e293b", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.contact_name} — {f.title}</span>
                    <span style={{ fontSize:10, color:"#ef4444", fontWeight:700, flexShrink:0 }}>{fmtDate(f.follow_up_date)}</span>
                  </Link>
                ))}
                {overdueCount > 5 && <p style={{ fontSize:11, color:"#dc2626", margin:"2px 0 0", paddingLeft:8 }}>+{overdueCount-5} more</p>}
              </div>
            </div>
          )}

          {todayCount > 0 && (
            <div>
              <p style={{ fontSize:10, fontWeight:800, color:"#d97706", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 5px" }}>
                🟡 Due Today ({todayCount})
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {(data.today||[]).slice(0,5).map((f,i)=>(
                  <Link key={i} href="/crm/dashboard/followups?view=today"
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px", background:"#fffbeb", borderRadius:6, textDecoration:"none" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:"#d97706", flexShrink:0 }}>🟡</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#1e293b", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.contact_name} — {f.title}</span>
                    <span style={{ fontSize:10, color:"#f59e0b", fontWeight:700, textTransform:"capitalize", flexShrink:0 }}>{f.channel}</span>
                  </Link>
                ))}
                {todayCount > 5 && <p style={{ fontSize:11, color:"#d97706", margin:"2px 0 0", paddingLeft:8 }}>+{todayCount-5} more</p>}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }`}</style>
    </div>
  );
}
