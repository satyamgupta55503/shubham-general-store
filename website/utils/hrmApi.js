import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com";

const HRM_API = axios.create({ baseURL: `${BASE}/api/hrm` });

HRM_API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hrm_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

HRM_API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("hrm_token");
      localStorage.removeItem("hrm_user");
      window.location.href = "/hrm/login";
    }
    return Promise.reject(err);
  }
);

export default HRM_API;
