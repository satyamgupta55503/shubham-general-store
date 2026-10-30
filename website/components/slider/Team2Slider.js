'use client'
import Link from 'next/link'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 30,
    slidesPerView: 4,
    spaceBetween: 30,
    slidesPerGroup: 2,
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
    },
    autoplay: {
        delay: 10000
    },
    breakpoints: {
        1199: {
            slidesPerView: 4
        },
        800: {
            slidesPerView: 3
        },
        500: {
            slidesPerView: 2
        },
        350: {
            slidesPerView: 1
        },
        250: {
            slidesPerView: 1
        }
    },
}

export default function Team2Slider() {
    return (
        <>
            <div className="swiper-container swiper-group-4">
                <Swiper {...swiperOptions}>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team1.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Olivia Williams</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team2.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Foysal Khan</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team3.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Ava Smith</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team4.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Alexander Hall</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team1.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Olivia Williams</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team2.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Foysal Khan</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team3.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Ava Smith</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                    <SwiperSlide>
                        <div className="card-team-2">
                            <div className="card-image"><img src="/assets/imgs/page/homepage2/team4.png" alt="Nivia" /></div>
                            <div className="card-info"><Link href="#">
                                <h6>Alexander Hall</h6>
                            </Link>
                                <p className="text-lg neutral-600">Master Trainer</p>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
            <div className="box-button-slider box-button-slider-team">
                <div className="swiper-button-prev swiper-button-prev-testimonials swiper-button-prev-3">
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.66667 3.33398L2 8.00065M2 8.00065L6.66667 12.6673M2 8.00065H14" stroke="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        </path>
                    </svg>
                </div>
                <div className="swiper-button-next swiper-button-next-testimonials swiper-button-next-3">
                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.33333 3.33398L14 8.00065M14 8.00065L9.33333 12.6673M14 8.00065H2" stroke="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        </path>
                    </svg>
                </div>
            </div>
        </>
    )
}
