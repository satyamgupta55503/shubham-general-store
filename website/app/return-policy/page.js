import Link from "next/link";
import StoreLayout from "@/components/store/layout/StoreLayout";

export const metadata = {
  title: "Return & Refund Policy | Subham General Store",
  description:
    "Our return, replacement, and refund policy for groceries and daily essentials bought at Subham General Store.",
};

const SECTIONS = [
  {
    n: "01",
    title: "Check Before You Accept",
    body: "Please check your items at the time of delivery. For perishable goods like vegetables, fruits, dairy, and bakery, any issue must be reported immediately on delivery or within the same day so we can act quickly.",
  },
  {
    n: "02",
    title: "What Can Be Returned",
    body: "We accept returns or replacements for items that are damaged, expired, spoiled, or wrong. Packaged and non-perishable goods can be returned within 7 days if they are unopened and in original condition with the bill.",
  },
  {
    n: "03",
    title: "What Cannot Be Returned",
    body: "Opened or partially used items, perishable goods without a quality issue, and products sold on clearance cannot be returned unless there was a quality or packaging defect at the time of delivery.",
  },
  {
    n: "04",
    title: "How to Request a Return",
    body: "Go to My Orders, open the order, and raise a return request — or simply call the store. Keep the item and the bill ready. For credit (khata) customers, approved returns are adjusted directly in your ledger as a jama entry.",
  },
  {
    n: "05",
    title: "Refunds",
    body: "Once a return is approved, prepaid refunds are processed to your original payment method, usually within 3 to 7 working days. Cash-on-delivery refunds are given as cash or as a credit adjustment on your ledger, as you prefer.",
  },
  {
    n: "06",
    title: "Replacements",
    body: "For damaged or wrong items, we will replace them in your next delivery or the earliest available slot at no extra cost.",
  },
];

export default function ReturnPolicyPage() {
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
          Return &amp; Refund Policy
        </h1>
        <p style={{ fontSize: 16, color: "#6b7280", lineHeight: 1.7, margin: "0 0 40px" }}>
          We want you to be happy with every order. Here is how returns, replacements, and refunds work at Subham General Store.
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
          <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Have an issue with an order?</h3>
          <p style={{ color: "#4b5563", lineHeight: 1.7, margin: "0 0 16px" }}>
            Raise a request from your orders page or get in touch and we will sort it out.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/account/orders" style={{ display: "inline-block", padding: "11px 24px", background: "#16a34a", color: "#fff", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              My Orders
            </Link>
            <Link href="/contact" style={{ display: "inline-block", padding: "11px 24px", background: "#fff", color: "#16a34a", border: "1px solid #16a34a", borderRadius: 50, textDecoration: "none", fontWeight: 700, fontSize: 14 }}>
              Contact Us
            </Link>
          </div>
        </div>
      </main>
    </StoreLayout>
  );
}
