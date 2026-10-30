"use client";
import { useEffect, useState } from "react";
import AddClassBody from "../elements/AddClassBody";
import BackToTop from "../elements/BackToTop";
import Breadcrumb from "./Breadcrumb";
import MobileMenu from "./MobileMenu";
import Footer1 from "./footer/Footer1";
import Footer2 from "./footer/Footer2";
import Footer3 from "./footer/Footer3";
import Footer4 from "./footer/Footer4";
import Header1 from "./header/Header1";
import CustomCursor from "../elements/CustomCursor";

export default function Layout({
  headerStyle,
  footerStyle,
  headTitle,
  breadcrumbTitle,
  children,
  topBar,
  headerCls,
  logoWhite,
}) {
  const [scroll, setScroll] = useState(0);
  // Moblile Menu
  const [isMobileMenu, setMobileMenu] = useState(false);
  const handleMobileMenu = () => {
    setMobileMenu(!isMobileMenu);
    !isMobileMenu
      ? document.body.classList.add("mobile-menu-active")
      : document.body.classList.remove("mobile-menu-active");
  };

  useEffect(() => {
    const WOW = require("wowjs");
    window.wow = new WOW.WOW({
      live: false,
    });
    window.wow.init();

    document.addEventListener("scroll", () => {
      const scrollCheck = window.scrollY > 100;
      if (scrollCheck !== scroll) {
        setScroll(scrollCheck);
      }
    });
  }, []);
  return (
    <>
      <CustomCursor />
      <AddClassBody />
      <div className="body-overlay-1" onClick={handleMobileMenu} />

      {!headerStyle && (
        <Header1
          scroll={scroll}
          isMobileMenu={isMobileMenu}
          handleMobileMenu={handleMobileMenu}
          topBar={topBar}
          headerCls={headerCls}
        />
      )}
      {headerStyle == 1 ? (
        <Header1
          scroll={scroll}
          isMobileMenu={isMobileMenu}
          handleMobileMenu={handleMobileMenu}
          topBar={topBar}
          headerCls={headerCls}
          logoWhite={logoWhite}
        />
      ) : null}
      <MobileMenu
        isMobileMenu={isMobileMenu}
        handleMobileMenu={handleMobileMenu}
      />

      <main className="main">
        {breadcrumbTitle && <Breadcrumb breadcrumbTitle={breadcrumbTitle} />}

        {children}
      </main>

      {!footerStyle && <Footer1 />}
      {footerStyle == 1 ? <Footer1 /> : null}
      {footerStyle == 2 ? <Footer2 /> : null}
      {footerStyle == 3 ? <Footer3 /> : null}
      {footerStyle == 4 ? <Footer4 /> : null}

      <BackToTop />
    </>
  );
}
