import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com";

const CRM_API = axios.create({
  baseURL: `${BASE}/api/crm`,
});

// Auto-attach CRM token
CRM_API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("crm_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auto-logout on 401
CRM_API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("crm_token");
      localStorage.removeItem("crm_user");
      window.location.href = "/crm/login";
    }
    return Promise.reject(err);
  }
);

export default CRM_API;
