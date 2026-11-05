"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/store/ui/ProductCard";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * RelatedProducts — "You May Also Like" section (YouTube-style related items).
 * Fetches same-category + featured products for the given slug.
 */
export default function RelatedProducts({ slug }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    axios
      .get(`${API}/api/store/products/${slug}/related?limit=8`)
      .then((r) => { if (active) setProducts(r.data.data || []); })
      .catch(() => { if (active) setProducts([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  if (loading) {
    return (
      <section style={{ marginTop: 48 }}>
        <SectionTitle />
        <div className="related-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 300, borderRadius: 16, background: "#f3f4f6", animation: "pulse 1.2s ease-in-out infinite" }} />
          ))}
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
          .related-grid{ display:grid; gap:16px; grid-template-columns:repeat(4,1fr); }
          @media (max-width:980px){ .related-grid{ grid-template-columns:repeat(3,1fr); } }
          @media (max-width:680px){ .related-grid{ grid-template-columns:repeat(2,1fr); } }
        ` }} />
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section style={{ marginTop: 48 }} aria-label="Related products">
      <SectionTitle />
      <div className="related-grid">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .related-grid{ display:grid; gap:16px; grid-template-columns:repeat(4,1fr); }
        @media (max-width:980px){ .related-grid{ grid-template-columns:repeat(3,1fr); } }
        @media (max-width:680px){ .related-grid{ grid-template-columns:repeat(2,1fr); } }
      ` }} />
    </section>
  );
}

function SectionTitle() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ width: 4, height: 22, borderRadius: 4, background: "#16a34a", display: "inline-block" }} />
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", margin: 0 }}>You May Also Like</h2>
    </div>
  );
}
