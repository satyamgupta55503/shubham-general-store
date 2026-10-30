"use client";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

// Blog array (replace with API-fetched data later)
const blogPosts = [
  {
    id: 1,
    title: "Struggling to Get Customers to Find Your Business?",
    description:
      "If your business isn’t showing up in local searches, you’re losing potential customers every day. When people search for what you offer, are they finding your competitors instead of you? That’s a common problem for local businesses! But don’t worry – we’ve got the solution.",
    image: "/assets/imgs/page/homepage1/img-news.png",
    url: "/blog/1",
  },
  {
    id: 2,
    title: "Why Premium Logos Matter for Your Brand",
    description:
      "A strong logo sets your brand apart and builds trust. Learn how our design team creates logos that resonate with your audience and boost your business.",
    image: "/assets/imgs/page/homepage1/img-news2.png",
    url: "/blog-post/premium-logos-matter",
  },
  {
    id: 3,
    title: "How Startups Can Improve Their Chances of Getting Financing",
    description:
      "Startups face tough competition for funding. Discover practical strategies to optimize your digital presence and attract investors with our proven methods.",
    image: "/assets/imgs/page/homepage1/img-news3.png",
    url: "/blog-post/startup-financing-tips",
  },
  {
    id: 4,
    title: "Boost Your Business with SEO and SMM",
    description:
      "Combine SEO and social media marketing to drive traffic and conversions. Our integrated approach ensures your brand reaches the right audience.",
    image: "/assets/imgs/page/homepage1/img-news.png",
    url: "/blog-post/seo-smm-strategies",
  },
];

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  spaceBetween: 30,
  slidesPerView: 3,
  slidesPerGroup: 1,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next-3",
    prevEl: ".swiper-button-prev-3",
  },
  autoplay: {
    delay: 10000,
  },
  breakpoints: {
    1199: {
      slidesPerView: 3,
    },
    800: {
      slidesPerView: 2,
    },
    400: {
      slidesPerView: 1,
    },
    250: {
      slidesPerView: 1,
    },
  },
};

export default function NewsSlider() {
  return (
    <div className="swiper-container swiper-group-3">
      <Swiper {...swiperOptions}>
        {blogPosts.map((post) => (
          <SwiperSlide key={post.id}>
            <div className="card-news">
              <div className="card-image">
                <Link href={post.url}>
                  <img src={post.image} alt="DigiKraft Social" />
                </Link>
              </div>
              <div className="card-info">
                <Link className="heading-4" href={post.url}>
                  {post.title}
                </Link>
                <p className="text-md neutral-700 mt-15 mb-35">
                  {post.description}
                </p>
                <Link className="btn btn-learmore-2" href={post.url}>
                  <span>
                    <svg
                      width={13}
                      height={13}
                      viewBox="0 0 13 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_24_999)">
                        <path
                          d="M10.6557 3.81393L1.71996 12.7497L0.251953 11.2817L9.18664 2.34592H1.31195V0.269531H12.7321V11.6897H10.6557V3.81393Z"
                          fill="#191919"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_24_999">
                          <rect width={13} height={13} fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  Learn More
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
