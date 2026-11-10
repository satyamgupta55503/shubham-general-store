import Link from "next/link";
import BrandLogo from "@/components/store/BrandLogo";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

async function getBrands() {
  try {
    const res = await fetch(`${API}/api/store/brands?dealer=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

/** "Authorised Dealer" strip on the homepage. Renders nothing if there are no brands. */
export default async function BrandsStrip() {
  const brands = await getBrands();
  if (!brands.length) return null;

  return (
    <section aria-labelledby="brands-heading" style={{ padding: "44px 20px 8px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
          <div>
            <h2 id="brands-heading" style={{ fontSize: "clamp(22px,3vw,30px)", fontWeight: 900, color: "#0f172a", margin: "0 0 4px", letterSpacing: "-.02em" }}>
              Brands we deal in
            </h2>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>Authorised dealer for these trusted brands</p>
          </div>
          <Link href="/brands" style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", textDecoration: "none", background: "#f0fdf4", padding: "8px 16px", borderRadius: 50, border: "1px solid #bbf7d0" }}>
            View all brands &rarr;
          </Link>
        </div>

        <div className="brand-strip">
          {brands.map((b) => (
            <Link key={b._id} href={`/brands/${b.slug}`} className="brand-chip" style={{ "--bc": b.color || "#16a34a" }}>
              <BrandLogo brand={b} size={54} />
              <span className="brand-chip-text">
                <strong>{b.name}</strong>
                <small>{b.isDealer ? b.dealerType || "Authorised Dealer" : b.tagline || "Shop now"}</small>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .brand-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}
        .brand-chip{display:flex;align-items:center;gap:14px;background:#fff;border:1px solid #eef0f2;border-radius:18px;padding:14px 16px;text-decoration:none;transition:transform .18s,box-shadow .18s,border-color .18s}
        .brand-chip:hover{transform:translateY(-2px);border-color:var(--bc);box-shadow:0 10px 26px rgba(15,23,42,.08)}
        .brand-chip:focus-visible{outline:2px solid var(--bc);outline-offset:2px}
        .brand-chip-text{min-width:0}
        .brand-chip-text strong{display:block;font-size:15px;font-weight:800;color:#0f172a;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .brand-chip-text small{display:block;font-size:12px;font-weight:600;color:var(--bc);margin-top:3px}
        @media (max-width:560px){.brand-strip{grid-template-columns:1fr}}
        @media (prefers-reduced-motion:reduce){.brand-chip{transition:none}}
      ` }} />
    </section>
  );
}
