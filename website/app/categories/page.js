"use client";
import { useEffect, useState } from "react";
import axios        from "axios";
import Link         from "next/link";
import StoreLayout  from "@/components/store/layout/StoreLayout";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CategoriesPage() {
  const [cats, setCats]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/store/categories?parent=root`)
      .then(r => setCats(r.data.data || []))
      .catch(() => setCats([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <StoreLayout>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px", minHeight: "50vh" }}>
        {/* Page header */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: ".1em", textTransform: "uppercase" }}>
            Browse
          </span>
          <h1 style={{ fontSize: "clamp(26px,4vw,36px)", fontWeight: 900, color: "#111827", margin: "8px 0 12px", letterSpacing: "-.03em" }}>
            All Categories
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Explore our wide selection of fresh groceries and daily essentials
          </p>
        </div>

        {loading ? (
          <div className="category-grid">
            {Array(6).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 20 }} />)}
          </div>
        ) : cats.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 20, border: "2px dashed #d1fae5" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#374151", margin: "0 0 8px" }}>No categories yet</h3>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>Categories added from the CMS admin panel will appear here.</p>
          </div>
        ) : (
          <div className="category-grid">
            {cats.map(cat => (
              <Link key={cat._id} href={`/categories/${cat.slug}`} className="cat-page-card">
                <div style={{ width: 64, height: 64, borderRadius: 18, background: `${cat.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, overflow: "hidden" }}>
                  {cat.image ? (
                    <img src={`${API}/${cat.image}`} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 26, fontWeight: 800, color: cat.color }}>{cat.name.charAt(0)}</span>
                  )}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 6px" }}>
                  {cat.name}
                </h2>
                <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px", lineHeight: 1.5 }}>
                  {cat.description || "Quality products at best prices"}
                </p>
                <span className="cat-shop-now" aria-hidden="true">Shop Now →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
