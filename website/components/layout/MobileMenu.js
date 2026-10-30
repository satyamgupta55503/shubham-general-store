"use client";
import Link from "next/link";
import { useState } from "react";
import { FaCalculator } from "react-icons/fa";
import { Button } from "@mui/material";
import GetQuoteDialog from "../elements/GetQuoteDialog";

export default function MobileMenu({ isMobileMenu, handleMobileMenu }) {
  const [isActive, setIsActive] = useState({
    status: false,
    key: "",
  });
  const [openQuoteDialog, setOpenQuoteDialog] = useState(false);
  const handleToggle = (key) => {
    if (isActive.key === key) {
      setIsActive({
        status: false,
      });
    } else {
      setIsActive({
        status: true,
        key,
      });
    }
  };

  return (
    <>
      <div
        className={`mobile-header-active mobile-header-wrapper-style perfect-scrollbar ${
          isMobileMenu ? "sidebar-visible" : ""
        }`}
      >
        <div className="mobile-header-wrapper-inner">
          <div
            className={`burger-icon burger-icon-white ${
              isMobileMenu ? "burger-close" : ""
            }`}
            onClick={handleMobileMenu}
          >
            <span className="burger-icon-top" />
            <span className="burger-icon-mid" />
            <span className="burger-icon-bottom" />
          </div>

          <div className="mobile-header-content-area">
            <div className="perfect-scroll">
              <div className="mobile-search mobile-header-border mb-30"></div>
              <div className="mobile-menu-wrap mobile-header-border">
                <nav>
                  <ul className="mobile-menu font-heading">
                    <li
                      className={
                        isActive.key === "about"
                          ? "has-children active"
                          : "has-children"
                      }
                    >
                      <span
                        className="menu-expand"
                        onClick={() => handleToggle("about")}
                      ></span>
                      <Link href="/about">About</Link>
                    </li>
                    <li
                      className={
                        isActive.key === "services"
                          ? "has-children active"
                          : "has-children"
                      }
                    >
                      <span
                        className="menu-expand"
                        onClick={() => handleToggle("services")}
                      ></span>
                      <Link href="/service">Services</Link>
                    </li>
                    <li
                      className={
                        isActive.key === "projects"
                          ? "has-children active"
                          : "has-children"
                      }
                    >
                      <span
                        className="menu-expand"
                        onClick={() => handleToggle("projects")}
                      ></span>
                      <Link href="/feature">Projects</Link>
                    </li>
                    <li
                      className={
                        isActive.key === "blog"
                          ? "has-children active"
                          : "has-children"
                      }
                    >
                      <span
                        className="menu-expand"
                        onClick={() => handleToggle("blog")}
                      ></span>
                      <Link href="/blog">Blog</Link>
                    </li>
                    <li
                      className={
                        isActive.key === "seo"
                          ? "has-children active"
                          : "has-children"
                      }
                    >
                      <span
                        className="menu-expand"
                        onClick={() => handleToggle("seo")}
                      ></span>
                      <Link href="/seo">Seo</Link>
                    </li>
                    <li
                      className={
                        isActive.key === "contact"
                          ? "has-children active"
                          : "has-children"
                      }
                    >
                      <span
                        className="menu-expand"
                        onClick={() => handleToggle("contact")}
                      ></span>
                      <Link href="/contact">Contact</Link>
                    </li>
                  </ul>
                </nav>
              </div>

              <div className="mobile-action-buttons mt-30">
                <Button
                  variant="contained"
                  startIcon={<FaCalculator />}
                  onClick={() => setOpenQuoteDialog(true)}
                  className="btn btn-brand-4-medium hover-up w-100 mb-10"
                  sx={{
                    backgroundColor: "#212B36",
                    color: "white",
                    textTransform: "none",
                  }}
                >
                  Get a Quote
                </Button>
              </div>
              <div className="mobile-social-icon mb-50">
                <h6 className="mb-25">Follow Us</h6>
                <Link
                  className="icon-socials icon-facebook"
                  href="https://www.facebook.com/digikraftsocial/"
                >
                  <img alt="Nivia" src="/assets/imgs/template/icons/fb.svg" />
                </Link>
                <Link
                  className="icon-socials icon-instagram"
                  href="https://www.instagram.com/digikraftsocial/?igsh=cWNham0yNzRqbWVj#"
                >
                  <img alt="Nivia" src="/assets/imgs/template/icons/ins.svg" />
                </Link>
                <Link
                  className="icon-socials icon-twitter"
                  href="https://x.com/DigikraftSocial"
                >
                  <img alt="Nivia" src="/assets/imgs/template/icons/tw.svg" />
                </Link>
                <Link
                  className="icon-socials icon-linkedin"
                  href="https://www.linkedin.com/company/digikraftsocial/"
                >
                  <img
                    alt="Nivia"
                    src="/assets/imgs/template/icons/LINKED.svg"
                  />
                </Link>
                <Link
                  className="icon-socials icon-be"
                  href="https://www.behance.net/digikraftsocial"
                >
                  <img alt="Nivia" src="/assets/imgs/template/icons/be.svg" />
                </Link>
              </div>
              <div className="site-copyright">
                Copyright © {new Date().getFullYear()} Digikraft Social.
              </div>
            </div>
          </div>
        </div>
      </div>
      <GetQuoteDialog
        isOpen={openQuoteDialog}
        onClose={() => setOpenQuoteDialog(false)}
      />
    </>
  );
}
