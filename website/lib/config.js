/**
 * Central config — use this everywhere instead of hardcoding backend URL.
 * 
 * Local dev:  set NEXT_PUBLIC_BACKEND_URL=http://localhost:5000 in .env.local
 * Production: set NEXT_PUBLIC_BACKEND_URL=https://backend.digikraftsocial.com
 */

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com";

export const API_BASE    = `${BACKEND_URL}/api`;
export const UPLOADS_URL = `${BACKEND_URL}/uploads`;
