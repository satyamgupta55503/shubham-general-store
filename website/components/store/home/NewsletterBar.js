"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function NewsletterBar({ initialData }) {
  const [email, setEmail] = useState("");
  const heading = initialData?.newsletter?.heading || "Get 10% Off Your First Order!";
  const subtext = initialData?.newsletter?.subtext || "Subscribe to our newsletter and stay updated with fresh deals, new arrivals, and exclusive offers every week.";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Subscribed! Get 10% off your first order.");
    setEmail("");
  };

  return (
    <section style={{
      padding: "60px 20px",
      background: "linear-gradient(135deg,#052e16,#16a34a)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <span style={{
          display: "inline-block", padding: "4px 14px", borderRadius: 50,
          background: "rgba(255,255,255,.15)", color: "#86efac",
          fontSize: 12, fontWeight: 700, letterSpacing: ".08em", marginBottom: 16,
        }}>
          SPECIAL OFFER
        </span>
        <h2 style={{
          fontSize: "clamp(24px,4vw,30px)", fontWeight: 900, color: "#fff",
          margin: "0 0 12px", letterSpacing: "-.02em",
        }}>
          {heading}
        </h2>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,.7)", margin: "0 0 28px", lineHeight: 1.7 }}>
          {subtext}
        </p>

        <form onSubmit={handleSubmit} style={{
          display: "flex", maxWidth: 480, margin: "0 auto",
          boxShadow: "0 8px 32px rgba(0,0,0,.3)", borderRadius: 8, overflow: "hidden",
        }}>
          <input
            type="email" placeholder="Enter your email address..." value={email}
            onChange={e => setEmail(e.target.value)} required aria-label="Email address"
            style={{ flex: 1, border: "none", outline: "none", padding: "14px 20px", fontSize: 14, background: "#fff", minWidth: 0 }}
          />
          <button type="submit" style={{
            border: "none", cursor: "pointer", padding: "0 24px",
            background: "#052e16", color: "#86efac", fontWeight: 800, fontSize: 14, whiteSpace: "nowrap",
          }}>
            Subscribe →
          </button>
        </form>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,.4)", marginTop: 12 }}>
          No spam ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
