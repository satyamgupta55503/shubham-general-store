import Link from "next/link";

export const metadata = { title: "Page Not Found" };

export default function AccountNotFound() {
  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "80px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}></div>
      <h1 style={{ fontSize: 26, fontWeight: 900, color: "#111827", margin: "0 0 10px" }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 28 }}>
        The account page you're looking for doesn't exist.
      </p>
      <Link href="/account" style={{
        padding: "12px 28px", background: "#16a34a", color: "#fff",
        borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14,
      }}>
        My Account →
      </Link>
    </div>
  );
}
