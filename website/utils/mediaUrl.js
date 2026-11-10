const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

/**
 * mediaUrl — turn a stored media value into a loadable URL.
 *
 *  - Cloudinary / any full URL ("https://…")  → returned as-is
 *  - data: / blob: URLs (previews)           → returned as-is
 *  - legacy server paths ("uploads/x.png")   → prefixed with the backend URL
 *  - empty / null                            → ""
 *
 * Use this everywhere an image/PDF/video path from the API is rendered, so both
 * new Cloudinary uploads and older locally-stored files keep working.
 */
export function mediaUrl(value) {
  if (!value || typeof value !== "string") return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }
  return `${API}/${value.replace(/^\/+/, "")}`;
}

/** Cloudinary on-the-fly optimisation (smaller + auto format). No-op for non-Cloudinary URLs. */
export function optimizedImage(value, width) {
  const url = mediaUrl(value);
  if (!/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(url)) return url;
  const t = `f_auto,q_auto${width ? `,w_${width},c_limit` : ""}`;
  return url.replace("/image/upload/", `/image/upload/${t}/`);
}
