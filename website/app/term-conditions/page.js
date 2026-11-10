import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";

export const metadata = {
  title: "Terms & Conditions | Subham General Store",
  description:
    "The terms that govern your use of Subham General Store and the purchase of kirana products through our website.",
};

const SECTIONS = [
  {
    n: "01",
    title: "Account Registration",
    body: "To place an order you must register with accurate details and choose your account type (retail / footkar or wholesale / thok). New accounts are reviewed and must be approved by the store before you can log in and order. You are responsible for keeping your password secure.",
  },
  {
    n: "02",
    title: "Orders & Pricing",
    body: "Prices are shown in INR and may differ for retail and wholesale customers. Wholesale pricing applies only to approved wholesale accounts and may require a minimum order quantity (MOQ). We try to keep stock and prices accurate but may correct errors or cancel an order if an item is unavailable.",
  },
  {
    n: "03",
    title: "Payments & Credit (Khata)",
    body: "You may pay on delivery or, for approved credit customers, on your store ledger. Ledger balances record every jama (credit) and baaki (due) with date and time. Outstanding dues must be cleared within the agreed credit terms.",
  },
  {
    n: "04",
    title: "Delivery",
    body: "We deliver within our serviceable areas during store hours. Delivery times are estimates and may vary due to demand, weather, or stock. Please ensure someone is available to receive perishable items.",
  },
  {
    n: "05",
    title: "Returns & Cancellations",
    body: "Returns are handled as described in our Return Policy. You may cancel an order before it is dispatched. Perishable and opened items may not be eligible for return except in case of a quality issue.",
  },
  {
    n: "06",
    title: "Acceptable Use",
    body: "You agree to use the store for genuine purchases only and not to misuse the site, attempt unauthorised access, or place fraudulent orders. We may suspend accounts that break these terms.",
  },
  {
    n: "07",
    title: "Changes to These Terms",
    body: "We may update these terms from time to time. Continued use of the store after an update means you accept the revised terms.",
  },
];

export default function TermsConditionsPage() {
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
          Terms &amp; Conditions
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.7, margin: "0 0 40px" }}>
          Please read these terms carefully. By registering and shopping at Subham General Store, you agree to the following.
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
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Need help?</h3>
          <p style={{ color: "#4b5563", lineHeight: 1.7, margin: "0 0 16px" }}>
            If anything here is unclear, our team is happy to explain.
          </p>
          <Link href="/contact" style={{ display: "inline-block", padding: "11px 24px", background: "#16a34a", color: "#fff", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
            Contact Us &rarr;
          </Link>
        </div>
      </main>
    </StoreLayout>
  );
}
