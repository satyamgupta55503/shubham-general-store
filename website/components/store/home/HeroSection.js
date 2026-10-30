"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Fallback slide if CMS has none yet
const FALLBACK_SLIDES = [{
  tag: "Fresh & Organic",
  title: "Farm Fresh\nVegetables\nDelivered Daily",
  description: "Straight from local farms to your kitchen. Fresh, healthy, and affordable groceries at your doorstep.",
  image: "",
  accent: "#16a34a",
  bgGradient: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)",
  cta1Label: "Shop Now",  cta1Link: "/products",
  cta2Label: "View Categories", cta2Link: "/categories",
  chips: ["Carrots", "Broccoli", "Tomatoes", "Leafy Greens"],
}];

const FALLBACK_STATS = [
  { value: "500+",  label: "Products" },
  { value: "1000+", label: "Customers" },
  { value: "Free",  label: "Delivery ₹499+" },
];

export default function HeroSection({ initialData }) {
  const [slides, setSlides] = useState(
    initialData?.heroSlides?.filter(s => s.isActive) || FALLBACK_SLIDES
  );
  const [stats,  setStats]  = useState(initialData?.heroStats || FALLBACK_STATS);
  const [active, setActive] = useState(0);
  const [query,  setQuery]  = useState("");
  const router = useRouter();

  // Fetch from CMS on mount if no SSR data provided
  useEffect(() => {
    if (initialData) return;
    axios.get(`${API}/api/store/homepage`)
      .then(r => {
        const active = (r.data.data?.heroSlides || []).filter(s => s.isActive);
        if (active.length) setSlides(active);
        if (r.data.data?.heroStats?.length) setStats(r.data.data.heroStats);
      })
      .catch(() => {});
  }, [initialData]);

  // Auto-advance slides every 6s
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setActive(a => (a + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides.length]);

  const slide = slides[active] || FALLBACK_SLIDES[0];

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section style={{ background: slide.bgGradient, transition: "background .5s ease", padding: "20px 20px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div className="hero-grid">

          {/* ── Left content ── */}
          <div>
            {slide.tag && (
              <span style={{
                display: "inline-block",
                background: "rgba(255,255,255,.75)", color: slide.accent,
                padding: "5px 14px", borderRadius: 50,
                fontSize: 12, fontWeight: 700, letterSpacing: ".04em",
                marginBottom: 20, textTransform: "uppercase",
                boxShadow: "0 2px 10px rgba(0,0,0,.07)",
                border: `1px solid ${slide.accent}30`,
              }}>
                {slide.tag}
              </span>
            )}

            <h1 style={{
              fontSize: "clamp(30px,5vw,56px)", fontWeight: 900,
              color: "#111827", lineHeight: 1.1, margin: "0 0 18px",
              letterSpacing: "-.03em", whiteSpace: "pre-line",
            }}>
              {slide.title}
            </h1>

            <p style={{ fontSize: "clamp(14px,2vw,16px)", color: "#4b5563", lineHeight: 1.75, margin: "0 0 26px", maxWidth: 460 }}>
              {slide.description}
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} style={{
              display: "flex", maxWidth: 460, marginBottom: 24,
              boxShadow: "0 4px 20px rgba(0,0,0,.10)", borderRadius: 8, overflow: "hidden",
            }}>
              <input
                type="search" placeholder="Search groceries..." value={query}
                onChange={e => setQuery(e.target.value)} aria-label="Search products"
                style={{ flex: 1, border: "none", outline: "none", padding: "13px 18px", fontSize: 14, background: "#fff", minWidth: 0 }}
              />
              <button type="submit" aria-label="Search" style={{
                border: "none", cursor: "pointer", padding: "0 20px",
                background: slide.accent, color: "#fff", fontWeight: 700, fontSize: 14,
                display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="hero-search-text">Search</span>
              </button>
            </form>

            {/* CTAs */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
              <Link href={slide.cta1Link} style={{
                padding: "12px 26px", borderRadius: 8, background: slide.accent, color: "#fff",
                textDecoration: "none", fontWeight: 700, fontSize: 14,
                boxShadow: `0 4px 16px ${slide.accent}44`,
              }}>
                {slide.cta1Label} →
              </Link>
              <Link href={slide.cta2Link} style={{
                padding: "12px 26px", borderRadius: 8, background: "rgba(255,255,255,.85)", color: slide.accent,
                textDecoration: "none", fontWeight: 700, fontSize: 14, border: `2px solid ${slide.accent}30`,
              }}>
                {slide.cta2Label}
              </Link>
            </div>

            {/* Chips */}
            {slide.chips?.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {slide.chips.map(item => (
                  <span key={item} style={{
                    background: "rgba(255,255,255,.75)", padding: "5px 13px",
                    borderRadius: 6, fontSize: 12, fontWeight: 600, color: "#374151",
                    border: "1px solid rgba(0,0,0,.07)",
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── Right visual ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
            {slide.image ? (
              /* CMS image */
              <div style={{
                width: "100%", maxWidth: 360, aspectRatio: "1 / 1", borderRadius: 20, overflow: "hidden",
                boxShadow: `0 20px 60px ${slide.accent}22`, border: "3px solid rgba(255,255,255,.6)",
              }}>
                <img src={`${API}/${slide.image}`} alt={slide.tag || "Hero"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              /* Text fallback box */
              <div style={{
                width: 260, height: 260, borderRadius: 20,
                background: "rgba(255,255,255,.5)", backdropFilter: "blur(10px)",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                boxShadow: `0 20px 60px ${slide.accent}22`, border: "2px solid rgba(255,255,255,.6)", gap: 12,
              }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: slide.accent, letterSpacing: ".04em", textTransform: "uppercase", textAlign: "center", padding: "0 20px" }}>
                  Subham General Store
                </div>
                <div style={{ width: 48, height: 3, background: slide.accent, borderRadius: 4 }} />
                <div style={{ fontSize: 13, color: "#4b5563", textAlign: "center", maxWidth: 180, lineHeight: 1.6 }}>
                  Fresh groceries delivered to your door every day
                </div>
              </div>
            )}

            {/* Stats */}
            {stats?.length > 0 && (
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center" }}>
                {stats.map((s, idx) => (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: slide.accent }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 20 }}>
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} aria-label={`Slide ${i + 1}`} style={{
                width: i === active ? 32 : 8, height: 8, borderRadius: 50, border: "none", cursor: "pointer",
                background: i === active ? slide.accent : "rgba(255,255,255,.7)", transition: "all .3s",
              }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
