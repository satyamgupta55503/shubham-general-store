"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import API from "@/utils/api";

export default function Login() {
    // Form Input States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Request Pipeline Feedback States
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Fix cursor: none from global style.css
    useEffect(() => {
        const style = document.createElement('style');
        style.id = 'login-cursor-fix';
        style.textContent = `
            * { cursor: auto !important; }
            .custom-cursor, .custom-cursor-outer { display: none !important; }
        `;
        document.head.appendChild(style);
        return () => {
            const el = document.getElementById('login-cursor-fix');
            if (el) el.remove();
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await API.post('/auth/login', { email, password });
            
            if (response.data && response.data.token) {
                localStorage.setItem('token', response.data.token);
                const userRole = response.data.role || 'user';
                localStorage.setItem('role', userRole);
                localStorage.setItem('userName', response.data.name || response.data.user?.name || 'Admin');
                localStorage.setItem('userEmail', email);

                // Force hard redirect to dashboard
                window.location.replace('/admin/dashboard');
            } else {
                throw new Error("Authorization payload missing token.");
            }
        } catch (err) {
            console.error("Authentication Exception:", err);
            const extractedError = err.response?.data?.message || err.message || "Login failed. Please try again.";
            setErrorMessage(extractedError);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1100px', width: '100%', display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '300px' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px', color: '#111' }}>Welcome Back</h2>
                    <p style={{ color: '#6b7280', marginBottom: '24px' }}>Today is a new day. Sign in to start managing your dashboard.</p>
                    
                    {errorMessage && (
                        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div style={{ background: '#d1fae5', color: '#065f46', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                            {successMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>
                                Your Email<span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input 
                                type="email" 
                                placeholder="email@website.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                            />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>
                                Password *
                            </label>
                            <input 
                                type="password" 
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                required
                                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '15px', outline: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', fontSize: '14px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280' }}>
                                <input type="checkbox" disabled={loading} /> Remember me
                            </label>
                            <Link href="/forget-password" style={{ color: '#6b7280', textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                padding: '14px', 
                                background: '#111', 
                                color: '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '16px', 
                                fontWeight: '600', 
                                cursor: 'pointer',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Processing Request..." : "Login"}
                            {!loading && (
                                <svg xmlns="http://www.w3.org/2000/svg" width={23} height={8} viewBox="0 0 23 8" fill="none">
                                    <path d="M22.5 4.00032L18.9791 0.479492V3.3074H0.5V4.69333H18.9791V7.52129L22.5 4.00032Z" fill="currentColor" />
                                </svg>
                            )}
                        </button>
                    </form>
                </div>
                <div style={{ flex: '1', minWidth: '300px', textAlign: 'center' }}>
                    <img src="/assets/imgs/page/login/banner.png" alt="Login" style={{ maxWidth: '100%', height: 'auto' }} />
                </div>
            </div>
        </section>
    );
}
