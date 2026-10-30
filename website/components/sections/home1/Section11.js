"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import API from "@/utils/api"; // Adjust this import path to match your file structure

export default function Section11() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActive, setIsActive] = useState({
    status: false,
    key: 0, // Initialized cleanly for dynamic numeric or string ID tracking
  });

  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        const response = await API.get("/pages/homepage");
        if (response.data && response.data.success) {
          const fetchedFaqs = response.data.data.faqs || [];
          setFaqs(fetchedFaqs);
          
          // Automatically expand the first FAQ item if data exists
          if (fetchedFaqs.length > 0) {
            setIsActive({
              status: true,
              key: fetchedFaqs[0]._id,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching FAQ section data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqData();
  }, []);

  const handleClick = (key) => {
    if (isActive.key === key) {
      setIsActive({
        status: false,
        key: null,
      });
    } else {
      setIsActive({
        status: true,
        key,
      });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <section className="section-box box-faqs-3">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="box-faq-left">
                <Link className="btn btn-brand-4-sm" href="#">
                  Frequently Asked Questions
                </Link>
                <h2 className="heading-2 mb-20 mt-20">
                  Do you have any questions?
                </h2>
                <p className="text-lg neutral-700">
                  Below are the most common questions about Digikraft Social’s
                  services. For more in-depth guides, visit our Resources
                  Center. Still need help? Don’t hesitate to{" "}
                  <Link className="text-18-bold brand-1-1" href="/contact">
                    Contact us
                  </Link>
                </p>
              </div>
            </div>
            <div className="col-lg-7">
              <div
                className="accordion accordion-flush accordion-style-2"
                id="accordionFAQS"
              >
                {faqs.map((faq) => (
                  <div className="accordion-item" key={faq._id}>
                    <h2
                      className="accordion-header"
                      id={`heading-${faq._id}`}
                      onClick={() => handleClick(faq._id)}
                    >
                      <button
                        className={
                          isActive.key === faq._id
                            ? "accordion-button "
                            : "accordion-button collapsed"
                        }
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse-${faq._id}`}
                        aria-expanded={isActive.key === faq._id ? "true" : "false"}
                        aria-controls={`collapse-${faq._id}`}
                      >
                        {faq.question}
                      </button>
                    </h2>
                    <div
                      className={
                        isActive.key === faq._id
                          ? "accordion-collapse collapse show"
                          : "accordion-collapse collapse"
                      }
                      id={`collapse-${faq._id}`}
                      aria-labelledby={`heading-${faq._id}`}
                      data-bs-parent="#accordionFAQS"
                    >
                      <div className="accordion-body">
                        <p>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}