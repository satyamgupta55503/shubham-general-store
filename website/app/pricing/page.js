'use client'
import Layout from "@/components/layout/Layout"
import Link from 'next/link'
import { useState } from 'react'
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
export default function Pricing() {
    const [isToggled, setToggled] = useState(false)
    const handleToggle = () => setToggled(!isToggled)
    return (
        <>

            <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4" >
                <div>
                    <section className="section-box box-pricing-5">
                        <div className="box-pricing-2-inner">
                            <div className="container">
                                <div className="text-center"><Link className="btn btn-brand-4-sm" href="#">Pricing Plan</Link>
                                    <h2 className="heading-2 mb-15 mt-15">Choose the right price plan<br className="d-none d-lg-block" /> that suitable for you</h2>
                                    <p className="text-lg neutral-500 mb-15">Get started with a 5-day trial, 25% off for Yearly Plan, Cancel anytime.</p>
                                    <div className="text-center mb-75"><span className="text-lg text-billed">Monthly</span>
                                        <label className="switch ml-20 mr-20">
                                            <input id="cb_billed_type" type="checkbox" name="billed_type" onClick={handleToggle} /><span className="slider round" />
                                        </label><span className="text-lg text-billed">Annually</span>
                                    </div>
                                </div>
                                <div className="block-pricing">
                                    <div className="row">
                                        <div className="col-lg-4 col-md-6">
                                            <div className="card-pricing card-pricing-style-2">
                                                <div className="card-title">
                                                    <h6>Basic</h6>
                                                </div>
                                                <div className="card-price">
                                                    <div className={`for-month ${isToggled ? "" : "display-month"}`}>
                                                        <h1 className="heading-1">$99</h1><span className="text-20-medium color-grey">Per Month</span>
                                                    </div>
                                                    <div className={`for-year ${isToggled ? "display-year" : ""}`}>
                                                        <h1 className="heading-1">$1,188</h1><span className="text-20-medium color-grey">Per Year</span>
                                                    </div>
                                                </div>
                                                <div className="card-lists"><strong className="text-18-bold">What’s included</strong>
                                                    <ul className="list-feature">
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            5,000 Monthly Word Limit
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            50+ Languages
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            Advance Editor Tool
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            50 Accounts
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="card-button"><Link className="btn btn-get-started" href="#">Get started
                                                    <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                                                    </svg></Link></div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="card-pricing card-pricing-style-2">
                                                <div className="card-title">
                                                    <h6>Professional</h6>
                                                </div>
                                                <div className="card-price">
                                                    <div className={`for-month ${isToggled ? "" : "display-month"}`}>
                                                        <h1 className="heading-1">$199</h1><span className="text-20-medium color-grey">Per Month</span>
                                                    </div>
                                                    <div className={`for-year ${isToggled ? "display-year" : ""}`}>
                                                        <h1 className="heading-1">$2,388</h1><span className="text-20-medium color-grey">Per Year</span>
                                                    </div>
                                                </div>
                                                <div className="card-lists"><strong className="text-18-bold">What’s included</strong>
                                                    <ul className="list-feature">
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            5,000 Monthly Word Limit
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            50+ Languages
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            Advance Editor Tool
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            50 Accounts
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="card-button"><Link className="btn btn-get-started" href="#">Get started
                                                    <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                                                    </svg></Link></div>
                                            </div>
                                        </div>
                                        <div className="col-lg-4 col-md-6">
                                            <div className="card-pricing card-pricing-style-2">
                                                <div className="card-title">
                                                    <h6>Enterprise</h6>
                                                </div>
                                                <div className="card-price">
                                                    <div className={`for-month ${isToggled ? "" : "display-month"}`}>
                                                        <h1 className="heading-1">$399</h1><span className="text-20-medium color-grey">Per Month</span>
                                                    </div>
                                                    <div className={`for-year ${isToggled ? "display-year" : ""}`}>
                                                        <h1 className="heading-1">$4,788</h1><span className="text-20-medium color-grey">Per Year</span>
                                                    </div>
                                                </div>
                                                <div className="card-lists"><strong className="text-18-bold">What’s included</strong>
                                                    <ul className="list-feature">
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            5,000 Monthly Word Limit
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            50+ Languages
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            Advance Editor Tool
                                                        </li>
                                                        <li>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width={26} height={26} viewBox="0 0 26 26" fill="none">
                                                                <g clipPath="url(#clip0_51_57)">
                                                                    <path d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z" fill="#C5FF55" />
                                                                    <path d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688" stroke="#191919" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_51_57">
                                                                        <rect width={26} height={26} fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>                                            50 Accounts
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div className="card-button"><Link className="btn btn-get-started" href="#">Get started
                                                    <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                                                    </svg></Link></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="box-list-prices">
                                    <div className="text-center"> <Link className="btn btn-brand-4-sm" href="#">Pricing Plan</Link>
                                        <h2 className="mb-45 mt-15">Need Any Help ?<br className="d-none d-lg-block" /> Read Popular Questions</h2>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card-faq card-faq-black">
                                                <div className="item-title">
                                                    <h6>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                            <g clipPath="url(#clip0_51_1478)">
                                                                <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                                <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                                <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_51_1478">
                                                                    <rect width={18} height={18} fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>How do I purchase an item?
                                                    </h6>
                                                </div>
                                                <div className="item-info">
                                                    <p className="text-md">With it profitable sure wrong continued in the queen's perhaps and simple fat denied adding worthy little use as some he so high down am week conduct esteems by cottage to pasture.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="col-md-6"> </div>
                                            <div className="card-faq card-faq-black">
                                                <div className="item-title">
                                                    <h6>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                            <g clipPath="url(#clip0_51_1478)">
                                                                <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                                <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                                <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_51_1478">
                                                                    <rect width={18} height={18} fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>Does Nivia share my information with others?
                                                    </h6>
                                                </div>
                                                <div className="item-info">
                                                    <p className="text-md"> Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper. the queen's perhaps and simple fat denied adding worthy little use as some he so high</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="col-md-6"> </div>
                                            <div className="card-faq card-faq-black">
                                                <div className="item-title">
                                                    <h6>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                            <g clipPath="url(#clip0_51_1478)">
                                                                <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                                <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                                <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_51_1478">
                                                                    <rect width={18} height={18} fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>How do I arrange a replacement item?
                                                    </h6>
                                                </div>
                                                <div className="item-info">
                                                    <p className="text-md">With it profitable sure wrong continued in the queen's perhaps and simple fat denied adding worthy little use as some he so high down am week conduct esteems by cottage to pasture.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="col-md-6"> </div>
                                            <div className="card-faq card-faq-black">
                                                <div className="item-title">
                                                    <h6>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none">
                                                            <g clipPath="url(#clip0_51_1478)">
                                                                <path d="M9 0C4.02571 0 0 4.02525 0 9C0 13.9742 4.02525 18 9 18C13.9743 18 18 13.9747 18 9C18 4.02571 13.9747 0 9 0ZM9 16.7442C4.72985 16.7442 1.25582 13.2702 1.25582 9C1.25582 4.72982 4.72985 1.25582 9 1.25582C13.2702 1.25582 16.7442 4.72982 16.7442 9C16.7442 13.2702 13.2702 16.7442 9 16.7442Z" fill="true" />
                                                                <path d="M8.73434 11.3887C8.23677 11.3887 7.83398 11.8033 7.83398 12.3008C7.83398 12.7866 8.22492 13.2131 8.73434 13.2131C9.24375 13.2131 9.6465 12.7866 9.6465 12.3008C9.6465 11.8033 9.23187 11.3887 8.73434 11.3887Z" fill="true" />
                                                                <path d="M8.8885 4.48047C7.28917 4.48047 6.55469 5.42825 6.55469 6.06795C6.55469 6.52997 6.94563 6.74323 7.26548 6.74323C7.90521 6.74323 7.6446 5.831 8.85296 5.831C9.44527 5.831 9.91918 6.09164 9.91918 6.6366C9.91918 7.2763 9.25574 7.64355 8.8648 7.97525C8.52122 8.27137 8.07108 8.75712 8.07108 9.77595C8.07108 10.392 8.23695 10.5697 8.72263 10.5697C9.3031 10.5697 9.42157 10.3091 9.42157 10.0839C9.42157 9.46791 9.43342 9.11252 10.085 8.6031C10.4049 8.35434 11.4118 7.54873 11.4118 6.43516C11.4118 5.32158 10.4049 4.48047 8.8885 4.48047Z" fill="true" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_51_1478">
                                                                    <rect width={18} height={18} fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>What kind of financial advice do you give?
                                                    </h6>
                                                </div>
                                                <div className="item-info">
                                                    <p className="text-md"> Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper. the queen's perhaps and simple fat denied adding worthy little use as some he so high</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="section-box wow animate__animated animate__fadeIn box-testimonials-5">
                        <div className="container">
                            <div className="text-center"><Link className="btn btn-brand-4-sm" href="#">Testimonials</Link>
                                <h2 className="heading-2 mb-15 mt-15">Hear what our users have<br className="d-none d-lg-block" />to say about us.</h2>
                            </div>
                        </div>
                        <div className="box-swiper-padding mt-60">
                            <div className="box-swiper">
                                <div className="swiper-container swiper-group-4">
                                    <Swiper {...swiperOptions} className="swiper-wrapper">
                                        <SwiperSlide>
                                            <div className="card-testimonial">
                                                <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                                                <div className="card-comment">
                                                    <p className="text-md">As a small business most owner, effective communication and collaboration are key to success. this app's<Link href="#">team collaboration</Link> with feature has and helped us get things donefaster the interface is user-friendly</p>
                                                </div>
                                                <div className="card-author">
                                                    <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                                                    <div className="author-image"><img src="/assets/imgs/page/homepage6/author.png" alt="Nivia" /></div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="card-testimonial">
                                                <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                                                <div className="card-comment">
                                                    <p className="text-md">Little in examination transmitting the and country with it profitable sure wrong continued in the queen's perhaps and simple fat denied adding worthy little use as some he so high down am week conduct esteems by cottage to pasture Little in examination transmitting the and country</p>
                                                </div>
                                                <div className="card-author">
                                                    <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                                                    <div className="author-image"><img src="/assets/imgs/page/homepage6/author2.png" alt="Nivia" /></div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="card-testimonial">
                                                <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                                                <div className="card-comment">
                                                    <p className="text-md">As a small business most owner, effective communication and collaboration are key to success. this app's<Link href="#">team collaboration</Link> with feature has and helped us get things donefaster the interface is user-friendly Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper up its enjoyment agreeable depending Comfort reached gay perhaps chamber his six</p>
                                                </div>
                                                <div className="card-author">
                                                    <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                                                    <div className="author-image"><img src="/assets/imgs/page/homepage6/author3.png" alt="Nivia" /></div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="card-testimonial">
                                                <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                                                <div className="card-comment">
                                                    <p className="text-md">As a small business most owner, effective communication and collaboration are key to success. this app's with feature has and helped us get things donefaster the interface is user-friendly Little in examination transmitting the and country with it profitable sure wrong continued in the queen's perhaps and simple fat denie</p>
                                                </div>
                                                <div className="card-author">
                                                    <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                                                    <div className="author-image"><img src="/assets/imgs/page/homepage6/author4.png" alt="Nivia" /></div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="card-testimonial">
                                                <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                                                <div className="card-comment">
                                                    <p className="text-md">As a small business most owner, effective communication and collaboration are key to success. this app's<Link href="#">team collaboration</Link> with feature has and helped us get things donefaster the interface is user-friendly Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper up its enjoyment agreeable depending Comfort reached gay perhaps chamber his six</p>
                                                </div>
                                                <div className="card-author">
                                                    <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                                                    <div className="author-image"><img src="/assets/imgs/page/homepage6/author3.png" alt="Nivia" /></div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                        <SwiperSlide>
                                            <div className="card-testimonial">
                                                <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                                                <div className="card-comment">
                                                    <p className="text-md">As a small business most owner, effective communication and collaboration are key to success. this app's with feature has and helped us get things donefaster the interface is user-friendly Little in examination transmitting the and country with it profitable sure wrong continued in the queen's perhaps and simple fat denie</p>
                                                </div>
                                                <div className="card-author">
                                                    <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                                                    <div className="author-image"><img src="/assets/imgs/page/homepage6/author4.png" alt="Nivia" /></div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    </Swiper>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="section-box wow animate__animated animate__fadeIn box-more-question box-more-question-2">
                        <div className="container">
                            <div className="block-more-question">
                                <div className="question-left">
                                    <h3 className="mb-10">Have more questions</h3>
                                    <p className="text-lg mb-20">If you still can’t find the answer you’re looking for, let we help you.</p><Link className="btn btn-brand-4" href="#">Go to Support Center
                                        <svg width={23} height={22} viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <g clipPath="url(#clip0_449_3780)">
                                                <path d="M22.5 10.9993L18.9791 7.47852V10.3064H0.5V11.6924H18.9791V14.5203L22.5 10.9993Z" fill="#191919" />
                                            </g>
                                            <defs>
                                                <clipPath id="clip0_449_3780">
                                                    <rect width={22} height={22} fill="white" transform="translate(0.5)" />
                                                </clipPath>
                                            </defs>
                                        </svg></Link>
                                </div>
                                <div className="question-right"><img src="/assets/imgs/page/homepage4/bg-question.png" alt="Nivia" /></div>
                            </div>
                        </div>
                    </section>
                </div>

            </Layout>
        </>
    )
}