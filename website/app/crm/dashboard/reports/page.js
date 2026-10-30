"use client";
import React, { useState, useEffect, useCallback } from "react";
import CRM_API from "@/utils/crmApi";
import {
  TrendingUp, TrendingDown, IndianRupee, Users, Briefcase,
  BarChart2, PieChart, Activity, RefreshCw, Download, ArrowUpRight,
  ChevronDown, FileText, MessageSquare, CheckCircle, AlertTriangle,
  Clock, Zap, Target, Star,
} from "lucide-react";
import { toCSV, downloadCSV } from "@/utils/exportUtils";

/* ── helpers ── */
const fmt   = n => `₹${Number(n||0).toLocaleString("en-IN")}`;
const fmtK  = n => { const v=Number(n||0); return v>=1e7?`₹${(v/1e7).toFixed(1)}Cr`:v>=1e5?`₹${(v/1e5).toFixed(1)}L`:v>=1e3?`₹${(v/1e3).toFixed(0)}K`:`₹${v}`; };
const pct   = (a,b) => b>0 ? Math.round((a/b)*100) : 0;

/* ── mini bar (pure CSS, no lib) ── */
function MiniBar({ value, max, color="#22c55e", height=6 }) {
  const w = max>0 ? Math.min(100, Math.round((value/max)*100)) : 0;
  return (
    <div style={{ background:"#f1f5f9", borderRadius:4, height, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${w}%`, background:color, borderRadius:4, transition:"width .6s ease" }} />
    </div>
  );
}

/* ── Funnel bar ── */
function FunnelRow({ stage, count, max, color }) {
  const w = max>0 ? Math.max(8, Math.round((count/max)*100)) : 8;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
      <div style={{ width:90, fontSize:11, fontWeight:600, color:"#64748b", textAlign:"right", flexShrink:0 }}>{stage}</div>
      <div style={{ flex:1, background:"#f1f5f9", borderRadius:6, height:28, overflow:"hidden", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, width:`${w}%`, background:color, borderRadius:6, opacity:0.9 }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", paddingLeft:10 }}>
          <span style={{ fontSize:12, fontWeight:800, color:"#fff", textShadow:"0 1px 2px rgba(0,0,0,.3)" }}>{count}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card ── */
function StatCard({ label, value, sub, icon:Icon, color, bg, trend }) {
  return (
    <div style={{ background:"#fff", border:`1px solid ${bg}`, borderRadius:14, padding:"16px 18px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 5px" }}>{label}</p>
          <p style={{ fontSize:26, fontWeight:800, color:"#0f172a", margin:0, lineHeight:1 }}>{value}</p>
        </div>
        <div style={{ width:40, height:40, borderRadius:10, background:bg, color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        {sub && <span style={{ fontSize:11, color:"#94a3b8" }}>{sub}</span>}
        {trend != null && (
          <span style={{ fontSize:11, fontWeight:700, color: trend>=0?"#16a34a":"#dc2626", display:"flex", alignItems:"center", gap:2 }}>
            {trend>=0 ? <TrendingUp size={11}/> : <TrendingDown size={11}/>} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Revenue Chart (inline SVG sparkline) ── */
function RevenueChart({ data }) {
  if (!data?.length) return <div style={{height:120,display:"flex",alignItems:"center",justifyContent:"center",color:"#94a3b8",fontSize:13}}>No data yet</div>;

  const maxV   = Math.max(...data.map(d => Math.max(d.received, d.billed)), 1);
  const W      = 580; // viewBox width
  const H      = 120;
  const PAD    = 30;
  const w      = (W - PAD*2) / (data.length - 1 || 1);

  const pts = (key) => data.map((d, i) => {
    const x = PAD + i * w;
    const y = H - PAD - ((d[key] / maxV) * (H - PAD*2));
    return `${x},${y}`;
  }).join(" ");

  const area = (key, y2 = H - PAD) => {
    const first = `${PAD},${H-PAD}`;
    const last  = `${PAD + (data.length-1)*w},${H-PAD}`;
    return `${first} ${pts(key)} ${last}`;
  };

  return (
    <div style={{ overflowX:"auto" }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", minWidth:260, display:"block" }}>
        {/* Grid lines */}
        {[0,.25,.5,.75,1].map(r => (
          <line key={r} x1={PAD} x2={W-PAD} y1={H-PAD - r*(H-PAD*2)} y2={H-PAD - r*(H-PAD*2)} stroke="#f1f5f9" strokeWidth={1}/>
        ))}
        {/* Billed area */}
        <polygon points={area("billed")} fill="#dbeafe" opacity={0.6}/>
        <polyline points={pts("billed")} fill="none" stroke="#2563eb" strokeWidth={1.5} strokeDasharray="4 2"/>
        {/* Received area */}
        <polygon points={area("received")} fill="#dcfce7" opacity={0.7}/>
        <polyline points={pts("received")} fill="none" stroke="#22c55e" strokeWidth={2}/>
        {/* Dots */}
        {data.map((d,i) => {
          const x = PAD + i*w;
          const yr = H - PAD - ((d.received / maxV) * (H - PAD*2));
          return <circle key={i} cx={x} cy={yr} r={3} fill="#22c55e" stroke="#fff" strokeWidth={1.5}/>;
        })}
        {/* X labels */}
        {data.filter((_,i)=>i%Math.ceil(data.length/6)===0||i===data.length-1).map((d,i,arr)=>{
          const origIdx = data.indexOf(d);
          const x = PAD + origIdx * w;
          return <text key={i} x={x} y={H-4} textAnchor="middle" fontSize={8} fill="#94a3b8">{d.label}</text>;
        })}
      </svg>
      {/* Legend */}
      <div style={{display:"flex",gap:16,justifyContent:"center",marginTop:6}}>
        <span style={{fontSize:11,color:"#22c55e",fontWeight:700,display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:3,background:"#22c55e",borderRadius:2,display:"inline-block"}}/> Received</span>
        <span style={{fontSize:11,color:"#2563eb",fontWeight:700,display:"flex",alignItems:"center",gap:4}}><span style={{width:12,height:2,background:"#2563eb",borderRadius:2,display:"inline-block",borderTop:"1px dashed #2563eb"}}/> Billed</span>
      </div>
    </div>
  );
}

/* ── Activity Heatmap ── */
function ActivityHeatmap({ data }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d=>d.count), 1);
  const getColor = c => {
    if (!c) return "#f1f5f9";
    const i = c/max;
    if (i<.25) return "#bbf7d0";
    if (i<.5)  return "#4ade80";
    if (i<.75) return "#16a34a";
    return "#14532d";
  };
  return (
    <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
      {data.map((d,i)=>(
        <div key={i} title={`${d.label}: ${d.count} actions`}
          style={{ width:14, height:14, borderRadius:3, background:getColor(d.count), cursor:"default", transition:"transform .15s" }}
          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.4)"}
          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
        />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN REPORTS PAGE
══════════════════════════════════════════ */
export default function ReportsPage() {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState("12m");
  const [refreshing,setRefreshing]= useState(false);
  const [tab,       setTab]       = useState("revenue");

  const fetch = useCallback(async (silent=false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const { data: d } = await CRM_API.get(`/reports?period=${period}`);
      setData(d);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setTimeout(()=>setRefreshing(false),600); }
  }, [period]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = data.revenue_chart || [];
    const cols = [
      { label:"Month",          key:"label" },
      { label:"Billed (₹)",     key:"billed" },
      { label:"Received (₹)",   key:"received" },
      { label:"Invoices",       key:"invoices" },
      { label:"Payments",       key:"payments" },
    ];
    downloadCSV(toCSV(rows, cols), `DKS_CRM_Revenue_Report_${new Date().toISOString().split("T")[0]}.csv`);
  };

  const s = data?.summary || {};
  const funnel = data?.conversion_funnel || [];
  const funnelMax = funnel[0]?.count || 1;

  if (loading) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",flexDirection:"column",gap:14}}>
      <div style={{width:40,height:40,border:"3px solid #dcfce7",borderTopColor:"#22c55e",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
      <p style={{color:"#64748b",fontSize:14,margin:0}}>Generating reports…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{fontFamily:"'Inter',sans-serif",animation:"fadeUp .25s ease"}}>

      {/* ── Header ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 3px"}}>Business Reports</h1>
          <p style={{fontSize:13,color:"#64748b",margin:0}}>Real-time analytics across revenue, pipeline, clients and activity</p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {/* Period selector */}
          {["3m","6m","12m"].map(p=>(
            <button key={p} onClick={()=>setPeriod(p)}
              style={{padding:"7px 14px",borderRadius:8,border:"1px solid #e2e8f0",fontSize:12,fontWeight:700,cursor:"pointer",background:period===p?"#0f172a":"#fff",color:period===p?"#fff":"#64748b",transition:"all .15s"}}>
              {p==="3m"?"3 Months":p==="6m"?"6 Months":"12 Months"}
            </button>
          ))}
          <button onClick={()=>fetch(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,fontSize:12,fontWeight:600,color:"#64748b",cursor:"pointer"}}>
            <RefreshCw size={12} style={{animation:refreshing?"spin .7s linear infinite":"none"}}/> Refresh
          </button>
          <button onClick={handleExportCSV} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,fontWeight:600,color:"#16a34a",cursor:"pointer"}}>
            <Download size={12}/> Export
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:12,marginBottom:24}}>
        <StatCard label="Total Billed"     value={fmtK(s.total_billed)}    icon={IndianRupee}  color="#7c3aed" bg="#ede9fe" sub="All-time invoiced"  />
        <StatCard label="Revenue Received" value={fmtK(s.total_received)}  icon={TrendingUp}   color="#16a34a" bg="#dcfce7" sub={`${s.collection_rate||0}% collection rate`} />
        <StatCard label="Outstanding"      value={fmtK(s.outstanding)}     icon={AlertTriangle}color="#ea580c" bg="#ffedd5" sub="Pending collection" />
        <StatCard label="Total Clients"    value={s.clients_total||0}       icon={Users}        color="#2563eb" bg="#dbeafe" sub={`+${s.clients_new||0} new this period`} />
        <StatCard label="Total Projects"   value={s.projects_total||0}      icon={Briefcase}    color="#0891b2" bg="#ccfbf1" />
        <StatCard label="Collection Rate"  value={`${s.collection_rate||0}%`} icon={Target}    color="#16a34a" bg="#dcfce7" />
      </div>

      {/* ── Tabs ── */}
      <div style={{display:"flex",gap:2,background:"#f8fafc",borderRadius:10,padding:4,marginBottom:20,overflowX:"auto"}}>
        {[
          {key:"revenue",  label:"Revenue & Billing",  icon:<BarChart2 size={12}/>},
          {key:"pipeline", label:"Sales Pipeline",     icon:<Target size={12}/>},
          {key:"clients",  label:"Clients & Projects", icon:<Users size={12}/>},
          {key:"activity", label:"Activity",           icon:<Activity size={12}/>},
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"7px 14px",borderRadius:7,border:"none",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",background:tab===t.key?"#fff":"transparent",color:tab===t.key?"#0f172a":"#64748b",boxShadow:tab===t.key?"0 1px 4px rgba(0,0,0,.07)":"none",transition:"all .15s"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ════ REVENUE TAB ════ */}
      {tab==="revenue" && (
        <div style={{display:"flex",flexDirection:"column",gap:18}}>

          {/* Revenue chart */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <BarChart2 size={15} style={{color:"#22c55e"}}/>
                <span style={{fontSize:14,fontWeight:700,color:"#0f172a"}}>Revenue Trend</span>
              </div>
              <span style={{fontSize:11,color:"#94a3b8"}}>Billed vs Received — last {period}</span>
            </div>
            <RevenueChart data={data?.revenue_chart}/>
          </div>

          {/* Invoice status + monthly table side by side */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>

            {/* Invoice by status */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><FileText size={13} style={{color:"#22c55e"}}/> Invoice Status</p>
              {(data?.invoice_by_status||[]).map((s,i)=>{
                const total = (data.invoice_by_status||[]).reduce((acc,x)=>acc+x.count,0);
                const colors={draft:"#94a3b8",issued:"#2563eb",partial:"#ea580c",paid:"#16a34a",overdue:"#dc2626",cancelled:"#9ca3af"};
                return (
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#374151",textTransform:"capitalize"}}>{s._id}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{s.count} <span style={{color:"#94a3b8",fontWeight:400}}>({pct(s.count,total)}%)</span></span>
                    </div>
                    <MiniBar value={s.count} max={total} color={colors[s._id]||"#64748b"}/>
                  </div>
                );
              })}
            </div>

            {/* Monthly summary table */}
            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px",overflow:"hidden"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 12px",display:"flex",alignItems:"center",gap:6}}><BarChart2 size={13} style={{color:"#22c55e"}}/> Monthly Summary</p>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead><tr style={{background:"#f8fafc"}}>
                    {["Month","Billed","Received","Inv."].map(h=><th key={h} style={{padding:"7px 10px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0",whiteSpace:"nowrap"}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {(data?.revenue_chart||[]).slice(-6).map((r,i)=>(
                      <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                        <td style={{padding:"8px 10px",fontWeight:600,color:"#374151"}}>{r.label}</td>
                        <td style={{padding:"8px 10px",color:"#2563eb",fontWeight:600}}>{fmtK(r.billed)}</td>
                        <td style={{padding:"8px 10px",color:"#16a34a",fontWeight:700}}>{fmtK(r.received)}</td>
                        <td style={{padding:"8px 10px",color:"#94a3b8"}}>{r.invoices}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════ PIPELINE TAB ════ */}
      {tab==="pipeline" && (
        <div style={{display:"flex",flexDirection:"column",gap:18}}>

          {/* Conversion funnel */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px 24px"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 18px",display:"flex",alignItems:"center",gap:6}}><Target size={14} style={{color:"#22c55e"}}/> Sales Conversion Funnel</p>
            {funnel.map((f,i)=>(
              <FunnelRow key={i} stage={f.stage} count={f.count} max={funnelMax} color={f.color}/>
            ))}
            <div style={{marginTop:14,padding:"10px 14px",background:"#f0fdf4",borderRadius:8,fontSize:12,color:"#16a34a"}}>
              💡 Conversion: {funnel[0]?.count||0} enquiries → {funnel[funnel.length-1]?.count||0} won deals
              ({pct(funnel[funnel.length-1]?.count||0, funnel[0]?.count||1)}% end-to-end rate)
            </div>
          </div>

          {/* Enquiry breakdown */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>

            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><MessageSquare size={13} style={{color:"#22c55e"}}/> Enquiry Status</p>
              {(data?.enquiry_by_status||[]).map((e,i)=>{
                const tot=(data.enquiry_by_status||[]).reduce((s,x)=>s+x.count,0);
                const colors={new:"#2563eb",contacted:"#d97706",proposal_sent:"#7c3aed",converted:"#16a34a",lost:"#dc2626"};
                return (
                  <div key={i} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#374151",textTransform:"capitalize"}}>{e._id?.replace(/_/g," ")}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{e.count} ({pct(e.count,tot)}%)</span>
                    </div>
                    <MiniBar value={e.count} max={tot} color={colors[e._id]||"#64748b"}/>
                  </div>
                );
              })}
            </div>

            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><Zap size={13} style={{color:"#22c55e"}}/> Enquiry Sources</p>
              {(data?.enquiry_by_source||[]).map((e,i)=>{
                const tot=(data.enquiry_by_source||[]).reduce((s,x)=>s+x.count,0);
                const srcColors={instagram:"#e1306c",facebook:"#1877f2",google:"#ea4335",linkedin:"#0a66c2",website:"#16a34a",referral:"#d97706",manual:"#64748b"};
                return (
                  <div key={i} style={{marginBottom:9}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontSize:12,fontWeight:600,color:"#374151",textTransform:"capitalize"}}>{e._id}</span>
                      <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{e.count} ({pct(e.count,tot)}%)</span>
                    </div>
                    <MiniBar value={e.count} max={tot} color={srcColors[e._id]||"#64748b"}/>
                  </div>
                );
              })}
            </div>

            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px"}}>
              <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><CheckCircle size={13} style={{color:"#22c55e"}}/> Proposals & Quotations</p>
              <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",margin:"0 0 6px"}}>Proposals</p>
              {(data?.proposal_by_status||[]).map((p,i)=>{
                const tot=(data.proposal_by_status||[]).reduce((s,x)=>s+x.count,0);
                const c={draft:"#94a3b8",sent:"#2563eb",accepted:"#16a34a",rejected:"#dc2626"}[p._id]||"#64748b";
                return (<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:70,fontSize:11,color:"#64748b",textTransform:"capitalize"}}>{p._id}</span>
                  <div style={{flex:1}}><MiniBar value={p.count} max={tot} color={c} height={5}/></div>
                  <span style={{fontSize:11,fontWeight:700,color:"#1e293b",minWidth:20,textAlign:"right"}}>{p.count}</span>
                </div>);
              })}
              <p style={{fontSize:11,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",margin:"12px 0 6px"}}>Quotations</p>
              {(data?.quotation_by_status||[]).map((q,i)=>{
                const tot=(data.quotation_by_status||[]).reduce((s,x)=>s+x.count,0);
                const c={draft:"#94a3b8",sent:"#2563eb",approved:"#16a34a",rejected:"#dc2626"}[q._id]||"#64748b";
                return (<div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{width:70,fontSize:11,color:"#64748b",textTransform:"capitalize"}}>{q._id}</span>
                  <div style={{flex:1}}><MiniBar value={q.count} max={tot} color={c} height={5}/></div>
                  <span style={{fontSize:11,fontWeight:700,color:"#1e293b",minWidth:20,textAlign:"right"}}>{q.count}</span>
                </div>);
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════ CLIENTS & PROJECTS TAB ════ */}
      {tab==="clients" && (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>

          {/* Top clients */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px",gridColumn:"span 2"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><Star size={13} style={{color:"#22c55e"}}/> Top Clients by Revenue</p>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                <thead><tr style={{background:"#f8fafc"}}>
                  {["#","Client","Total Billed","Invoices","Avg Invoice"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",borderBottom:"1px solid #e2e8f0"}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {(data?.top_clients||[]).map((c,i)=>(
                    <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"10px 12px",color:"#94a3b8",fontWeight:700}}>{i+1}</td>
                      <td style={{padding:"10px 12px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#dcfce7,#bbf7d0)",color:"#16a34a",fontSize:11,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{c._id?.[0]?.toUpperCase()||"?"}</div>
                          <span style={{fontWeight:600,color:"#1e293b"}}>{c._id||"Unknown"}</span>
                        </div>
                      </td>
                      <td style={{padding:"10px 12px",fontWeight:800,color:"#16a34a"}}>{fmt(c.total_billed)}</td>
                      <td style={{padding:"10px 12px",color:"#374151"}}>{c.invoice_count}</td>
                      <td style={{padding:"10px 12px",color:"#64748b"}}>{fmt(c.invoice_count?c.total_billed/c.invoice_count:0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Projects by status */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"18px 20px"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><Briefcase size={13} style={{color:"#22c55e"}}/> Projects by Status</p>
            {(data?.projects_by_status||[]).map((p,i)=>{
              const tot=(data.projects_by_status||[]).reduce((s,x)=>s+x.count,0);
              const c={active:"#22c55e",completed:"#2563eb",on_hold:"#d97706",cancelled:"#dc2626"}[p._id]||"#64748b";
              return (<div key={i} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#374151",textTransform:"capitalize"}}>{p._id?.replace(/_/g," ")}</span>
                  <span style={{fontSize:12,fontWeight:700,color:"#1e293b"}}>{p.count} ({pct(p.count,tot)}%)</span>
                </div>
                <MiniBar value={p.count} max={tot} color={c}/>
              </div>);
            })}
          </div>
        </div>
      )}

      {/* ════ ACTIVITY TAB ════ */}
      {tab==="activity" && (
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px 22px"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 6px",display:"flex",alignItems:"center",gap:6}}><Activity size={13} style={{color:"#22c55e"}}/> Activity Heatmap — Last 30 Days</p>
            <p style={{fontSize:11,color:"#94a3b8",margin:"0 0 14px"}}>Each cell = one day. Darker = more activity.</p>
            <ActivityHeatmap data={data?.activity_chart}/>
            <div style={{display:"flex",gap:6,marginTop:10,alignItems:"center"}}>
              <span style={{fontSize:10,color:"#94a3b8"}}>Less</span>
              {["#f1f5f9","#bbf7d0","#4ade80","#16a34a","#14532d"].map((c,i)=>(
                <div key={i} style={{width:12,height:12,borderRadius:2,background:c}}/>
              ))}
              <span style={{fontSize:10,color:"#94a3b8"}}>More</span>
            </div>
          </div>

          {/* Follow-up pipeline value */}
          <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,padding:"20px 22px"}}>
            <p style={{fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 14px",display:"flex",alignItems:"center",gap:6}}><TrendingUp size={13} style={{color:"#22c55e"}}/> Follow-Up Pipeline</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12}}>
              {Object.entries(data?.followup_pipeline||{}).map(([status,info],i)=>{
                const colors={won:"#16a34a",lost:"#dc2626",scheduled:"#2563eb",in_progress:"#d97706",contacted:"#0891b2",no_response:"#94a3b8"};
                const bgs={won:"#dcfce7",lost:"#fee2e2",scheduled:"#dbeafe",in_progress:"#fef3c7",contacted:"#cffafe",no_response:"#f1f5f9"};
                const c=colors[status]||"#64748b"; const bg=bgs[status]||"#f8fafc";
                return (
                  <div key={i} style={{background:bg,borderRadius:10,padding:"12px 14px"}}>
                    <p style={{fontSize:9,fontWeight:800,color:c,textTransform:"uppercase",letterSpacing:".07em",margin:"0 0 5px"}}>{status.replace(/_/g," ")}</p>
                    <p style={{fontSize:20,fontWeight:800,color:c,margin:"0 0 2px"}}>{info.count}</p>
                    {info.value>0 && <p style={{fontSize:11,color:c,margin:0,opacity:.8}}>{fmtK(info.value)}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:none; } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
