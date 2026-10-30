'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter();
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'
  const [accessRevoked, setAccessRevoked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('role');

    // No token → redirect to login immediately
    if (!token) {
      router.replace('/admin/login');
      setStatus('denied');
      return;
    }

    // Role restriction check
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace('/unauthorized');
      setStatus('denied');
      return;
    }

    // Token exists → allow content to show
    setStatus('allowed');

    // ✅ Background verify — silently revokes if token is invalid
    const verifyInBackground = async () => {
      try {
        const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend.digikraftsocial.com';
        const res = await fetch(`${BASE}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: AbortSignal.timeout(6000),
        });

        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            // Token invalid → revoke session
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userName');
            localStorage.removeItem('userEmail');
            setAccessRevoked(true);
          }
          return;
        }

        const data = await res.json();
        if (data?.valid) {
          if (data.role && data.role !== role) {
            localStorage.setItem('role', data.role);
          }
          if (data.name) {
            localStorage.setItem('userName', data.name);
          }
        }
      } catch {
        // Timeout / network error → keep session alive silently
      }
    };

    verifyInBackground();
    const interval = setInterval(verifyInBackground, 60000);
    return () => clearInterval(interval);
  }, []);

  // ── Access revoked (token rejected by server) ──
  if (accessRevoked) {
    return (
      <div style={{ minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fef2f2',padding:'20px' }}>
        <div style={{ maxWidth:'400px',textAlign:'center',background:'#fff',borderRadius:'16px',padding:'36px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',border:'1px solid #fecaca' }}>
          <div style={{ fontSize:'44px',marginBottom:'14px' }}>🚫</div>
          <h2 style={{ fontSize:'20px',fontWeight:'800',color:'#991b1b',margin:'0 0 8px' }}>Session Expired</h2>
          <p style={{ color:'#6b7280',fontSize:'13px',lineHeight:'1.6',marginBottom:'20px' }}>
            Your session has expired or was revoked. Please log in again.
          </p>
          <button
            onClick={() => { router.replace('/admin/login'); }}
            style={{ background:'#dc2626',color:'#fff',border:'none',padding:'10px 22px',borderRadius:'8px',fontSize:'13px',fontWeight:'600',cursor:'pointer' }}>
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Still checking (first render before useEffect runs) ──
  if (status === 'checking') return null;

  // ── Denied → null (router.replace already called) ──
  if (status === 'denied') return null;

  // ── Allowed ──
  return <>{children}</>;
}
