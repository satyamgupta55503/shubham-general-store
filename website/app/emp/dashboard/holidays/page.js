"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Sun } from "lucide-react";
import EMP_API from "@/utils/empApi";

const TYPE_STYLE = {
  national: { bg:"#fee2e2", c:"#dc2626", label:"National"  },
  optional: { bg:"#fef9c3", c:"#a16207", label:"Optional"  },
  regional: { bg:"#dbeafe", c:"#1d4ed8", label:"Regional"  },
  company:  { bg:"#ede9fe", c:"#5b21b6", label:"Company"   },
};
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function EmpHolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [year,     setYear]     = useState(new Date().getFullYear());
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    try { setLoading(true); const { data } = await EMP_API.get("/holidays", { params:{ year } }); setHolidays(data||[]); }
    catch {} finally { setLoading(false); }
  }, [year]);

  useEffect(() => { load(); }, [load]);

  const today  = new Date(); today.setHours(0,0,0,0);
  const passed = holidays.filter(h => new Date(h.date) < today);
  const upcoming = holidays.filter(h => new Date(h.date) >= today);
  const next = upcoming[0];

  const byMonth = MONTHS.map((label,i) => ({
    label, month: i,
    items: holidays.filter(h => new Date(h.date).getMonth()===i),
  })).filter(m=>m.items.length>0);

  const fmtD = (d) => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"long",weekday:"long"}) : "—";

  return (
    <div>
      <div className="emp-page-header">
        <div><h1 className="emp-page-title">Holiday Calendar</h1><p className="emp-page-sub">{holidays.length} holidays in {year}</p></div>
        <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{ padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:13,outline:"none",fontFamily:"inherit" }}>
          {[2024,2025,2026].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Next holiday highlight */}
      {next && (
        <div style={{ background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid #93c5fd",borderRadius:14,padding:"20px 24px",marginBottom:24,display:"flex",gap:20,alignItems:"center",flexWrap:"wrap" }}>
          <div style={{ fontSize:40,lineHeight:1 }}>🎉</div>
          <div>
            <p style={{ fontSize:11,fontWeight:700,color:"#1d4ed8",textTransform:"uppercase",letterSpacing:".06em",margin:"0 0 4px" }}>Next Holiday</p>
            <h2 style={{ fontSize:20,fontWeight:800,color:"#1e3a8a",margin:"0 0 4px" }}>{next.name}</h2>
            <p style={{ fontSize:13,color:"#2563eb",margin:0 }}>
              {fmtD(next.date)} ·{" "}
              <strong>{Math.ceil((new Date(next.date)-today)/(1000*60*60*24))} day{Math.ceil((new Date(next.date)-today)/(1000*60*60*24))!==1?"s":""} away</strong>
            </p>
          </div>
          <div style={{ marginLeft:"auto" }}>
            <span style={{ ...TYPE_STYLE[next.type]&&{background:TYPE_STYLE[next.type].bg,color:TYPE_STYLE[next.type].c},padding:"5px 14px",borderRadius:20,fontWeight:700,fontSize:12 }}>{TYPE_STYLE[next.type]?.label||next.type}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ display:"flex",gap:8,marginBottom:20,flexWrap:"wrap" }}>
        {Object.entries(TYPE_STYLE).map(([k,v])=>(
          <span key={k} style={{ padding:"4px 12px",borderRadius:20,fontSize:11,fontWeight:700,background:v.bg,color:v.c }}>{v.label}</span>
        ))}
      </div>

      {loading ? <div style={{ padding:"48px",textAlign:"center",color:"#94a3b8" }}>Loading…</div>
      : holidays.length===0 ? (
        <div style={{ padding:"64px",textAlign:"center",color:"#94a3b8" }}>
          <Sun size={40} color="#e2e8f0" style={{ display:"block",margin:"0 auto 12px" }}/>
          <p style={{ margin:0 }}>No holidays found for {year}.</p>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:18 }}>
          {byMonth.map(({ label, items }) => (
            <div key={label} className="emp-card">
              <div className="emp-card-header">
                <span className="emp-card-title">{label}</span>
                <span style={{ background:"#dbeafe",color:"#1d4ed8",padding:"2px 9px",borderRadius:20,fontSize:11,fontWeight:700 }}>{items.length}</span>
              </div>
              {items.map(h => {
                const ts = TYPE_STYLE[h.type]||TYPE_STYLE.national;
                const isPast = new Date(h.date) < today;
                return (
                  <div key={h.id||h._id} style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 18px",borderBottom:"1px solid #f8fafc",opacity:isPast?.5:1 }}>
                    <div style={{ textAlign:"center",width:38,flexShrink:0 }}>
                      <div style={{ fontSize:18,fontWeight:800,color:isPast?"#94a3b8":"#0f172a",lineHeight:1 }}>{new Date(h.date).getDate()}</div>
                      <div style={{ fontSize:10,color:"#94a3b8",textTransform:"uppercase" }}>{new Date(h.date).toLocaleString("en-IN",{weekday:"short"})}</div>
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <div style={{ fontWeight:600,fontSize:13,color:isPast?"#94a3b8":"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{h.name}</div>
                      <span style={{ padding:"2px 7px",borderRadius:20,fontSize:10,fontWeight:700,background:ts.bg,color:ts.c }}>{ts.label}</span>
                    </div>
                    {isPast && <span style={{ fontSize:10,color:"#94a3b8",fontWeight:600 }}>Past</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {holidays.length > 0 && (
        <div style={{ marginTop:24,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12 }}>
          {[["Total Holidays",holidays.length,"#2563eb"],["Passed",passed.length,"#94a3b8"],["Upcoming",upcoming.length,"#15803d"],["This Month",holidays.filter(h=>new Date(h.date).getMonth()===new Date().getMonth()&&new Date(h.date).getFullYear()===year).length,"#7c3aed"]].map(([l,v,c])=>(
            <div key={l} style={{ background:"#fff",border:"1px solid #e2e8f0",borderRadius:10,padding:"14px 16px" }}>
              <p style={{ fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",margin:"0 0 3px" }}>{l}</p>
              <p style={{ fontSize:22,fontWeight:800,color:c,margin:0 }}>{v}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
