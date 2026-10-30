"use client";
import { useState, useEffect } from "react";
import Link                    from "next/link";
import axios                   from "axios";
import ProductCard             from "@/components/store/ui/ProductCard";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CategoryPageClient({ category }) {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [sort,       setSort]       = useState("createdAt-desc");
  const [page,       setPage]       = useState(1);

  useEffect(() => {
    setLoading(true);
    const [sortField, sortOrder] = sort.split("-");
    axios.get(`${API}/api/store/products?category=${category._id}&sort=${sortField}&order=${sortOrder}&page=${page}&limit=20`)
      .then(r => { setProducts(r.data.data || []); setPagination(r.data.pagination); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category._id, sort, page]);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px" }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: "flex", gap: 6, marginBottom: 24, fontSize: 13, color: "#6b7280", alignItems: "center", flexWrap: "wrap" }}>
        <Link href="/"           style={{ color: "#6b7280", textDecoration: "none" }}>Home</Link> /
        <Link href="/categories" style={{ color: "#6b7280", textDecoration: "none" }}>Categories</Link> /
        <span style={{ color: "#111827", fontWeight: 600 }} aria-current="page">{category.name}</span>
      </nav>

      {/* Category header */}
      <div style={{
        background:   `linear-gradient(135deg,${category.color || "#16a34a"}15,${category.color || "#16a34a"}05)`,
        borderRadius: 20, padding: "24px 28px", marginBottom: 28,
        border:       `2px solid ${category.color || "#16a34a"}25`,
        display:      "flex", alignItems: "center", gap: 18, flexWrap: "wrap",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18, flexShrink: 0,
          background: `${category.color || "#16a34a"}20`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
        }} aria-hidden>
          {category.icon || ""}
        </div>
        <div>
          <h1 style={{ fontSize: "clamp(20px,3vw,26px)", fontWeight: 900, color: "#111827", margin: "0 0 5px" }}>
            {category.name}
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            {category.description || `Shop fresh ${category.name.toLowerCase()}`}
            {pagination ? ` · ${pagination.total} products` : ""}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
        <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>
          {pagination ? `${pagination.total} products` : "Loading…"}
        </p>
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
          aria-label="Sort products"
          style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", fontSize: 13, outline: "none", background: "#fff" }}>
          <option value="createdAt-desc">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="avgRating-desc">Top Rated</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="product-grid">
          {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}></div>
          <h2 style={{ color: "#374151", fontSize: 18, margin: "0 0 8px" }}>No products in this category yet</h2>
          <Link href="/products" style={{ display: "inline-block", marginTop: 14, padding: "10px 24px", background: "#16a34a", color: "#fff", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>
            Browse All Products
          </Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <nav aria-label="Category product pages" style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 28, flexWrap: "wrap" }}>
          {Array(pagination.pages).fill(0).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              aria-current={page === i + 1 ? "page" : undefined}
              style={{
                width: 36, height: 36, borderRadius: 8, fontWeight: 700, cursor: "pointer",
                border:      page === i + 1 ? "none" : "1px solid #e5e7eb",
                background:  page === i + 1 ? "#16a34a" : "#fff",
                color:       page === i + 1 ? "#fff" : "#374151",
              }}>
              {i + 1}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
