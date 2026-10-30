'use client'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 30,
    slidesPerView: 2,
    spaceBetween: 30,
    slidesPerGroup: 1,
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next-testimonials",
        prevEl: ".swiper-button-prev-testimonials"
    },
    autoplay: {
        delay: 10000
    },
    breakpoints: {
        1199: {
            slidesPerView: 2
        },
        1000: {
            slidesPerView: 1
        },
        400: {
            slidesPerView: 1
        },
        350: {
            slidesPerView: 1
        }
    },
}

export default function Section11() {
    return (
        <>

            <section className="section-box box-testimonials-2">
                <div className="container"><span className="btn btn-bg-linear-2 mb-25"><span>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.0532 15.1551L12.3032 1.65509C12.2684 1.60707 12.2228 1.56797 12.17 1.54102C12.1172 1.51406 12.0587 1.5 11.9994 1.5C11.9402 1.5 11.8817 1.51406 11.8289 1.54102C11.7761 1.56797 11.7305 1.60707 11.6957 1.65509L1.9457 15.1551C1.91663 15.1955 1.89588 15.2412 1.88466 15.2897C1.87344 15.3381 1.87198 15.3883 1.88035 15.4374C1.88873 15.4864 1.90678 15.5333 1.93345 15.5753C1.96012 15.6173 1.99487 15.6535 2.0357 15.682L11.7857 22.432C11.8485 22.4755 11.923 22.4988 11.9994 22.4988C12.0758 22.4988 12.1504 22.4755 12.2132 22.432L21.9632 15.682C22.004 15.6535 22.0388 15.6173 22.0654 15.5753C22.0921 15.5333 22.1102 15.4864 22.1185 15.4374C22.1269 15.3883 22.1254 15.3381 22.1142 15.2897C22.103 15.2412 22.0823 15.1955 22.0532 15.1551ZM11.9994 15.6445L8.6882 12.9951L11.9994 3.05946L15.3107 12.997L11.9994 15.6445ZM7.94945 12.832L3.22257 14.6676L10.8744 4.08134L7.94945 12.832ZM8.18382 13.5463L11.6244 16.312V21.4157L3.11195 15.5151L8.18382 13.5463ZM12.3744 16.312L15.8169 13.5501L20.9469 15.4738L12.3744 21.4082V16.312ZM16.0494 12.8432L13.1244 4.08134L20.7126 14.5813L16.0494 12.8432Z" fill="true" />
                    </svg></span> Testimonials</span>
                    <div className="row align-items-end mb-105">
                        <div className="col-md-9 mb-30">
                            <h3 className="heading-2">What our customers are saying</h3>
                        </div>
                        <div className="col-md-3 mb-30">
                            <div className="box-button-slider">
                                <div className="swiper-button-prev swiper-button-prev-testimonials">
                                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.66667 3.33398L2 8.00065M2 8.00065L6.66667 12.6673M2 8.00065H14" stroke="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        </path>
                                    </svg>
                                </div>
                                <div className="swiper-button-next swiper-button-next-testimonials">
                                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.33333 3.33398L14 8.00065M14 8.00065L9.33333 12.6673M14 8.00065H2" stroke="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="box-swiper-padding">
                    <div className="box-swiper">
                        <div className="swiper-container swiper-group-testimonials">
                            <Swiper {...swiperOptions} className="swiper-wrapper pb-70 pt-5">
                                <SwiperSlide>
                                    <div className="card-testimonial-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage5/review1.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <div className="card-logo"><img src="/assets/imgs/page/homepage5/minty.png" alt="Nivia" /></div>
                                            <div className="card-comment">
                                                <p className="text-md neutral-700">“Discover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition Discover
                                                    what sets this apart as the market's easiest and most powerful
                                                    video interviewing platform, and why hiring managers consistently choose
                                                    us over the competitionDiscover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition”
                                                </p>
                                            </div>
                                            <div className="card-author">
                                                <div className="author-info">
                                                    <h6>Alexander Hall</h6>
                                                    <p className="text-lg neutral-600">Master Trainer</p>
                                                </div>
                                                <div className="card-rates"><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage5/review2.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <div className="card-logo"><img src="/assets/imgs/page/homepage5/minty.png" alt="Nivia" /></div>
                                            <div className="card-comment">
                                                <p className="text-md neutral-700">“Discover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition Discover
                                                    what sets this apart as the market's easiest and most powerful
                                                    video interviewing platform, and why hiring managers consistently choose
                                                    us over the competitionDiscover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition”
                                                </p>
                                            </div>
                                            <div className="card-author">
                                                <div className="author-info">
                                                    <h6>Foysal Khan</h6>
                                                    <p className="text-lg neutral-600">Master Trainer</p>
                                                </div>
                                                <div className="card-rates"><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage5/review1.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <div className="card-logo"><img src="/assets/imgs/page/homepage5/minty.png" alt="Nivia" /></div>
                                            <div className="card-comment">
                                                <p className="text-md neutral-700">“Discover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition Discover
                                                    what sets this apart as the market's easiest and most powerful
                                                    video interviewing platform, and why hiring managers consistently choose
                                                    us over the competitionDiscover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition”
                                                </p>
                                            </div>
                                            <div className="card-author">
                                                <div className="author-info">
                                                    <h6>Alexander Hall</h6>
                                                    <p className="text-lg neutral-600">Master Trainer</p>
                                                </div>
                                                <div className="card-rates"><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage5/review2.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <div className="card-logo"><img src="/assets/imgs/page/homepage5/minty.png" alt="Nivia" /></div>
                                            <div className="card-comment">
                                                <p className="text-md neutral-700">“Discover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition Discover
                                                    what sets this apart as the market's easiest and most powerful
                                                    video interviewing platform, and why hiring managers consistently choose
                                                    us over the competitionDiscover what sets this apart as the
                                                    market's easiest and most powerful video interviewing platform, and
                                                    why hiring managers consistently choose us over the competition”
                                                </p>
                                            </div>
                                            <div className="card-author">
                                                <div className="author-info">
                                                    <h6>Foysal Khan</h6>
                                                    <p className="text-lg neutral-600">Master Trainer</p>
                                                </div>
                                                <div className="card-rates"><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /><img src="/assets/imgs/page/homepage5/star-sm.svg" alt="Nivia" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
