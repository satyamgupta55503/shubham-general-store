// Server-rendered category page with generateMetadata + JSON-LD

import { notFound }        from "next/navigation";
import StoreLayout         from "@/components/store/layout/StoreLayout";
import JsonLd              from "@/components/store/seo/JsonLd";
import BreadcrumbJsonLd    from "@/components/store/seo/BreadcrumbJsonLd";
import CategoryPageClient  from "./_CategoryPageClient";

const API      = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const BASE_URL = "https://www.subhamgeneralstore.com";

async function getCategory(slug) {
  try {
    const res = await fetch(`${API}/api/store/categories/${slug}`, { next: { revalidate: 120 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch { return null; }
}

export async function generateMetadata({ params }) {
  const cat = await getCategory(params.slug);
  if (!cat) return { title: "Category Not Found" };

  return {
    title:      `${cat.name} — Buy Fresh Online`,
    description: cat.description || `Shop fresh ${cat.name.toLowerCase()} online at Subham General Store. Best prices, fast delivery.`,
    alternates:  { canonical: `${BASE_URL}/categories/${cat.slug}` },
    openGraph: {
      title:       `${cat.name} | Subham General Store`,
      description: cat.description || `Fresh ${cat.name.toLowerCase()} delivered to your door`,
      url:         `${BASE_URL}/categories/${cat.slug}`,
      type:        "website",
    },
  };
}

export default async function CategoryPage({ params }) {
  const cat = await getCategory(params.slug);
  if (!cat) notFound();

  const categorySchema = {
    "@context": "https://schema.org",
    "@type":    "CollectionPage",
    name:       `${cat.name} — Subham General Store`,
    description: cat.description || `Buy fresh ${cat.name.toLowerCase()} online`,
    url:        `${BASE_URL}/categories/${cat.slug}`,
  };

  return (
    <StoreLayout>
      <JsonLd data={categorySchema} />
      <BreadcrumbJsonLd items={[
        { name: "Home",       href: "/"                        },
        { name: "Categories", href: "/categories"              },
        { name: cat.name,     href: `/categories/${cat.slug}`  },
      ]} />
      <CategoryPageClient category={cat} />
    </StoreLayout>
  );
}
