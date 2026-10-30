"use client";
import Layout from "@/components/layout/Layout";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Portfolio from "../portfolio/page";

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  spaceBetween: 30,
  slidesPerView: 2,
  spaceBetween: 30,
  slidesPerGroup: 1,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next-testimonials",
    prevEl: ".swiper-button-prev-testimonials",
  },
  autoplay: {
    delay: 10000,
  },
  breakpoints: {
    1199: {
      slidesPerView: 2,
    },
    1000: {
      slidesPerView: 1,
    },
    400: {
      slidesPerView: 1,
    },
    350: {
      slidesPerView: 1,
    },
  },
};
export default function Feature() {
  return (
    <>
      <Layout
        headerStyle={1}
        footerStyle={1}
        headerCls="header-style-2 header-style-4"
      >
        <div>
          <Portfolio />
        </div>
      </Layout>
    </>
  );
}
