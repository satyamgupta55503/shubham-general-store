"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/store/ui/ProductCard";

export default function WishlistPage() {
  const { customer, token } = useCustomerAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push("/account/login");
  }, [token, router]);

  const wishlist = customer?.wishlist || [];

  return (
    <StoreLayout>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"32px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:28 }}>
          <Link href="/account" style={{ color:"#6b7280", textDecoration:"none", fontSize:13 }}>← My Account</Link>
          <span style={{ color:"#d1d5db" }}>/</span>
          <h1 style={{ fontSize:24, fontWeight:900, color:"#111827", margin:0 }}>
             My Wishlist ({wishlist.length})
          </h1>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign:"center", padding:"80px 20px" }}>
            <div style={{ fontSize:60, marginBottom:16 }}></div>
            <h3 style={{ color:"#374151", fontSize:20 }}>Your wishlist is empty</h3>
            <p style={{ color:"#9ca3af", marginBottom:20 }}>Save products you love to buy them later</p>
            <Link href="/products" style={{
              display:"inline-block", padding:"10px 24px",
              background:"#16a34a", color:"#fff",
              borderRadius:8, textDecoration:"none", fontWeight:700,
            }}>
              Explore Products →
            </Link>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16 }}>
            {wishlist.map(product => (
              <ProductCard key={product._id || product} product={
                typeof product === "object" ? product : { _id:product, name:"Product", slug:"#", price:0 }
              } />
            ))}
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
