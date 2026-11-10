"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import { optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Fallback slide if CMS has none yet
const FALLBACK_SLIDES = [{
  tag: "Fresh & Organic",
  title: "Farm Fresh\nVegetables\nDelivered Daily",
  description: "Straight from local farms to your kitchen. Fresh, healthy, and affordable groceries at your doorstep.",
  image: "",
  accent: "#16a34a",
  bgGradient: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 55%,#bbf7d0 100%)",
  cta1Label: "Shop Now",  cta1Link: "/products",
  cta2Label: "View Categories", cta2Link: "/categories",
  chips: ["Vegetables", "Fruits", "Dairy", "Staples"],
}];

const FALLBACK_STATS = [
  { value: "500+",  label: "Products" },
  { value: "1000+", label: "Customers" },
  { value: "Free",  label: "Delivery ₹499+" },
];

// Turn a chip label into a sensible search link
const chipHref = (label) => `/products?search=${encodeURIComponent(label)}`;

export default function HeroSection({ initialData }) {
  const [slides, setSlides] = useState(
    initialData?.heroSlides?.filter(s => s.isActive)?.length
      ? initialData.heroSlides.filter(s => s.isActive)
      : FALLBACK_SLIDES
  );
  const [stats,  setStats]  = useState(initialData?.heroStats?.length ? initialData.heroStats : FALLBACK_STATS);
  const [active, setActive] = useState(0);
  const [query,  setQuery]  = useState("");
  const router = useRouter();

  // Fetch from CMS on mount if no SSR data provided
  useEffect(() => {
    if (initialData) return;
    axios.get(`${API}/api/store/homepage`)
      .then(r => {
        const live = (r.data.data?.heroSlides || []).filter(s => s.isActive);
        if (live.length) setSlides(live);
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

  const slide  = slides[active] || FALLBACK_SLIDES[0];
  const accent = slide.accent || "#16a34a";

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="hx" style={{ background: slide.bgGradient || FALLBACK_SLIDES[0].bgGradient, "--hx-accent": accent }}>
      {/* Decorative leaves */}
      <Leaf className="hx-leaf hx-leaf-a" />
      <Leaf className="hx-leaf hx-leaf-b" />
      <Leaf className="hx-leaf hx-leaf-c" />
      <span className="hx-blob" aria-hidden="true" />

      <div className="hx-inner">
        <div className="hx-grid">

          {/* ── Left content ── */}
          <div className="hx-copy">
            {slide.tag && (
              <span className="hx-tag">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
                {slide.tag}
              </span>
            )}

            <h1 className="hx-title">{slide.title}</h1>

            {slide.description && <p className="hx-desc">{slide.description}</p>}

            {/* Search */}
            <form onSubmit={handleSearch} className="hx-search" role="search">
              <input
                type="search"
                placeholder="Search groceries..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search groceries"
              />
              <button type="submit" aria-label="Search">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="hx-search-text">Search</span>
              </button>
            </form>

            {/* CTAs */}
            <div className="hx-ctas">
              {slide.cta1Label && (
                <Link href={slide.cta1Link || "/products"} className="hx-btn hx-btn-primary">
                  {slide.cta1Label}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              )}
              {slide.cta2Label && (
                <Link href={slide.cta2Link || "/categories"} className="hx-btn hx-btn-ghost">
                  {slide.cta2Label}
                </Link>
              )}
            </div>

            {/* Chips → quick search */}
            {slide.chips?.length > 0 && (
              <div className="hx-chips">
                {slide.chips.map(item => (
                  <Link key={item} href={chipHref(item)} className="hx-chip">{item}</Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Right visual ── */}
          <div className="hx-visual">
            <div className="hx-frame">
              {slide.image ? (
                <img
                  src={optimizedImage(slide.image, 900)}
                  alt={slide.tag ? `${slide.tag} groceries` : "Fresh groceries"}
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <GroceryArt />
              )}
            </div>

            {/* Stats */}
            {stats?.length > 0 && (
              <div className="hx-stats">
                {stats.map((s, idx) => (
                  <div key={idx} className="hx-stat">
                    <div className="hx-stat-v">{s.value}</div>
                    <div className="hx-stat-l">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slide dots */}
        {slides.length > 1 && (
          <div className="hx-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === active}
                className={i === active ? "is-on" : ""}
              />
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: HERO_CSS }} />
    </section>
  );
}

// ── Decorative leaf ──
function Leaf({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M90 10C40 10 10 40 10 90c50 0 80-30 80-80z" fill="currentColor" />
      <path d="M85 15L18 82" stroke="rgba(255,255,255,.45)" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

// ── Built-in illustration shown until a hero image is uploaded in CMS ──
function GroceryArt() {
  return (
    <svg viewBox="0 0 400 360" className="hx-art" role="img" aria-label="Basket of fresh groceries">
      <defs>
        <linearGradient id="hxBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ecfdf5" /><stop offset="1" stopColor="#d1fae5" />
        </linearGradient>
        <linearGradient id="hxBag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d6a86a" /><stop offset="1" stopColor="#b9854a" />
        </linearGradient>
      </defs>
      <rect width="400" height="360" fill="url(#hxBg)" />
      {/* shelf lines */}
      <g opacity=".35" stroke="#86efac" strokeWidth="3">
        <line x1="0" y1="70" x2="400" y2="70" /><line x1="0" y1="130" x2="400" y2="130" />
      </g>
      {/* bottle */}
      <rect x="300" y="88" width="46" height="150" rx="14" fill="#facc15" />
      <rect x="312" y="66" width="22" height="26" rx="5" fill="#16a34a" />
      <rect x="300" y="140" width="46" height="44" fill="#fef9c3" opacity=".9" />
      {/* box */}
      <rect x="48" y="104" width="96" height="120" rx="8" fill="#2563eb" />
      <rect x="58" y="130" width="76" height="34" rx="5" fill="#fff" />
      <rect x="66" y="141" width="48" height="12" rx="3" fill="#2563eb" opacity=".8" />
      {/* bag */}
      <path d="M118 178h164l-16 150H134z" fill="url(#hxBag)" />
      <path d="M160 178c0-30 80-30 80 0" stroke="#8a5a2b" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* produce peeking out */}
      <circle cx="160" cy="176" r="24" fill="#ef4444" />
      <circle cx="166" cy="168" r="6" fill="#fff" opacity=".35" />
      <path d="M160 150c4-10 12-14 18-14-2 8-8 14-18 14z" fill="#16a34a" />
      <ellipse cx="208" cy="170" rx="30" ry="22" fill="#f59e0b" />
      <ellipse cx="248" cy="178" rx="22" ry="18" fill="#a16207" opacity=".85" />
      <path d="M232 150c10-20 30-22 40-18-8 14-24 22-40 18z" fill="#22c55e" />
      <path d="M244 146c14-6 26 0 30 8" stroke="#15803d" strokeWidth="4" fill="none" />
      {/* label on bag */}
      <rect x="170" y="240" width="60" height="34" rx="8" fill="#fff" opacity=".9" />
      <path d="M186 258l8 7 14-14" stroke="#16a34a" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* front onions/potatoes */}
      <ellipse cx="78" cy="300" rx="34" ry="26" fill="#c2410c" opacity=".85" />
      <ellipse cx="330" cy="300" rx="36" ry="24" fill="#d6a86a" />
      <ellipse cx="300" cy="312" rx="26" ry="18" fill="#c08a4f" />
      <rect x="0" y="330" width="400" height="30" fill="#bbf7d0" />
    </svg>
  );
}

const HERO_CSS = `
.hx{position:relative;overflow:hidden;padding:40px 20px 36px;transition:background .5s ease}
.hx-inner{position:relative;z-index:1;max-width:1240px;margin:0 auto}
.hx-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:48px;align-items:center}

/* decorations */
.hx-leaf{position:absolute;color:#4ade80;opacity:.28;pointer-events:none;z-index:0}
.hx-leaf-a{width:120px;top:-28px;right:4%;transform:rotate(18deg)}
.hx-leaf-b{width:90px;bottom:18%;right:-22px;transform:rotate(-30deg);opacity:.35}
.hx-leaf-c{width:150px;bottom:-60px;left:-50px;transform:rotate(200deg);opacity:.18}
.hx-blob{position:absolute;width:520px;height:520px;right:-140px;top:50%;transform:translateY(-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.6),transparent 65%);pointer-events:none;z-index:0}

/* copy */
.hx-tag{display:inline-flex;align-items:center;gap:8px;background:#fff;color:var(--hx-accent);padding:7px 15px;border-radius:50px;font-size:12.5px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;box-shadow:0 4px 14px rgba(22,101,52,.1);margin-bottom:18px}
.hx-title{font-size:clamp(34px,5.2vw,62px);font-weight:900;line-height:1.06;letter-spacing:-.035em;color:#0f2a1d;margin:0 0 18px;white-space:pre-line}
.hx-desc{font-size:clamp(15px,1.6vw,17px);line-height:1.7;color:#3f4b45;margin:0 0 26px;max-width:480px}

.hx-search{display:flex;max-width:480px;background:#fff;border-radius:14px;padding:5px;box-shadow:0 10px 30px rgba(15,42,29,.1);margin-bottom:20px}
.hx-search input{flex:1;min-width:0;border:none;outline:none;background:transparent;padding:12px 14px;font-size:15px;color:#0f172a;font-family:inherit}
.hx-search input::-webkit-search-cancel-button{display:none}
.hx-search button{display:flex;align-items:center;gap:8px;border:none;cursor:pointer;background:var(--hx-accent);color:#fff;font-weight:700;font-size:15px;padding:0 22px;border-radius:10px;white-space:nowrap;transition:filter .15s}
.hx-search button:hover{filter:brightness(1.07)}
.hx-search:focus-within{box-shadow:0 0 0 3px rgba(22,163,74,.25),0 10px 30px rgba(15,42,29,.1)}

.hx-ctas{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:20px}
.hx-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:13px 24px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;transition:transform .15s,box-shadow .15s,background .15s}
.hx-btn-primary{background:var(--hx-accent);color:#fff;box-shadow:0 10px 24px rgba(22,163,74,.3)}
.hx-btn-primary:hover{transform:translateY(-1px);box-shadow:0 14px 28px rgba(22,163,74,.38)}
.hx-btn-ghost{background:rgba(255,255,255,.9);color:var(--hx-accent);border:1.5px solid rgba(22,163,74,.35)}
.hx-btn-ghost:hover{background:#fff;border-color:var(--hx-accent)}

.hx-chips{display:flex;flex-wrap:wrap;gap:8px}
.hx-chip{background:#fff;color:#334155;font-size:13px;font-weight:600;padding:7px 15px;border-radius:50px;text-decoration:none;box-shadow:0 2px 8px rgba(15,42,29,.06);transition:color .15s,box-shadow .15s}
.hx-chip:hover{color:var(--hx-accent);box-shadow:0 4px 12px rgba(22,163,74,.18)}

/* visual */
.hx-visual{display:flex;flex-direction:column;align-items:center;gap:22px}
.hx-frame{width:100%;max-width:440px;aspect-ratio:1.15/1;border-radius:26px;overflow:hidden;background:#fff;border:7px solid #fff;box-shadow:0 24px 60px rgba(15,42,29,.16)}
.hx-frame img,.hx-art{width:100%;height:100%;object-fit:cover;display:block;border-radius:19px}

.hx-stats{display:flex;justify-content:center;width:100%;max-width:440px}
.hx-stat{flex:1;text-align:center;padding:2px 10px}
.hx-stat+.hx-stat{border-left:2px solid rgba(22,163,74,.25)}
.hx-stat-v{font-size:clamp(22px,2.6vw,30px);font-weight:900;color:var(--hx-accent);line-height:1.1;letter-spacing:-.02em}
.hx-stat-l{font-size:13.5px;color:#1f2937;font-weight:600;margin-top:4px}

.hx-dots{display:flex;justify-content:center;gap:8px;margin-top:26px}
.hx-dots button{width:9px;height:9px;border-radius:50px;border:none;cursor:pointer;padding:0;background:rgba(22,101,52,.25);transition:all .3s}
.hx-dots button.is-on{width:30px;background:var(--hx-accent)}

.hx a:focus-visible,.hx button:focus-visible{outline:2px solid #0f2a1d;outline-offset:2px}

/* ── Tablet ── */
@media (max-width:980px){
  .hx-grid{grid-template-columns:1fr 1fr;gap:28px}
  .hx-frame{max-width:380px}
}

/* ── Mobile: stack, image below copy ── */
@media (max-width:768px){
  .hx{padding:26px 16px 28px}
  .hx-grid{grid-template-columns:1fr;gap:26px}
  .hx-copy{text-align:left}
  .hx-title{margin-bottom:14px}
  .hx-desc{margin-bottom:20px}
  .hx-search,.hx-ctas{max-width:none}
  .hx-ctas .hx-btn{flex:1}
  .hx-visual{gap:18px}
  .hx-frame{max-width:420px;aspect-ratio:1.35/1;border-width:5px;border-radius:22px}
  .hx-blob{display:none}
  .hx-leaf-a{width:80px;right:-10px}
  .hx-leaf-b{display:none}
}

/* ── Small phones ── */
@media (max-width:400px){
  .hx-search-text{display:none}
  .hx-search button{padding:0 16px}
  .hx-btn{padding:12px 16px;font-size:14px}
  .hx-stat{padding:2px 6px}
  .hx-stat-l{font-size:12px}
}

@media (prefers-reduced-motion:reduce){
  .hx,.hx-btn,.hx-dots button{transition:none}
}
`;
