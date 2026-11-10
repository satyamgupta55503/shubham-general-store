import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";
import BrandLogo from "@/components/store/BrandLogo";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const metadata = {
  title: "Our Brands | Subham General Store",
  description: "Authorised dealer for Sunder Biscuits & Namkeen, Nirma, Hulchal and more. Shop by brand at Subham General Store.",
};

async function getBrands() {
  try {
    const res = await fetch(`${API}/api/store/brands`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <StoreLayout>
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "36px 20px 70px" }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: "#6b7280", marginBottom: 18 }}>
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>Home</Link> / <span style={{ color: "#111827", fontWeight: 600 }}>Brands</span>
        </nav>

        <header style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "clamp(26px,4vw,38px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-.02em", margin: "0 0 8px" }}>
            Shop by Brand
          </h1>
          <p style={{ fontSize: 15, color: "#64748b", margin: 0, maxWidth: 560 }}>
            We are an authorised dealer for these brands. Pick a brand to see its full range, grouped by product type.
          </p>
        </header>

        {brands.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#f9fafb", borderRadius: 18, border: "1px dashed #d1d5db", color: "#6b7280" }}>
            Brands are coming soon.
          </div>
        ) : (
          <div className="brands-grid">
            {brands.map((b) => (
              <Link key={b._id} href={`/brands/${b.slug}`} className="brand-card" style={{ "--bc": b.color || "#16a34a" }}>
                <div className="brand-card-top">
                  <BrandLogo brand={b} size={64} radius={16} />
                  {b.isDealer && <span className="brand-badge">{b.dealerType || "Authorised Dealer"}</span>}
                </div>
                <h2>{b.name}</h2>
                {b.tagline && <p className="brand-tag">{b.tagline}</p>}
                {b.productLines?.length > 0 && (
                  <div className="brand-lines">
                    {b.productLines.slice(0, 5).map((l) => <span key={l._id}>{l.name}</span>)}
                    {b.productLines.length > 5 && <span>+{b.productLines.length - 5} more</span>}
                  </div>
                )}
                <span className="brand-go">Shop {b.name.split(" ")[0]} &rarr;</span>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .brands-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:18px}
        .brand-card{display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid #eef0f2;border-radius:22px;padding:22px;text-decoration:none;position:relative;overflow:hidden;transition:transform .18s,box-shadow .18s,border-color .18s}
        .brand-card::before{content:"";position:absolute;inset:0 0 auto 0;height:5px;background:var(--bc)}
        .brand-card:hover{transform:translateY(-3px);border-color:var(--bc);box-shadow:0 14px 34px rgba(15,23,42,.1)}
        .brand-card:focus-visible{outline:2px solid var(--bc);outline-offset:2px}
        .brand-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px}
        .brand-badge{font-size:11px;font-weight:800;color:var(--bc);background:color-mix(in srgb,var(--bc) 12%,#fff);padding:5px 11px;border-radius:50px;text-align:center}
        .brand-card h2{font-size:20px;font-weight:900;color:#0f172a;margin:0;letter-spacing:-.01em}
        .brand-tag{font-size:13.5px;color:#64748b;margin:0}
        .brand-lines{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
        .brand-lines span{font-size:12px;font-weight:600;color:#475569;background:#f1f5f9;padding:4px 10px;border-radius:50px}
        .brand-go{margin-top:14px;font-size:14px;font-weight:800;color:var(--bc)}
        @media (max-width:420px){.brands-grid{grid-template-columns:1fr}}
        @media (prefers-reduced-motion:reduce){.brand-card{transition:none}}
      ` }} />
    </StoreLayout>
  );
}
