import { notFound } from "next/navigation";
import StoreLayout from "@/components/store/layout/StoreLayout";
import JsonLd from "@/components/store/seo/JsonLd";
import { mediaUrl } from "@/utils/mediaUrl";
import BrandPageClient from "./_BrandPageClient";

const API      = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const BASE_URL = "https://www.subhamgeneralstore.com";

async function getBrand(slug) {
  try {
    const res = await fetch(`${API}/api/store/brands/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()).data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const brand = await getBrand(params.slug);
  if (!brand) return { title: "Brand not found" };
  const title = brand.metaTitle || `${brand.name} — Authorised Dealer | Subham General Store`;
  const description = brand.metaDesc || brand.description || `Buy ${brand.name} products online at Subham General Store.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/brands/${brand.slug}` },
    openGraph: { title, description, url: `${BASE_URL}/brands/${brand.slug}`, ...(brand.logo ? { images: [mediaUrl(brand.logo)] } : {}) },
  };
}

export default async function BrandPage({ params }) {
  const brand = await getBrand(params.slug);
  if (!brand) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    url: `${BASE_URL}/brands/${brand.slug}`,
    ...(brand.logo ? { logo: mediaUrl(brand.logo) } : {}),
    ...(brand.description ? { description: brand.description } : {}),
  };

  return (
    <StoreLayout>
      <JsonLd data={schema} />
      <BrandPageClient brand={brand} />
    </StoreLayout>
  );
}
