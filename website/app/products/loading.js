export default function ProductsLoading() {
  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton" style={{ height: 28, width: 200, marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 16, width: 140 }} />
      </div>
      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar */}
        <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {[80, 200, 120, 160].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: h, borderRadius: 14 }} />
          ))}
        </div>
        {/* Grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
          {Array(12).fill(0).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );
}
