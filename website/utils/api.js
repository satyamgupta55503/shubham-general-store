import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com";

const API = axios.create({
  baseURL: `${BASE}/api`,
  timeout: 8000, // ✅ 8 second timeout — prevents infinite loading
});

// Token Automatically Add
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ✅ Response error handler — don't throw on timeout, return empty data
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      console.warn('API timeout — returning empty response');
      return Promise.resolve({ data: [], status: 408 });
    }
    return Promise.reject(err);
  }
);

export default API;

// ✅ Export the base URL so fetch()-based pages can use it too
export const API_BASE = `${BASE}/api`;
