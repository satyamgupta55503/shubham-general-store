"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import API from "@/utils/api"; 

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  spaceBetween: 30,
  slidesPerView: 1,
  slidesPerGroup: 1,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 2300,
  },
  speed: 1000,
};

export default function Section12() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonialData = async () => {
      try {
        const response = await API.get("/pages/homepage");
        if (response.data && response.data.success) {
          setTestimonials(response.data.data.testimonials || []);
        }
      } catch (error) {
        console.error("Error fetching testimonials section data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonialData();
  }, []);

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <>
      <section className="section-box wow animate__animated animate__fadeIn box-testimonials-3">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 mb-30">
              <img
                src="/assets/imgs/page/homepage1/img-testimonial.png"
                alt="Nivia"
              />
            </div>
            <div className="col-lg-6 mb-30">
              <div className="row align-items-end">
                <div className="col-lg-8 mb-50">
                  <Link className="btn btn-brand-4-sm" href="#">
                    Testimonials
                  </Link>
                  <h3 className="mt-20 neutral-0">
                    Here’s Why Our Customers Love Us
                  </h3>
                </div>
              </div>
              <div className="box-swiper mt-30">
                <div className="swiper-container swiper-group-1">
                  <Swiper {...swiperOptions}>
                    {testimonials.map((item) => (
                      <SwiperSlide key={item._id}>
                        <div className="card-testimonial-3">
                          <div className="card-image">
                            <img
                              src={item.photo}
                              alt={item.clientName}
                            />
                          </div>
                          <div className="card-info">
                            <p className="text-md neutral-500">
                              {item.quote}
                            </p>
                            <div className="card-author-review">
                              <div className="card-author-info">
                                <span className="author-name">{item.clientName}</span>
                                <span className="author-tag">
                                  {item.designation}
                                </span>
                              </div>
                              <div className="card-rate">
                                {/* Dynamically rendering SVG stars depending on ratings value */}
                                {Array.from({ length: item.ratings || 5 }).map((_, index) => (
                                  <img
                                    key={index}
                                    src="/assets/imgs/page/homepage1/star.svg"
                                    alt="star"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}