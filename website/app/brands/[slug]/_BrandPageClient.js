"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import ProductCard from "@/components/store/ui/ProductCard";
import BrandLogo from "@/components/store/BrandLogo";
import { optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const SORTS = [
  { value: "createdAt-desc", label: "Newest first" },
  { value: "price-asc",      label: "Price: low to high" },
  { value: "price-desc",     label: "Price: high to low" },
  { value: "avgRating-desc", label: "Top rated" },
];

const FLAGS = [
  { key: "isBestSeller", label: "Best sellers" },
  { key: "isNewArrival", label: "New arrivals" },
  { key: "isFeatured",   label: "Featured" },
];

export default function BrandPageClient({ brand }) {
  const color = brand.color || "#16a34a";
  const lines = brand.productLines || [];

  const [line, setLine]       = useState("");
  const [sort, setSort]       = useState("createdAt-desc");
  const [minPrice, setMin]    = useState("");
  const [maxPrice, setMax]    = useState("");
  const [flags, setFlags]     = useState({});
  const [page, setPage]       = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read ?line= from the URL once (keeps links like /brands/sunder?line=namkeen working)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("line");
    if (q && lines.some((l) => l.slug === q)) setLine(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chooseLine = (slug) => {
    setLine(slug);
    setPage(1);
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("line", slug); else url.searchParams.delete("line");
    window.history.replaceState(null, "", url.toString());
  };

  const load = useCallback(() => {
    setLoading(true);
    const [s, o] = sort.split("-");
    const params = new URLSearchParams({ brand: brand._id, sort: s, order: o, page, limit: 24 });
    if (line) params.set("line", line);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    Object.entries(flags).forEach(([k, v]) => { if (v) params.set(k, "true"); });
    axios.get(`${API}/api/store/products?${params}`)
      .then((r) => { setProducts(r.data.data || []); setPagination(r.data.pagination); })
      .catch(() => { setProducts([]); setPagination(null); })
      .finally(() => setLoading(false));
  }, [brand._id, line, sort, minPrice, maxPrice, flags, page]);

  useEffect(() => { load(); }, [load]);

  const activeLine = useMemo(() => lines.find((l) => l.slug === line), [lines, line]);
  const hasFilters = !!(minPrice || maxPrice || Object.values(flags).some(Boolean));
  const clearFilters = () => { setMin(""); setMax(""); setFlags({}); setPage(1); };

  return (
    <div className="bp" style={{ "--bc": color }}>
      {/* ── Header ── */}
      <header className="bp-head" style={{ "--bc": color }}>
        {brand.banner && (
          <img className="bp-banner" src={optimizedImage(brand.banner, 1400)} alt="" aria-hidden="true" />
        )}
        <div className="bp-head-inner">
          <nav aria-label="Breadcrumb" className="bp-crumb">
            <Link href="/">Home</Link> / <Link href="/brands">Brands</Link> / <span>{brand.name}</span>
          </nav>
          <div className="bp-head-row">
            <BrandLogo brand={brand} size={84} radius={20} />
            <div className="bp-head-text">
              <h1>{brand.name}</h1>
              {brand.tagline && <p className="bp-tagline">{brand.tagline}</p>}
              <div className="bp-meta">
                {brand.isDealer && (
                  <span className="bp-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    {brand.dealerType || "Authorised Dealer"}{brand.dealerSince ? ` · since ${brand.dealerSince}` : ""}
                  </span>
                )}
                <span className="bp-count">{brand.totalProducts || 0} products</span>
              </div>
            </div>
          </div>
          {brand.description && <p className="bp-desc">{brand.description}</p>}
        </div>
      </header>

      {/* ── Mobile: product-type chips ── */}
      {lines.length > 0 && (
        <div className="bp-chips" role="tablist" aria-label="Product types">
          <button role="tab" aria-selected={!line} className={!line ? "on" : ""} onClick={() => chooseLine("")}>
            All <em>{brand.totalProducts || 0}</em>
          </button>
          {lines.map((l) => (
            <button key={l._id} role="tab" aria-selected={line === l.slug} className={line === l.slug ? "on" : ""} onClick={() => chooseLine(l.slug)}>
              {l.name} <em>{l.productCount}</em>
            </button>
          ))}
        </div>
      )}

      <div className="bp-body">
        {/* ── Sidebar filters ── */}
        <aside className="bp-side" aria-label={`${brand.name} filters`}>
          {lines.length > 0 && (
            <div className="bp-box bp-lines">
              <h2>{brand.name.split(" ")[0]} product types</h2>
              <button className={!line ? "on" : ""} onClick={() => chooseLine("")}>
                <span>All products</span><em>{brand.totalProducts || 0}</em>
              </button>
              {lines.map((l) => (
                <button key={l._id} className={line === l.slug ? "on" : ""} onClick={() => chooseLine(l.slug)}>
                  <span>{l.name}</span><em>{l.productCount}</em>
                </button>
              ))}
            </div>
          )}

          <button className="bp-filter-toggle" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen}>
            {filtersOpen ? "Hide filters" : "More filters"}{hasFilters ? " •" : ""}
          </button>

          <div className={`bp-more ${filtersOpen ? "open" : ""}`}>
            <div className="bp-box">
              <h2>Price (₹)</h2>
              <div className="bp-price">
                <input type="number" min="0" inputMode="numeric" placeholder="Min" value={minPrice}
                  onChange={(e) => { setMin(e.target.value); setPage(1); }} aria-label="Minimum price" />
                <span>–</span>
                <input type="number" min="0" inputMode="numeric" placeholder="Max" value={maxPrice}
                  onChange={(e) => { setMax(e.target.value); setPage(1); }} aria-label="Maximum price" />
              </div>
            </div>

            <div className="bp-box">
              <h2>Show only</h2>
              {FLAGS.map((f) => (
                <label key={f.key} className="bp-check">
                  <input type="checkbox" checked={!!flags[f.key]}
                    onChange={(e) => { setFlags((p) => ({ ...p, [f.key]: e.target.checked })); setPage(1); }} />
                  {f.label}
                </label>
              ))}
            </div>

            {hasFilters && <button className="bp-clear" onClick={clearFilters}>Clear filters</button>}
          </div>
        </aside>

        {/* ── Products ── */}
        <section className="bp-main" aria-live="polite">
          <div className="bp-toolbar">
            <div>
              <h2 className="bp-h2">{activeLine ? `${brand.name.split(" ")[0]} ${activeLine.name}` : `All ${brand.name} products`}</h2>
              <p className="bp-sub">{loading ? "Loading…" : `${pagination?.total ?? products.length} product${(pagination?.total ?? products.length) === 1 ? "" : "s"}`}</p>
              {activeLine?.description && <p className="bp-sub">{activeLine.description}</p>}
            </div>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} aria-label="Sort products">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bp-empty">
              <h3>{hasFilters || line ? "No products match these filters" : `${brand.name} products are coming soon`}</h3>
              <p>{hasFilters || line ? "Try a different product type or clear the filters." : "We are adding this range. Please check back shortly."}</p>
              {(hasFilters || line) && (
                <button onClick={() => { clearFilters(); chooseLine(""); }}>Show all {brand.name.split(" ")[0]} products</button>
              )}
            </div>
          ) : (
            <div className="product-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {pagination && pagination.pages > 1 && (
            <nav aria-label="Pagination" className="bp-pages">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} aria-current={page === i + 1 ? "page" : undefined} className={page === i + 1 ? "on" : ""}>
                  {i + 1}
                </button>
              ))}
            </nav>
          )}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bp{max-width:1280px;margin:0 auto;padding:20px 20px 70px}
        .bp-head{position:relative;overflow:hidden;border-radius:26px;margin-bottom:22px;color:#fff;background:linear-gradient(135deg,var(--bc),color-mix(in srgb,var(--bc) 55%,#0f172a))}
        .bp-banner{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.28}
        .bp-head::after{content:"";position:absolute;width:340px;height:340px;right:-90px;top:-120px;border-radius:50%;background:rgba(255,255,255,.1)}
        .bp-head-inner{position:relative;z-index:1;padding:26px 30px 28px}
        .bp-crumb{font-size:12.5px;color:rgba(255,255,255,.8);margin-bottom:18px}
        .bp-crumb a{color:rgba(255,255,255,.85);text-decoration:none}
        .bp-crumb a:hover{text-decoration:underline}
        .bp-crumb span{font-weight:700;color:#fff}
        .bp-head-row{display:flex;align-items:center;gap:18px}
        .bp-head h1{font-size:clamp(26px,4vw,38px);font-weight:900;letter-spacing:-.02em;margin:0;line-height:1.1}
        .bp-tagline{margin:5px 0 0;font-size:15px;color:rgba(255,255,255,.85)}
        .bp-meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin-top:12px}
        .bp-badge{display:inline-flex;align-items:center;gap:6px;background:#fff;color:var(--bc);font-size:12px;font-weight:800;padding:6px 13px;border-radius:50px}
        .bp-count{font-size:13px;font-weight:700;background:rgba(255,255,255,.18);padding:6px 13px;border-radius:50px}
        .bp-desc{margin:18px 0 0;max-width:680px;font-size:14.5px;line-height:1.7;color:rgba(255,255,255,.88)}

        .bp-chips{display:none;gap:8px;overflow-x:auto;padding:2px 2px 14px;margin:0 -2px;scrollbar-width:none}
        .bp-chips::-webkit-scrollbar{display:none}
        .bp-chips button{flex-shrink:0;border:1.5px solid #e5e7eb;background:#fff;color:#334155;font-size:13.5px;font-weight:700;padding:9px 15px;border-radius:50px;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
        .bp-chips button em,.bp-lines button em{font-style:normal;font-size:11.5px;font-weight:800;background:#f1f5f9;color:#64748b;padding:2px 8px;border-radius:50px}
        .bp-chips button.on{background:var(--bc,#16a34a);border-color:var(--bc,#16a34a);color:#fff}
        .bp-chips button.on em{background:rgba(255,255,255,.25);color:#fff}

        .bp-body{display:grid;grid-template-columns:260px 1fr;gap:26px;align-items:start}
        .bp-side{display:flex;flex-direction:column;gap:14px;position:sticky;top:104px}
        .bp-box{background:#fff;border:1px solid #eef0f2;border-radius:18px;padding:16px}
        .bp-box h2{font-size:11.5px;font-weight:800;color:#64748b;text-transform:uppercase;letter-spacing:.07em;margin:0 0 10px}
        .bp-lines button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;border:none;background:transparent;text-align:left;cursor:pointer;font-size:14px;font-weight:600;color:#334155;padding:9px 10px;border-radius:11px;transition:background .12s}
        .bp-lines button:hover{background:#f8fafc}
        .bp-lines button.on{background:color-mix(in srgb,var(--bc) 12%,#fff);color:var(--bc);font-weight:800}
        .bp-price{display:flex;align-items:center;gap:8px}
        .bp-price input{width:100%;min-width:0;border:1.5px solid #e5e7eb;border-radius:10px;padding:9px 11px;font-size:14px;outline:none;box-sizing:border-box}
        .bp-price input:focus{border-color:var(--bc)}
        .bp-check{display:flex;align-items:center;gap:9px;font-size:14px;color:#334155;padding:6px 0;cursor:pointer}
        .bp-check input{width:17px;height:17px;accent-color:var(--bc)}
        .bp-clear{border:1.5px solid #e5e7eb;background:#fff;color:#334155;border-radius:12px;padding:10px;font-size:13px;font-weight:700;cursor:pointer}
        .bp-filter-toggle{display:none;border:1.5px solid #e5e7eb;background:#fff;border-radius:12px;padding:11px;font-size:14px;font-weight:700;color:#334155;cursor:pointer}
        .bp-more{display:flex;flex-direction:column;gap:14px}

        .bp-main{min-width:0}
        .bp-toolbar{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:16px}
        .bp-h2{font-size:21px;font-weight:900;color:#0f172a;margin:0;letter-spacing:-.01em}
        .bp-sub{font-size:13px;color:#64748b;margin:3px 0 0}
        .bp-toolbar select{border:1.5px solid #e5e7eb;border-radius:11px;padding:9px 12px;font-size:14px;background:#fff;color:#334155;outline:none}
        .bp-empty{text-align:center;padding:56px 20px;background:#f9fafb;border:1px dashed #d1d5db;border-radius:20px}
        .bp-empty h3{font-size:18px;color:#1f2937;margin:0 0 6px}
        .bp-empty p{font-size:14px;color:#6b7280;margin:0 0 16px}
        .bp-empty button{border:none;background:#16a34a;color:#fff;font-weight:700;font-size:14px;padding:11px 22px;border-radius:50px;cursor:pointer}
        .bp-pages{display:flex;justify-content:center;gap:6px;margin-top:28px;flex-wrap:wrap}
        .bp-pages button{width:38px;height:38px;border-radius:10px;border:1px solid #e5e7eb;background:#fff;font-weight:700;color:#334155;cursor:pointer}
        .bp-pages button.on{background:#16a34a;border-color:#16a34a;color:#fff}

        .bp button:focus-visible,.bp a:focus-visible,.bp select:focus-visible{outline:2px solid #0f172a;outline-offset:2px}

        @media (max-width:900px){
          .bp-body{grid-template-columns:1fr}
          .bp-side{position:static}
          .bp-lines{display:none}
          .bp-chips{display:flex}
          .bp-filter-toggle{display:block}
          .bp-more{display:none}
          .bp-more.open{display:flex}
        }
        @media (max-width:560px){
          .bp{padding:14px 14px 56px}
          .bp-head{border-radius:20px}
          .bp-head-inner{padding:20px 18px 22px}
          .bp-head-row{gap:14px}
          .bp-head-row > div:first-child{transform:scale(.82);transform-origin:left center;margin-right:-10px}
        }
        @media (prefers-reduced-motion:reduce){.bp-lines button{transition:none}}
      ` }} />
    </div>
  );
}
