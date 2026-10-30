import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";

export const metadata = { title: "Product Not Found" };

export default function ProductNotFound() {
  return (
    <StoreLayout>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}></div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
          Product Not Found
        </h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28, lineHeight: 1.7 }}>
          The product you're looking for doesn't exist or has been removed.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/products" style={{
            padding: "12px 28px", background: "#16a34a", color: "#fff",
            borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14,
          }}>
            Browse All Products
          </Link>
          <Link href="/" style={{
            padding: "12px 28px", background: "#f3f4f6", color: "#374151",
            borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14,
          }}>
            Go Home
          </Link>
        </div>
      </div>
    </StoreLayout>
  );
}
