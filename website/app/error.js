"use client";
import Link from "next/link";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui,sans-serif", background: "#f9fafb" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🛒</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28, lineHeight: 1.7 }}>
            We ran into an unexpected error. Don't worry — your cart is safe.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={reset} style={{
              padding: "12px 28px", background: "#16a34a", color: "#fff",
              border: "none", borderRadius: 50, cursor: "pointer", fontWeight: 800, fontSize: 14,
            }}>
              Try Again
            </button>
            <Link href="/" style={{
              padding: "12px 28px", background: "#fff", color: "#374151",
              borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14,
              border: "1px solid #e5e7eb",
            }}>
              Go to Store
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
