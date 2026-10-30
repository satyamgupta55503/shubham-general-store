"use client";

import { useState } from "react";
import LogoTicker from "@/components/elements/LogoTicker";
import Layout from "@/components/layout/Layout";
import Team2Slider from "@/components/slider/Team2Slider";
import Link from "next/link";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: "error", message: "All fields are required." });
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/enquiry/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        setStatus({ type: "success", message: "Message sent successfully!" });
        setFormData({ name: "", email: "", message: "" });
      } else {
        const errorData = await response.json();
        setStatus({
          type: "error",
          message: errorData.message || "Failed to send message.",
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };

  return (
    <>
      <Layout
        headerStyle={1}
        footerStyle={1}
        headerCls="header-style-2 header-style-4"
      >
        <div>
          <section className="section-box box-content-contact">
            <div className="container">
              <div className="text-center contact-head">
                <span className="icon-1 shape-1" />
                <span className="icon-2 shape-2" />
                <span className="btn btn-brand-4-sm">Contact Us</span>
                <h2 className="heading-2 mb-20 mt-15">Get in Touch</h2>
                <div className="text-center">
                  <nav className="container-breadcrumb">
                    <ul className="breadcrumb">
                      <li className="breadcrumb-item">
                        <Link href="#">Home</Link>
                      </li>
                      <li
                        className="breadcrumb-item active"
                        aria-current="page"
                      >
                        Contact Us
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
              <div className="box-border-rounded">
                <div className="row align-items-center">
                  <div className="col-lg-6">
                    <Link className="btn btn-brand-4-sm" href="#">
                      Contact Us
                    </Link>
                    <h3 className="mb-20 mt-20">
                      To make requests for further information, contact us via
                      our social channels.
                    </h3>
                    <p className="text-md neutral-700">
                      Contact us below and we will get back to you shortly.
                    </p>
                    <div className="row mt-50">
                      <div className="col-lg-12">
                        <div className="card-feature-2">
                          <div className="card-image">
                            <img src="/assets/imgs/page/homepage3/marketing.svg" alt="marketing" />
                          </div>
                          <div className="card-info">
                            <h3 className="text-22-bold">Address</h3>
                            <p className="text-md neutral-700">
                              Raipur, Chhattisgarh 492001
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="card-feature-2">
                          <div className="card-image">
                            <img src="/assets/imgs/page/homepage3/digital.svg" alt="digital" />
                          </div>
                          <div className="card-info">
                            <h3 className="text-22-bold">Phone</h3>
                            <div className="text-md neutral-700">
                              <div className="row">
                                <div className="col-sm-6">
                                  <Link href="tel:+919302279701">
                                    +91 93022 79701
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="card-feature-2">
                          <div className="card-image">
                            <img src="/assets/imgs/page/homepage3/digital.svg" alt="digital" />
                          </div>
                          <div className="card-info">
                            <h3 className="text-22-bold">Email</h3>
                            <div className="text-md neutral-700">
                              <div className="row">
                                <div className="col-sm-6">
                                  <Link
                                    className="neutral-700"
                                    href="mailto:admin@subhamstore.com"
                                  >
                                    info@localhost:5000
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 text-center">
                    <img src="/assets/imgs/page/contact/img-contact.png" alt="contact" />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section-box box-get-touch-section box-contact-form">
            <div className="container">
              <div className="row">
                <div className="col-lg-6 mb-30">
                  <div className="block-map">
                    <div className="box-map">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3718.9052256727678!2d81.63230057531767!3d21.235606480465957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a28c31c51bc9339%3A0x19ebca00c54c85a6!2sRaipur%2C%20Chhattisgarh!5e0!3m2!1sen!2sin!4v1747739479550!5m2!1sen!2sin"
                        width="600"
                        height="450"
                        style={{ border: 0 }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                    </div>
                    <p className="text-md neutral-600 text-center">
                      Hours: 10:00 - 19:00, Mon - Sat
                    </p>
                  </div>
                </div>
                <div className="col-lg-6 mb-30">
                  <Link className="btn btn-brand-4-sm" href="#">
                    Contact Us
                  </Link>
                  <h2 className="mb-20 mt-20">Get in Touch</h2>
                  <p className="text-md neutral-700">
                    Contact us below and we will get back to you shortly.
                  </p>
                  <div className="block-form-contact mt-45">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Your Name *</label>
                        <input
                          className="form-control"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Name"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email">Your Email *</label>
                        <input
                          className="form-control"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@website.com"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="message">Message *</label>
                        <textarea
                          className="form-control"
                          rows={7}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="How can we help you?"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <button
                          className="btn btn-black btn-rounded"
                          type="submit"
                        >
                          Send Message
                          <svg
                            width={22}
                            height={8}
                            viewBox="0 0 22 8"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M22 3.99934L18.4791 0.478516V3.30642H0V4.69236H18.4791V7.52031L22 3.99934Z"
                              fill="currentColor"
                             />
                          </svg>
                        </button>
                      </div>
                      {status && (
                        <div
                          className={`mt-3 text-${
                            status.type === "success" ? "success" : "danger"
                          }`}
                        >
                          {status.message}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section-box wow animate__animated animate__fadeIn box-logos-4">
            <div className="container">
              <div
                className="carouselTickerLogos2 carouselTicker_vertical"
                id="slide-logos"
              >
                <LogoTicker />
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}
