import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";

export const metadata = {
  title: "Privacy Policy | Subham General Store",
  description:
    "How Subham General Store collects, uses, and protects your personal information when you shop with us.",
};

const SECTIONS = [
  {
    n: "01",
    title: "Information We Collect",
    body: "We collect the details you share when you register, place an order, or contact us — your name, phone number, email, delivery address, and order history. We also store basic account preferences so your next visit is faster. We never ask for more than we need to serve you.",
  },
  {
    n: "02",
    title: "How We Use Your Information",
    body: "Your information is used to process and deliver your grocery orders, keep your ledger (khata) up to date, send order updates, handle returns, and improve our product range. Wholesale and retail customers are served based on the account type you select at registration.",
  },
  {
    n: "03",
    title: "Payments & Ledger",
    body: "For credit (udhaar) customers, we maintain a transparent ledger showing jama (credit) and baaki (due) with date and time stamps. Both you and the store can view your running balance. We do not store full card or UPI credentials on our servers.",
  },
  {
    n: "04",
    title: "Data Sharing",
    body: "We do not sell your data. We share information only with delivery partners and payment providers to the extent needed to complete your order, and with authorities when required by law.",
  },
  {
    n: "05",
    title: "Security",
    body: "Passwords are stored in encrypted (hashed) form, and access to customer records is restricted by role. We use reasonable safeguards to protect your data, though no online system is ever completely risk-free.",
  },
  {
    n: "06",
    title: "Your Rights",
    body: "You can view and update your profile anytime from your account, request a copy of your data, or ask us to delete your account. Contact us and we will act on your request promptly.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <StoreLayout>
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "40px 20px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
          <Link href="/" style={{ color: "#16a34a", fontWeight: 600, textDecoration: "none" }}>
            &larr; Back to Home
          </Link>
          <span style={{ fontSize: 13, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "1px" }}>
            Last Updated: October 2026
          </span>
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 900, color: "#111827", margin: "0 0 12px" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.7, margin: "0 0 40px" }}>
          At Subham General Store, we respect your privacy. This policy explains what information we collect when you shop with us and how we keep it safe.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {SECTIONS.map((s) => (
            <section key={s.n}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 800, background: "rgba(22,163,74,.1)", color: "#16a34a", padding: "4px 10px", borderRadius: 8 }}>
                  {s.n}
                </span>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: "#111827", margin: 0 }}>{s.title}</h2>
              </div>
              <p style={{ color: "#4b5563", lineHeight: 1.8, margin: 0 }}>{s.body}</p>
            </section>
          ))}
        </div>

        <div style={{ marginTop: 40, padding: 24, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 14 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Questions?</h3>
          <p style={{ color: "#4b5563", lineHeight: 1.7, margin: "0 0 16px" }}>
            If you have any questions about this Privacy Policy or your data, reach out to us.
          </p>
          <Link href="/contact" style={{ display: "inline-block", padding: "11px 24px", background: "#16a34a", color: "#fff", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
            Contact Us &rarr;
          </Link>
        </div>
      </main>
    </StoreLayout>
  );
}
