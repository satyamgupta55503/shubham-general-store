import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com";

const EMP_API = axios.create({ baseURL: `${BASE}/api/emp` });

EMP_API.interceptors.request.use((req) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("emp_token");
    if (token) req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

EMP_API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("emp_token");
      localStorage.removeItem("emp_user");
      window.location.href = "/emp/login";
    }
    return Promise.reject(err);
  }
);

export default EMP_API;
