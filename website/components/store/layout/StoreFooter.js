"use client";
import Link from "next/link";
import useStoreSettings from "@/components/store/useStoreSettings";
import { telHref, whatsappHref } from "@/utils/storeSettings";

const COMPANY_LINKS = [
  { label: "About Us",   href: "/about"   },
  { label: "Our Brands", href: "/brands"  },
  { label: "Careers",    href: "/careers" },
  { label: "Contact Us", href: "/contact" },
];

const CATEGORIES = [
  { label: "Vegetables",   href: "/categories/vegetables"  },
  { label: "Fruits",       href: "/categories/fruits"      },
  { label: "Dairy & Eggs", href: "/categories/dairy-eggs"  },
  { label: "Snacks",       href: "/categories/snacks"      },
  { label: "Beverages",    href: "/categories/beverages"   },
  { label: "Staples",      href: "/categories/staples"     },
];

const HELP_LINKS = [
  { label: "My Account",         href: "/account"          },
  { label: "Track Order",        href: "/account/orders"   },
  { label: "Return Policy",      href: "/return-policy"    },
  { label: "Privacy Policy",     href: "/privacy-policy"   },
  { label: "Terms & Conditions", href: "/term-conditions"  },
];

const SOCIALS = [
  {
    label: "Facebook", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07"/></svg>,
  },
  {
    label: "Instagram", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
  },
  {
    label: "YouTube", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6z"/></svg>,
  },
  {
    label: "WhatsApp", href: "#",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.06 24l1.69-6.16a11.87 11.87 0 0 1-1.59-5.95C.16 5.33 5.5 0 12.05 0a11.82 11.82 0 0 1 8.41 3.49 11.82 11.82 0 0 1 3.48 8.42c0 6.55-5.33 11.89-11.89 11.89a11.9 11.9 0 0 1-5.68-1.45zm6.6-3.8c1.68.99 3 .99 3.4.99 5.45 0 9.89-4.43 9.89-9.88a9.84 9.84 0 0 0-2.9-7 9.82 9.82 0 0 0-6.99-2.9c-5.46 0-9.9 4.44-9.9 9.89 0 1.87.52 3.29 1.4 4.78l-.99 3.63zm11.38-5.46c-.07-.12-.26-.19-.54-.33s-1.77-.87-2.04-.97-.47-.15-.67.15-.77.96-.94 1.16-.35.22-.63.07a8.13 8.13 0 0 1-2.4-1.48 9.1 9.1 0 0 1-1.66-2.06c-.17-.3 0-.46.13-.6s.3-.35.44-.52a2 2 0 0 0 .3-.5.55.55 0 0 0-.03-.52c-.07-.15-.67-1.62-.92-2.22s-.49-.5-.67-.5h-.57a1.1 1.1 0 0 0-.8.37 3.35 3.35 0 0 0-1.04 2.5 5.82 5.82 0 0 0 1.22 3.08 13.3 13.3 0 0 0 5.1 4.51c.71.3 1.26.49 1.7.63.72.23 1.37.2 1.88.12.57-.08 1.77-.72 2.02-1.42s.25-1.3.17-1.42z"/></svg>,
  },
];

export default function StoreFooter() {
  const { contact, social } = useStoreSettings();

  // Only show contact lines the store has actually filled in (CMS → Store Info)
  const contactRows = [
    contact.address && { label: "Address:", text: [contact.address, contact.city].filter(Boolean).join(", ") },
    contact.phone   && { label: "Phone:",   text: contact.phone,  href: telHref(contact.phone) },
    contact.email   && { label: "Email:",   text: contact.email,  href: `mailto:${contact.email}` },
    contact.hours   && { label: "Hours:",   text: contact.hours },
  ].filter(Boolean);

  // Social buttons: real links when set, otherwise hidden
  const socials = SOCIALS
    .map((s) => ({
      ...s,
      href:
        s.label === "WhatsApp" ? (contact.whatsapp ? whatsappHref(contact.whatsapp) : "")
        : social[s.label.toLowerCase()] || "",
    }))
    .filter((s) => s.href);

  return (
    <footer style={{ background: "#052e16", color: "#fff", marginTop: 60 }} aria-label="Site footer">
      {/* Wave separator */}
      <div style={{ height: 56, overflow: "hidden", background: "#f9fafb" }} aria-hidden="true">
        <svg viewBox="0 0 1440 56" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <path d="M0,0 C480,56 960,56 1440,0 L1440,56 L0,56 Z" fill="#052e16"/>
        </svg>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 20px 20px" }}>
        {/* Main grid */}
        <div className="footer-cols" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 40,
          paddingBottom: 40,
          borderBottom: "1px solid rgba(255,255,255,.1)",
        }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg,#16a34a,#15803d)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 16px rgba(22,163,74,.4)", flexShrink: 0,
              }} aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Subham General Store</div>
                <div style={{ fontSize: 11, color: "#86efac", letterSpacing: ".05em", textTransform: "uppercase" }}>
                  Fresh • Natural • Local
                </div>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.55)", lineHeight: 1.7, margin: "0 0 20px" }}>
              Your trusted neighbourhood grocery store, now online. Fresh produce, daily essentials and more — delivered fast to your door.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["100% Fresh", "Fast Delivery", "Quality Assured"].map(b => (
                <span key={b} style={{
                  fontSize: 11, fontWeight: 600,
                  background: "rgba(22,163,74,.15)",
                  border: "1px solid rgba(22,163,74,.3)",
                  color: "#86efac", padding: "4px 10px", borderRadius: 20,
                }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Categories */}
          <nav aria-label="Shop categories">
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: "#86efac", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Shop by Category
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {CATEGORIES.map(c => (
                <li key={c.href}>
                  <Link href={c.href} className="footer-link">
                    <span aria-hidden="true" style={{ color: "#16a34a" }}>›</span> {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Help */}
          <nav aria-label="Help and support">
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: "#86efac", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Help &amp; Support
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {HELP_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    <span aria-hidden="true" style={{ color: "#16a34a" }}>›</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company">
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: "#86efac", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Company
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {COMPANY_LINKS.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="footer-link">
                    <span aria-hidden="true" style={{ color: "#16a34a" }}>›</span> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <address style={{ fontStyle: "normal" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: "#86efac", letterSpacing: ".06em", textTransform: "uppercase" }}>
              Contact Us
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {contactRows.map(c => (
                <div key={c.label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#86efac", flexShrink: 0 }}>{c.label}</span>
                  {c.href ? (
                    <a href={c.href} style={{ fontSize: 13, color: "rgba(255,255,255,.75)", lineHeight: 1.5, textDecoration: "none", wordBreak: "break-word" }}>{c.text}</a>
                  ) : (
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,.6)", lineHeight: 1.5 }}>{c.text}</span>
                  )}
                </div>
              ))}
              {contactRows.length === 0 && (
                <Link href="/contact" className="footer-link" style={{ fontSize: 13 }}>
                  <span aria-hidden="true" style={{ color: "#16a34a" }}>›</span> Send us a message
                </Link>
              )}
            </div>
            {socials.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 20 }} aria-label="Social media">
                {socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="footer-social-btn">
                    <span aria-hidden="true">{s.icon}</span>
                  </a>
                ))}
              </div>
            )}
          </address>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,.3)" }}>
            © 2026 Subham General Store. All rights reserved. | Powered by Subham Gupta
          </p>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms", href: "/term-conditions" },
              { label: "Returns", href: "/return-policy" },
            ].map(l => (
              <Link key={l.href} href={l.href} className="footer-bottom-link">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
