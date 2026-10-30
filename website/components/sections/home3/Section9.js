"use client";
import Link from "next/link";
import { useState } from "react";

export default function Section9() {
  const [activeIndex, setActiveIndex] = useState(1);
  const handleOnClick = (index) => {
    setActiveIndex(index);
  };
  return (
    <>
      <section className="section-box box-choose-plan">
        <div className="container">
          <div className="d-flex align-items-end justify-content-between box-head-plan mb-65">
            <h2 className="heading-2">
              Choose The Best Plan
              <br className="d-none d-lg-block" /> That’s For You
            </h2>
            <div className="box-button-plan">
              <div className="box-buttons-feature-4">
                <Link className="btn btn-black" href="#">
                  Get a Quote
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
                  </span>{" "}
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          <div className="box-choose-plan-inner">
            <div className="box-grid-plan">
              <div className="grid-plan-left">
                <h4 className="heading-4 neutral-0">Choose your plan</h4>
                <ul className="list-choose-plan">
                  <li
                    className={activeIndex === 1 ? "active" : ""}
                    onClick={() => handleOnClick(1)}
                  >
                    <label className="radio-container">
                      <input
                        className="cb-plan"
                        type="radio"
                        name="chooseplan"
                        defaultChecked="checked"
                      />
                      <span className="checkmark" />
                      Yearly billing
                    </label>
                    <span className="text-sm neutral-200">
                      Save 25% - 30 days money back
                    </span>
                  </li>
                  <li
                    className={activeIndex === 2 ? "active" : ""}
                    onClick={() => handleOnClick(2)}
                  >
                    <label className="radio-container">
                      <input
                        className="cb-plan"
                        type="radio"
                        name="chooseplan"
                      />
                      <span className="checkmark" />
                      Monthly billing
                    </label>
                    <span className="text-sm neutral-200">
                      Save 35% - 30 days money back
                    </span>
                  </li>
                </ul>
              </div>
              <div className="grid-plan-right">
                <div className="block-pricing">
                  <div className="row">
                    <div className="col-lg-4 col-md-6">
                      <div className="card-pricing card-pricing-2">
                        <div className="card-image justify-content-between">
                          <div className="card-icon-info">
                            <h4 className="heading-4">Free</h4>
                            <p className="text-md neutral-600">
                              For individuals
                            </p>
                          </div>
                          <div className="card-icon">
                            <img
                              src="/assets/imgs/page/homepage5/basic.png"
                              alt="Nivia"
                            />
                          </div>
                        </div>
                        <div className="card-lists">
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
                                  ></path>
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
                                  ></path>
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
                                  ></path>
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
                          </ul>
                        </div>
                        <div className="card-price">
                          {activeIndex === 1 && (
                            <div className="for-month display-month">
                              <span className="heading-2">$99</span>
                            </div>
                          )}
                          {activeIndex === 2 && (
                            <div className="for-year display-year">
                              <span className="heading-2">$1,188</span>
                            </div>
                          )}
                          <span className="text-sm neutral-500">
                            Upgrade anytime
                          </span>
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
                      <div className="card-pricing card-pricing-2">
                        <div className="card-image justify-content-between">
                          <div className="card-icon-info">
                            <h4 className="heading-4">Professional</h4>
                            <p className="text-md neutral-600">For startups</p>
                          </div>
                          <div className="card-icon">
                            <img
                              src="/assets/imgs/page/homepage5/professional.png"
                              alt="Nivia"
                            />
                          </div>
                        </div>
                        <div className="card-lists">
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
                                  ></path>
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
                                  ></path>
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
                                  ></path>
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
                          </ul>
                        </div>
                        <div className="card-price">
                          {activeIndex === 1 && (
                            <>
                              <div className="for-month display-month">
                                <span className="heading-2">$199</span>
                              </div>
                              <div className="for-month display-month">
                                <span className="text-sm neutral-500">
                                  Per person, billed monthly
                                </span>
                              </div>
                            </>
                          )}
                          {activeIndex === 2 && (
                            <>
                              <div className="for-year display-year">
                                <span className="heading-2">$2,388</span>
                              </div>
                              <div className="for-year  display-year">
                                <span className="text-sm neutral-500">
                                  Per person, billed yearly
                                </span>
                              </div>
                            </>
                          )}
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
                      <div className="card-pricing card-pricing-2">
                        <div className="card-image justify-content-between">
                          <div className="card-icon-info">
                            <h4 className="heading-4">Enterprise</h4>
                            <p className="text-md neutral-600">
                              For big companies
                            </p>
                          </div>
                          <div className="card-icon">
                            <img
                              src="/assets/imgs/page/homepage5/enterprise.png"
                              alt="Nivia"
                            />
                          </div>
                        </div>
                        <div className="card-lists">
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
                                  ></path>
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
                                  ></path>
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
                                  ></path>
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
                          </ul>
                        </div>
                        <div className="card-price">
                          {activeIndex === 1 && (
                            <>
                              <div className="for-month display-month">
                                <span className="heading-2">$399</span>
                              </div>
                              <div className="for-month display-month">
                                <span className="text-sm neutral-500">
                                  Per person, billed monthly
                                </span>
                              </div>
                            </>
                          )}
                          {activeIndex === 2 && (
                            <>
                              <div className="for-year display-year">
                                <span className="heading-2">$4,788</span>
                              </div>
                              <div className="for-year  display-year">
                                <span className="text-sm neutral-500">
                                  Per person, billed yearly
                                </span>
                              </div>
                            </>
                          )}
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
