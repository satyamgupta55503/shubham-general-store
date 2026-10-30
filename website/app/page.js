import StoreLayout      from "@/components/store/layout/StoreLayout";
import HeroSection      from "@/components/store/home/HeroSection";
import CategoriesStrip  from "@/components/store/home/CategoriesStrip";
import FeaturedProducts from "@/components/store/home/FeaturedProducts";
import OfferBanners     from "@/components/store/home/OfferBanners";
import BestSellers      from "@/components/store/home/BestSellers";
import WhyChooseUs      from "@/components/store/home/WhyChooseUs";
import Testimonials     from "@/components/store/home/Testimonials";
import NewsletterBar    from "@/components/store/home/NewsletterBar";
import JsonLd           from "@/components/store/seo/JsonLd";

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
const organizationSchema = {
  "@context":  "https://schema.org",
  "@type":     "GroceryStore",
  name:        "Subham General Store",
  description: "Fresh vegetables, fruits, dairy and daily essentials delivered to your door.",
  url:         BASE_URL,
  telephone:   "+91XXXXXXXXXX",
  address: {
    "@type":         "PostalAddress",
    streetAddress:   "Main Market",
    addressLocality: "Raipur",
    addressRegion:   "Chhattisgarh",
    postalCode:      "492001",
    addressCountry:  "IN",
  },
  openingHoursSpecification: {
    "@type":   "OpeningHoursSpecification",
    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    opens:     "08:00",
    closes:    "21:00",
  },
  priceRange: "₹",
};

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
  const cms = await getHomepageData();
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
