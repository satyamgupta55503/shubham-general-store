'use client'
import Link from 'next/link'
import { useState } from "react"
export default function Section8() {
    const [activeIndex, setActiveIndex] = useState(1)
    const handleOnClick = (index) => {
        setActiveIndex(index)
    }
    return (
        <>

            <section className="section-box box-preparing">
                <div className="box-preparing-inner">
                    <div className="container">
                        <div className="text-center">
                            <h2 className="heading-2 mb-20">Preparing For Your Success,<br className="d-none d-lg-block" /> We Provide
                                Truly Prominent IT Solutions</h2>
                            <p className="text-lg">Nivia is an independent web design studio with a rich history. Founded in
                                1999, it gathered the best web designers  developers.</p>
                            <div className="box-button-preparing">
                                <ul className="nav nav-tabs justify-content-center" role="tablist">
                                    <li onClick={() => handleOnClick(1)}><a className={activeIndex === 1 ? "btn btn-neutral-100 active" : "btn btn-neutral-100"} data-bs-toggle="tab" role="tab" aria-controls="tab-1" aria-selected="true">IT Management</a></li>
                                    <li onClick={() => handleOnClick(2)}><a className={activeIndex === 2 ? "btn btn-neutral-100 active" : "btn btn-neutral-100"} data-bs-toggle="tab" role="tab" aria-controls="tab-2" aria-selected="false">Data Security</a></li>
                                    <li onClick={() => handleOnClick(3)}><a className={activeIndex === 3 ? "btn btn-neutral-100 active" : "btn btn-neutral-100"} data-bs-toggle="tab" role="tab" aria-controls="tab-2" aria-selected="false">Business Reform</a></li>
                                    <li onClick={() => handleOnClick(4)}><a className={activeIndex === 4 ? "btn btn-neutral-100 active" : "btn btn-neutral-100"} data-bs-toggle="tab" role="tab" aria-controls="tab-2" aria-selected="false">Firewall Advancement</a></li>
                                    <li onClick={() => handleOnClick(5)}><a className={activeIndex === 5 ? "btn btn-neutral-100 active" : "btn btn-neutral-100"} data-bs-toggle="tab" role="tab" aria-controls="tab-2" aria-selected="false">Infrastructure Plan</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="block-group-preparing">
                            <div className="tab-content">
                                <div  className={activeIndex == 1 ? "tab-pane fade show active" : "tab-pane fade"} id="tab-1">
                                    <div className="item-preparing">
                                        <div className="item-preparing-left" />
                                        <div className="item-preparing-right">
                                            <div className="internet-icon"><span /> Our Features</div>
                                            <h2 className="heading-2 mb-20">Trusted by worldwide clients since 1980</h2>
                                            <p className="text-lg neutral-700">In a professional context it often happens that
                                                private or corporate clients order a publication news while still not being
                                                ready. In a professional context it often happens that private or corporate
                                                clients order a publication news while still not being ready.</p>
                                            <div className="box-list-check">
                                                <ul className="list-check">
                                                    <li>Trustworthy Research</li>
                                                    <li>SEO Efficiency</li>
                                                    <li>Time Efficiency</li>
                                                    <li>Smart Installation Tools</li>
                                                    <li>Dynamic Boosting</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div  className={activeIndex == 2 ? "tab-pane fade show active" : "tab-pane fade"} id="tab-2">
                                    <div className="item-preparing">
                                        <div className="item-preparing-left img-2" />
                                        <div className="item-preparing-right">
                                            <div className="internet-icon"><span /> Our Features</div>
                                            <h2 className="heading-2 mb-20">Trusted by worldwide clients since 1980</h2>
                                            <p className="text-lg neutral-700">In a professional context it often happens that
                                                private or corporate clients order a publication news while still not being
                                                ready. In a professional context it often happens that private or corporate
                                                clients order a publication news while still not being ready.</p>
                                            <div className="box-list-check">
                                                <ul className="list-check">
                                                    <li>Trustworthy Research</li>
                                                    <li>SEO Efficiency</li>
                                                    <li>Time Efficiency</li>
                                                    <li>Smart Installation Tools</li>
                                                    <li>Dynamic Boosting</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div  className={activeIndex == 3 ? "tab-pane fade show active" : "tab-pane fade"} id="tab-3">
                                    <div className="item-preparing">
                                        <div className="item-preparing-left img-3" />
                                        <div className="item-preparing-right">
                                            <div className="internet-icon"><span /> Our Features</div>
                                            <h2 className="heading-2 mb-20">Trusted by worldwide clients since 1980</h2>
                                            <p className="text-lg neutral-700">In a professional context it often happens that
                                                private or corporate clients order a publication news while still not being
                                                ready. In a professional context it often happens that private or corporate
                                                clients order a publication news while still not being ready.</p>
                                            <div className="box-list-check">
                                                <ul className="list-check">
                                                    <li>Trustworthy Research</li>
                                                    <li>SEO Efficiency</li>
                                                    <li>Time Efficiency</li>
                                                    <li>Smart Installation Tools</li>
                                                    <li>Dynamic Boosting</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div  className={activeIndex == 4 ? "tab-pane fade show active" : "tab-pane fade"} id="tab-4">
                                    <div className="item-preparing">
                                        <div className="item-preparing-left img-4" />
                                        <div className="item-preparing-right">
                                            <div className="internet-icon"><span /> Our Features</div>
                                            <h2 className="heading-2 mb-20">Trusted by worldwide clients since 1980</h2>
                                            <p className="text-lg neutral-700">In a professional context it often happens that
                                                private or corporate clients order a publication news while still not being
                                                ready. In a professional context it often happens that private or corporate
                                                clients order a publication news while still not being ready.</p>
                                            <div className="box-list-check">
                                                <ul className="list-check">
                                                    <li>Trustworthy Research</li>
                                                    <li>SEO Efficiency</li>
                                                    <li>Time Efficiency</li>
                                                    <li>Smart Installation Tools</li>
                                                    <li>Dynamic Boosting</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div  className={activeIndex == 5 ? "tab-pane fade show active" : "tab-pane fade"} id="tab-5">
                                    <div className="item-preparing">
                                        <div className="item-preparing-left img-5" />
                                        <div className="item-preparing-right">
                                            <div className="internet-icon"><span /> Our Features</div>
                                            <h2 className="heading-2 mb-20">Trusted by worldwide clients since 1980</h2>
                                            <p className="text-lg neutral-700">In a professional context it often happens that
                                                private or corporate clients order a publication news while still not being
                                                ready. In a professional context it often happens that private or corporate
                                                clients order a publication news while still not being ready.</p>
                                            <div className="box-list-check">
                                                <ul className="list-check">
                                                    <li>Trustworthy Research</li>
                                                    <li>SEO Efficiency</li>
                                                    <li>Time Efficiency</li>
                                                    <li>Smart Installation Tools</li>
                                                    <li>Dynamic Boosting</li>
                                                </ul>
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
    )
}
