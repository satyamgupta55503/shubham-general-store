import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import PageHero from "@/components/store/pages/PageHero";
import SpIcon from "@/components/store/pages/SpIcon";
import { getStoreSettings } from "@/utils/storeSettings";
import CareersClient from "./_CareersClient";
import "@/styles/store-pages.css";

export const metadata = {
  title: "Careers | Subham General Store",
  description: "Join the Subham General Store team. See open roles and apply online.",
  alternates: { canonical: "https://www.subhamgeneralstore.com/careers" },
};

const CULTURE = [
  { icon: "heart",     title: "Customer first",   text: "Every order is someone's daily routine. We take care of it like our own." },
  { icon: "users",     title: "Work as a team",   text: "Packing, delivery, billing and the shop floor all depend on each other." },
  { icon: "briefcase", title: "Learn on the job", text: "Get hands-on with retail, wholesale, inventory and customer handling." },
  { icon: "shield",    title: "Honest work",      text: "Fair dealing with customers, brands and each other." },
];

export default async function CareersPage() {
  const { careers } = await getStoreSettings();
  const intro =
    careers.intro ||
    "We are a growing neighbourhood store serving families and shopkeepers. If you like working with people and take pride in good service, we would like to hear from you.";

  return (
    <StoreLayout>
      <main className="sp">
        <div className="sp-wrap">
          <PageHero crumb="Careers" pill="Careers" title="Grow with Subham General Store" text={intro}>
            <a href="#openings" className="sp-btn sp-btn-light">
              See open roles <SpIcon name="arrow" size={17} stroke={2.5} />
            </a>
            <Link href="/about" className="sp-btn sp-btn-ghost">About the store</Link>
          </PageHero>

          <section className="sp-sec" aria-labelledby="culture-h">
            <div className="sp-sec-head">
              <p className="sp-eyebrow">How we work</p>
              <h2 className="sp-h2" id="culture-h">What we care about</h2>
            </div>
            <div className="sp-grid">
              {CULTURE.map((c) => (
                <div key={c.title} className="sp-card">
                  <div className="sp-ico"><SpIcon name={c.icon} /></div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="sp-sec" id="openings" aria-label="Open positions and application form" style={{ scrollMarginTop: 110 }}>
            <CareersClient openings={careers.openings || []} />
          </section>

          <div style={{ height: 56 }} />
        </div>
      </main>
    </StoreLayout>
  );
}
