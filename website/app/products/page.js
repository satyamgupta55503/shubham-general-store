// NOTE: This page uses Suspense + useSearchParams, so the ProductsContent
// component must be a client component. The page export itself (and
// generateMetadata) run on the server — SSR delivers the shell + metadata.

import { Suspense }   from "react";
import StoreLayout    from "@/components/store/layout/StoreLayout";
import ProductsClient from "./_ProductsClient";
import JsonLd         from "@/components/store/seo/JsonLd";

const BASE_URL = "https://www.subhamgeneralstore.com";

export const metadata = {
  title:       "Shop Fresh Groceries Online",
  description: "Browse 500+ fresh groceries — vegetables, fruits, dairy, snacks and daily essentials at the best prices. Filter by category, price and more.",
  alternates:  { canonical: `${BASE_URL}/products` },
  openGraph: {
    title:       "Shop Fresh Groceries Online | Subham General Store",
    description: "Browse fresh vegetables, fruits, dairy and more at best prices.",
    url:         `${BASE_URL}/products`,
    type:        "website",
  },
};

const storeJsonLd = {
  "@context":    "https://schema.org",
  "@type":       "CollectionPage",
  name:          "Subham General Store — All Products",
  description:   "Shop fresh groceries online.",
  url:           `${BASE_URL}/products`,
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Products", item: `${BASE_URL}/products` },
    ],
  },
};

export default function ProductsPage() {
  return (
    <StoreLayout>
      <JsonLd data={storeJsonLd} />
      <Suspense fallback={<ProductsShell />}>
        <ProductsClient />
      </Suspense>
    </StoreLayout>
  );
}

// Static fallback rendered by server + shown while client hydrates
function ProductsShell() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 140 }} />
      </div>
      <div className="products-layout">
        <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {[80, 200, 130, 160].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 14 }} />
          ))}
        </div>
        <div className="product-grid" style={{ flex: 1 }}>
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
