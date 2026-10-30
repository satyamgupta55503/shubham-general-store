"use client";
import Link from "next/link";
import { useState } from "react";

export default function Section9() {
  const [isToggled, setToggled] = useState(false);
  const handleToggle = () => setToggled(!isToggled);
  return (
    <>
      <section className="section-box box-pricing">
        <div className="container">
          <div className="text-center">
            <h6 className="heading-6 text-linear-3 mb-5">PRICING PLAN</h6>
            <h3 className="heading-2 mb-30">
              Choose the right price plan
              <br className="d-none d-lg-block" /> that suitable for you
            </h3>
            <div className="text-center mb-75">
              <span className="text-lg text-billed">Monthly</span>
              <label className="switch ml-20 mr-20">
                <input
                  id="cb_billed_type"
                  type="checkbox"
                  name="billed_type"
                  onClick={handleToggle}
                />
                <span className="slider round" />
              </label>
              <span className="text-lg text-billed">Annually</span>
            </div>
          </div>
          <div className="block-pricing">
            <div className="row">
              <div className="col-lg-4 col-md-6">
                <div className="card-pricing">
                  <div className="card-image">
                    <div className="card-icon">
                      <img
                        src="/assets/imgs/page/homepage5/basic.png"
                        alt="Nivia"
                      />
                    </div>
                    <div className="card-icon-info">
                      <p className="text-lg neutral-600">For individuals</p>
                      <p className="text-24-bold">Basic</p>
                    </div>
                  </div>
                  <div className="card-desc">
                    <p className="text-lg neutral-700">
                      Lorem ipsum dolor sit amet doloroli sitiol conse ctetur
                      adipiscing elit.
                    </p>
                  </div>
                  <div className="card-price">
                    <div
                      className={`for-month ${
                        isToggled ? "" : "display-month"
                      }`}
                    >
                      <span className="heading-1">$99</span>
                      <span className="text-20-medium color-grey">
                        /monthly
                      </span>
                    </div>
                    <div
                      className={`for-year ${isToggled ? "display-year" : ""}`}
                    >
                      <span className="heading-1">$1,188</span>
                      <span className="text-20-medium color-grey">/yearly</span>
                    </div>
                  </div>
                  <div className="card-lists">
                    <strong className="text-18-bold">What’s included</strong>
                    <ul className="list-feature">
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        5,000 Monthly Word Limit
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        50+ Languages
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        Advance Editor Tool
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        50 Accounts
                      </li>
                    </ul>
                  </div>
                  <div className="card-button">
                    <Link className="btn btn-get-started" href="#">
                      Get started
                      <svg
                        width={23}
                        height={8}
                        viewBox="0 0 23 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z"
                          fill="true"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="card-pricing card-pricing-popular">
                  <label className="btn btn-popular">Popular</label>
                  <div className="card-image">
                    <div className="card-icon">
                      <img
                        src="/assets/imgs/page/homepage5/professional.png"
                        alt="Nivia"
                      />
                    </div>
                    <div className="card-icon-info">
                      <p className="text-lg neutral-600">For startups</p>
                      <p className="text-24-bold">Professional</p>
                    </div>
                  </div>
                  <div className="card-desc">
                    <p className="text-lg neutral-700">
                      Lorem ipsum dolor sit amet doloroli sitiol conse ctetur
                      adipiscing elit.
                    </p>
                  </div>
                  <div className="card-price">
                    <div
                      className={`for-month ${
                        isToggled ? "" : "display-month"
                      }`}
                    >
                      <span className="heading-1">$199</span>
                      <span className="text-20-medium color-grey">
                        /monthly
                      </span>
                    </div>
                    <div
                      className={`for-year ${isToggled ? "display-year" : ""}`}
                    >
                      <span className="heading-1">$2,388</span>
                      <span className="text-20-medium color-grey">/yearly</span>
                    </div>
                  </div>
                  <div className="card-lists">
                    <strong className="text-18-bold">What’s included</strong>
                    <ul className="list-feature">
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        5,000 Monthly Word Limit
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        50+ Languages
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        Advance Editor Tool
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        50 Accounts
                      </li>
                    </ul>
                  </div>
                  <div className="card-button">
                    <Link className="btn btn-get-started" href="#">
                      Get started
                      <svg
                        width={23}
                        height={8}
                        viewBox="0 0 23 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z"
                          fill="true"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-md-6">
                <div className="card-pricing">
                  <div className="card-image">
                    <div className="card-icon">
                      <img
                        src="/assets/imgs/page/homepage5/enterprise.png"
                        alt="Nivia"
                      />
                    </div>
                    <div className="card-icon-info">
                      <p className="text-lg neutral-600">For big companies</p>
                      <p className="text-24-bold">Enterprise</p>
                    </div>
                  </div>
                  <div className="card-desc">
                    <p className="text-lg neutral-700">
                      Lorem ipsum dolor sit amet doloroli sitiol conse ctetur
                      adipiscing elit.
                    </p>
                  </div>
                  <div className="card-price">
                    <div
                      className={`for-month ${
                        isToggled ? "" : "display-month"
                      }`}
                    >
                      <span className="heading-1">$399</span>
                      <span className="text-20-medium color-grey">
                        /monthly
                      </span>
                    </div>
                    <div
                      className={`for-year ${isToggled ? "display-year" : ""}`}
                    >
                      <span className="heading-1">$4,788</span>
                      <span className="text-20-medium color-grey">/yearly</span>
                    </div>
                  </div>
                  <div className="card-lists">
                    <strong className="text-18-bold">What’s included</strong>
                    <ul className="list-feature">
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        5,000 Monthly Word Limit
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        50+ Languages
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        Advance Editor Tool
                      </li>
                      <li>
                        <svg
                          width={26}
                          height={26}
                          viewBox="0 0 26 26"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g clipPath="url(#clip0_15_115)">
                            <path
                              d="M13 26C20.1799 26 26 20.1799 26 13C26 5.8201 20.1799 0 13 0C5.8201 0 0 5.8201 0 13C0 20.1799 5.8201 26 13 26Z"
                              fill="url(#paint0_linear_15_115)"
                            />
                            <path
                              d="M7.11719 13.8396L10.479 17.2014L18.8835 8.79688"
                              stroke="#191919"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                          <defs>
                            <linearGradient
                              id="paint0_linear_15_115"
                              x1="26.9286"
                              y1="3.85184"
                              x2="-2.09554"
                              y2="5.87316"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stopColor="#22D1EE" />
                              <stop offset={1} stopColor="#8ee013" />
                            </linearGradient>
                            <clipPath id="clip0_15_115">
                              <rect width={26} height={26} fill="white" />
                            </clipPath>
                          </defs>
                        </svg>{" "}
                        50 Accounts
                      </li>
                    </ul>
                  </div>
                  <div className="card-button">
                    <Link className="btn btn-get-started" href="#">
                      Get started
                      <svg
                        width={23}
                        height={8}
                        viewBox="0 0 23 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z"
                          fill="true"
                        />
                      </svg>
                    </Link>
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
