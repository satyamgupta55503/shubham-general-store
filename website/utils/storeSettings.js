const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export const EMPTY_SETTINGS = {
  contact: { phone: "", whatsapp: "", email: "", address: "", city: "", hours: "", mapUrl: "" },
  social:  { instagram: "", facebook: "", youtube: "" },
  about:   { headline: "", story: "", stats: [] },
  careers: { intro: "", openings: [] },
};

const merge = (data) => ({
  contact: { ...EMPTY_SETTINGS.contact, ...(data?.contact || {}) },
  social:  { ...EMPTY_SETTINGS.social,  ...(data?.social  || {}) },
  about:   { ...EMPTY_SETTINGS.about,   ...(data?.about   || {}) },
  careers: { ...EMPTY_SETTINGS.careers, ...(data?.careers || {}) },
});

/** Server-side fetch (About / Careers / Contact pages). Never throws. */
export async function getStoreSettings() {
  try {
    const res = await fetch(`${API}/api/store/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return merge(null);
    return merge((await res.json()).data);
  } catch {
    return merge(null);
  }
}

/** Server-side fetch of dealer brands for the About page. Never throws. */
export async function getDealerBrands() {
  try {
    const res = await fetch(`${API}/api/store/brands?dealer=true`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()).data || [];
  } catch {
    return [];
  }
}

// ── Link helpers ──────────────────────────────────────────────────────────────
const digits = (v = "") => String(v).replace(/\D/g, "");

/** tel: link — keeps a leading + */
export const telHref = (phone) => `tel:${String(phone).trim().startsWith("+") ? "+" : ""}${digits(phone)}`;

/** wa.me link — assumes India (+91) when a 10-digit number is given */
export function whatsappHref(num, text = "") {
  let d = digits(num);
  if (d.length === 10) d = "91" + d;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
