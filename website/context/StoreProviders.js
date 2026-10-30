"use client";
import { CartProvider }         from "./CartContext";
import { CustomerAuthProvider } from "./CustomerAuthContext";

export default function StoreProviders({ children }) {
  return (
    <CustomerAuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </CustomerAuthProvider>
  );
}
