// Server-rendered product detail page
// - generateMetadata fetches product at request time → proper title/og/canonical per product
// - JSON-LD Product schema for Google rich results (price, rating, availability)
// - Client component only for interactive parts (qty, cart, reviews)

import { notFound }           from "next/navigation";
import StoreLayout            from "@/components/store/layout/StoreLayout";
import JsonLd                 from "@/components/store/seo/JsonLd";
import BreadcrumbJsonLd       from "@/components/store/seo/BreadcrumbJsonLd";
import ProductDetailClient    from "./_ProductDetailClient";

const API      = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const BASE_URL = "https://www.subhamgeneralstore.com";

// ── Server-side data fetch ────────────────────────────────────────────────────
async function getProduct(slug) {
  try {
    const res = await fetch(`${API}/api/store/products/${slug}`, {
      next: { revalidate: 60 },   // ISR — revalidate every 60 s
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// ── generateMetadata ─────────────────────────────────────────────────────────
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product Not Found" };

  const price = product.salePrice ?? product.price;
  const image = product.thumbnail ? `${API}/${product.thumbnail}` : `${BASE_URL}/assets/imgs/store/og-image.png`;

  return {
    title:       product.name,
    description: product.shortDesc || product.description?.slice(0, 155) ||
                 `Buy ${product.name} online at Subham General Store. Fresh, quality products at best prices.`,
    alternates:  { canonical: `${BASE_URL}/products/${product.slug}` },
    openGraph: {
      title:       `${product.name} | Subham General Store`,
      description: product.shortDesc || `Buy fresh ${product.name} online`,
      url:         `${BASE_URL}/products/${product.slug}`,
      type:        "website",
      images:      [{ url: image, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       product.name,
      description: product.shortDesc || `Buy ${product.name} at Subham General Store`,
      images:      [image],
    },
  };
}

// ── Page component ───────────────────────────────────────────────────────────
export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const price  = product.salePrice ?? product.price;
  const image  = product.thumbnail ? `${API}/${product.thumbnail}` : null;

  // Product JSON-LD
  const productSchema = {
    "@context":    "https://schema.org",
    "@type":       "Product",
    name:          product.name,
    description:   product.description || product.shortDesc || "",
    sku:           product.sku || product._id,
    brand: {
      "@type": "Brand",
      name:    product.brand || "Subham General Store",
    },
    image:         image ? [image] : [],
    offers: {
      "@type":         "Offer",
      url:             `${BASE_URL}/products/${product.slug}`,
      priceCurrency:   "INR",
      price:           price,
      availability:    product.stockQty > 0
                         ? "https://schema.org/InStock"
                         : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name:    "Subham General Store",
      },
    },
    ...(product.numReviews > 0 ? {
      aggregateRating: {
        "@type":       "AggregateRating",
        ratingValue:   product.avgRating.toFixed(1),
        reviewCount:   product.numReviews,
        bestRating:    "5",
        worstRating:   "1",
      },
    } : {}),
  };

  const breadcrumbs = [
    { name: "Home",     href: "/" },
    ...(product.category ? [{ name: product.category.name, href: `/categories/${product.category.slug}` }] : []),
    { name: product.name, href: `/products/${product.slug}` },
  ];

  return (
    <StoreLayout>
      <JsonLd data={productSchema} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {/* Pass server-fetched product to the interactive client component */}
      <ProductDetailClient product={product} />
    </StoreLayout>
  );
}
