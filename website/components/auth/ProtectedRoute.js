"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/ProtectedRoute";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 1. If not logged in, redirect to login page
      if (!isAuthenticated) {
        router.push("/login");
      }
      // 2. If logged in but role isn't authorized, redirect to unauthorized or home page
      else if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        router.push("/"); // Or an explicit /unauthorized page
      }
    }
  }, [loading, isAuthenticated, user, router, allowedRoles]);

  // Show a shell state while checking authorization parameters
  if (
    loading ||
    !isAuthenticated ||
    (allowedRoles.length > 0 && !allowedRoles.includes(user?.role))
  ) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div className="spinner-border text-dark" role="status"></div>
        <p style={{ fontFamily: "sans-serif", color: "#555" }}>
          Verifying Authorization Security...
        </p>
      </div>
    );
  }

  // Render children if all security gates pass
  return <>{children}</>;
}
