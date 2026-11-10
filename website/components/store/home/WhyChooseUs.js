"use client";

/* Clean inline SVG icons — no emoji */
const Icons = {
  leaf: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  truck: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
      <path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
      <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
    </svg>
  ),
  tag: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  ),
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  phone: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
    </svg>
  ),
  users: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
};

const FEATURES = [
  { icon: Icons.leaf,   title: "Genuine Brands", desc: "Packaged products from trusted FMCG brands, sourced from authorised suppliers. Sealed packs, correct MRP.", color: "#16a34a", cls: "why-green"  },
  { icon: Icons.truck,  title: "Footkar & Thok",       desc: "Buy a single pack at retail rate or order in bulk at wholesale (thok) rates for your own shop.",                      color: "#2563eb", cls: "why-blue"   },
  { icon: Icons.tag,    title: "Best Prices",          desc: "Competitive rates on daily kirana items. Bigger quantity means better thok pricing.",                           color: "#ea580c", cls: "why-orange" },
  { icon: Icons.shield, title: "Quality Guaranteed",   desc: "Every item is checked before packing. If something is damaged or wrong, tell us and we will sort it out.",                      color: "#7c3aed", cls: "why-purple" },
  { icon: Icons.phone,  title: "Easy Ordering",        desc: "Order in seconds from your mobile or desktop. Track your order live with real-time updates.",                      color: "#0891b2", cls: "why-cyan"   },
  { icon: Icons.users,  title: "Local & Trusted",       desc: "Subham General Store is a local kirana and wholesale seller serving homes and shops in Chirmiri.",                              color: "#d97706", cls: "why-amber"  },
];

export default function WhyChooseUs() {
  return (
    <section style={{ padding: "60px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#16a34a", letterSpacing: ".1em", textTransform: "uppercase" }}>
            हमें क्यों चुनें  |  Why Subham Store
          </span>
          <h2 style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 900, color: "#111827", margin: "8px 0 12px", letterSpacing: "-.03em" }}>
            किराना का भरोसा, सही दाम के साथ
          </h2>
          <p style={{ fontSize: 15, color: "#6b7280", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Your local kirana and wholesale seller, now online. Order for your home or stock up for your shop.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
          {FEATURES.map(f => (
            <article key={f.title} className={`why-card ${f.cls}`}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${f.color}15`, color: f.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 8px", letterSpacing: "-.01em" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: 0, lineHeight: 1.7 }}>{f.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
