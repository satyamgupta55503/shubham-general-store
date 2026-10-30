"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer]   = useState(null);
  const [token,    setToken]      = useState(null);
  const [loading,  setLoading]    = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const storedToken    = localStorage.getItem("sgs_customer_token");
    const storedCustomer = localStorage.getItem("sgs_customer");
    if (storedToken && storedCustomer) {
      setToken(storedToken);
      setCustomer(JSON.parse(storedCustomer));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await axios.post(`${API}/api/store/customers/login`, { email, password });
    const { token: t, data } = res.data;
    setToken(t);
    setCustomer(data);
    localStorage.setItem("sgs_customer_token",  t);
    localStorage.setItem("sgs_customer",        JSON.stringify(data));
    return data;
  }, []);

  // Register — account is created as "pending approval". No auto-login.
  const register = useCallback(async (payload) => {
    const res = await axios.post(`${API}/api/store/customers/register`, payload);
    return { pendingApproval: res.data.pendingApproval, message: res.data.message };
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem("sgs_customer_token");
    localStorage.removeItem("sgs_customer");
  }, []);

  const refreshMe = useCallback(async () => {
    const storedToken = localStorage.getItem("sgs_customer_token");
    if (!storedToken) return;
    try {
      const res = await axios.get(`${API}/api/store/customers/me`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });
      setCustomer(res.data.data);
      localStorage.setItem("sgs_customer", JSON.stringify(res.data.data));
    } catch {
      logout();
    }
  }, [logout]);

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <CustomerAuthContext.Provider value={{ customer, token, loading, authHeaders, login, register, logout, refreshMe }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be inside CustomerAuthProvider");
  return ctx;
}
