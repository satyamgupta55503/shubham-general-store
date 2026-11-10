import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import JsonLd from "@/components/store/seo/JsonLd";
import BrandLogo from "@/components/store/BrandLogo";
import PageHero from "@/components/store/pages/PageHero";
import SpIcon from "@/components/store/pages/SpIcon";
import { getStoreSettings, getDealerBrands } from "@/utils/storeSettings";
import "@/styles/store-pages.css";

const BASE_URL = "https://www.subhamgeneralstore.com";

export const metadata = {
  title: "About Us | Subham General Store",
  description:
    "Subham General Store is a neighbourhood grocery and general store serving families and shopkeepers, and an authorised dealer of trusted brands.",
  alternates: { canonical: `${BASE_URL}/about` },
};

const VALUES = [
  { icon: "shield", title: "Genuine products", text: "We are an authorised dealer, so the packs you buy come straight from the brand's own supply chain." },
  { icon: "tag",    title: "Fair prices",       text: "Separate retail (footkar) and wholesale (thok) rates, so families and shopkeepers both pay what makes sense." },
  { icon: "book",   title: "Trusted khata",     text: "Regular customers can keep a credit ledger with us. Every jama and baaki entry is dated and visible to both sides." },
  { icon: "truck",  title: "Track your order",  text: "Place an order online and follow it from packed to delivered, with a note and time at every step." },
];

export default async function AboutPage() {
  const [settings, brands] = await Promise.all([getStoreSettings(), getDealerBrands()]);
  const { about, contact } = settings;
  const place = contact.city ? ` in ${contact.city}` : "";

  const defaultStory = [
    `Subham General Store is a neighbourhood general store${place}. We stock groceries, packaged foods and household essentials, and we serve both families (retail) and shopkeepers (wholesale).`,
    "We are an authorised dealer for brands such as Sunder Biscuits & Namkeen, Nirma and Hulchal, so you get genuine products at fair prices.",
    "Our online store lets you browse the full range, order from home and track your delivery. Regular customers can also keep a khata (credit ledger) with us, with every entry visible to both sides.",
  ];
  const story = about.story
    ? about.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : defaultStory;

  const headline = about.headline || "Your neighbourhood grocery store, now online";

  const schema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Subham General Store",
    url: `${BASE_URL}/about`,
    about: { "@type": "GroceryStore", name: "Subham General Store", url: BASE_URL },
  };

  return (
    <StoreLayout>
      <JsonLd data={schema} />
      <main className="sp">
        <div className="sp-wrap">
          <PageHero
            crumb="About us"
            pill="About us"
            title={headline}
            text="Daily essentials, trusted brands and fair prices, for families and shopkeepers alike."
          >
            <Link href="/products" className="sp-btn sp-btn-light">Shop now <SpIcon name="arrow" size={17} stroke={2.5} /></Link>
            <Link href="/contact" className="sp-btn sp-btn-ghost">Contact us</Link>
          </PageHero>

          {/* ── Our story ── */}
          <section className="sp-sec" aria-labelledby="story-h">
            <div className="sp-story">
              <div className="sp-story-text">
                <p className="sp-eyebrow">Our story</p>
                <h2 className="sp-h2" id="story-h">Who we are</h2>
                <div style={{ marginTop: 14 }}>
                  {story.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>

              <div className="sp-card" aria-label="What we offer">
                <h3 style={{ marginBottom: 14 }}>What you can expect</h3>
                <ul className="sp-checks">
                  {[
                    ["Retail and wholesale", "One store for home use and for shop restocking."],
                    ["Authorised dealer", "Genuine stock from the brands we deal in."],
                    ["Credit ledger (khata)", "Transparent jama and baaki for regular customers."],
                    ["Order tracking", "Know where your order is, any time."],
                  ].map(([t, d]) => (
                    <li key={t}>
                      <span className="sp-tick"><SpIcon name="check" size={14} stroke={3} /></span>
                      <span><b>{t}</b>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ── Optional stats set from the CMS ── */}
          {about.stats?.length > 0 && (
            <section className="sp-sec" aria-label="Store in numbers">
              <div className="sp-stats">
                {about.stats.map((s, i) => (
                  <div key={i} className="sp-stat"><b>{s.value}</b><span>{s.label}</span></div>
                ))}
              </div>
            </section>
          )}

          {/* ── Two ways to shop ── */}
          <section className="sp-sec" aria-labelledby="ways-h">
            <div className="sp-sec-head">
              <p className="sp-eyebrow">Shop your way</p>
              <h2 className="sp-h2" id="ways-h">Retail for families, wholesale for shops</h2>
            </div>
            <div className="sp-grid-2">
              <div className="sp-card sp-way">
                <div className="sp-ico"><SpIcon name="store" /></div>
                <h3>Retail (footkar)</h3>
                <p>Buy what your family needs, at the regular price, delivered to your door.</p>
                <ul><li>Browse by category or by brand</li><li>Free delivery on orders above ₹499</li><li>Save addresses and wishlist</li></ul>
                <Link href="/products" className="sp-btn sp-btn-primary">Start shopping</Link>
              </div>
              <div className="sp-card sp-way alt">
                <div className="sp-ico" style={{ background: "#eff6ff", color: "#2563eb" }}><SpIcon name="box" /></div>
                <h3>Wholesale (thok)</h3>
                <p>Running a shop? Get bulk (thok) rates on approved wholesale accounts.</p>
                <ul><li>Wholesale prices on eligible products</li><li>Optional khata with credit limit</li><li>Account is approved by our team</li></ul>
                <Link href="/account/register" className="sp-btn sp-btn-outline">Open a wholesale account</Link>
              </div>
            </div>
          </section>

          {/* ── Brands ── */}
          {brands.length > 0 && (
            <section className="sp-sec" aria-labelledby="brands-h">
              <div className="sp-sec-head">
                <p className="sp-eyebrow">Authorised dealer</p>
                <h2 className="sp-h2" id="brands-h">Brands we deal in</h2>
                <p className="sp-lead">Tap a brand to see its full range, grouped by product type.</p>
              </div>
              <div className="sp-brands">
                {brands.map((b) => (
                  <Link key={b._id} href={`/brands/${b.slug}`} className="sp-brand" style={{ "--bc": b.color || "#16a34a" }}>
                    <BrandLogo brand={b} size={46} radius={12} />
                    <span><strong>{b.name}</strong><small>{b.dealerType || "Authorised Dealer"}</small></span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Why us ── */}
          <section className="sp-sec" aria-labelledby="why-h">
            <div className="sp-sec-head">
              <p className="sp-eyebrow">Why shop with us</p>
              <h2 className="sp-h2" id="why-h">Simple, honest and reliable</h2>
            </div>
            <div className="sp-grid">
              {VALUES.map((v) => (
                <div key={v.title} className="sp-card">
                  <div className="sp-ico"><SpIcon name={v.icon} /></div>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ── */}
          <section className="sp-cta" aria-labelledby="cta-h">
            <h2 id="cta-h">Have a question or a bulk requirement?</h2>
            <p>Tell us what you need and our team will get back to you with the right rates.</p>
            <div className="sp-hero-cta">
              <Link href="/contact" className="sp-btn sp-btn-light">Contact us</Link>
              <Link href="/careers" className="sp-btn sp-btn-ghost">Work with us</Link>
            </div>
          </section>
          <div style={{ height: 56 }} />
        </div>
      </main>
    </StoreLayout>
  );
}
