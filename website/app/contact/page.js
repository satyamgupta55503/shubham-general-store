import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import JsonLd from "@/components/store/seo/JsonLd";
import PageHero from "@/components/store/pages/PageHero";
import SpIcon from "@/components/store/pages/SpIcon";
import { getStoreSettings, telHref, whatsappHref } from "@/utils/storeSettings";
import { directionsHref } from "@/utils/digipin";
import ContactForm from "./_ContactForm";
import "@/styles/store-pages.css";

const BASE_URL = "https://www.subhamgeneralstore.com";

export const metadata = {
  title: "Contact Us | Subham General Store",
  description: "Call, WhatsApp, email or visit Subham General Store, or send us a message online.",
  alternates: { canonical: `${BASE_URL}/contact` },
};

const QUICK = [
  { href: "/account/orders",   label: "Track my order" },
  { href: "/account/register", label: "Open a wholesale account" },
  { href: "/return-policy",    label: "Return policy" },
  { href: "/brands",           label: "Browse brands" },
];

export default async function ContactPage() {
  const { contact: c, social } = await getStoreSettings();

  const items = [];
  if (c.phone)    items.push({ icon: "phone",    label: "Call us",    value: c.phone,   href: telHref(c.phone),   note: "Tap to call" });
  if (c.whatsapp) items.push({ icon: "whatsapp", label: "WhatsApp",   value: c.whatsapp, href: whatsappHref(c.whatsapp, "Hello Subham General Store"), note: "Chat with us", external: true });
  if (c.email)    items.push({ icon: "mail",     label: "Email",      value: c.email,   href: `mailto:${c.email}`, note: "We reply within a working day" });
  if (c.address)  items.push({ icon: "pin",      label: "Visit us",   value: c.address, note: c.city || "" });
  if (c.hours)    items.push({ icon: "clock",    label: "Store hours", value: c.hours });
  if (c.digipin)  items.push({ icon: "pin",      label: "Location code (DIGIPIN)", value: c.digipin, note: "Search this code in Mappls or any map app to find us" });

  const directions = c.digipin ? directionsHref(c.digipin) : "";
  const showMap = Boolean(c.mapUrl || c.mapLink || directions);

  const socials = [
    ["Instagram", social.instagram],
    ["Facebook", social.facebook],
    ["YouTube", social.youtube],
  ].filter(([, url]) => url);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Subham General Store",
    url: `${BASE_URL}/contact`,
    mainEntity: {
      "@type": "GroceryStore",
      name: "Subham General Store",
      url: BASE_URL,
      ...(c.phone ? { telephone: c.phone } : {}),
      ...(c.email ? { email: c.email } : {}),
      ...(c.address ? { address: { "@type": "PostalAddress", streetAddress: c.address, ...(c.city ? { addressLocality: c.city } : {}) } } : {}),
    },
  };

  return (
    <StoreLayout>
      <JsonLd data={schema} />
      <main className="sp">
        <div className="sp-wrap">
          <PageHero
            crumb="Contact"
            pill="Contact us"
            title="We would love to hear from you"
            text="Questions about an order, wholesale rates or becoming a customer? Reach out and we will help."
          />

          <section className="sp-sec" aria-label="Contact details and message form">
            <div className="sp-contact">
              <div>
                <div className="sp-sec-head">
                  <p className="sp-eyebrow">Get in touch</p>
                  <h2 className="sp-h2">Talk to the store</h2>
                </div>

                {items.length > 0 ? (
                  <div className="sp-info">
                    {items.map((it) => {
                      const body = (
                        <>
                          <span className="sp-ico"><SpIcon name={it.icon} size={20} /></span>
                          <span style={{ minWidth: 0 }}>
                            <small>{it.label}</small>
                            <b>{it.value}</b>
                            {it.note && <span>{it.note}</span>}
                          </span>
                        </>
                      );
                      return it.href ? (
                        <a key={it.label} href={it.href} className="sp-info-item" {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{body}</a>
                      ) : (
                        <div key={it.label} className="sp-info-item">{body}</div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="sp-empty" style={{ textAlign: "left" }}>
                    <h3>Use the form to reach us</h3>
                    <p style={{ margin: 0 }}>Our phone and address will appear here soon. Send us a message and we will get back to you.</p>
                  </div>
                )}

                {socials.length > 0 && (
                  <div className="sp-tags" style={{ marginTop: 16 }}>
                    {socials.map(([name, url]) => (
                      <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="sp-tag g" style={{ textDecoration: "none", padding: "7px 14px" }}>{name} ↗</a>
                    ))}
                  </div>
                )}
              </div>

              <ContactForm />
            </div>
          </section>

          {showMap && (
            <section className="sp-sec" aria-labelledby="map-h">
              <div className="sp-sec-head">
                <p className="sp-eyebrow">Find us</p>
                <h2 className="sp-h2" id="map-h">Visit the store</h2>
                {(c.address || c.city) && (
                  <p className="sp-lead">{[c.address, c.city].filter(Boolean).join(", ")}</p>
                )}
              </div>

              {c.mapUrl && (
                <div className="sp-map">
                  <iframe src={c.mapUrl} title="Subham General Store location map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                </div>
              )}

              <div className="sp-map-actions">
                {c.mapLink && (
                  <a href={c.mapLink} target="_blank" rel="noopener noreferrer" className="sp-btn sp-btn-primary">
                    <SpIcon name="pin" size={17} /> Open in Mappls
                  </a>
                )}
                {directions && (
                  <a href={directions} target="_blank" rel="noopener noreferrer" className="sp-btn sp-btn-outline">
                    Get directions <SpIcon name="arrow" size={16} stroke={2.5} />
                  </a>
                )}
              </div>
            </section>
          )}

          <section className="sp-sec" aria-labelledby="quick-h">
            <div className="sp-sec-head">
              <h2 className="sp-h2" id="quick-h">Quick help</h2>
            </div>
            <div className="sp-quick">
              {QUICK.map((q) => (
                <Link key={q.href} href={q.href}>{q.label} <SpIcon name="arrow" size={16} stroke={2.5} /></Link>
              ))}
            </div>
          </section>
          <div style={{ height: 56 }} />
        </div>
      </main>
    </StoreLayout>
  );
}
