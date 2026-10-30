"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "@/components/store/ui/ProductCard";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function FeaturedProducts({ initialData }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const title    = initialData?.headings?.featuredTitle    || "Featured Products";
  const subtitle = initialData?.headings?.featuredSubtitle || "Our most popular picks this week";

  useEffect(() => {
    axios.get(`${API}/api/store/products?isFeatured=true&limit=8`)
      .then(r => setProducts(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding:"48px 20px", background:"#f9fafb" }}>
      <div style={{ maxWidth:1280, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
          <div>
            <span style={{ fontSize:12, fontWeight:700, color:"#16a34a", letterSpacing:".1em", textTransform:"uppercase" }}>
               Hand-picked
            </span>
            <h2 style={{ fontSize:"clamp(22px,3vw,26px)", fontWeight:800, color:"#111827", margin:"4px 0 4px", letterSpacing:"-.02em" }}>
              {title}
            </h2>
            <p style={{ fontSize:14, color:"#6b7280", margin:0 }}>{subtitle}</p>
          </div>
          <Link href="/products?isFeatured=true" style={{
            fontSize:13, fontWeight:700, color:"#16a34a", textDecoration:"none",
            padding:"8px 16px", borderRadius:8, border:"1px solid #bbf7d0",
            background:"#f0fdf4",
          }}>
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="product-grid">
            {Array(8).fill(0).map((_,i) => (
              <div key={i} className="skeleton" style={{ height:280, borderRadius:16 }} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyProducts />
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyProducts() {
  return (
    <div style={{
      textAlign:"center", padding:"60px 20px",
      background:"#fff", borderRadius:20,
      border:"2px dashed #d1fae5",
    }}>
      <div style={{ fontSize:48, marginBottom:12 }}></div>
      <h3 style={{ fontSize:18, fontWeight:700, color:"#374151", margin:"0 0 8px" }}>No products yet</h3>
      <p style={{ fontSize:14, color:"#9ca3af", margin:"0 0 20px" }}>
        Add products via the CMS admin panel to display them here.
      </p>
      <Link href="/admin/login" style={{
        display:"inline-block", padding:"10px 24px",
        background:"#16a34a", color:"#fff", borderRadius:8,
        textDecoration:"none", fontSize:14, fontWeight:600,
      }}>
        Go to CMS
      </Link>
    </div>
  );
}
