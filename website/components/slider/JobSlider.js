'use client'
import Link from 'next/link'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 30,
    slidesPerView: 3,
    spaceBetween: 30,
    slidesPerGroup: 1,
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next-3",
        prevEl: ".swiper-button-prev-3"
    },
    autoplay: {
        delay: 10000
    },
    breakpoints: {
        1199: {
            slidesPerView: 3
        },
        800: {
            slidesPerView: 2
        },
        400: {
            slidesPerView: 1
        },
        250: {
            slidesPerView: 1
        }
    }
}

export default function JobSlider() {
    return (
        <>
            <div className="swiper-container swiper-group-3">
                <Swiper {...swiperOptions}>
                    <SwiperSlide>
                        <div className="card-job">
                            <div className="card-head">
                                <div className="card-head-left"> <Link href="#">
                                    <h5>Webflow Developer</h5></Link>
                                    <p className="text-md">Full Time</p>
                                </div>
                                <div className="card-head-right"> <Link href="#">
                                    <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width={38} height={38} rx={19} fill="true" />
                                        <g clipPath="url(#clip0_26_2613)">
                                            <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_26_2613">
                                                <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                            </clipPath>
                                        </defs>
                                    </svg></Link></div>
                            </div>
                            <div className="card-info">
                                <p className="text-md neutral-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna adipiscing praesent velit viverra Saas is a easy process of darkzai. Donec vel sapien in sapien convallis malesuada.</p>
                                <div className="card-meta"> <span className="location text-md">California</span><span className="card-price text-md">$15K-25K</span></div>
                            </div>
                        </div>
                    </SwiperSlide>


                    <SwiperSlide>
                        <div className="card-job">
                            <div className="card-head">
                                <div className="card-head-left"> <Link href="#">
                                    <h5>VP of Growth Marketing</h5></Link>
                                    <p className="text-md" />
                                </div>
                                <div className="card-head-right"> <Link href="#">
                                    <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width={38} height={38} rx={19} fill="true" />
                                        <g clipPath="url(#clip0_26_2613)">
                                            <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_26_2613">
                                                <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                            </clipPath>
                                        </defs>
                                    </svg></Link></div>
                            </div>
                            <div className="card-info">
                                <p className="text-md neutral-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna adipiscing praesent velit viverra Saas is a easy process of darkzai. Donec vel sapien in sapien convallis malesuada.</p>
                                <div className="card-meta"> <span className="location text-md">California</span><span className="card-price text-md">$15K-25K</span></div>
                            </div>
                        </div>
                    </SwiperSlide>


                    <SwiperSlide>
                        <div className="card-job">
                            <div className="card-head">
                                <div className="card-head-left"> <Link href="#">
                                    <h5>Lead of Product Design</h5></Link>
                                    <p className="text-md">Full Time</p>
                                </div>
                                <div className="card-head-right"> <Link href="#">
                                    <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width={38} height={38} rx={19} fill="true" />
                                        <g clipPath="url(#clip0_26_2613)">
                                            <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_26_2613">
                                                <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                            </clipPath>
                                        </defs>
                                    </svg></Link></div>
                            </div>
                            <div className="card-info">
                                <p className="text-md neutral-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna adipiscing praesent velit viverra Saas is a easy process of darkzai. Donec vel sapien in sapien convallis malesuada.</p>
                                <div className="card-meta"> <span className="location text-md">California</span><span className="card-price text-md">$15K-25K</span></div>
                            </div>
                        </div>
                    </SwiperSlide>


                    <SwiperSlide>
                        <div className="card-job">
                            <div className="card-head">
                                <div className="card-head-left"> <Link href="#">
                                    <h5>AI Model Trainer</h5></Link>
                                    <p className="text-md">Freelancer</p>
                                </div>
                                <div className="card-head-right"> <Link href="#">
                                    <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width={38} height={38} rx={19} fill="true" />
                                        <g clipPath="url(#clip0_26_2613)">
                                            <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_26_2613">
                                                <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                            </clipPath>
                                        </defs>
                                    </svg></Link></div>
                            </div>
                            <div className="card-info">
                                <p className="text-md neutral-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna adipiscing praesent velit viverra Saas is a easy process of darkzai. Donec vel sapien in sapien convallis malesuada.</p>
                                <div className="card-meta"> <span className="location text-md">California</span><span className="card-price text-md">$15K-25K</span></div>
                            </div>
                        </div>
                    </SwiperSlide>


                    <SwiperSlide>
                        <div className="card-job">
                            <div className="card-head">
                                <div className="card-head-left"> <Link href="#">
                                    <h5>Ruby on Rails Developer</h5></Link>
                                    <p className="text-md">Remote</p>
                                </div>
                                <div className="card-head-right"> <Link href="#">
                                    <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect width={38} height={38} rx={19} fill="true" />
                                        <g clipPath="url(#clip0_26_2613)">
                                            <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_26_2613">
                                                <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                            </clipPath>
                                        </defs>
                                    </svg></Link></div>
                            </div>
                            <div className="card-info">
                                <p className="text-md neutral-500">Lorem ipsum dolor sit amet, consectetur adipiscing elit lobortis arcu enim urna adipiscing praesent velit viverra Saas is a easy process of darkzai. Donec vel sapien in sapien convallis malesuada.</p>
                                <div className="card-meta"> <span className="location text-md">California</span><span className="card-price text-md">$15K-25K</span></div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
        </>
    )
}
