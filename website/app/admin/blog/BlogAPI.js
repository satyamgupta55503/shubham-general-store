// components/BlogAPI.js
const BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api";

const getHeaders = (isFormData = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const API = {
  get: async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return { data: await res.json() };
  },

  post: async (url, body) => {
    const isFormData = body instanceof FormData;
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? body : JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return { data: await res.json() };
  },

  delete: async (url) => {
    const res = await fetch(`${BASE_URL}${url}`, { 
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
    return { data: await res.json().catch(() => ({})) };
  },
};
