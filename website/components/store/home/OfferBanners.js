"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

import { optimizedImage } from "@/utils/mediaUrl";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const FALLBACK = [
  { tag: "थोक / Wholesale",   title: "दुकानदारों के लिए\nस्पेशल थोक रेट",  subtitle: "Bulk orders for shops at wholesale rates", link: "/contact",                     bgGradient: "linear-gradient(135deg,#16a34a,#15803d)", image: "" },
  { tag: "रोज़ की ज़रूरत",       title: "बिस्किट और नमकीन\nटॉप ब्रांड्स",      subtitle: "Biscuits & namkeen from top brands",       link: "/categories/biscuits-cookies", bgGradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", image: "" },
  { tag: "Home Care",          title: "साबुन, सर्फ और सफ़ाई\nघर का हर सामान", subtitle: "Soap, detergent & cleaning essentials",    link: "/categories/home-care",        bgGradient: "linear-gradient(135deg,#ea580c,#dc2626)", image: "" },
];

export default function OfferBanners({ initialData }) {
  const [offers,  setOffers]  = useState(
    initialData?.offerBanners?.filter(b => b.isActive) || FALLBACK
  );
  const [heading, setHeading] = useState(initialData?.headings?.offersTitle || "Today's Best Deals");

  useEffect(() => {
    if (initialData) return;
    axios.get(`${API}/api/store/homepage`)
      .then(r => {
        const active = (r.data.data?.offerBanners || []).filter(b => b.isActive);
        if (active.length) setOffers(active);
        if (r.data.data?.headings?.offersTitle) setHeading(r.data.data.headings.offersTitle);
      })
      .catch(() => {});
  }, [initialData]);

  if (!offers.length) return null;

  return (
    <section style={{ padding: "48px 20px", background: "#f9fafb" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#dc2626", letterSpacing: ".1em", textTransform: "uppercase" }}>
            Deals &amp; Offers
          </span>
          <h2 style={{ fontSize: "clamp(22px,3vw,26px)", fontWeight: 800, color: "#111827", margin: "4px 0 0", letterSpacing: "-.02em" }}>
            {heading}
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {offers.map((o, i) => (
            <Link key={o._id || i} href={o.link || "/products"} className="offer-card">
              <div className="offer-inner" style={{ background: o.bgGradient }}>
                {/* Background image (optional) */}
                {o.image && (
                  <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `url(${optimizedImage(o.image, 800)})`,
                    backgroundSize: "cover", backgroundPosition: "center",
                    opacity: .25, pointerEvents: "none",
                  }} />
                )}

                <div style={{ position: "relative" }}>
                  {o.tag && (
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 20,
                      background: "rgba(255,255,255,.2)", color: "#fff",
                      fontSize: 11, fontWeight: 700, letterSpacing: ".05em", marginBottom: 10,
                    }}>
                      {o.tag}
                    </span>
                  )}
                  <h3 style={{
                    fontSize: 22, fontWeight: 900, color: "#fff", margin: "0 0 6px",
                    lineHeight: 1.35, whiteSpace: "pre-line", textShadow: "0 1px 4px rgba(0,0,0,.2)",
                  }}>
                    {o.title}
                  </h3>
                  {o.subtitle && <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", margin: 0 }}>{o.subtitle}</p>}
                </div>

                <span className="offer-cta" style={{ position: "relative" }}>
                  Shop Now <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
