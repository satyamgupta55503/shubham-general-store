"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useCustomerAuth } from "./CustomerAuthContext";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

const CartContext = createContext(null);

// Generate or get a stable guest session ID
function getSessionId() {
  if (typeof window === "undefined") return "";
  let sid = localStorage.getItem("sgs_session_id");
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("sgs_session_id", sid);
  }
  return sid;
}

export function CartProvider({ children }) {
  const { token, customer } = useCustomerAuth();
  const [cart,     setCart]    = useState({ items: [], subtotal: 0 });
  const [loading,  setLoading] = useState(false);
  const mergedRef = useRef(false);

  const getHeaders = useCallback(() => {
    const h = { "Content-Type": "application/json" };
    if (token) {
      h["Authorization"] = `Bearer ${token}`;
    } else {
      h["x-session-id"] = getSessionId();
    }
    return h;
  }, [token]);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/store/cart`, { headers: getHeaders() });
      setCart(res.data.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  // Fetch cart on mount and when auth changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Merge guest cart when customer logs in
  useEffect(() => {
    if (customer && !mergedRef.current) {
      mergedRef.current = true;
      const sessionId = localStorage.getItem("sgs_session_id");
      if (sessionId) {
        axios.post(`${API}/api/store/cart/merge`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        ).then(() => fetchCart()).catch(() => {});
      }
    }
    if (!customer) mergedRef.current = false;
  }, [customer, token, fetchCart]);

  // Returns true on success, false if blocked (e.g. not logged in)
  const addToCart = useCallback(async (productId, quantity = 1) => {
    // Require login before adding to cart
    if (!token) {
      toast.error("Please login to add items to cart");
      return false;
    }
    try {
      const res = await axios.post(`${API}/api/store/cart/add`,
        { productId, quantity },
        { headers: getHeaders() }
      );
      setCart(res.data.data);
      toast.success("Added to cart!");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
      return false;
    }
  }, [getHeaders, token]);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      const res = await axios.put(`${API}/api/store/cart/update`,
        { itemId, quantity },
        { headers: getHeaders() }
      );
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  }, [getHeaders]);

  const removeItem = useCallback(async (itemId) => {
    try {
      const res = await axios.delete(`${API}/api/store/cart/item/${itemId}`, { headers: getHeaders() });
      setCart(res.data.data);
      toast.success("Item removed");
    } catch (err) {
      toast.error("Remove failed");
    }
  }, [getHeaders]);

  const clearCart = useCallback(async () => {
    try {
      await axios.delete(`${API}/api/store/cart/clear`, { headers: getHeaders() });
      setCart({ items: [], subtotal: 0 });
    } catch {}
  }, [getHeaders]);

  const itemCount  = cart.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const isLoggedIn = !!token;

  return (
    <CartContext.Provider value={{ cart, loading, itemCount, isLoggedIn, addToCart, updateItem, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
