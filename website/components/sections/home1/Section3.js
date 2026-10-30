"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
// Import your Axios API instance
import API from "@/utils/api"; // Adjust this path to point to your Axios configuration file

export default function Section3() {
  const [servicesSection, setServicesSection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const response = await API.get("/pages/homepage");
        if (response.data && response.data.success) {
          setServicesSection(response.data.data.servicesSection);
        }
      } catch (error) {
        console.error("Error fetching services section data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicesData();
  }, []);

  if (loading) {
    return null;
  }

  // Fallback structural dictionary for text-based keys to point back to image templates
  const getIconAsset = (icon) => {
    if (!icon) return "/assets/imgs/page/homepage1/service1.png";
    
    // Check if the database field is already a complete web URL path string
    if (icon.startsWith("http://") || icon.startsWith("https://")) {
      return icon;
    }

    // Otherwise, route standard text strings into matching project local images
    const localizedFallbackImages = {
      Code: "/assets/imgs/page/homepage1/webapp.png",
      Cpu: "/assets/imgs/page/homepage1/service2.png",
      Megaphone: "/assets/imgs/page/homepage1/service3.png",
    };

    return localizedFallbackImages[icon] || "/assets/imgs/page/homepage1/service1.png";
  };

  const cards = servicesSection?.cards || [];

  return (
    <section
      className="section-box wow animate__animated animate__fadeIn box-preparing-2"
      style={{
        marginBottom: "80px",
      }}
    >
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="mb-15">
            {servicesSection?.heading || "Our Service Categories"}
            <br className="d-none d-lg-block" />
            {servicesSection?.description || "We Deliver Excellence in Every Domain"}
          </h2>
          <p className="text-lg neutral-700">
            Digikraft offers innovative and scalable digital solutions
            <br />
            tailored to your brand’s growth journey.
          </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          // pagination={{ clickable: true }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          loop={true}
        >
          {cards.map((service, index) => (
            <SwiperSlide key={service._id || index}>
              <div
                className="card-preparing text-center"
                onClick={() => {
                  window.location.href = "./service";
                }}
              >
                <div className="card-image">
                  <img
                    className="wow fadeInUp"
                    src={getIconAsset(service.icon)}
                    alt="Nivia"
                  />
                </div>
                <div className="card-info">
                  <h5>{service.heading}</h5>
                  <p className="text-lg neutral-700 w-85 mx-auto">
                    {service.description}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}