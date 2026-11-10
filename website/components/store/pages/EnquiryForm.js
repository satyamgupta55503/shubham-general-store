"use client";
import { useState, useId } from "react";
import axios from "axios";
import SpIcon from "./SpIcon";
import "@/styles/store-pages.css";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RX = /^[+\d][\d\s\-()]{6,18}$/;

/**
 * EnquiryForm — one form component for the Contact page and the Careers page.
 *
 * props:
 *  - type:        "contact" | "career" | "dealer"   (stored with the enquiry)
 *  - title, intro, submitLabel
 *  - fields:      [{ name, label, kind: text|email|tel|url|textarea|select, required, options, placeholder, hint, span2 }]
 *  - values:      controlled initial values (e.g. { position } when "Apply" is clicked)
 *  - onValuesChange(values)  optional – lets a parent keep a field (position) in sync
 *  - success:     { title, text }
 *  - id:          anchor id so "Apply" buttons can scroll to the form
 */
export default function EnquiryForm({ type = "contact", title, intro, submitLabel = "Send message", fields, values: external, onValuesChange, success, id }) {
  const uid = useId();
  const [local, setLocal] = useState({});
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");   // idle | sending | done
  const [serverError, setServerError] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const values = { ...local, ...(external || {}) };
  const set = (name, v) => {
    const next = { ...values, [name]: v };
    setLocal((p) => ({ ...p, [name]: v }));
    onValuesChange?.(next);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    fields.forEach((f) => {
      const v = String(values[f.name] || "").trim();
      if (f.required && !v) e[f.name] = `${f.label} is required`;
      else if (v && f.kind === "email" && !EMAIL_RX.test(v)) e[f.name] = "Enter a valid email address";
      else if (v && f.kind === "tel" && !PHONE_RX.test(v)) e[f.name] = "Enter a valid phone number";
      else if (v && f.kind === "url" && !/^https?:\/\/\S+$/i.test(v)) e[f.name] = "Link must start with http:// or https://";
      else if (f.kind === "textarea" && f.required && v.length < 5) e[f.name] = "Please write a little more";
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setServerError("");
    if (!validate()) return;
    setStatus("sending");
    try {
      const body = { type, website: honeypot };
      fields.forEach((f) => { body[f.name] = String(values[f.name] || "").trim(); });
      await axios.post(`${API}/api/enquiry/send`, body);
      setStatus("done");
    } catch (err) {
      setServerError(
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK" ? "Could not reach the server. Please check your internet and try again." : "Something went wrong. Please try again.")
      );
      setStatus("idle");
    }
  };

  const reset = () => { setLocal({}); setErrors({}); setStatus("idle"); onValuesChange?.({}); };

  if (status === "done") {
    return (
      <div className="sp-form" id={id} role="status" aria-live="polite">
        <div className="sp-done">
          <div className="sp-done-ico"><SpIcon name="check" size={30} stroke={3} /></div>
          <h2>{success?.title || "Message sent"}</h2>
          <p>{success?.text || "Thank you. We will get back to you soon."}</p>
          <button type="button" className="sp-btn sp-btn-outline" onClick={reset}>Send another</button>
        </div>
      </div>
    );
  }

  return (
    <form className="sp-form" id={id} onSubmit={submit} noValidate>
      {title && <h2>{title}</h2>}
      {intro && <p>{intro}</p>}

      {serverError && (
        <div className="sp-alert" role="alert"><SpIcon name="alert" size={18} /><span>{serverError}</span></div>
      )}

      <div className={`sp-fields ${fields.length > 3 ? "two" : ""}`}>
        {fields.map((f) => {
          const fid = `${uid}-${f.name}`;
          const err = errors[f.name];
          const common = {
            id: fid, name: f.name, value: values[f.name] || "", required: f.required,
            "aria-invalid": !!err, "aria-describedby": err ? `${fid}-e` : f.hint ? `${fid}-h` : undefined,
            onChange: (e) => set(f.name, e.target.value),
            disabled: status === "sending",
          };
          return (
            <div key={f.name} className={`sp-field ${err ? "err" : ""} ${f.span2 || f.kind === "textarea" ? "span2" : ""}`}>
              <label htmlFor={fid}>{f.label}{f.required && <i> *</i>}</label>
              {f.kind === "textarea" ? (
                <textarea {...common} rows={f.rows || 5} placeholder={f.placeholder} maxLength={3000} />
              ) : f.kind === "select" ? (
                <select {...common}>
                  <option value="">{f.placeholder || "Select…"}</option>
                  {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input {...common} type={f.kind || "text"} placeholder={f.placeholder} autoComplete={f.autoComplete} maxLength={f.kind === "url" ? 500 : 160} />
              )}
              {err ? <small id={`${fid}-e`} style={{ color: "#dc2626" }} role="alert">{err}</small>
                   : f.hint ? <small id={`${fid}-h`}>{f.hint}</small> : null}
            </div>
          );
        })}
      </div>

      {/* Honeypot: hidden from people, bots tend to fill it */}
      <div className="sp-hp" aria-hidden="true">
        <label>Website<input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
      </div>

      <button type="submit" className="sp-btn sp-btn-primary" disabled={status === "sending"}>
        {status === "sending" ? (<><span className="sp-spin" aria-hidden="true" /> Sending…</>) : (<>{submitLabel} <SpIcon name="arrow" size={17} stroke={2.5} /></>)}
      </button>
    </form>
  );
}
