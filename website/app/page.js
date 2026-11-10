import StoreLayout      from "@/components/store/layout/StoreLayout";
import HeroSection      from "@/components/store/home/HeroSection";
import CategoriesStrip  from "@/components/store/home/CategoriesStrip";
import BrandsStrip      from "@/components/store/home/BrandsStrip";
import FeaturedProducts from "@/components/store/home/FeaturedProducts";
import OfferBanners     from "@/components/store/home/OfferBanners";
import BestSellers      from "@/components/store/home/BestSellers";
import WhyChooseUs      from "@/components/store/home/WhyChooseUs";
import Testimonials     from "@/components/store/home/Testimonials";
import NewsletterBar    from "@/components/store/home/NewsletterBar";
import JsonLd           from "@/components/store/seo/JsonLd";
import { getStoreSettings } from "@/utils/storeSettings";

const API      = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const BASE_URL = "https://www.subhamgeneralstore.com";

// ── Fetch CMS homepage content server-side (ISR, revalidate 60s) ────────────
async function getHomepageData() {
  try {
    const res = await fetch(`${API}/api/store/homepage`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

// ── Structured data ─────────────────────────────────────────────────────────
// Built from the real store details saved in CMS → Store Info (nothing is hardcoded).
const buildOrganizationSchema = (contact = {}) => ({
  "@context":  "https://schema.org",
  "@type":     "GroceryStore",
  name:        "Subham General Store",
  description: "Groceries, daily essentials and trusted brands, with retail and wholesale rates.",
  url:         BASE_URL,
  ...(contact.phone ? { telephone: contact.phone } : {}),
  ...(contact.email ? { email: contact.email } : {}),
  ...((contact.address || contact.city) ? {
    address: {
      "@type": "PostalAddress",
      ...(contact.address ? { streetAddress: contact.address } : {}),
      ...(contact.city ? { addressLocality: contact.city } : {}),
      addressRegion:  "Chhattisgarh",
      addressCountry: "IN",
    },
  } : {}),
  ...(contact.hours ? { openingHours: contact.hours } : {}),
  areaServed: { "@type": "Country", name: "India" },   // serves customers everywhere, not one town
  priceRange: "₹",
});

const websiteSchema = {
  "@context": "https://schema.org",
  "@type":    "WebSite",
  name:       "Subham General Store",
  url:        BASE_URL,
  potentialAction: {
    "@type":       "SearchAction",
    target:        `${BASE_URL}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default async function HomePage() {
  const [cms, settings] = await Promise.all([getHomepageData(), getStoreSettings()]);
  const organizationSchema = buildOrganizationSchema(settings.contact);
  const sections = cms?.sections || {
    showCategories: true, showFeatured: true, showOffers: true,
    showBestSellers: true, showWhyChooseUs: true, showTestimonials: true, showNewsletter: true,
  };

  return (
    <StoreLayout promoBar={cms?.promoBar}>
      <JsonLd data={organizationSchema} />
      <JsonLd data={websiteSchema} />
      <main>
        <HeroSection initialData={cms} />
        {sections.showCategories  && <CategoriesStrip  initialData={cms} />}
        <BrandsStrip />   {/* authorised-dealer brands — hidden automatically if none */}
        {sections.showFeatured    && <FeaturedProducts initialData={cms} />}
        {sections.showOffers      && <OfferBanners     initialData={cms} />}
        {sections.showBestSellers && <BestSellers      initialData={cms} />}
        {sections.showWhyChooseUs && <WhyChooseUs />}
        {sections.showTestimonials&& <Testimonials />}
        {sections.showNewsletter  && <NewsletterBar    initialData={cms} />}
      </main>
    </StoreLayout>
  );
}
