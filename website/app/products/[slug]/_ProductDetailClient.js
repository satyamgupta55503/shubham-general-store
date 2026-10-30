"use client";
import { useState, useEffect } from "react";
import { useRouter }           from "next/navigation";
import axios                   from "axios";
import Link                    from "next/link";
import ProductCard             from "@/components/store/ui/ProductCard";
import { useCart }             from "@/context/CartContext";
import { useCustomerAuth }     from "@/context/CustomerAuthContext";
import toast                   from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ProductDetailClient({ product: initial }) {
  const router              = useRouter();
  const { addToCart }       = useCart();
  const { token, customer } = useCustomerAuth();

  const [product,    setProduct]    = useState(initial);
  const [related,    setRelated]    = useState([]);
  const [selImg,     setSelImg]     = useState(0);
  const [qty,        setQty]        = useState(1);
  const [tab,        setTab]        = useState("desc");
  const [adding,     setAdding]     = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);

  // Fetch related products client-side (non-critical for SEO)
  useEffect(() => {
    if (product?.category?._id) {
      axios.get(`${API}/api/store/products?category=${product.category._id}&limit=6`)
        .then(r => setRelated(r.data.data?.filter(p => p.slug !== product.slug) || []))
        .catch(() => {});
    }
  }, [product]);

  const requireLogin = () => {
    toast.error("Please login to continue");
    router.push(`/account/login?redirect=/products/${product.slug}`);
  };

  const handleAddToCart = async () => {
    if (!token) return requireLogin();
    setAdding(true);
    await addToCart(product._id, qty);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (!token) return requireLogin();
    const ok = await addToCart(product._id, qty);
    if (ok) router.push("/cart");
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!token) { toast.error("Please login to review"); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/store/products/${product._id}/review`,
        reviewForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Review submitted — pending approval");
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Pricing tier based on logged-in customer ──
  const isWholesale = customer?.customerType === "wholesale" && customer?.isApproved && product.isWholesaleAvailable;

  const retailEffective    = product.salePrice ?? product.price;
  const wholesaleEffective = product.wholesaleSalePrice ?? product.wholesalePrice ?? retailEffective;

  const effectivePrice = isWholesale ? wholesaleEffective : retailEffective;
  const basePrice      = isWholesale ? (product.wholesalePrice ?? product.price) : product.price;
  const hasDiscount    = isWholesale ? (product.wholesaleSalePrice != null) : (product.salePrice != null);
  const discount       = hasDiscount && basePrice > effectivePrice
    ? Math.round(((basePrice - effectivePrice) / basePrice) * 100) : 0;

  const images          = product.images?.length ? product.images : [product.thumbnail].filter(Boolean);
  const approvedReviews = product.reviews?.filter(r => r.isApproved) || [];

  // Enforce MOQ default qty for wholesale
  useEffect(() => {
    if (isWholesale && product.moq > 1 && qty < product.moq) setQty(product.moq);
  }, [isWholesale, product.moq]); // eslint-disable-line

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px" }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 13, color: "#6b7280", flexWrap: "wrap" }}>
        <Link href="/"          style={bcLink}>Home</Link> <span aria-hidden>/</span>
        <Link href="/products"  style={bcLink}>Products</Link> <span aria-hidden>/</span>
        {product.category && <><Link href={`/categories/${product.category.slug}`} style={bcLink}>{product.category.name}</Link> <span aria-hidden>/</span></>}
        <span style={{ color: "#111827", fontWeight: 600 }} aria-current="page">{product.name}</span>
      </nav>

      {/* ── Main product grid ── */}
      <div className="detail-grid">

        {/* Images */}
        <div>
          <div className="product-image-main">
            {discount > 0 && (
              <span style={{ position: "absolute", top: 14, left: 14, background: "#dc2626", color: "#fff", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 20, zIndex: 2 }}>
                -{discount}% OFF
              </span>
            )}
            {images[selImg] ? (
              <img src={`${API}/${images[selImg]}`} alt={product.name}
                style={{ width: "100%", height: "100%", objectFit: "contain", padding: 20 }}
                loading="eager" fetchPriority="high"
              />
            ) : (
              <div style={{
                width: "100%", height: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
              }}>
                <svg width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelImg(i)} aria-label={`View image ${i + 1}`} style={{
                  width: 68, height: 68, borderRadius: 10, padding: 0, cursor: "pointer",
                  border: selImg === i ? "2px solid #16a34a" : "2px solid #e5e7eb",
                  overflow: "hidden", background: "#f9fafb",
                }}>
                  <img src={`${API}/${img}`} alt={`${product.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Badges */}
          <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
            {product.category && (
              <Link href={`/categories/${product.category.slug}`} style={{ fontSize: 11, fontWeight: 700, color: product.category.color || "#16a34a", background: `${product.category.color || "#16a34a"}15`, padding: "3px 10px", borderRadius: 20, textDecoration: "none" }}>
                {product.category.name}
              </Link>
            )}
            {product.isOrganic    && <Badge bg="#f0fdf4" color="#16a34a" text="Organic"     />}
            {product.isVeg        && <Badge bg="#f0fdf4" color="#16a34a" text="Veg"         />}
            {product.isBestSeller && <Badge bg="#fff7ed" color="#ea580c" text="Best Seller" />}
            {product.isNewArrival && <Badge bg="#eff6ff" color="#2563eb" text="New Arrival" />}
          </div>

          <h1 style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: "#111827", margin: "0 0 8px", letterSpacing: "-.02em", lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {product.brand && (
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>
              Brand: <strong style={{ color: "#374151" }}>{product.brand}</strong>
            </p>
          )}

          {/* Rating */}
          {product.numReviews > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 2 }} aria-label={`Rating: ${product.avgRating} out of 5`}>
                {[1,2,3,4,5].map(s => (
                  <svg key={s} width="16" height="16" viewBox="0 0 24 24" aria-hidden
                    fill={s <= Math.round(product.avgRating) ? "#f59e0b" : "none"}
                    stroke={s <= Math.round(product.avgRating) ? "#f59e0b" : "#d1d5db"} strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#374151" }}>{product.avgRating?.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: "#9ca3af" }}>({product.numReviews} reviews)</span>
            </div>
          )}

          {/* Wholesale price badge */}
          {isWholesale && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a", padding: "3px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              Wholesale Price (Thok)
            </div>
          )}

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: "clamp(28px,4vw,38px)", fontWeight: 900, color: "#111827" }}>₹{effectivePrice}</span>
            {hasDiscount && basePrice > effectivePrice && (
              <>
                <span style={{ fontSize: 18, color: "#9ca3af", textDecoration: "line-through" }}>₹{basePrice}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: "#16a34a" }}>Save ₹{basePrice - effectivePrice}</span>
              </>
            )}
            {isWholesale && <span style={{ fontSize: 13, color: "#6b7280" }}>/ {product.unit}</span>}
          </div>

          {/* Retail price reference for wholesale buyers */}
          {isWholesale && (
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 10px" }}>
              Retail price: ₹{retailEffective} &nbsp;·&nbsp; You save ₹{Math.max(0, retailEffective - effectivePrice)}/unit
            </p>
          )}

          {product.packSize && (
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 10px" }}>
              Pack: <strong>{product.packSize}</strong> &nbsp;·&nbsp; Unit: <strong>{product.unit}</strong>
              {isWholesale && product.moq > 1 && <> &nbsp;·&nbsp; Min order: <strong>{product.moq}</strong></>}
            </p>
          )}

          {/* Stock badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "4px 12px", borderRadius: 20, marginBottom: 16,
            background: product.stockQty > product.lowStockAt ? "#f0fdf4" : product.stockQty > 0 ? "#fff7ed" : "#fef2f2",
            border: `1px solid ${product.stockQty > product.lowStockAt ? "#bbf7d0" : product.stockQty > 0 ? "#fed7aa" : "#fecaca"}`,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: product.stockQty > 0 ? "#16a34a" : "#ef4444" }} aria-hidden />
            <span style={{ fontSize: 13, fontWeight: 700, color: product.stockQty > product.lowStockAt ? "#16a34a" : product.stockQty > 0 ? "#d97706" : "#dc2626" }}>
              {product.stockQty > product.lowStockAt ? `In Stock (${product.stockQty})`
                : product.stockQty > 0 ? `Only ${product.stockQty} left!`
                : "Out of Stock"}
            </span>
          </div>

          {product.shortDesc && (
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.75, margin: "0 0 18px" }}>{product.shortDesc}</p>
          )}

          {/* Qty + actions */}
          {product.stockQty > 0 && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", border: "2px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtn} aria-label="Decrease quantity">−</button>
                <span style={{ padding: "7px 16px", fontSize: 15, fontWeight: 700, minWidth: 40, textAlign: "center" }} aria-live="polite">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQty, q + 1))} style={qtyBtn} aria-label="Increase quantity">+</button>
              </div>
              <button onClick={handleAddToCart} disabled={adding} style={{
                flex: 1, minWidth: 130, padding: "11px 20px",
                background: adding ? "#d1fae5" : "#16a34a", color: "#fff",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800,
                cursor: adding ? "default" : "pointer",
                boxShadow: "0 4px 14px rgba(22,163,74,.35)", transition: "all .2s",
              }}>
                {adding ? "Added!" : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} style={{
                flex: 1, minWidth: 110, padding: "11px 20px",
                background: "#fff", color: "#111827",
                border: "2px solid #e5e7eb", borderRadius: 10,
                fontSize: 14, fontWeight: 800, cursor: "pointer",
              }}>
                Buy Now
              </button>
            </div>
          )}

          {/* Trust badges */}
          <div style={{ background: "#f9fafb", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
            {[
              "Free delivery above ₹499",
              "Easy 7-day returns",
              "100% genuine & fresh",
              "COD available",
            ].map(text => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" aria-hidden>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span style={{ fontSize: 13, color: "#374151" }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ marginBottom: 50 }}>
        <div role="tablist" style={{ display: "flex", gap: 0, borderBottom: "2px solid #e5e7eb", marginBottom: 22, overflowX: "auto" }}>
          {[
            { key: "desc",    label: "Description"                      },
            { key: "details", label: "Product Details"                  },
            { key: "reviews", label: `Reviews (${approvedReviews.length})` },
          ].map(t => (
            <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)} style={{
              border: "none", background: "none", cursor: "pointer",
              padding: "11px 18px", fontSize: 14, fontWeight: 700,
              color:       tab === t.key ? "#16a34a" : "#6b7280",
              borderBottom: tab === t.key ? "3px solid #16a34a" : "3px solid transparent",
              marginBottom: -2, transition: "all .18s", whiteSpace: "nowrap",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "desc" && (
          <div style={{ fontSize: 15, color: "#374151", lineHeight: 1.85, maxWidth: 680 }}>
            {product.description || "No description available."}
          </div>
        )}

        {tab === "details" && (
          <div style={{ maxWidth: 560, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <tbody>
                {[
                  { label: "SKU",         value: product.sku || "—"         },
                  { label: "Brand",       value: product.brand || "—"       },
                  { label: "Pack Size",   value: product.packSize || "—"    },
                  { label: "Unit",        value: product.unit || "—"        },
                  { label: "Weight",      value: product.weight ? `${product.weight}g` : "—" },
                  { label: "Category",   value: product.category?.name || "—" },
                  { label: "Veg/Non-Veg",value: product.isVeg ? " Vegetarian" : " Non-Vegetarian" },
                  { label: "Organic",    value: product.isOrganic ? " Yes" : "No" },
                ].map(row => (
                  <tr key={row.label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "9px 14px", fontSize: 13, color: "#6b7280", fontWeight: 600, width: 140, background: "#f9fafb", whiteSpace: "nowrap" }}>{row.label}</td>
                    <td style={{ padding: "9px 14px", fontSize: 13, color: "#111827" }}>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ maxWidth: 680 }}>
            {approvedReviews.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: 14 }}>No reviews yet. Be the first!</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                {approvedReviews.map((r, i) => (
                  <div key={i} style={{ background: "#f9fafb", borderRadius: 14, padding: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#15803d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>
                        {r.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{r.name}</div>
                        <div style={{ display: "flex", gap: 2 }} aria-label={`${r.rating} stars`}>
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} width="12" height="12" viewBox="0 0 24 24" aria-hidden
                              fill={s <= r.rating ? "#f59e0b" : "none"} stroke={s <= r.rating ? "#f59e0b" : "#d1d5db"} strokeWidth="2">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 14, color: "#374151", margin: 0, lineHeight: 1.65 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "2px solid #f3f4f6" }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 14px" }}>Write a Review</h3>
              {!token ? (
                <p style={{ fontSize: 14, color: "#6b7280" }}>
                  <Link href="/account/login" style={{ color: "#16a34a", fontWeight: 700 }}>Login</Link> to write a review.
                </p>
              ) : (
                <form onSubmit={handleReview}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={lbl}>Your Rating</label>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[1,2,3,4,5].map(s => (
                        <button key={s} type="button" onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                          aria-label={`${s} stars`}
                          style={{ border: "none", background: "none", cursor: "pointer", padding: 2, lineHeight: 0 }}>
                          <svg width="26" height="26" viewBox="0 0 24 24"
                            fill={s <= reviewForm.rating ? "#f59e0b" : "none"} stroke={s <= reviewForm.rating ? "#f59e0b" : "#d1d5db"} strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={lbl} htmlFor="review-comment">Comment</label>
                    <textarea id="review-comment"
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      rows={4} placeholder="Share your experience…"
                      style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 10, padding: "10px 14px", fontSize: 14, outline: "none", resize: "vertical", boxSizing: "border-box" }}
                    />
                  </div>
                  <button type="submit" disabled={submitting} style={{ padding: "10px 24px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section aria-label="Related products">
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 18px" }}>Related Products</h2>
          <div className="product-grid">
            {related.slice(0, 5).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

const bcLink = { color: "#6b7280", textDecoration: "none" };
const qtyBtn = { border: "none", background: "#f3f4f6", cursor: "pointer", padding: "7px 13px", fontSize: 17, fontWeight: 700, color: "#374151" };
const lbl    = { fontSize: 12, fontWeight: 700, color: "#374151", display: "block", marginBottom: 5 };

function Badge({ bg, color, text }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: bg, color }}>
      {text}
    </span>
  );
}
