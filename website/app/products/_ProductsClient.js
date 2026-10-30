"use client";
import { useState, useEffect } from "react";
import { useSearchParams }     from "next/navigation";
import axios                   from "axios";
import ProductCard             from "@/components/store/ui/ProductCard";
import Link                    from "next/link";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "price-asc",      label: "Price: Low to High" },
  { value: "price-desc",     label: "Price: High to Low" },
  { value: "avgRating-desc", label: "Top Rated" },
];

export default function ProductsClient() {
  const sp = useSearchParams();

  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [filters,    setFilters]    = useState({
    category:     sp.get("category")     || "",
    search:       sp.get("search")       || "",
    minPrice:     sp.get("minPrice")     || "",
    maxPrice:     sp.get("maxPrice")     || "",
    isFeatured:   sp.get("isFeatured")   || "",
    isBestSeller: sp.get("isBestSeller") || "",
    isNewArrival: sp.get("isNewArrival") || "",
    isOrganic:    sp.get("isOrganic")    || "",
    sort:  "createdAt",
    order: "desc",
    page:  1,
  });

  useEffect(() => {
    axios.get(`${API}/api/store/categories?parent=root`)
      .then(r => setCategories(r.data.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
    axios.get(`${API}/api/store/products?${params}&limit=20`)
      .then(r => { setProducts(r.data.data || []); setPagination(r.data.pagination); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [filters]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  const clearAll = () => setFilters({
    category: "", search: "", minPrice: "", maxPrice: "",
    isFeatured: "", isBestSeller: "", isNewArrival: "", isOrganic: "",
    sort: "createdAt", order: "desc", page: 1,
  });

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px" }}>
      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 4px" }}>
          {filters.search ? `Results for "${filters.search}"` : "All Products"}
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
          {pagination ? `${pagination.total} products found` : "Loading…"}
        </p>
      </div>

      <div className="products-layout">
        {/* ── Sidebar ── */}
        <aside className="products-sidebar" aria-label="Product filters">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Search */}
            <FilterBox title="Search">
              <input
                type="search" placeholder="Search products…"
                value={filters.search}
                onChange={e => setFilter("search", e.target.value)}
                style={inputStyle}
                aria-label="Search products"
              />
            </FilterBox>

            {/* Category */}
            <FilterBox title="Category">
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <RadioOption label="All Categories" checked={!filters.category} onChange={() => setFilter("category", "")} />
                {categories.map(c => (
                  <RadioOption
                    key={c._id}
                    label={`${c.icon || ""} ${c.name}`}
                    checked={filters.category === c._id}
                    onChange={() => setFilter("category", c._id)}
                  />
                ))}
              </div>
            </FilterBox>

            {/* Price */}
            <FilterBox title="Price Range">
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" placeholder="Min ₹" value={filters.minPrice}
                  onChange={e => setFilter("minPrice", e.target.value)}
                  style={{ ...inputStyle, width: "50%" }} aria-label="Minimum price" />
                <input type="number" placeholder="Max ₹" value={filters.maxPrice}
                  onChange={e => setFilter("maxPrice", e.target.value)}
                  style={{ ...inputStyle, width: "50%" }} aria-label="Maximum price" />
              </div>
            </FilterBox>

            {/* Flags */}
            <FilterBox title="Filter By">
              {[
                { key: "isFeatured",   label: " Featured"    },
                { key: "isBestSeller", label: " Best Sellers" },
                { key: "isNewArrival", label: "🆕 New Arrivals" },
                { key: "isOrganic",    label: " Organic"      },
              ].map(f => (
                <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={!!filters[f.key]}
                    onChange={e => setFilter(f.key, e.target.checked ? "true" : "")}
                    style={{ accentColor: "#16a34a", width: 15, height: 15 }}
                    aria-label={f.label}
                  />
                  <span style={{ fontSize: 13, color: "#374151" }}>{f.label}</span>
                </label>
              ))}
            </FilterBox>

            <button onClick={clearAll} style={{
              border: "1px solid #e5e7eb", background: "#fff",
              color: "#374151", borderRadius: 8, padding: "8px 12px",
              fontSize: 12, fontWeight: 700, cursor: "pointer", textAlign: "left",
            }}>
               Clear All Filters
            </button>
          </div>
        </aside>

        {/* ── Product grid ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
            <select
              value={`${filters.sort}-${filters.order}`}
              onChange={e => { const [s, o] = e.target.value.split("-"); setFilters(f => ({ ...f, sort: s, order: o, page: 1 })); }}
              style={{ ...inputStyle, width: "auto" }}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Active chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {filters.isFeatured   && <Chip label="Featured"    onRemove={() => setFilter("isFeatured",   "")} />}
              {filters.isBestSeller && <Chip label="Best Seller" onRemove={() => setFilter("isBestSeller", "")} />}
              {filters.isNewArrival && <Chip label="New Arrival" onRemove={() => setFilter("isNewArrival", "")} />}
              {filters.isOrganic    && <Chip label="Organic"     onRemove={() => setFilter("isOrganic",    "")} />}
              {filters.search       && <Chip label={`"${filters.search}"`} onRemove={() => setFilter("search", "")} />}
            </div>
          </div>

          {loading ? (
            <div className="product-grid">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "70px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}></div>
              <h3 style={{ fontSize: 18, color: "#374151", margin: "0 0 8px" }}>No products found</h3>
              <p style={{ color: "#9ca3af", marginBottom: 20 }}>Try adjusting your filters or search terms</p>
              <button onClick={clearAll} style={{
                padding: "10px 24px", background: "#16a34a", color: "#fff",
                border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700,
              }}>
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <nav aria-label="Product pagination" style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28, flexWrap: "wrap" }}>
              {Array(pagination.pages).fill(0).map((_, i) => (
                <button key={i} onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                  aria-label={`Page ${i + 1}`}
                  aria-current={filters.page === i + 1 ? "page" : undefined}
                  style={{
                    width: 36, height: 36, borderRadius: 8, fontWeight: 700, fontSize: 14,
                    border: filters.page === i + 1 ? "none" : "1px solid #e5e7eb",
                    background: filters.page === i + 1 ? "#16a34a" : "#fff",
                    color:      filters.page === i + 1 ? "#fff" : "#374151",
                    cursor: "pointer",
                  }}>
                  {i + 1}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterBox({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #f3f4f6" }}>
      <h2 style={{ fontSize: 11, fontWeight: 800, color: "#6b7280", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: ".06em" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function RadioOption({ label, checked, onChange }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
      fontSize: 13, color: checked ? "#16a34a" : "#374151",
      fontWeight: checked ? 700 : 400, padding: "3px 0",
    }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ accentColor: "#16a34a" }} />
      {label}
    </label>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: "#f0fdf4", color: "#16a34a",
      border: "1px solid #bbf7d0", fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 20,
    }}>
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} style={{
        border: "none", background: "none", cursor: "pointer",
        color: "#16a34a", fontSize: 14, padding: 0, lineHeight: 1,
      }}>×</button>
    </span>
  );
}

const inputStyle = {
  width: "100%", border: "1px solid #e5e7eb", borderRadius: 8,
  padding: "8px 12px", fontSize: 13, outline: "none", boxSizing: "border-box",
  background: "#fff",
};
