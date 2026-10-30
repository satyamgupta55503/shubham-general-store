
import Link from 'next/link'

export default function Section5() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-imazing-features">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5 mb-30"><Link className="btn btn-brand-5" href="#">Amazing features</Link>
                            <h3 className="mb-25 mt-15 neutral-0">The best solution for seamless productive teamwork</h3>
                            <p className="text-md neutral-0">We specializes in technological and IT-related services such as
                                product engineering, warranty management, building cloud, infrastructure, network, etc. We
                                put a strong focus on the needs of your business to figure out solutions that best fits your
                                demand and nail it.</p>
                            <div className="box-list-check">
                                <ul className="list-check list-check-block">
                                    <li>Trustworthy Research</li>
                                    <li>SEO Efficiency</li>
                                    <li>Time Efficiency</li>
                                </ul>
                            </div>
                        </div>
                        <div className="col-lg-7 mb-30">
                            <div className="row">
                                <div className="col-lg-6 col-sm-6">
                                    <div className="card-features-5">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage2/market.svg" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h6>Market Research</h6>
                                            <p className="text-sm neutral-500">Refers to the process of reevaluating and
                                                improving the internal operations, structure, and strategies of a company to
                                                adapt to changing market conditions and achieve better efficiency,
                                                profitability, and competitiveness.</p>
                                        </div>
                                    </div>
                                    <div className="card-features-5">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage2/content.svg" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h6>Content Marketing</h6>
                                            <p className="text-sm neutral-500"> Strategic approach that involves creating and
                                                distributing valuable, relevant, and engaging content to attract and retain
                                                a target audience, ultimately driving brand awareness and customer loyalty.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-sm-6 pt-40">
                                    <div className="card-features-5">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage2/social2.svg" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h6>Social Engagement</h6>
                                            <p className="text-sm neutral-500">Involves overseeing an organization's technology
                                                resources, including hardware, software, networks, and personnel, to ensure
                                                the efficient and secure operation of IT systems in alignment with business
                                                objectives.</p>
                                        </div>
                                    </div>
                                    <div className="card-features-5">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage2/daily.svg" alt="Nivia" />
                                        </div>
                                        <div className="card-info">
                                            <h6>Daily Updates</h6>
                                            <p className="text-sm neutral-500">Daily updates are regular reports or
                                                communications that provide information on the progress, developments, and
                                                activities within a project, team, or organization.</p>
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
