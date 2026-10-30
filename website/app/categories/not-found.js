import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";

export const metadata = { title: "Category Not Found" };

export default function CategoryNotFound() {
  return (
    <StoreLayout>
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}></div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
          Category Not Found
        </h1>
        <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28, lineHeight: 1.7 }}>
          This category doesn't exist. Browse our available categories below.
        </p>
        <Link href="/categories" style={{
          padding: "12px 28px", background: "#16a34a", color: "#fff",
          borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14,
        }}>
          All Categories →
        </Link>
      </div>
    </StoreLayout>
  );
}
