"use client";
import Link from "next/link";

export default function ProductsError({ error, reset }) {
  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}></div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 10px" }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 24 }}>
        {error?.message || "Failed to load products. Please try again."}
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={reset} style={{
          padding: "10px 24px", background: "#16a34a", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 14,
        }}>
          Try Again
        </button>
        <Link href="/" style={{
          padding: "10px 24px", background: "#f3f4f6", color: "#374151",
          borderRadius: 8, textDecoration: "none", fontWeight: 700, fontSize: 14,
        }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
