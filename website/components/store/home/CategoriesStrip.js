"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import { optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function CategoriesStrip({ initialData }) {
  const [cats, setCats]       = useState([]);
  const [loaded, setLoaded]   = useState(false);
  const title    = initialData?.headings?.categoriesTitle    || "Shop by Category";
  const subtitle = initialData?.headings?.categoriesSubtitle || "Explore our wide range of fresh categories";

  useEffect(() => {
    axios.get(`${API}/api/store/categories?parent=root`)
      .then(r => setCats(r.data.data || []))
      .catch(() => setCats([]))
      .finally(() => setLoaded(true));
  }, []);

  // Don't render section until loaded; hide entirely if no categories in DB
  if (!loaded) return null;
  if (cats.length === 0) return null;

  return (
    <section style={{ padding: "48px 20px 32px", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: "clamp(22px,3vw,26px)", fontWeight: 800, color: "#111827", margin: "0 0 4px", letterSpacing: "-.02em" }}>
              {title}
            </h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>{subtitle}</p>
          </div>
          <Link href="/categories" style={{
            fontSize: 13, fontWeight: 700, color: "#16a34a", textDecoration: "none",
            padding: "8px 16px", borderRadius: 8, border: "1px solid #bbf7d0",
            background: "#f0fdf4", whiteSpace: "nowrap",
          }}>
            View All →
          </Link>
        </div>

        <div className="cat-strip-grid">
          {cats.map(cat => (
            <Link key={cat._id} href={`/categories/${cat.slug}`} className="cat-item">
              <div className="cat-card">
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `${cat.color}15`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden",
                }}>
                  {cat.image ? (
                    <img src={optimizedImage(cat.image, 160)} alt={cat.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 20, fontWeight: 800, color: cat.color }}>{cat.name.charAt(0)}</span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", textAlign: "center", lineHeight: 1.3 }}>
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
