"use client";
import { useState, useRef } from "react";
import EnquiryForm from "@/components/store/pages/EnquiryForm";
import SpIcon from "@/components/store/pages/SpIcon";
import "@/styles/store-pages.css";

const GENERAL = "General application (no specific role)";
const EXPERIENCE = ["Fresher", "Less than 1 year", "1–3 years", "3–5 years", "5+ years"];

export default function CareersClient({ openings = [] }) {
  const [position, setPosition] = useState("");
  const formRef = useRef(null);

  const apply = (title) => {
    setPosition(title);
    // Wait a tick so the select shows the chosen role, then bring the form into view
    setTimeout(() => {
      const el = document.getElementById("apply-form");
      el?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      el?.querySelector("input")?.focus({ preventScroll: true });
    }, 60);
  };

  const roleOptions = [...openings.map((o) => o.title), GENERAL];

  const fields = [
    { name: "name",       label: "Full name",  kind: "text",  required: true, autoComplete: "name", placeholder: "Your name" },
    { name: "phone",      label: "Phone",      kind: "tel",   required: true, autoComplete: "tel",  placeholder: "10-digit mobile number" },
    { name: "email",      label: "Email",      kind: "email", required: true, autoComplete: "email", placeholder: "you@example.com" },
    { name: "position",   label: "Role",       kind: "select", options: roleOptions, placeholder: "Choose a role" },
    { name: "experience", label: "Experience", kind: "select", options: EXPERIENCE, placeholder: "Select experience" },
    { name: "resumeUrl",  label: "Resume link (optional)", kind: "url", placeholder: "https://drive.google.com/…", hint: "Paste a Google Drive / Dropbox share link if you have a resume.", span2: true },
    { name: "message",    label: "Tell us about yourself (optional)", kind: "textarea", rows: 4, placeholder: "Past work, why you want to join, when you can start…" },
  ];

  return (
    <div className="sp-careers">
      <div>
        <div className="sp-sec-head">
          <p className="sp-eyebrow">Open positions</p>
          <h2 className="sp-h2">{openings.length ? "Find your role" : "No open roles right now"}</h2>
        </div>

        {openings.length === 0 ? (
          <div className="sp-empty">
            <h3>We are not hiring for a specific role at the moment</h3>
            <p>You can still send us your details with the form. We will contact you when something suitable opens up.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {openings.map((o) => (
              <article key={o._id || o.title} className="sp-card sp-job">
                <div className="sp-job-top">
                  <div>
                    <h3>{o.title}</h3>
                    <div className="sp-tags" style={{ marginTop: 8 }}>
                      {o.type && <span className="sp-tag g">{o.type}</span>}
                      {o.location && <span className="sp-tag">{o.location}</span>}
                      {o.experience && <span className="sp-tag">{o.experience}</span>}
                    </div>
                  </div>
                </div>
                {o.description && <p style={{ whiteSpace: "pre-line" }}>{o.description}</p>}
                <button type="button" className="sp-btn sp-btn-primary" onClick={() => apply(o.title)}>
                  Apply for this role <SpIcon name="arrow" size={16} stroke={2.5} />
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      <div ref={formRef} className="sp-apply">
        <EnquiryForm
          id="apply-form"
          type="career"
          title="Apply now"
          intro="Fill in your details and our team will get in touch."
          submitLabel="Send application"
          fields={fields}
          values={position ? { position } : undefined}
          onValuesChange={(v) => setPosition(v.position || "")}
          success={{ title: "Application received", text: "Thank you for applying. Our team will review it and contact you on the phone number or email you gave." }}
        />
      </div>
    </div>
  );
}
