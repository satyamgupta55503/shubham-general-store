"use client";
import EnquiryForm from "@/components/store/pages/EnquiryForm";

const TOPICS = [
  "Order or delivery",
  "Product availability / price",
  "Wholesale (thok) rates",
  "Dealership / bulk enquiry",
  "Feedback or complaint",
  "Something else",
];

const FIELDS = [
  { name: "name",    label: "Your name",  kind: "text",  required: true, autoComplete: "name",  placeholder: "Full name" },
  { name: "phone",   label: "Phone",      kind: "tel",   autoComplete: "tel", placeholder: "Optional, for a quick call back" },
  { name: "email",   label: "Email",      kind: "email", required: true, autoComplete: "email", placeholder: "you@example.com" },
  { name: "subject", label: "Topic",      kind: "select", required: true, options: TOPICS, placeholder: "What is this about?" },
  { name: "message", label: "Message",    kind: "textarea", required: true, rows: 5, placeholder: "Tell us how we can help…" },
];

export default function ContactForm() {
  return (
    <EnquiryForm
      id="contact-form"
      type="contact"
      title="Send us a message"
      intro="We usually reply within one working day."
      submitLabel="Send message"
      fields={FIELDS}
      success={{ title: "Message sent", text: "Thank you for reaching out. Our team will reply to you soon on the email or phone you gave." }}
    />
  );
}
