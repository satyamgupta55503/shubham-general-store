
'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Section9() {
    const [isToggled, setToggled] = useState(false)
    const handleToggle = () => setToggled(!isToggled)
    return (
        <>

            <section className="section-box box-pricing-2">
                <div className="box-pricing-2-inner">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="heading-2 mb-30">Choose the right price plan<br className="d-none d-lg-block" /> that
                                suitable for you</h2>
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
                                                <h1 className="heading-1">$99</h1><span className="text-20-medium color-grey">monthly</span>
                                            </div>
                                            <div className={`for-year ${isToggled ? "display-year" : ""}`}>
                                                <h1 className="heading-1">$1,188</h1><span className="text-20-medium color-grey">yearly</span>
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
                                                    </svg> 5,000 Monthly Word Limit
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
                                                    </svg> 50+ Languages
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
                                                    </svg> Advance Editor Tool
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
                                                    </svg> 50 Accounts
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
                                                <h1 className="heading-1">$199</h1><span className="text-20-medium color-grey">monthly</span>
                                            </div>
                                            <div className={`for-year ${isToggled ? "display-year" : ""}`}>
                                                <h1 className="heading-1">$2,388</h1><span className="text-20-medium color-grey">yearly</span>
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
                                                    </svg> 5,000 Monthly Word Limit
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
                                                    </svg> 50+ Languages
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
                                                    </svg> Advance Editor Tool
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
                                                    </svg> 50 Accounts
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
                                    <div className="card-pricing card-pricing-style-2 active">
                                        <div className="card-title">
                                            <h6>Enterprise</h6>
                                        </div>
                                        <div className="card-price">
                                            <div className={`for-month ${isToggled ? "" : "display-month"}`}>
                                                <h1 className="heading-1">$399</h1><span className="text-20-medium color-grey">monthly</span>
                                            </div>
                                            <div className={`for-year ${isToggled ? "display-year" : ""}`}>
                                                <h1 className="heading-1">$4,788</h1><span className="text-20-medium color-grey">yearly</span>
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
                                                    </svg> 5,000 Monthly Word Limit
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
                                                    </svg> 50+ Languages
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
                                                    </svg> Advance Editor Tool
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
                                                    </svg> 50 Accounts
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
                                            <p className="text-md">With it profitable sure wrong continued in the queen's
                                                perhaps and simple fat denied adding worthy little use as some he so high
                                                down am week conduct esteems by cottage to pasture.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="col-md-6" />
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
                                            <p className="text-md"> Comfort reached gay perhaps chamber his six detract besides
                                                add. Moonlight newspaper. the queen's perhaps and simple fat denied adding
                                                worthy little use as some he so high</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="col-md-6" />
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
                                            <p className="text-md">With it profitable sure wrong continued in the queen's
                                                perhaps and simple fat denied adding worthy little use as some he so high
                                                down am week conduct esteems by cottage to pasture.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="col-md-6" />
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
                                            <p className="text-md"> Comfort reached gay perhaps chamber his six detract besides
                                                add. Moonlight newspaper. the queen's perhaps and simple fat denied adding
                                                worthy little use as some he so high</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
