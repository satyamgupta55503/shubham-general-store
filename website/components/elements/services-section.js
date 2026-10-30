"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ServicesSection() {
  // Define 12 services with placeholder image paths
  const services = [
    {
      name: "UI/UX design",
      images: [
        "https://placehold.co/128x128/png?text=UI%2FUX+Design+Image",
        "https://placehold.co/128x128/png?text=UI%2FUX+Design+Image+2",
      ],
    },
    {
      name: "React.js Development",
      images: [
        "https://placehold.co/128x128/png?text=React.js+Development",
        "https://placehold.co/128x128/png?text=React.js+Development+2",
      ],
    },
    {
      name: "Digital Marketing",
      images: [
        "https://placehold.co/128x128/png?text=Digital+Marketing",
        "https://placehold.co/128x128/png?text=Digital+Marketing+2",
      ],
    },
    {
      name: "Technology",
      images: [
        "https://placehold.co/128x128/png?text=Technology",
        "https://placehold.co/128x128/png?text=Technology+2",
      ],
    },
    {
      name: "Web Development",
      images: [
        "https://placehold.co/128x128/png?text=Web+Development",
        "https://placehold.co/128x128/png?text=Web+Development+2",
      ],
    },
    {
      name: "Mobile App Development",
      images: [
        "https://placehold.co/128x128/png?text=Mobile+App+Development",
        "https://placehold.co/128x128/png?text=Mobile+App+Development+2",
      ],
    },
    {
      name: "SEO Optimization",
      images: [
        "https://placehold.co/128x128/png?text=SEO+Optimization",
        "https://placehold.co/128x128/png?text=SEO+Optimization+2",
      ],
    },
    {
      name: "Cloud Solutions",
      images: [
        "https://placehold.co/128x128/png?text=Cloud+Solutions",
        "https://placehold.co/128x128/png?text=Cloud+Solutions+2",
      ],
    },
    {
      name: "Graphic Design",
      images: [
        "https://placehold.co/128x128/png?text=Graphic+Design",
        "https://placehold.co/128x128/png?text=Graphic+Design+2",
      ],
    },
    {
      name: "Cybersecurity",
      images: [
        "https://placehold.co/128x128/png?text=Cybersecurity",
        "https://placehold.co/128x128/png?text=Cybersecurity+2",
      ],
    },
    {
      name: "Data Analytics",
      images: [
        "https://placehold.co/128x128/png?text=Data+Analytics",
        "https://placehold.co/128x128/png?text=Data+Analytics+2",
      ],
    },
    {
      name: "AI Solutions",
      images: [
        "https://placehold.co/128x128/png?text=AI+Solutions",
        "https://placehold.co/128x128/png?text=AI+Solutions+2",
      ],
    },
  ];

  // Group services into sets of 4 for the main carousel
  const groupedServices = [];
  for (let i = 0; i < services.length; i += 4) {
    groupedServices.push(services.slice(i, i + 4));
  }

  return (
    <>
      <section className="container mx-auto px-3 py-5 d-flex flex-column flex-md-row align-items-md-start justify-content-md-between gap-5 bg-dark text-white">
        <div className="flex-md-1 max-w-xs max-md-w-none">
          <p className="text-secondary mb-2 small fw-semibold">
            What Can We Do
          </p>
          <h2 className="text-white fw-bolder display-4 mb-4">
            Services we can
            <br />
            help you with
          </h2>
          <Link
            href="/services"
            className="text-white small fw-semibold d-flex align-items-center gap-1 text-decoration-none"
            aria-label="See All Services"
          >
            See All Services <i className="fas fa-arrow-right small"></i>
          </Link>
        </div>

        {/* Main Swiper carousel to cycle through services, 4 at a time */}
        <div className="flex-md-1 position-relative w-100 max-w-md h-280px md-h-320px">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            loop={true}
            className="main-swiper"
          >
            {groupedServices.map((group, groupIndex) => (
              <SwiperSlide key={groupIndex}>
                <div className="position-relative w-100 h-280px md-h-320px d-grid grid-cols-2 md-grid-cols-3 gap-4 md-gap-5">
                  {group.map((service, index) => {
                    // Define positions for each service card based on index
                    const positions = [
                      "top-0 start-50 translate-middle-x", // Top center
                      "top-0 end-0", // Top right
                      "bottom-0 start-0", // Bottom left
                      "bottom-0 end-5", // Bottom center-right (adjusted for Bootstrap)
                    ];
                    const positionClass = positions[index % 4];

                    return (
                      <div
                        key={index}
                        className={`position-absolute ${positionClass} rounded-3 overflow-hidden w-28 h-28 md-w-32 md-h-32`}
                      >
                        {/* Nested Swiper carousel for each service's images */}
                        <Swiper
                          modules={[Autoplay]}
                          spaceBetween={0}
                          slidesPerView={1}
                          autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                          }}
                          loop={true}
                          className="nested-swiper"
                        >
                          {service.images.map((image, imgIndex) => (
                            <SwiperSlide key={imgIndex}>
                              <Image
                                alt={`${service.name} image ${imgIndex + 1}`}
                                className="w-100 h-100 object-fit-cover"
                                src={image}
                                width={128}
                                height={128}
                              />
                            </SwiperSlide>
                          ))}
                        </Swiper>
                        <span className="position-absolute top-0 start-0 mt-3 ms-3 w-3 h-3 bg-danger rounded-circle"></span>
                        <p className="position-absolute bottom-0 start-0 mb-3 ms-3 text-white fw-semibold small">
                          {service.name.split(" ").map((word, i) => (
                            <span key={i}>
                              {word}
                              {i < service.name.split(" ").length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Include Bootstrap CSS, Font Awesome, and custom styles */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap");

        body {
          font-family: "Inter", sans-serif;
        }

        .bg-dark {
          background-color: #121212 !important;
        }

        .container {
          max-width: 1280px;
        }

        .flex-md-1 {
          flex: 1;
        }

        .max-w-xs {
          max-width: 320px;
        }

        .max-md-w-none {
          max-width: none;
        }

        .max-w-md {
          max-width: 448px;
        }

        .h-280px {
          height: 280px;
        }

        .md-h-320px {
          height: 320px;
        }

        .d-grid {
          display: grid !important;
        }

        .grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .md-grid-cols-3 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .gap-4 {
          gap: 1.5rem;
        }

        .md-gap-5 {
          gap: 2rem;
        }

        .w-28 {
          width: 112px;
        }

        .h-28 {
          height: 112px;
        }

        .md-w-32 {
          width: 128px;
        }

        .md-h-32 {
          height: 128px;
        }

        .w-3 {
          width: 12px;
        }

        .h-3 {
          height: 12px;
        }

        .small {
          font-size: 0.75rem;
��

        .display-4 {
          font-size: 2.25rem;
          line-height: 1.2;
        }

        .fw-semibold {
          font-weight: 600 !important;
        }

        .fw-bolder {
          font-weight: 800 !important;
        }

        .gap-1 {
          gap: 0.25rem;
        }

        .gap-5 {
          gap: 3rem;
        }

        .rounded-3 {
          border-radius: 0.5rem !important;
        }

        .main-swiper {
          padding-bottom: 40px;
        }

        .swiper-pagination {
          bottom: 0 !important;
        }

        .swiper-pagination-bullet {
          background: #666;
          opacity: 1;
          width: 10px;
          height: 10px;
        }

        .swiper-pagination-bullet-active {
          background: #fff;
        }

        .swiper-button-prev,
        .swiper-button-next {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          color: #fff;
          transition: background 0.3s;
        }

        .swiper-button-prev:hover,
        .swiper-button-next:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .swiper-button-prev:after,
        .swiper-button-next:after {
          font-size: 20px;
        }

        .nested-swiper,
        .nested-swiper .swiper-wrapper {
          width: 100%;
          height: 100%;
          border-radius: 0.5rem;
        }

        .nested-swiper .swiper-slide {
          width: 100%;
          height: 100%;
        }

        @media (max-width: 768px) {
          .max-w-xs {
            max-width: none;
          }

          .display-4 {
            font-size: 1.875rem;
          }
        }
      `}</style>
    </>
  );
}
