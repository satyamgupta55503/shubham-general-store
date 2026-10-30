"use client";
import StoreNavbar from "./StoreNavbar";
import StoreFooter from "./StoreFooter";
import { Toaster } from "react-hot-toast";

export default function StoreLayout({ children, promoBar }) {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: 13, borderRadius: 10 } }} />
      <StoreNavbar promoBar={promoBar} />
      <main style={{ minHeight: "100vh", background: "#f9fafb" }}>
        {children}
      </main>
      <StoreFooter />
    </>
  );
}
