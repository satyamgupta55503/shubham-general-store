"use client";
import Link from "next/link";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  spaceBetween: 30,
  slidesPerView: 1,
  spaceBetween: 30,
  slidesPerGroup: 1,
  loop: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  autoplay: {
    delay: 10000,
  },
};

export default function Section8() {
  return (
    <>
      <section className="section-box wow animate__animated animate__fadeIn box-discover">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-30">
              <div className="box-image-neutral-1000">
                <img
                  src="/assets/imgs/page/homepage1/img-discover.png"
                  alt="Nivia"
                />
              </div>
            </div>
            <div className="col-lg-6 mb-30">
              <h2>Hear What Our Clients Say About Digikraft Social</h2>
              <p className="text-lg neutral-500">
                Discover how Digikraft Social has empowered businesses of all
                sizes to achieve remarkable growth, streamline their digital
                presence, and create lasting impact through innovative
                strategies and personalized service.
              </p>
              {/* <div className="box-buttons-feature-4">
                <Link className="btn btn-brand-4-medium mr-20" href="#">
                  Subscribe
                  <svg
                    width={22}
                    height={8}
                    viewBox="0 0 22 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22 3.99934L18.4791 0.478516V3.30642H0V4.69236H18.4791V7.52031L22 3.99934Z"
                      fill="true"
                    />
                  </svg>
                </Link>
                <Link className="btn btn-learmore-2" href="#">
                  <span>
                    <svg
                      width={39}
                      height={38}
                      viewBox="0 0 39 38"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="0.5"
                        width={38}
                        height={38}
                        rx={19}
                        fill="#191919"
                      />
                      <g clipPath="url(#clip0_1_376)">
                        <path
                          d="M24.1537 16.8139L15.218 25.7497L13.75 24.2817L22.6847 15.3459H14.81V13.2695H26.2301V24.6897H24.1537V16.8139Z"
                          fill="#C5FF55"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_1_376">
                          <rect
                            width={13}
                            height={13}
                            fill="white"
                            transform="translate(13.5 13)"
                          />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  Learn More
                </Link>
              </div> */}
              <div className="box-reviews-home5">
                <div className="box-swiper">
                  <div className="swiper-container swiper-group-1">
                    <Swiper {...swiperOptions}>
                      <SwiperSlide>
                        <div className="item-review-discover">
                          <p className="text-lg">
                            DigiKraft Social exceeded our expectations by
                            delivering a website that is not only visually
                            stunning but also incredibly functional. Since the
                            redesign, our customer engagement and inquiries have
                            surged. Their unparalleled expertise and meticulous
                            attention to detail have truly elevated our online
                            presence. We couldn't be happier with the results
                            and highly recommend their services!
                          </p>
                          <div className="box-author-review">
                            <div className="box-author">
                              <Link href="#">
                                <img
                                  src="/assets/imgs/page/homepage1/author.png"
                                  alt="Nivia"
                                />
                              </Link>
                              <div className="author-info">
                                <Link href="#">
                                  <span className="author-name">
                                    Karan Jain
                                  </span>
                                </Link>
                                <span className="text-sm color-600 department">
                                  TULSI PROVISION
                                </span>
                              </div>
                            </div>
                            <div className="author-brand">
                              <Link href="#">
                                <img
                                  src="/assets/imgs/page/homepage3/tulsi.png"
                                  alt="Nivia"
                                />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                      <SwiperSlide>
                        <div className="item-review-discover">
                          <p className="text-lg">
                            DigiKraft Social exceeded our expectations by
                            delivering a website that is not only visually
                            stunning but also incredibly functional. Since the
                            redesign, our customer engagement and inquiries have
                            surged. Their unparalleled expertise and meticulous
                            attention to detail have truly elevated our online
                            presence. We couldn't be happier with the results
                            and highly recommend their services! Karan Jain
                            TULSI PROVISION Digikraft Social exceeded our
                            expectations with their creative designs and good
                            work ethic. They consistently deliver high-quality
                            work on time, often going above and beyond the
                            original scope. I highly recommend Digikraft Social
                            for their marketing and graphic design services
                          </p>
                          <div className="box-author-review">
                            <div className="box-author">
                              <Link href="#">
                                <img
                                  src="/assets/imgs/page/homepage1/author.png"
                                  alt="Nivia"
                                />
                              </Link>
                              <div className="author-info">
                                <Link href="#">
                                  <span className="author-name">
                                    Md. Shabab Qureshi
                                  </span>
                                </Link>
                                <span className="text-sm color-600 department">
                                  Founder Terminator Cricket Academy
                                </span>
                              </div>
                            </div>
                            <div className="author-brand">
                              <Link href="#">
                                <img
                                  src="/assets/imgs/page/homepage3/tca.png"
                                  alt="Nivia"
                                />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    </Swiper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
