"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCart }         from "@/context/CartContext";
import { useCustomerAuth } from "@/context/CustomerAuthContext";
import toast               from "react-hot-toast";

const NAV_LINKS = [
  { label: "Home",       href: "/" },
  { label: "Shop",       href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Offers",     href: "/products?isFeatured=true" },
];

export default function StoreNavbar({ promoBar }) {
  const promoBarEnabled = promoBar?.enabled ?? true;
  const promoBarText    = promoBar?.text || "Free delivery on orders above ₹499 | 100% Fresh & Natural";
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [query,       setQuery]       = useState("");
  const router    = useRouter();
  const pathname  = usePathname();
  const searchRef = useRef(null);
  const accountRef = useRef(null);
  const { itemCount }          = useCart();
  const { customer, logout }   = useCustomerAuth();

  /* scroll shadow */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  /* close account dropdown on outside click */
  useEffect(() => {
    const fn = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  /* close mobile menu on route change */
  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [pathname]);

  /* focus search input when expanded */
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) { router.push(`/products?search=${encodeURIComponent(q)}`); setQuery(""); setSearchOpen(false); }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    setAccountOpen(false);
    router.push("/");
  };

  return (
    <>
      {/* ── Main header ───────────────────────────────────────── */}
      <header style={{
        position:   "fixed",
        top:        0,
        left:       0,
        right:      0,
        zIndex:     1000,
        background: scrolled ? "rgba(255,255,255,.97)" : "#fff",
        boxShadow:  scrolled ? "0 2px 20px rgba(0,0,0,.10)" : "0 1px 0 #e5e7eb",
        backdropFilter: "blur(10px)",
        transition: "all .25s ease",
      }}>
        {/* Promo bar — CMS controlled */}
        {promoBarEnabled && (
          <div style={{
            background: "linear-gradient(90deg,#16a34a,#15803d)",
            padding: "5px 16px",
            textAlign: "center",
            fontSize: 12,
            color: "#fff",
            letterSpacing: ".03em",
            lineHeight: 1.4,
          }}>
            {promoBarText}
          </div>
        )}
        <nav style={{
          maxWidth:   1280,
          margin:     "0 auto",
          padding:    "0 16px",
          height:     60,
          display:    "flex",
          alignItems: "center",
          gap:        12,
        }}>
          {/* ── Logo ── */}
          <Link href="/" aria-label="Subham General Store Home" style={{
            textDecoration: "none",
            display:        "flex",
            alignItems:     "center",
            gap:            8,
            flexShrink:     0,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "linear-gradient(135deg,#16a34a,#15803d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 3px 10px rgba(22,163,74,.35)",
              flexShrink: 0,
            }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <div className="hide-mobile">
              <div style={{ fontSize: 15, fontWeight: 800, color: "#111827", lineHeight: 1.1, letterSpacing: "-.02em" }}>Subham</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", lineHeight: 1, letterSpacing: ".06em", textTransform: "uppercase" }}>General Store</div>
            </div>
          </Link>

          {/* ── Desktop search ── */}
          <form onSubmit={handleSearch} role="search" aria-label="Search products" style={{
            flex:       1,
            maxWidth:   480,
            display:    "flex",
            background: "#f3f4f6",
            borderRadius: 50,
            overflow:   "hidden",
            border:     `2px solid ${searchOpen ? "#16a34a" : "transparent"}`,
            transition: "border .2s",
          }} className="hide-mobile">
            <input
              ref={searchRef}
              type="search"
              placeholder="Search vegetables, fruits, dairy…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              aria-label="Search products"
              style={{
                flex: 1, border: "none", outline: "none",
                background: "transparent", padding: "9px 16px",
                fontSize: 13, color: "#111827",
              }}
            />
            <button type="submit" aria-label="Submit search" style={{
              border: "none", background: "#16a34a", color: "#fff",
              padding: "0 18px", cursor: "pointer", fontSize: 14,
              display: "flex", alignItems: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* ── Desktop nav links ── */}
          <nav aria-label="Main navigation" style={{ display: "flex", gap: 2, alignItems: "center", flexShrink: 0 }} className="hide-mobile">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                textDecoration: "none",
                padding:        "6px 11px",
                borderRadius:   7,
                fontSize:       13,
                fontWeight:     600,
                color:          pathname === l.href ? "#16a34a" : "#374151",
                background:     pathname === l.href ? "#f0fdf4" : "transparent",
                transition:     "all .18s",
                whiteSpace:     "nowrap",
              }}>
                {l.label}
              </Link>
            ))}
          </nav>

          {/* ── Action icons ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", flexShrink: 0 }}>

            {/* Mobile search toggle */}
            <button
              className="show-mobile"
              onClick={() => setSearchOpen(s => !s)}
              aria-label="Search"
              style={{ ...iconBtn, display: "none" }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {/* Wishlist */}
            <Link href="/account/wishlist" aria-label="Wishlist" style={{ ...iconBtn, textDecoration: "none" }} className="hide-mobile">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </Link>

            {/* Cart */}
            <Link href="/cart" aria-label={`Cart (${itemCount} items)`} style={{ ...iconBtn, position: "relative", textDecoration: "none" }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" aria-hidden="true">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {itemCount > 0 && (
                <span aria-hidden="true" style={{
                  position: "absolute", top: -5, right: -5,
                  background: "#16a34a", color: "#fff",
                  width: 17, height: 17, borderRadius: "50%",
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(22,163,74,.5)",
                }}>
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </Link>

            {/* Account dropdown */}
            <div ref={accountRef} style={{ position: "relative" }}>
              <button
                onClick={() => setAccountOpen(o => !o)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                aria-label={customer ? `Account: ${customer.name}` : "Login or Register"}
                style={customer ? {
                  // Logged in — subtle green pill
                  ...iconBtn,
                  border:     "1px solid #bbf7d0",
                  background: "#f0fdf4",
                  display:    "flex", alignItems: "center", gap: 6,
                  padding:    "6px 12px", borderRadius: 50, cursor: "pointer",
                } : {
                  // Guest — prominent green CTA button
                  border:     "none",
                  background: "linear-gradient(135deg,#16a34a,#15803d)",
                  color:      "#fff",
                  display:    "flex", alignItems: "center", gap: 7,
                  padding:    "7px 16px", borderRadius: 50, cursor: "pointer",
                  fontSize:   13, fontWeight: 700,
                  boxShadow:  "0 3px 12px rgba(22,163,74,.35)",
                  transition: "all .2s",
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {customer ? (
                  /* Logged-in state */
                  <>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: "linear-gradient(135deg,#16a34a,#15803d)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0,
                    }}>
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hide-mobile" style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {customer.name.split(" ")[0]}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" aria-hidden="true">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </>
                ) : (
                  /* Guest — Login button */
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" aria-hidden="true">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Login</span>
                  </>
                )}
              </button>

              {accountOpen && (
                <div role="menu" style={{
                  position:   "absolute",
                  top:        "calc(100% + 8px)",
                  right:      0,
                  background: "#fff",
                  borderRadius: 12,
                  padding:    8,
                  boxShadow:  "0 8px 30px rgba(0,0,0,.12)",
                  border:     "1px solid #e5e7eb",
                  minWidth:   175,
                  zIndex:     200,
                }}>
                  {customer ? (
                    <>
                      <DropItem href="/account"          icon="" label="My Profile"  onClick={() => setAccountOpen(false)} />
                      <DropItem href="/account/orders"   icon="" label="My Orders"   onClick={() => setAccountOpen(false)} />
                      <DropItem href="/account/wishlist" icon="" label="Wishlist"    onClick={() => setAccountOpen(false)} />
                      <DropItem href="/account/addresses"icon="" label="Addresses"   onClick={() => setAccountOpen(false)} />
                      <div style={{ height: 1, background: "#e5e7eb", margin: "4px 0" }} />
                      <button role="menuitem" onClick={handleLogout} style={{
                        width: "100%", border: "none", background: "none", textAlign: "left",
                        padding: "8px 12px", borderRadius: 8, cursor: "pointer",
                        fontSize: 13, color: "#ef4444", fontWeight: 600,
                        display: "flex", alignItems: "center", gap: 8,
                      }}>
                         Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <DropItem href="/account/login"    icon="" label="Login"    onClick={() => setAccountOpen(false)} />
                      <DropItem href="/account/register" icon="" label="Register"  onClick={() => setAccountOpen(false)} />
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Hamburger */}
            <button
              className="show-mobile"
              onClick={() => setMobileOpen(o => !o)}
              aria-expanded={mobileOpen}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              style={{ ...iconBtn, cursor: "pointer", display: "none" }}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2" aria-hidden="true">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </nav>

        {/* ── Mobile search bar (expand on tap) ── */}
        {searchOpen && (
          <div className="show-mobile" style={{
            borderTop: "1px solid #e5e7eb",
            padding:   "10px 16px",
            background: "#fff",
          }}>
            <form onSubmit={handleSearch} role="search" style={{
              display: "flex", background: "#f3f4f6",
              borderRadius: 50, overflow: "hidden",
              border: "2px solid #16a34a",
            }}>
              <input
                ref={searchRef}
                type="search"
                placeholder="Search groceries…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                aria-label="Search products"
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", padding: "10px 16px",
                  fontSize: 14,
                }}
              />
              <button type="submit" aria-label="Search" style={{
                border: "none", background: "#16a34a", color: "#fff",
                padding: "0 18px", cursor: "pointer",
                display: "flex", alignItems: "center",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
            </form>
          </div>
        )}

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <nav aria-label="Mobile navigation" style={{
            borderTop:  "1px solid #e5e7eb",
            background: "#fff",
            padding:    "8px 16px 16px",
          }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                display:    "block",
                padding:    "11px 4px",
                fontSize:   15,
                fontWeight: 600,
                color:      pathname === l.href ? "#16a34a" : "#374151",
                textDecoration: "none",
                borderBottom: "1px solid #f3f4f6",
              }}>
                {l.label}
              </Link>
            ))}
            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              {customer ? (
                <Link href="/account" style={mobileCTA}>My Account</Link>
              ) : (
                <>
                  <Link href="/account/login"    style={mobileCTA}>Login</Link>
                  <Link href="/account/register" style={{ ...mobileCTA, background: "#fff", color: "#16a34a", border: "2px solid #16a34a" }}>Register</Link>
                </>
              )}
            </div>
          </nav>
        )}
      </header>

      {/* ── Spacer (promo bar ~28px when enabled + nav 60px) ── */}
      <div style={{ height: promoBarEnabled ? 88 : 60 }} aria-hidden="true" />
    </>
  );
}

const iconBtn = {
  border:     "none",
  background: "transparent",
  width:      36,
  height:     36,
  borderRadius: 8,
  display:    "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor:     "pointer",
  position:   "relative",
  textDecoration: "none",
  flexShrink: 0,
};

const mobileCTA = {
  flex:           1,
  display:        "block",
  padding:        "10px 0",
  background:     "#16a34a",
  color:          "#fff",
  borderRadius:   10,
  textDecoration: "none",
  fontSize:       14,
  fontWeight:     700,
  textAlign:      "center",
  border:         "2px solid transparent",
};

function DropItem({ href, label, icon, onClick }) {
  return (
    <Link href={href} role="menuitem" onClick={onClick} className="drop-item">
      <span aria-hidden="true">{icon}</span> {label}
    </Link>
  );
}
