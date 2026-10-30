"use client";

import { useRef, useEffect, useState } from "react";

export default function Section4() {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;
    let speed = 100; // pixels per frame

    const scroll = () => {
      if (
        container.scrollLeft >=
        container.scrollWidth - container.clientWidth
      ) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += speed;
      }

      // Update active indicator
      const maxScroll = container.scrollWidth - container.clientWidth;
      const index = Math.min(
        7,
        Math.floor((container.scrollLeft / maxScroll) * 8)
      );
      setActiveIndex(index);

      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const cards = [
    {
      title: "Quotation Management Software",
      description:
        "Create, edit, and manage professional quotations with ease—complete with version history, previews, and powerful customer/product management tools.",
      image: "/assets/imgs/page/homepage3/acegranite.png",
    },
    {
      title: "A for Avocado : Avocado Oil That Elevates",
      description:
        "Enjoy pure, premium avocado oil made for both flavor and wellness—ideal for cooking, dressing, or daily nourishment, with unmatched freshness and quality.",
      image: "/assets/imgs/page/homepage3/avocado.png",
    },
    {
      title: "MotoPlatform : Vehicle Buying & Selling Platform",
      description:
        "Buy, sell, and manage vehicles with ease—cars, bikes, or commercial. A trusted platform connecting buyers, sellers, and associates seamlessly.",
      image: "/assets/imgs/page/homepage3/motoweb.png",
    },
    {
      title: "Fruera – Farm-to-Table Fruit Delivery",
      description:
        "Revolutionizing fruit delivery through a sustainable supply chain—connecting farms directly to consumers with fresher, healthier, and waste-free produce.",
      image: "/assets/imgs/page/homepage3/fruera.png",
    },
    {
      title: " Smart Attendance App - Tap & Track Attendance",
      description:
        "Mark attendance easily within office proximity with location verification and integrated leave & salary management.",
      image: "/assets/imgs/page/homepage3/attendance.png",
    },
    {
      title: "Optom: The Ultimate eCommerce Hub",
      description:
        "Manage your entire online marketplace effortlessly with Optom’s seamless multi-vendor features and integrated billing system.",
      image: "/assets/imgs/page/homepage3/optom.png",
    },
    {
      title: "Protestin: Smart Admission & Exam App",
      description:
        "Easily apply to multiple universities and colleges with secure online exams.Advanced proctoring and image capture keep your admissions process safe and fair.",
      image: "/assets/imgs/page/homepage3/potestime.png",
    },
    {
      title: "QuickCart - Fresh Groceries at Your Doorstep ",
      description:
        "Shop your groceries with ease and speed. FreshCart delivers fresh produce and essentials right to your doorstep.",
      image: "/assets/imgs/page/homepage3/grocery.png",
    },
  ];

  return (
    <section className="section-box py-5">
      <div className="container">
        <div className="text-center">
          <h2 className="mb-3">
            Showcasing Success
            <br className="d-none d-lg-block" />
            Turning Ideas Into Digital Impact
          </h2>
          <p className="text-lg neutral-700">
            Explore how Digikraft Social transforms ideas into powerful digital
            <br />
            solutions that drive real results and business growth.
          </p>
        </div>

        <div className="mt-5 position-relative">
          <div
            ref={scrollContainerRef}
            className="d-flex overflow-hidden py-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
            }}
          >
            <div
              className="d-flex"
              style={{ width: "max-content", gap: "1rem", padding: "0 1rem" }}
            >
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="card-preparing"
                  style={{ width: "380px", flexShrink: 0 }}
                >
                  <div className="card-image">
                    <img
                      className="mx-auto"
                      src={card.image}
                      alt={`Nivia - ${card.title}`}
                    />
                  </div>
                  <div className="card-info">
                    <h5>{card.title}</h5>
                    <p className="text-lg neutral-700 w-85 mx-auto">
                      {card.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div
            className="d-flex justify-content-center mt-4"
            style={{ gap: "0.5rem" }}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-circle transition-all"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor:
                    index === activeIndex ? "#0d6efd" : "#dee2e6",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
}
