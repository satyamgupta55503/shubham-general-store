"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, RefreshCw, Megaphone } from "lucide-react";
import EMP_API from "@/utils/empApi";

const PRI_STYLE = {
  high:   { bg:"#fee2e2", c:"#dc2626", border:"#fca5a5", icon:"🔴" },
  medium: { bg:"#fef9c3", c:"#a16207", border:"#fde68a", icon:"🟡" },
  low:    { bg:"#dcfce7", c:"#15803d", border:"#bbf7d0", icon:"🟢" },
};

const timeAgo = (d) => {
  const m = Math.floor((Date.now()-new Date(d).getTime())/60000);
  if (m<1) return "just now"; if (m<60) return `${m}m ago`;
  const h=Math.floor(m/60); if (h<24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

export default function EmpAnnouncementsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded,setExpanded]= useState({});

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await EMP_API.get("/announcements"); setItems(data||[]); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    try {
      await EMP_API.patch(`/announcements/${id}/read`);
      setItems(prev => prev.map(i => (i.id||i._id)===id ? { ...i, is_read:true } : i));
    } catch {}
  };

  const toggleExpand = (id) => {
    setExpanded(p => ({ ...p, [id]:!p[id] }));
    // auto-mark read on expand
    const item = items.find(i=>(i.id||i._id)===id);
    if (item && !item.is_read) markRead(id);
  };

  const unread = items.filter(i=>!i.is_read);
  const high   = items.filter(i=>i.priority==="high");

  return (
    <div>
      <div className="emp-page-header">
        <div>
          <h1 className="emp-page-title">Announcements</h1>
          <p className="emp-page-sub">{unread.length} unread · {items.length} total</p>
        </div>
        <button onClick={load} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:"#fff",border:"1px solid #d1d5db",borderRadius:8,fontSize:12,fontWeight:600,color:"#374151",cursor:"pointer" }}><RefreshCw size={13}/>Refresh</button>
      </div>

      {/* High priority banner */}
      {high.filter(i=>!i.is_read).length > 0 && (
        <div style={{ background:"#fef2f2",border:"1px solid #fca5a5",borderRadius:12,padding:"14px 18px",marginBottom:20,display:"flex",gap:10,alignItems:"center" }}>
          <span style={{ fontSize:20 }}>🚨</span>
          <span style={{ fontSize:13,fontWeight:700,color:"#dc2626" }}>{high.filter(i=>!i.is_read).length} urgent announcement{high.filter(i=>!i.is_read).length!==1?"s require":"requires"} your attention</span>
        </div>
      )}

      {loading ? <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      : items.length===0 ? (
        <div style={{ padding:"64px",textAlign:"center",color:"#94a3b8" }}>
          <Megaphone size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 12px" }}/>
          <p style={{ margin:0 }}>No announcements right now. Check back later.</p>
        </div>
      ) : (
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          {items.map(item => {
            const id = item.id||item._id;
            const ps = PRI_STYLE[item.priority]||PRI_STYLE.medium;
            const isExpanded = !!expanded[id];
            return (
              <div key={id} className={`emp-announce-card priority-${item.priority}`} style={{ opacity:item.is_read?.8:1 }}>
                <div style={{ display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer" }} onClick={()=>toggleExpand(id)}>
                  <div style={{ fontSize:22,flexShrink:0,lineHeight:1,marginTop:2 }}>{ps.icon}</div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap",marginBottom:4 }}>
                      <h3 style={{ fontSize:14,fontWeight:item.is_read?600:800,color:"#0f172a",margin:0 }}>{item.title}</h3>
                      <div style={{ display:"flex",gap:6,alignItems:"center",flexShrink:0 }}>
                        {!item.is_read && <span style={{ width:8,height:8,borderRadius:"50%",background:"#2563eb",display:"inline-block" }}/>}
                        <span style={{ fontSize:11,color:"#94a3b8" }}>{timeAgo(item.created_at)}</span>
                        <span style={{ fontSize:11,color:"#94a3b8" }}>{isExpanded?"▲":"▼"}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      <span style={{ padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,background:ps.bg,color:ps.c }}>{item.priority.charAt(0).toUpperCase()+item.priority.slice(1)}</span>
                      <span style={{ fontSize:11,color:"#94a3b8" }}>By {item.created_by_name||"HR"}</span>
                      {item.expires_at && <span style={{ fontSize:11,color:"#94a3b8" }}>· Expires {new Date(item.expires_at).toLocaleDateString("en-IN")}</span>}
                    </div>
                    {/* Body preview or full */}
                    <p style={{ fontSize:13,color:"#374151",lineHeight:1.7,margin:"10px 0 0",whiteSpace:"pre-wrap",
                      ...(!isExpanded && { display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden" }) }}>
                      {item.body}
                    </p>
                  </div>
                </div>
                {isExpanded && !item.is_read && (
                  <div style={{ marginTop:14,display:"flex",justifyContent:"flex-end" }}>
                    <button onClick={()=>markRead(id)} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:"#dbeafe",color:"#1d4ed8",border:"none",borderRadius:8,fontSize:12,fontWeight:700,cursor:"pointer" }}><Check size={13}/>Mark as Read</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
