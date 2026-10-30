"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer1() {
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const res = await fetch("https://backend.digikraftsocial.com/api/pages/homepage");
        const json = await res.json();
        if (json.success && json.data && json.data.footer) {
          setFooterData(json.data.footer);
        }
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  // Helper function to auto-detect social media icons based on URL/Platform
  const getSocialIconDetails = (social) => {
    const linkStr = (social.link || "").toLowerCase();
    const platformStr = (social.platform || "").toLowerCase();
    const iconOverride = social.icon;

    if (linkStr.includes("facebook") || platformStr.includes("facebook")) {
      return { src: iconOverride || "/assets/imgs/template/icons/fb.svg", className: "icon-facebook" };
    }
    if (linkStr.includes("instagram") || platformStr.includes("instagram")) {
      return { src: iconOverride || "/assets/imgs/template/icons/in.svg", className: "icon-instagram" };
    }
    if (linkStr.includes("twitter") || linkStr.includes("x.com") || platformStr.includes("twitter")) {
      return { src: iconOverride || "/assets/imgs/template/icons/tw.svg", className: "icon-twitter" };
    }
    if (linkStr.includes("linkedin") || platformStr.includes("linkedin")) {
      return { src: iconOverride || "/assets/imgs/template/icons/LINKED.svg", className: "icon-linkedin", style: { width: "20px" } };
    }
    if (linkStr.includes("behance") || platformStr.includes("behance")) {
      return { src: iconOverride || "/assets/imgs/template/icons/be.svg", className: "icon-be" };
    }
    
    // Fallback if no match is found
    return { src: iconOverride || "/assets/imgs/template/icons/fb.svg", className: "icon-default" };
  };

  // Fallbacks while loading or if data is missing
  const logo = footerData?.logo || "/assets/imgs/template/logo.png";
  const address = footerData?.address || "Raipur, Chhattisgarh 492001";
  const operatingHours = footerData?.operatingHours || "Hours: 10:00 - 19:00, Mon - Sat";

  return (
    <>
      <footer className="footer footer-style-3 footer-style-5">
        <div className="container">
          <div className="row">
            {/* LOGO & ADDRESS SECTION */}
            <div className="col-md-6 col-sm-12 mb-30">
              <Link href="/">
                <img
                  alt="Company Logo"
                  src={logo}
                  style={{
                    width: "150px",
                    objectFit: "contain"
                  }}
                />
              </Link>
              <div className="mt-20 mb-20">
                <p className="text-md neutral-600 mb-10">
                  {address}
                </p>
                <p className="text-md neutral-600">
                  {operatingHours}
                </p>
              </div>
            </div>

            {/* QUICK LINKS SECTION */}
            <div className="col-md-6 col-sm-12">
              <div className="row">
                
                {/* About Links */}
                <div className="col-lg-3 col-md-6 mb-30">
                  <h5 className="neutral-0 mb-10 text-18-semibold neutral-0">
                    About
                  </h5>
                  <ul className="menu-footer">
                    {footerData?.aboutPages?.length > 0 ? (
                      footerData.aboutPages.map((page) => (
                        <li key={page._id || page.label}>
                          <Link href={page.link}>{page.label}</Link>
                        </li>
                      ))
                    ) : (
                      // Fallback content if empty
                      <>
                        <li><Link href="#">Company</Link></li>
                        <li><Link href="/careers">Careers</Link></li>
                        <li><Link href="/sitemap.xml">Sitemap</Link></li>
                        <li><Link href="#">Privacy Policy</Link></li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Services Links */}
                <div className="col-lg-3 col-md-6 mb-30">
                  <h5 className="neutral-0 mb-10 text-18-semibold neutral-0">
                    Services
                  </h5>
                  <ul className="menu-footer">
                    {footerData?.services?.length > 0 ? (
                      footerData.services.map((service) => (
                        <li key={service._id || service.label}>
                          <Link href={service.link}>{service.label}</Link>
                        </li>
                      ))
                    ) : (
                      // Fallback content if empty
                      <>
                        <li><Link href="/service">Branding & Creative Design</Link></li>
                        <li><Link href="/service">Web & App Development</Link></li>
                        <li><Link href="/service">Digital Marketing</Link></li>
                        <li><Link href="/service">Video & Animation</Link></li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Resource Links */}
                <div className="col-lg-3 col-md-6 mb-30">
                  <h5 className="neutral-0 mb-10 text-18-semibold neutral-0">
                    Resource
                  </h5>
                  <ul className="menu-footer">
                    {footerData?.resources?.length > 0 ? (
                      footerData.resources.map((resource) => (
                        <li key={resource._id || resource.label}>
                          <Link href={resource.link}>{resource.label}</Link>
                        </li>
                      ))
                    ) : (
                      <li><Link href="/blog">Our Blog</Link></li>
                    )}
                  </ul>
                </div>

                {/* Support Links */}
                <div className="col-lg-3 col-md-6 mb-30">
                  <h5 className="neutral-0 mb-10 text-18-semibold neutral-0">
                    Support
                  </h5>
                  <ul className="menu-footer">
                    {footerData?.support?.length > 0 ? (
                      footerData.support.map((supportItem) => (
                        <li key={supportItem._id || supportItem.label}>
                          <Link href={supportItem.link}>{supportItem.label}</Link>
                        </li>
                      ))
                    ) : (
                      <li><Link href="/contact">Contact Us</Link></li>
                    )}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* FOOTER BOTTOM */}
          <div className="footer-bottom mt-0">
            <div className="row align-items-end">
              <div className=" text-lg-end text-center">
                <div className="row align-items-end ">
                  <div className="col-md-6 mb-20">
                    <div className="text-center text-md-start">
                      <div className="text-start d-inline-block">
                        <p className="text-lg title-follow neutral-0">
                          Follow us
                        </p>
                        <div className="box-socials-footer">
                          {/* Dynamic Social Media Icons */}
                          {footerData?.socialMedia?.map((social, index) => {
                            if (!social.link) return null; // Skip if no link
                            const { src, className, style } = getSocialIconDetails(social);
                            
                            return (
                              <Link
                                key={social._id || index}
                                className={`icon-socials ${className}`}
                                href={social.link}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  alt={social.platform || "Social Media"}
                                  src={src}
                                  style={style || {}}
                                />
                              </Link>
                            );
                          })}
                        </div>
                        <p />
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-20">
                    <p className="text-sm neutral-600">
                      Copyright © {new Date().getFullYear()} <span><a href="/">Digikraft Social.</a></span>{" "}
                      All rights reserved.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}