"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import CRM_API from "@/utils/crmApi";
import {
  Users, Briefcase, FileText, CreditCard, TrendingUp,
  MessageSquare, DollarSign, AlertCircle, ArrowRight,
  CheckCircle, Activity, RefreshCw, Package,
  BarChart2, Clock, IndianRupee,
} from "lucide-react";

/* ── helpers ─────────────────────────────── */
const fmt   = n  => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtK  = n  => { const v = Number(n || 0); return v >= 1e5 ? `₹${(v/1e5).toFixed(1)}L` : v >= 1e3 ? `₹${(v/1e3).toFixed(0)}K` : `₹${v}`; };
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) : "—";
const greet   = () => { const h = new Date().getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"; };

const STATUS_BADGE = {
  active:    { bg:"#dcfce7", color:"#15803d" },
  completed: { bg:"#dbeafe", color:"#1d4ed8" },
  on_hold:   { bg:"#fef9c3", color:"#a16207" },
  cancelled: { bg:"#fee2e2", color:"#dc2626" },
  paid:      { bg:"#dcfce7", color:"#15803d" },
  issued:    { bg:"#dbeafe", color:"#1d4ed8" },
  partial:   { bg:"#ffedd5", color:"#c2410c" },
  overdue:   { bg:"#fee2e2", color:"#dc2626" },
  draft:     { bg:"#f1f5f9", color:"#475569" },
  new:       { bg:"#dbeafe", color:"#1d4ed8" },
  contacted: { bg:"#fef9c3", color:"#a16207" },
  converted: { bg:"#dcfce7", color:"#15803d" },
  lost:      { bg:"#fee2e2", color:"#dc2626" },
  accepted:  { bg:"#dcfce7", color:"#15803d" },
  sent:      { bg:"#dbeafe", color:"#1d4ed8" },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { bg:"#f1f5f9", color:"#475569" };
  return (
    <span style={{
      display:"inline-flex", alignItems:"center",
      padding:"2px 9px", borderRadius:"20px",
      fontSize:"10px", fontWeight:"700",
      textTransform:"capitalize", whiteSpace:"nowrap",
      background: s.bg, color: s.color,
    }}>{status?.replace(/_/g," ") || "—"}</span>
  );
}

/* ── Stat card ───────────────────────────── */
function StatCard({ label, value, icon: Icon, colorClass, href, trend }) {
  const colorMap = {
    green:  { bg:"#dcfce7", ic:"#16a34a", border:"#bbf7d0" },
    blue:   { bg:"#dbeafe", ic:"#2563eb", border:"#bfdbfe" },
    purple: { bg:"#ede9fe", ic:"#7c3aed", border:"#ddd6fe" },
    teal:   { bg:"#ccfbf1", ic:"#0d9488", border:"#99f6e4" },
    orange: { bg:"#ffedd5", ic:"#ea580c", border:"#fed7aa" },
    red:    { bg:"#fee2e2", ic:"#dc2626", border:"#fecaca" },
    indigo: { bg:"#e0e7ff", ic:"#4338ca", border:"#c7d2fe" },
    pink:   { bg:"#fce7f3", ic:"#be185d", border:"#fbcfe8" },
  };
  const cl = colorMap[colorClass] || colorMap.blue;

  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div
        className="crm-stat-card-hover"
        style={{
          background:"#fff",
          border:`1px solid ${cl.border}`,
          borderRadius:"14px",
          padding:"18px 20px 16px",
          cursor:"pointer",
          transition:"all .2s",
          display:"flex",
          flexDirection:"column",
          gap:"14px",
          height:"100%",
        }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontSize:"11px", fontWeight:"700", color:"#64748b", textTransform:"uppercase", letterSpacing:".06em", margin:"0 0 6px" }}>
              {label}
            </p>
            <p style={{ fontSize:"28px", fontWeight:"800", color:"#0f172a", margin:0, lineHeight:1 }}>
              {value}
            </p>
          </div>
          <div style={{
            width:"42px", height:"42px", borderRadius:"11px",
            background: cl.bg, color: cl.ic,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0,
          }}>
            <Icon size={20} />
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"5px", fontSize:"11px", color:"#94a3b8" }}>
          <Activity size={11} />
          <span>Live data</span>
          {trend && <span style={{ marginLeft:"auto", fontSize:"11px", fontWeight:"600", color:"#22c55e" }}>{trend}</span>}
        </div>
      </div>
    </Link>
  );
}

/* ── Recent panel ────────────────────────── */
function RecentPanel({ title, href, children, empty }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 18px", borderBottom:"1px solid #f1f5f9" }}>
        <span style={{ fontSize:"14px", fontWeight:"700", color:"#0f172a" }}>{title}</span>
        <Link href={href} style={{ fontSize:"12px", color:"#16a34a", fontWeight:"600", textDecoration:"none", display:"flex", alignItems:"center", gap:"3px" }}>
          View all <ArrowRight size={12} />
        </Link>
      </div>
      {empty
        ? <div style={{ padding:"32px 20px", textAlign:"center", color:"#94a3b8", fontSize:"13px" }}>{empty}</div>
        : children
      }
    </div>
  );
}

/* ── Quick action button ─────────────────── */
function QuickBtn({ href, label, bg, icon: Icon }) {
  return (
    <Link href={href} style={{ textDecoration:"none", flex:"1 1 140px" }}>
      <button
        className="crm-quick-btn"
        style={{
          width:"100%", padding:"11px 16px",
          background: bg, color:"#fff",
          border:"none", borderRadius:"10px",
          fontSize:"13px", fontWeight:"700",
          cursor:"pointer", display:"flex",
          alignItems:"center", justifyContent:"center",
          gap:"7px", transition:"all .15s",
          whiteSpace:"nowrap",
        }}>
        {Icon && <Icon size={15} />}
        {label}
      </button>
    </Link>
  );
}

/* ══════════════════════════════════════════
   Main Dashboard Component
══════════════════════════════════════════ */
export default function CrmDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [user,    setUser]    = useState({ full_name: "there", role: "executive" });
  const [time,    setTime]    = useState(new Date());

  useEffect(() => {
    try { const u = JSON.parse(localStorage.getItem("crm_user") || "{}"); if (u.full_name) setUser(u); } catch {}
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const fetchStats = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setRefresh(true);
    try {
      const { data: d } = await CRM_API.get("/dashboard/stats");
      setData(d);
    } catch (e) {
      console.error("Dashboard stats:", e);
    } finally {
      setLoading(false);
      setTimeout(() => setRefresh(false), 600);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const c   = data?.counts  || {};
  const rev = data?.revenue || {};

  const timeStr = time.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:true });
  const dateStr = time.toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const firstName = user.full_name?.split(" ")[0] || "there";

  /* ── Stat cards config ── */
  const statCards = [
    { label:"Total Clients",       value: c.clients || 0,              icon: Users,          colorClass:"green",  href:"/crm/dashboard/clients" },
    { label:"Active Projects",     value: c.projects?.active || 0,     icon: Briefcase,      colorClass:"blue",   href:"/crm/dashboard/projects" },
    { label:"Total Billed",        value: fmtK(rev.total_billed),      icon: IndianRupee,    colorClass:"purple", href:"/crm/dashboard/invoices" },
    { label:"Revenue Received",    value: fmtK(rev.total_received),    icon: TrendingUp,     colorClass:"teal",   href:"/crm/dashboard/payments" },
    { label:"Outstanding",         value: fmtK(rev.outstanding),       icon: AlertCircle,    colorClass:"orange", href:"/crm/dashboard/invoices" },
    { label:"New Enquiries",       value: c.enquiries?.new || 0,       icon: MessageSquare,  colorClass:"indigo", href:"/crm/dashboard/enquiries" },
    { label:"Overdue Invoices",    value: c.invoices?.overdue || 0,    icon: AlertCircle,    colorClass:"red",    href:"/crm/dashboard/invoices" },
    { label:"Accepted Proposals",  value: c.proposals?.accepted || 0,  icon: CheckCircle,    colorClass:"green",  href:"/crm/dashboard/proposals" },
  ];

  if (loading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:"14px" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid #dcfce7", borderTopColor:"#22c55e", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
        <p style={{ color:"#64748b", fontSize:"14px", margin:0 }}>Loading dashboard…</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ animation:"fadeUp .25s ease", fontFamily:"'Inter',sans-serif" }}>

      {/* ══ Welcome Banner ══════════════════════════════ */}
      <div style={{
        background:"linear-gradient(135deg,#f0fdf4 0%,#dcfce7 60%,#bbf7d0 100%)",
        border:"1px solid #bbf7d0",
        borderRadius:"16px",
        padding:"clamp(16px,3vw,24px) clamp(16px,3vw,28px)",
        marginBottom:"24px",
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        flexWrap:"wrap",
        gap:"16px",
        position:"relative",
        overflow:"hidden",
      }}>
        {/* Background decoration */}
        <div style={{ position:"absolute", right:"-20px", top:"-20px", width:"140px", height:"140px", borderRadius:"50%", background:"rgba(34,197,94,.08)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", right:"60px", bottom:"-30px", width:"100px", height:"100px", borderRadius:"50%", background:"rgba(34,197,94,.05)", pointerEvents:"none" }} />

        <div style={{ position:"relative" }}>
          <span style={{
            display:"inline-block",
            fontSize:"10px", fontWeight:"800", letterSpacing:".08em", textTransform:"uppercase",
            background:"#22c55e", color:"#fff",
            padding:"3px 10px", borderRadius:"20px", marginBottom:"8px",
          }}>
            {user.role}
          </span>
          <h1 style={{ fontSize:"clamp(18px,3vw,24px)", fontWeight:"800", color:"#14532d", margin:"0 0 4px", lineHeight:1.2 }}>
            {greet()}, {firstName} 👋
          </h1>
          <p style={{ fontSize:"13px", color:"#166534", margin:0 }}>
            Here's what's happening at Subham General Store today.
          </p>
        </div>

        {/* Clock */}
        <div style={{ textAlign:"right", position:"relative" }}>
          <div style={{ fontSize:"clamp(20px,4vw,28px)", fontWeight:"800", color:"#14532d", fontVariantNumeric:"tabular-nums", lineHeight:1.1 }}>
            {timeStr}
          </div>
          <div style={{ fontSize:"12px", color:"#166534", marginTop:"3px" }}>{dateStr}</div>
        </div>
      </div>

      {/* ══ Stat Cards Grid ══════════════════════════════ */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",
        gap:"14px",
        marginBottom:"28px",
      }}>
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* ══ Revenue Summary Bar ══════════════════════════ */}
      {(rev.total_billed > 0 || rev.total_received > 0) && (
        <div style={{
          background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px",
          padding:"18px 22px", marginBottom:"24px",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px", flexWrap:"wrap", gap:"8px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <BarChart2 size={16} style={{ color:"#22c55e" }} />
              <span style={{ fontSize:"14px", fontWeight:"700", color:"#0f172a" }}>Revenue Overview</span>
            </div>
            <div style={{ display:"flex", gap:"16px", flexWrap:"wrap" }}>
              {[
                { label:"Total Billed",    val: fmt(rev.total_billed),    color:"#7c3aed" },
                { label:"Received",        val: fmt(rev.total_received),  color:"#22c55e" },
                { label:"Outstanding",     val: fmt(rev.outstanding),     color:"#ea580c" },
              ].map((item, i) => (
                <div key={i} style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"10px", color:"#94a3b8", fontWeight:"600", textTransform:"uppercase", letterSpacing:".05em" }}>{item.label}</div>
                  <div style={{ fontSize:"15px", fontWeight:"800", color: item.color }}>{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {rev.total_billed > 0 && (() => {
            const pct = Math.min(100, Math.round((rev.total_received / rev.total_billed) * 100));
            return (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                  <span style={{ fontSize:"11px", color:"#64748b" }}>Collection progress</span>
                  <span style={{ fontSize:"11px", fontWeight:"700", color:"#22c55e" }}>{pct}% collected</span>
                </div>
                <div style={{ background:"#f1f5f9", borderRadius:"8px", height:"8px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#22c55e,#16a34a)", borderRadius:"8px", transition:"width .5s ease" }} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ══ Recent Panels ════════════════════════════════ */}
      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",
        gap:"16px",
        marginBottom:"24px",
      }}>
        {/* Recent Clients */}
        <RecentPanel
          title="Recent Clients"
          href="/crm/dashboard/clients"
          empty={(data?.recent?.clients || []).length === 0 ? "No clients added yet" : null}>
          {(data?.recent?.clients || []).map((cl, i) => (
            <Link key={i} href={`/crm/dashboard/clients/${cl._id}`} style={{ textDecoration:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"11px 18px", borderBottom:"1px solid #f8fafc", transition:"background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width:"34px", height:"34px", borderRadius:"9px", background:"linear-gradient(135deg,#dcfce7,#bbf7d0)", color:"#16a34a", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"800", fontSize:"13px", flexShrink:0 }}>
                  {cl.full_name?.[0]?.toUpperCase() || "C"}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:"13px", fontWeight:"600", color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{cl.full_name}</div>
                  <div style={{ fontSize:"11px", color:"#94a3b8" }}>{cl.city || cl.company_name || "—"}</div>
                </div>
                <ArrowRight size={13} style={{ color:"#cbd5e1", flexShrink:0 }} />
              </div>
            </Link>
          ))}
        </RecentPanel>

        {/* Recent Invoices */}
        <RecentPanel
          title="Recent Invoices"
          href="/crm/dashboard/invoices"
          empty={(data?.recent?.invoices || []).length === 0 ? "No invoices created yet" : null}>
          {(data?.recent?.invoices || []).map((inv, i) => (
            <Link key={i} href={`/crm/dashboard/invoices/${inv._id}`} style={{ textDecoration:"none" }}>
              <div style={{ padding:"11px 18px", borderBottom:"1px solid #f8fafc", transition:"background .12s" }}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                  <span style={{ fontSize:"12px", fontWeight:"700", color:"#1e293b" }}>{inv.invoice_number}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:"11px", color:"#64748b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"150px" }}>{inv.client_name_snapshot}</span>
                  <span style={{ fontSize:"12px", fontWeight:"700", color:"#0f172a" }}>{fmt(inv.grand_total)}</span>
                </div>
              </div>
            </Link>
          ))}
        </RecentPanel>

        {/* Recent Enquiries */}
        <RecentPanel
          title="Recent Enquiries"
          href="/crm/dashboard/enquiries"
          empty={(data?.recent?.enquiries || []).length === 0 ? "No enquiries yet" : null}>
          {(data?.recent?.enquiries || []).map((enq, i) => (
            <div key={i} style={{ padding:"11px 18px", borderBottom:"1px solid #f8fafc" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                <span style={{ fontSize:"13px", fontWeight:"600", color:"#1e293b", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:"150px" }}>{enq.client_name}</span>
                <StatusBadge status={enq.status} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"11px", color:"#94a3b8" }}>{enq.mobile_number || "—"}</span>
                <span style={{ fontSize:"10px", color:"#b0bec5", display:"flex", alignItems:"center", gap:"3px" }}>
                  <Clock size={10} /> {fmtDate(enq.enquiry_date || enq.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </RecentPanel>
      </div>

      {/* ══ Quick Actions ════════════════════════════════ */}
      <div style={{
        background:"#fff", border:"1px solid #e2e8f0", borderRadius:"14px",
        padding:"16px 18px",
        marginBottom:"20px",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"14px" }}>
          <TrendingUp size={15} style={{ color:"#22c55e" }} />
          <span style={{ fontSize:"13px", fontWeight:"700", color:"#0f172a" }}>Quick Actions</span>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"10px" }}>
          <QuickBtn href="/crm/dashboard/clients"       label="+ New Client"    bg="linear-gradient(135deg,#22c55e,#16a34a)" icon={Users}        />
          <QuickBtn href="/crm/dashboard/enquiries/new" label="+ Log Enquiry"   bg="linear-gradient(135deg,#3b82f6,#2563eb)" icon={MessageSquare} />
          <QuickBtn href="/crm/dashboard/projects/new"  label="+ New Project"   bg="linear-gradient(135deg,#8b5cf6,#7c3aed)" icon={Briefcase}     />
          <QuickBtn href="/crm/dashboard/invoices/new"  label="+ New Invoice"   bg="linear-gradient(135deg,#f59e0b,#d97706)" icon={FileText}      />
          <QuickBtn href="/crm/dashboard/proposals/new" label="+ New Proposal"  bg="linear-gradient(135deg,#0891b2,#0e7490)" icon={Package}       />
        </div>
      </div>

      {/* ══ Refresh ══════════════════════════════════════ */}
      <div style={{ display:"flex", justifyContent:"flex-end", paddingBottom:"8px" }}>
        <button
          onClick={() => fetchStats(true)}
          disabled={refresh}
          style={{
            display:"flex", alignItems:"center", gap:"6px",
            padding:"7px 14px", background:"none",
            border:"1px solid #e2e8f0", borderRadius:"8px",
            fontSize:"12px", fontWeight:"600", color:"#64748b",
            cursor: refresh ? "not-allowed" : "pointer",
            transition:"all .15s",
          }}
          onMouseEnter={e => { if (!refresh) e.currentTarget.style.borderColor = "#22c55e"; }}
          onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
          <RefreshCw size={13} style={{ animation: refresh ? "spin .7s linear infinite" : "none" }} />
          {refresh ? "Refreshing…" : "Refresh data"}
        </button>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        @keyframes spin   { to { transform:rotate(360deg); } }
        .crm-stat-card-hover:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(0,0,0,.07); }
        .crm-quick-btn:hover       { opacity:.88; transform:translateY(-1px); }
        @media(max-width:640px){
          .crm-stat-card-hover { padding:14px 16px !important; }
        }
      `}</style>
    </div>
  );
}
