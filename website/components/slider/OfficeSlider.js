
'use client'
import Link from 'next/link'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
    modules: [Autoplay, Pagination, Navigation],
    spaceBetween: 30,
    slidesPerView: 1,
    spaceBetween: 30,
    slidesPerGroup: 1,
    loop: true,
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev"
    },
    autoplay: {
        delay: 10000
    }
}

export default function OfficeSlider() {
    return (
        <>
            <Swiper {...swiperOptions}>
                <SwiperSlide>
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/london.svg" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">London</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/paris.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Paris</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/toronto.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Toronto</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/osaka.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Osaka</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/mumbai.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Mumbai</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
                <SwiperSlide>
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/london.svg" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">London</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/paris.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Paris</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/toronto.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Toronto</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/osaka.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Osaka</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-features-6">
                                <div className="card-image"> <img src="/assets/imgs/page/about/mumbai.png" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h5 className="mb-12">Mumbai</h5>
                                    <p className="mb-12 text-md neutral-300">4517 Washington Ave. Manchester,
                                        Kentucky 39495</p>
                                    <p className="text-md neutral-300 mb-30">Hours: 8:00 - 17:00, Mon - Sat </p>
                                    <Link className="btn btn-link-white" href="#">
                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width={38} height={38} rx={19} fill="true" />
                                            <g clipPath="url(#clip0_5_2504)">
                                                <path d="M23.6537 16.8139L14.718 25.7497L13.25 24.2817L22.1847 15.3459H14.31V13.2695H25.7301V24.6897H23.6537V16.8139Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_5_2504">
                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                </clipPath>
                                            </defs>
                                        </svg>Contact Now</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            </Swiper>
        </>
    )
}
