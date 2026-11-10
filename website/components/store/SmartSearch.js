"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

import { optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * SmartSearch — Amazon-style live search with autocomplete dropdown.
 * - Debounced fetch (fast, cancels stale requests)
 * - Shows matching categories + products with image/price
 * - Keyboard nav (↑ ↓ Enter Esc)
 * - Click a product → product page; click a category → category page
 *
 * props:
 *  - variant: "desktop" | "mobile"
 *  - onNavigate(): optional callback after navigation (e.g. close mobile search)
 */
export default function SmartSearch({ variant = "desktop", onNavigate }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ products: [], categories: [], brands: [] });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1); // highlighted index for keyboard nav

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);

  // Flatten results into a single ordered list for keyboard nav
  const brandList = results.brands || [];
  const flat = [
    ...brandList.map((b) => ({ type: "brand", item: b })),
    ...results.categories.map((c) => ({ type: "category", item: c })),
    ...results.products.map((p) => ({ type: "product", item: p })),
  ];

  const fetchSuggest = useCallback((q) => {
    const id = ++reqIdRef.current;
    setLoading(true);
    axios
      .get(`${API}/api/store/products/suggest`, { params: { q } })
      .then((r) => {
        if (id !== reqIdRef.current) return; // stale response, ignore
        setResults(r.data.data || { products: [], categories: [], brands: [] });
        setOpen(true);
      })
      .catch(() => {
        if (id !== reqIdRef.current) return;
        setResults({ products: [], categories: [], brands: [] });
      })
      .finally(() => {
        if (id === reqIdRef.current) setLoading(false);
      });
  }, []);

  // Debounce the query
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 1) {
      setResults({ products: [], categories: [], brands: [] });
      setOpen(false);
      setLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggest(q), 180);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggest]);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const go = (url) => {
    setOpen(false);
    setQuery("");
    setActive(-1);
    router.push(url);
    onNavigate?.();
  };

  const goToResult = (entry) => {
    if (entry.type === "product") go(`/products/${entry.item.slug}`);
    else if (entry.type === "brand") go(`/brands/${entry.item.slug}`);
    else go(`/categories/${entry.item.slug}`);
  };

  const submitSearch = () => {
    const q = query.trim();
    if (q) go(`/products?search=${encodeURIComponent(q)}`);
  };

  const onKeyDown = (e) => {
    if (!open && e.key === "ArrowDown" && query.trim()) { setOpen(true); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && flat[active]) goToResult(flat[active]);
      else submitSearch();
    } else if (e.key === "Escape") { setOpen(false); setActive(-1); }
  };

  const highlight = (text) => {
    const q = query.trim();
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <strong style={{ color: "#16a34a" }}>{text.slice(i, i + q.length)}</strong>
        {text.slice(i + q.length)}
      </>
    );
  };

  const isMobile = variant === "mobile";

  return (
    <div ref={boxRef} style={{ position: "relative", flex: 1, maxWidth: isMobile ? "100%" : 480 }}>
      <form
        onSubmit={(e) => { e.preventDefault(); submitSearch(); }}
        role="search"
        aria-label="Search products"
        style={{
          display: "flex",
          background: "#f3f4f6",
          borderRadius: 50,
          overflow: "hidden",
          border: `2px solid ${open ? "#16a34a" : "transparent"}`,
          transition: "border .2s",
        }}
      >
        <input
          ref={inputRef}
          type="search"
          placeholder={isMobile ? "Search products…" : "Search biscuits, namkeen, soap, salt…"}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(-1); }}
          onFocus={() => { if (flat.length) setOpen(true); }}
          onKeyDown={onKeyDown}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-expanded={open}
          autoComplete="off"
          style={{
            flex: 1, border: "none", outline: "none",
            background: "transparent", padding: isMobile ? "10px 16px" : "9px 16px",
            fontSize: isMobile ? 14 : 13, color: "#111827",
          }}
        />
        <button type="submit" aria-label="Submit search" style={{
          border: "none", background: "#16a34a", color: "#fff",
          padding: "0 18px", cursor: "pointer",
          display: "flex", alignItems: "center",
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </form>

      {/* Suggestions dropdown */}
      {open && query.trim() && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "#fff",
            borderRadius: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,.14)",
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            zIndex: 500,
            maxHeight: 440,
            overflowY: "auto",
          }}
        >
          {loading && flat.length === 0 ? (
            <div style={{ padding: "16px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>Searching…</div>
          ) : flat.length === 0 ? (
            <div style={{ padding: "16px", fontSize: 13, color: "#9ca3af", textAlign: "center" }}>
              No matches for &quot;{query.trim()}&quot;
            </div>
          ) : (
            <>
              {/* Brands */}
              {brandList.length > 0 && (
                <div>
                  <div style={groupLabel}>Brands</div>
                  {brandList.map((b, idx) => (
                    <button
                      key={b._id}
                      type="button"
                      role="option"
                      aria-selected={active === idx}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => go(`/brands/${b.slug}`)}
                      style={rowStyle(active === idx)}
                    >
                      <span style={{
                        width: 30, height: 30, borderRadius: 8, flexShrink: 0, overflow: "hidden",
                        background: b.logo ? "#fff" : (b.color || "#16a34a"),
                        border: b.logo ? "1px solid #eef0f2" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 900, fontSize: 13,
                      }}>
                        {b.logo
                          ? <img src={optimizedImage(b.logo, 60)} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                          : b.name.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 600 }}>{highlight(b.name)}</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>Brand</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Categories */}
              {results.categories.length > 0 && (
                <div>
                  <div style={groupLabel}>Categories</div>
                  {results.categories.map((c, idx) => {
                    const i = brandList.length + idx;
                    return (
                      <button
                        key={c._id}
                        type="button"
                        role="option"
                        aria-selected={active === i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(`/categories/${c.slug}`)}
                        style={rowStyle(active === i)}
                      >
                        <span style={{
                          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                          background: (c.color || "#16a34a") + "22",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.color || "#16a34a"} strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                          </svg>
                        </span>
                        <span style={{ fontSize: 13.5, color: "#374151", fontWeight: 600 }}>{highlight(c.name)}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af" }}>Category</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Products */}
              {results.products.length > 0 && (
                <div>
                  <div style={groupLabel}>Products</div>
                  {results.products.map((p, idx) => {
                    const i = brandList.length + results.categories.length + idx;
                    return (
                      <button
                        key={p._id}
                        type="button"
                        role="option"
                        aria-selected={active === i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(`/products/${p.slug}`)}
                        style={rowStyle(active === i)}
                      >
                        <span style={{
                          width: 40, height: 40, borderRadius: 8, flexShrink: 0, overflow: "hidden",
                          background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {p.thumbnail ? (
                            <img src={optimizedImage(p.thumbnail, 80)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="1.5">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                          )}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ display: "block", fontSize: 13.5, color: "#111827", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {highlight(p.name)}
                          </span>
                          {p.category?.name && (
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>in {p.category.name}</span>
                          )}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#16a34a", flexShrink: 0 }}>
                          ₹{p.salePrice ?? p.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* See all results */}
              <button
                type="button"
                onClick={submitSearch}
                style={{
                  width: "100%", border: "none", borderTop: "1px solid #f3f4f6",
                  background: "#f9fafb", padding: "11px 14px", cursor: "pointer",
                  fontSize: 13, fontWeight: 700, color: "#16a34a", textAlign: "center",
                }}
              >
                See all results for &quot;{query.trim()}&quot; →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const groupLabel = {
  fontSize: 10, fontWeight: 800, color: "#9ca3af", textTransform: "uppercase",
  letterSpacing: ".06em", padding: "10px 14px 4px",
};

const rowStyle = (activeRow) => ({
  display: "flex", alignItems: "center", gap: 10, width: "100%",
  border: "none", background: activeRow ? "#f0fdf4" : "transparent",
  padding: "8px 14px", cursor: "pointer", textAlign: "left",
  transition: "background .12s",
});
