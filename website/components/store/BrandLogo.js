import { optimizedImage } from "@/utils/mediaUrl";

/**
 * BrandLogo — shows the brand logo, or a coloured initial tile when no logo
 * has been uploaded yet. Used on brand cards, the brand page and search.
 */
export default function BrandLogo({ brand, size = 56, radius = 14 }) {
  const color = brand?.color || "#16a34a";
  const box = {
    width: size, height: size, borderRadius: radius, flexShrink: 0, overflow: "hidden",
    display: "flex", alignItems: "center", justifyContent: "center",
  };

  if (brand?.logo) {
    return (
      <div style={{ ...box, background: "#fff", border: "1px solid #eef0f2", padding: 6, boxSizing: "border-box" }}>
        <img
          src={optimizedImage(brand.logo, size * 2)}
          alt={`${brand.name} logo`}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      style={{
        ...box,
        background: `linear-gradient(135deg, ${color}, ${color}cc)`,
        color: "#fff", fontWeight: 900, fontSize: Math.round(size * 0.42),
        boxShadow: `0 6px 16px ${color}40`,
      }}
    >
      {(brand?.name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
