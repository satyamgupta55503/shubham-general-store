
import Link from 'next/link'

export default function Section6() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-pricing-3">
                <div className="container">
                    <div className="text-center"><Link className="btn btn-brand-4-sm" href="#">Pricing Plan</Link>
                        <h2 className="mb-20 mt-15">Ready to Get Started? Don't Worry,<br className="d-none d-lg-block" /> We'll Keep
                            You Under Budget</h2>
                        <p className="text-lg neutral-500 mb-65">Get started with a 5-day trial, 25% off for Yearly Plan, Cancel
                            anytime.</p>
                    </div>
                    <div className="block-pricing">
                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                <div className="card-pricing card-pricing-style-2 text-center">
                                    <div className="card-title"><img src="/assets/imgs/page/homepage4/pricing1.png" alt="Nivia" />
                                    </div>
                                    <div className="card-prices mt-30">
                                        <h6 className="mb-5">Starter</h6>
                                        <h1 className="heading-1 mb-5"><span className="text-xl">$</span>99.0</h1>
                                    </div>
                                    <div className="card-desc">
                                        <p className="text-sm neutral-500">One domain with section nesting and preset are allow
                                            in this plan</p>
                                    </div>
                                    <div className="card-button"><Link className="btn btn-get-started" href="#">Get started
                                        <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                                        </svg></Link></div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-pricing card-pricing-style-2 text-center active">
                                    <div className="card-title"><img src="/assets/imgs/page/homepage4/pricing2.png" alt="Nivia" />
                                    </div>
                                    <div className="card-prices mt-30">
                                        <h6 className="mb-5">Basic</h6>
                                        <h1 className="heading-1 mb-5"><span className="text-xl">$</span>199.0</h1>
                                    </div>
                                    <div className="card-desc">
                                        <p className="text-sm neutral-500">Five domains, section nesting, preset and cross
                                            domain copy paste are included</p>
                                    </div>
                                    <div className="card-button"><Link className="btn btn-get-started" href="#">Get started
                                        <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                                        </svg></Link></div>
                                </div>
                            </div>
                            <div className="col-lg-4 col-md-6">
                                <div className="card-pricing card-pricing-style-2 text-center">
                                    <div className="card-title"><img src="/assets/imgs/page/homepage4/pricing3.png" alt="Nivia" />
                                    </div>
                                    <div className="card-prices mt-30">
                                        <h6 className="mb-5">Premium</h6>
                                        <h1 className="heading-1 mb-5"><span className="text-xl">$</span>299.0</h1>
                                    </div>
                                    <div className="card-desc">
                                        <p className="text-sm neutral-500">Unlimited domains, section nesting, preset and cross
                                            domain copy paste are included</p>
                                    </div>
                                    <div className="card-button"><Link className="btn btn-get-started" href="#">Get started
                                        <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                                        </svg></Link></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
