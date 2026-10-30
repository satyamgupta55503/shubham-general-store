
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

export default function Section5() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-testimonials-4">
                <div className="container">
                    <h2 className="heading-2 neutral-0">Testimonials</h2>
                    <p className="text-md neutral-500 mb-50">Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
                        consectetur</p>
                </div>
                <div className="box-swiper-padding">
                    <div className="box-swiper">
                        <div className="swiper-container swiper-group-4">
                            <Swiper {...swiperOptions} className="swiper-wrapper">
                                <SwiperSlide>
                                    <div className="card-testimonial-4">
                                        <div className="card-author">
                                            <div className="box-author"><Link href="#"><img src="/assets/imgs/page/homepage4/author.png" alt="Nivia" /></Link>
                                                <div className="author-info"><Link href="#"><span className="author-name neutral-0">Guy
                                                    Hawkins</span></Link><span className="text-sm color-second-grey department">Founder, Alpha
                                                        Group</span></div>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <p className="text-md color-second-grey">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing elit. Mauris et tincidunt leo. Mauris eleifend mi leo, lacinia
                                                porta sem iaculis eu. Duis nisi ligula, suscipit sit amet sem sit amet,
                                                mollis molestie tellus. Aenean molestie ligula arcu, at tincidunt velit
                                                pellentesque id. Donec in scelerisque arcu.</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-4">
                                        <div className="card-author">
                                            <div className="box-author"><Link href="#"><img src="/assets/imgs/page/homepage4/author2.png" alt="Nivia" /></Link>
                                                <div className="author-info"><Link href="#"><span className="author-name neutral-0">Don
                                                    Joe</span></Link><span className="text-sm color-second-grey department">Founder, Alpha
                                                        Group</span></div>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <p className="text-md color-second-grey">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing elit. Mauris et tincidunt leo. Mauris eleifend mi leo, lacinia
                                                porta sem iaculis eu. Duis nisi ligula, suscipit sit amet sem sit amet,
                                                mollis molestie tellus. Aenean molestie ligula arcu, at tincidunt velit
                                                pellentesque id. Donec in scelerisque arcu.</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-4">
                                        <div className="card-author">
                                            <div className="box-author"><Link href="#"><img src="/assets/imgs/page/homepage4/author3.png" alt="Nivia" /></Link>
                                                <div className="author-info"><Link href="#"><span className="author-name neutral-0">Zoe
                                                    Mantis</span></Link><span className="text-sm color-second-grey department">Founder, Alpha
                                                        Group</span></div>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <p className="text-md color-second-grey">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing elit. Mauris et tincidunt leo. Mauris eleifend mi leo, lacinia
                                                porta sem iaculis eu. Duis nisi ligula, suscipit sit amet sem sit amet,
                                                mollis molestie tellus. Aenean molestie ligula arcu, at tincidunt velit
                                                pellentesque id. Donec in scelerisque arcu.</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-4">
                                        <div className="card-author">
                                            <div className="box-author"><Link href="#"><img src="/assets/imgs/page/homepage4/author.png" alt="Nivia" /></Link>
                                                <div className="author-info"><Link href="#"><span className="author-name neutral-0">Zoe
                                                    Mantis</span></Link><span className="text-sm color-second-grey department">Founder, Alpha
                                                        Group</span></div>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <p className="text-md color-second-grey">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing elit. Mauris et tincidunt leo. Mauris eleifend mi leo, lacinia
                                                porta sem iaculis eu. Duis nisi ligula, suscipit sit amet sem sit amet,
                                                mollis molestie tellus. Aenean molestie ligula arcu, at tincidunt velit
                                                pellentesque id. Donec in scelerisque arcu.</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-4">
                                        <div className="card-author">
                                            <div className="box-author"><Link href="#"><img src="/assets/imgs/page/homepage4/author3.png" alt="Nivia" /></Link>
                                                <div className="author-info"><Link href="#"><span className="author-name neutral-0">Zoe
                                                    Mantis</span></Link><span className="text-sm color-second-grey department">Founder, Alpha
                                                        Group</span></div>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <p className="text-md color-second-grey">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing elit. Mauris et tincidunt leo. Mauris eleifend mi leo, lacinia
                                                porta sem iaculis eu. Duis nisi ligula, suscipit sit amet sem sit amet,
                                                mollis molestie tellus. Aenean molestie ligula arcu, at tincidunt velit
                                                pellentesque id. Donec in scelerisque arcu.</p>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide>
                                    <div className="card-testimonial-4">
                                        <div className="card-author">
                                            <div className="box-author"><Link href="#"><img src="/assets/imgs/page/homepage4/author.png" alt="Nivia" /></Link>
                                                <div className="author-info"><Link href="#"><span className="author-name neutral-0">Zoe
                                                    Mantis</span></Link><span className="text-sm color-second-grey department">Founder, Alpha
                                                        Group</span></div>
                                            </div>
                                        </div>
                                        <div className="card-info">
                                            <p className="text-md color-second-grey">Lorem ipsum dolor sit amet, consectetur
                                                adipiscing elit. Mauris et tincidunt leo. Mauris eleifend mi leo, lacinia
                                                porta sem iaculis eu. Duis nisi ligula, suscipit sit amet sem sit amet,
                                                mollis molestie tellus. Aenean molestie ligula arcu, at tincidunt velit
                                                pellentesque id. Donec in scelerisque arcu.</p>
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
