
import CounterUp from '@/components/elements/CounterUp'
import Link from 'next/link'

export default function Section4() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-our-features-4">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-40">
                            <div className="internet-icon"><span /> Our Features</div>
                            <h2 className="heading-2 mb-20">Nivia Platform - The best way to build your startup.</h2>
                            <p className="text-lg neutral-700">Nivia is an independent web design studio with a rich history.
                                Founded in 1999, it gathered the best web designers  developers.</p>
                            <div className="row mt-50">
                                <div className="col-lg-6 col-md-6">
                                    <div className="card-feature-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/marketing.svg" /></div>
                                        <div className="card-info"><Link href="#">
                                            <h3 className="text-22-bold">Marketing Strategy</h3>
                                        </Link>
                                            <p className="text-md neutral-700">Strategic approach that involves creating and
                                                distributing valuable, relevant</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <div className="card-feature-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/digital.svg" /></div>
                                        <div className="card-info"><Link href="#">
                                            <h3 className="text-22-bold">Digital Services</h3>
                                        </Link>
                                            <p className="text-md neutral-700">An infrastructure plan outlines a comprehensive
                                                strategy for designing, building</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <div className="card-feature-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/product.svg" /></div>
                                        <div className="card-info"><Link href="#">
                                            <h3 className="text-22-bold">Product Selling</h3>
                                        </Link>
                                            <p className="text-md neutral-700">Signifies the enhancement of security measures,
                                                typically through the use of advanced firewall</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6">
                                    <div className="card-feature-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/social.svg" /></div>
                                        <div className="card-info"><Link href="#">
                                            <h3 className="text-22-bold">Social Marketing</h3>
                                        </Link>
                                            <p className="text-md neutral-700">Involves overseeing an organization's technology
                                                resources, including hardware, software, networks</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="box-buttons-feature-4"><Link className="btn btn-black" href="#">Get a Quote
                                <svg width={22} height={8} viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 3.99934L18.4791 0.478516V3.30642H0V4.69236H18.4791V7.52031L22 3.99934Z" fill="true" />
                                </svg></Link><Link className="btn btn-learmore-2" href="#"><span>
                                    <svg width={13} height={13} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clipPath="url(#clip0_24_999)">
                                            <path d="M10.6557 3.81393L1.71996 12.7497L0.251953 11.2817L9.18664 2.34592H1.31195V0.269531H12.7321V11.6897H10.6557V3.81393Z" fill="#191919" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_24_999">
                                                <rect width={13} height={13} fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg></span> Learn More</Link>
                            </div>
                        </div>
                        <div className="col-lg-6 mb-40">
                            <div className="image-feature-2"><img src="/assets/imgs/page/homepage3/img-feature.png" alt="Nivia" />
                                <div className="card-number-feature card-number-bottom">
                                    <h4><CounterUp count={17} />k+</h4>
                                    <p className="text-sm">Happy Clients</p>
                                </div>
                                <div className="card-number-feature card-number-top">
                                    <h4><CounterUp count={12} />k+</h4>
                                    <p className="text-sm">Completed Cases</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </section >
        </>
    )
}
