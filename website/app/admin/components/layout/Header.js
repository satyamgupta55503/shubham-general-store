"use client";

import React, { useState, useEffect, useRef } from 'react';
import { LogOut, ChevronDown, Bell, Menu } from 'lucide-react';
import Link from 'next/link';
import './Header.css';

const Header = ({ onMenuToggle }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const dropdownRef = useRef(null);

  const [userInfo, setUserInfo] = useState({
    name: "Loading...",
    role: "...",
    email: "Loading..."
  });

  // Local Backend URL endpoint configuration - use env var
  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api/enquiry/send";

  const checkNewEnquiries = async () => {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5000);
      // Enquiries contain customers' contact details, so the API needs the admin token
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(API_URL, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
      });
      clearTimeout(tid);
      if (!response.ok) return;
      const data = await response.json();
      const enquiries = Array.isArray(data) ? data : data.data || data.enquiries || [];
      const readMessages = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
      const unreadEnquiries = enquiries.filter(
        (item) => !readMessages.includes(item._id || item.id)
      );
      setUnreadCount(unreadEnquiries.length);
    } catch (error) {
      // Ignore timeout/network errors silently
    }
  };

  useEffect(() => {
    setIsMounted(true);

    const loadUserInfo = () => {
      const storedName  = localStorage.getItem('userName')  || '';
      const storedRole  = localStorage.getItem('role')       || '';
      const storedEmail = localStorage.getItem('userEmail')  || '';
      if (storedName || storedRole) {
        setUserInfo({
          name:  storedName  || 'Admin',
          role:  storedRole  ? storedRole.charAt(0).toUpperCase() + storedRole.slice(1) : 'Admin',
          email: storedEmail || 'admin@localhost:5000',
        });
      }
    };

    loadUserInfo();

    // Poll every 300ms for 3s in case ProtectedRoute updates localStorage
    let attempts = 0;
    const poll = setInterval(() => {
      loadUserInfo();
      attempts++;
      if (attempts >= 10) clearInterval(poll);
    }, 300);

    checkNewEnquiries();
    const interval = setInterval(checkNewEnquiries, 30000); // reduced to 30s

    const handleStorageSync = () => { checkNewEnquiries(); loadUserInfo(); };
    window.addEventListener("storage", handleStorageSync);
    window.addEventListener("cms_navigated", handleStorageSync);

    return () => {
      clearInterval(interval);
      clearInterval(poll);
      window.removeEventListener("storage", handleStorageSync);
      window.removeEventListener("cms_navigated", handleStorageSync);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isMounted) {
    return <div className="header-skeleton"></div>;
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  return (
    <header className="admin-header">
      <div className="header-left" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* Mobile hamburger — toggles sidebar */}
        <button
          className="admin-menu-toggle"
          onClick={onMenuToggle}
          aria-label="Open menu"
          style={{
            display: "none", border: "none", background: "#f8faf5",
            width: 38, height: 38, borderRadius: 8, cursor: "pointer",
            alignItems: "center", justifyContent: "center", color: "#374151",
          }}
        >
          <Menu size={20} />
        </button>
        <h2 className="welcome-back-text">Subham General Store — Admin</h2>
      </div>

      <div className="header-right">
        {/* Notification Bell Wrapper - Direct Link */}
        <div className="notification-wrapper">
          <Link href="/admin/enquiry" className="icon-btn-box relative-box" aria-label="Notifications">
            <Bell size={19} />
            {/* NUMBER BADGE: Jab tak unread message hoga, count dikhega */}
            {unreadCount > 0 && (
              <span className="notification-alert-badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </div>
        
        {/* User Account Trigger block */}
        <div className="user-profile-wrapper" ref={dropdownRef}>
          <div
            className={`user-profile-trigger ${dropdownOpen ? 'active-trigger' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <img 
              src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" 
              alt="Avatar" 
              className="user-avatar"
            />
            
            <div className="user-info">
              <h4 className="user-name">{userInfo.name}</h4>
              <span className="user-email">{userInfo.email}</span>
            </div>

            {/* Direct Logout Icon Indicator */}
            {/* <button 
              className="direct-logout-btn"
              onClick={(e) => {
                e.stopPropagation(); // Yeh dropdown ko open hone se rokega
                handleLogout();
              }}
              title="Logout"
            > */}
              <LogOut size={16} />
          
            
            {/* <ChevronDown size={14} className={`arrow-toggle ${dropdownOpen ? 'rotate-up' : ''}`} /> */}
          </div>

          {dropdownOpen && (
            <div className="profile-dropdown-menu">
            
              <button onClick={handleLogout} className="dropdown-item logout-action">
                <LogOut size={15} />
                <span>Logout Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
