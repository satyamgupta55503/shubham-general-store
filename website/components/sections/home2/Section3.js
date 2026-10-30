
import Link from 'next/link'

export default function Section3() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-our-features-5 pt-0">
                <div className="container">
                    <div className="text-center"><Link className="btn btn-brand-5" href="#">Amazing features</Link>
                        <h2 className="mb-25 mt-15 neutral-0">Provide best results to<br className="d-none d-lg-block" />your
                            customers</h2>
                        <p className="text-md neutral-500 mb-55">In general, analyses of famous case studies help your clients,
                            partners, and visitors have a better<br className="d-none d-lg-block" />understanding of what is going
                            on in the market. Your helpful advice can also be beneficial for audiences,<br className="d-none d-lg-block" />which keeps them coming back for more.</p>
                    </div>
                    <div className="row">
                        <div className="col-lg-4 col-sm-6">
                            <div className="card-features-5">
                                <div className="card-image"><img src="/assets/imgs/page/homepage2/web.svg" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h6>Web Design</h6>
                                    <p className="text-sm neutral-500">Strategic approach that involves creating and
                                        distributing valuable, relevant, and engaging content to attract and retain a target
                                        audience, ultimately driving brand awareness and customer loyalty.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="card-features-5">
                                <div className="card-image"><img src="/assets/imgs/page/homepage2/3d.svg" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h6>3D Animation</h6>
                                    <p className="text-sm neutral-500">Refers to the process of reevaluating and improving the
                                        internal operations, structure, and strategies of a company to adapt to changing
                                        market conditions and achieve better efficiency, profitability, and competitiveness.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="card-features-5">
                                <div className="card-image"><img src="/assets/imgs/page/homepage2/social.svg" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h6>Social Media</h6>
                                    <p className="text-sm neutral-500">Involves overseeing an organization's technology
                                        resources, including hardware, software, networks, and personnel, to ensure the
                                        efficient and secure operation of IT systems in alignment with business objectives.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="card-features-5">
                                <div className="card-image"><img src="/assets/imgs/page/homepage2/engine.svg" alt="Nivia" /></div>
                                <div className="card-info">
                                    <h6>Search Engines</h6>
                                    <p className="text-sm neutral-500">An infrastructure plan outlines a comprehensive strategy
                                        for designing, building, and maintaining physical and digital infrastructure,
                                        ensuring scalability, resilience, and sustainable development.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="card-features-5">
                                <div className="card-image"><img src="/assets/imgs/page/homepage2/security.svg" alt="Nivia" />
                                </div>
                                <div className="card-info">
                                    <h6>Data Security</h6>
                                    <p className="text-sm neutral-500">Signifies the enhancement of security measures, typically
                                        through the use of advanced firewall technology, to protect networks and systems
                                        from unauthorized access, malware, and cyber threats.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 col-sm-6">
                            <div className="card-features-5">
                                <div className="card-image"><img src="/assets/imgs/page/homepage2/firewall.svg" alt="Nivia" />
                                </div>
                                <div className="card-info">
                                    <h6>Firewall Advance</h6>
                                    <p className="text-sm neutral-500">The practice of safeguarding sensitive information from
                                        unauthorized access, disclosure. It involves implementing robust security protocols,
                                        encryption, and access control measures to protect data integrity and privacy.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-20">
                        <p className="text-md neutral-0">Challenges are just opportunities in disguise<Link className="brand-4" href="#">Take the challenge!</Link></p>
                    </div>
                </div>
            </section>
        </>
    )
}
