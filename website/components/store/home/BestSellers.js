"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/store/ui/ProductCard";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function BestSellers({ initialData }) {
  const [products, setProducts] = useState([]);
  const title    = initialData?.headings?.bestSellersTitle    || "Best Sellers";
  const subtitle = initialData?.headings?.bestSellersSubtitle || "Customers love these products";

  useEffect(() => {
    axios.get(`${API}/api/store/products?isBestSeller=true&limit=8`)
      .then(r => setProducts(r.data.data || []))
      .catch(() => {});
  }, []);

  if (!products.length) return null;

  return (
    <section style={{ padding:"48px 20px", background:"#fff" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <span style={{ fontSize:12, fontWeight:700, color:"#ea580c", letterSpacing:".1em", textTransform:"uppercase" }}>
               Top Selling
            </span>
            <h2 style={{ fontSize:"clamp(22px,3vw,26px)", fontWeight:800, color:"#111827", margin:"4px 0 4px", letterSpacing:"-.02em" }}>
              {title}
            </h2>
            <p style={{ fontSize:14, color:"#6b7280", margin:0 }}>{subtitle}</p>
          </div>
          <Link href="/products?isBestSeller=true" style={{
            fontSize:13, fontWeight:700, color:"#16a34a", textDecoration:"none",
            padding:"8px 16px", borderRadius:8, border:"1px solid #bbf7d0",
            background:"#f0fdf4", whiteSpace:"nowrap",
          }}>
            View All →
          </Link>
        </div>
        <div className="product-grid">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
