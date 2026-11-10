"use client";
"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter }       from "next/navigation";
import { useCart }         from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import axios               from "axios";
import toast               from "react-hot-toast";

import { mediaUrl, optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProductCard({ product }) {
  const [adding,      setAdding]      = useState(false);
  const [wishlisted,  setWishlisted]  = useState(false);
  const { addToCart } = useCart();
  const { token }     = useCustomerAuth();
  const router        = useRouter();

  const discount = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    // Not logged in → send to login with a redirect back here
    if (!token) {
      toast.error("Please login to add items to cart");
      router.push(`/account/login?redirect=/products/${product.slug}`);
      return;
    }
    setAdding(true);
    await addToCart(product._id, 1);
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Please login to save wishlist"); return; }
    try {
      await axios.post(`${API}/api/store/customers/me/wishlist/${product._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlisted(!wishlisted);
      toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div style={{
      background:"#fff",
      borderRadius:16,
      overflow:"hidden",
      border:"1px solid #f3f4f6",
      transition:"all .2s",
      position:"relative",
    }}
      className="product-card"
    >
      {/* Badges */}
      <div style={{ position:"absolute", top:10, left:10, display:"flex", flexDirection:"column", gap:4, zIndex:2 }}>
        {discount > 0 && (
          <span style={{
            background:"#dc2626", color:"#fff",
            fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:20,
          }}>
            -{discount}%
          </span>
        )}
        {product.isNewArrival && (
          <span style={{
            background:"#2563eb", color:"#fff",
            fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:20,
          }}>
            NEW
          </span>
        )}
        {product.isOrganic && (
          <span style={{
            background:"#16a34a", color:"#fff",
            fontSize:11, fontWeight:800, padding:"2px 8px", borderRadius:20,
          }}>
            Organic
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button onClick={handleWishlist} aria-label="Add to wishlist" style={{
        position:"absolute", top:10, right:10, zIndex:2,
        width:32, height:32, borderRadius:"50%",
        border:"none", cursor:"pointer",
        background: wishlisted ? "#fef2f2" : "rgba(255,255,255,.9)",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 2px 8px rgba(0,0,0,.1)",
        transition:"all .2s",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#ef4444" : "none"} stroke={wishlisted ? "#ef4444" : "#9ca3af"} strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div style={{
          height:180, background:"#f9fafb",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden",
        }}>
          {product.thumbnail ? (
            <img
              src={optimizedImage(product.thumbnail, 400)}
              loading="lazy"
              alt={product.name}
              style={{ width:"100%", height:"100%", objectFit:"cover" }}
            />
          ) : (
            /* Clean placeholder — store icon, no emoji */
            <div style={{
              width:"100%", height:"100%",
              display:"flex", alignItems:"center", justifyContent:"center",
              background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding:"12px 14px 14px" }}>
        {/* Category */}
        {product.category && (
          <span style={{ fontSize:10, fontWeight:700, color:product.category.color || "#16a34a",
            textTransform:"uppercase", letterSpacing:".06em" }}>
            {product.category.name}
          </span>
        )}

        {/* Name */}
        <Link href={`/products/${product.slug}`} style={{ textDecoration:"none" }}>
          <h3 style={{
            fontSize:14, fontWeight:700, color:"#111827",
            margin:"4px 0 4px", lineHeight:1.3,
            display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
          }}>
            {product.name}
          </h3>
        </Link>

        {/* Pack size & unit */}
        {product.packSize && (
          <span style={{ fontSize:11, color:"#9ca3af" }}>{product.packSize}</span>
        )}

        {/* Rating */}
        {product.numReviews > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <span style={{ fontSize:11, fontWeight:600, color:"#374151" }}>{product.avgRating?.toFixed(1)}</span>
            <span style={{ fontSize:11, color:"#9ca3af" }}>({product.numReviews})</span>
          </div>
        )}

        {/* Price + Add */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:10 }}>
          <div>
            <span style={{ fontSize:18, fontWeight:900, color:"#111827" }}>
              ₹{product.salePrice ?? product.price}
            </span>
            {product.salePrice && (
              <span style={{ fontSize:12, color:"#9ca3af", textDecoration:"line-through", marginLeft:6 }}>
                ₹{product.price}
              </span>
            )}
          </div>

          {product.stockQty === 0 ? (
            <span style={{
              fontSize:11, color:"#ef4444", fontWeight:700,
              padding:"4px 10px", borderRadius:8,
              background:"#fef2f2",
            }}>
              Out of Stock
            </span>
          ) : (
            <button onClick={handleAdd} disabled={adding} style={{
              border:"none", cursor:adding ? "not-allowed" : "pointer",
              width:34, height:34, borderRadius:8,
              background: adding ? "#d1fae5" : "#16a34a",
              color:"#fff", display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all .2s", flexShrink:0,
            }}>
              {adding ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
