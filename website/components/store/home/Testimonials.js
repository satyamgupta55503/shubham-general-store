"use client";
import { useState } from "react";

const REVIEWS = [
  { name: "Priya Sharma", loc: "Raipur",   rating: 5, text: "The vegetables are always fresh and the delivery is super fast! I've been ordering every week for the past 3 months. Highly recommended!", product: "Fresh Vegetables Pack" },
  { name: "Rahul Verma",  loc: "Raipur",   rating: 5, text: "Prices are much better than local market and quality is excellent. The dairy products are fresh every morning. Love this store!",         product: "Dairy Combo Pack" },
  { name: "Sunita Gupta", loc: "Bilaspur", rating: 5, text: "I ordered fruits for a family function and everything was fresh and perfectly ripe. The packaging was also very good. Will order again.",       product: "Seasonal Fruits Basket" },
  { name: "Amit Patel",   loc: "Durg",     rating: 4, text: "Really convenient to order online. The site is easy to use and checkout is fast. Delivery arrived within 3 hours. Great experience overall.",    product: "Monthly Grocery Pack" },
];

const STATS = [
  { value: "1,000+", label: "Happy Customers" },
  { value: "4.8/5",  label: "Average Rating" },
  { value: "5,000+", label: "Orders Delivered" },
  { value: "99%",    label: "Fresh Guarantee" },
];

// Filled star SVG
function Star({ filled }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24"
      fill={filled ? "#f59e0b" : "none"} stroke={filled ? "#f59e0b" : "#d1d5db"} strokeWidth="2" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

export default function Testimonials() {
  const [active, setActive] = useState(0);

  return (
    <section style={{ padding: "60px 20px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: ".1em", textTransform: "uppercase" }}>
            Customer Reviews
          </span>
          <h2 style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, color: "#111827", margin: "8px 0 12px", letterSpacing: "-.03em" }}>
            What Our Customers Say
          </h2>
        </div>

        {/* Review cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
          {REVIEWS.map((r, i) => (
            <div key={i}
              onClick={() => setActive(i)}
              style={{
                background: "#fff", borderRadius: 20, padding: 24,
                boxShadow: i === active ? "0 12px 40px rgba(22,163,74,.15)" : "0 2px 12px rgba(0,0,0,.06)",
                border: i === active ? "2px solid #86efac" : "2px solid transparent",
                transition: "all .25s", cursor: "pointer",
              }}>
              {/* Stars */}
              <div style={{ display: "flex", gap: 2, marginBottom: 12 }}>
                {[1, 2, 3, 4, 5].map(s => <Star key={s} filled={s <= r.rating} />)}
              </div>

              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 16px", fontStyle: "italic" }}>
                "{r.text}"
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg,#16a34a,#15803d)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 16, fontWeight: 800, flexShrink: 0,
                }}>
                  {r.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.loc} · {r.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust numbers */}
        <div style={{ display: "flex", justifyContent: "center", gap: 40, marginTop: 48, flexWrap: "wrap" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(22px,4vw,28px)", fontWeight: 900, color: "#16a34a" }}>{s.value}</div>
              <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
