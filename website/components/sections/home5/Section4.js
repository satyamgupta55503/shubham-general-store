
import Link from 'next/link'

export default function Section4() {
    return (
        <>

            <section className="section-box box-all-in-one">
                <div className="container">
                    <div className="row align-items-end">
                        <div className="col-lg-7 mb-30">
                            <h2 className="display-2 neutral-1000">Design, Development, and Content. All-in-one</h2>
                        </div>
                        <div className="col-lg-5 mb-30">
                            <h5 className="heading-5 neutral-700">Take your online presence to the next level with my expert web
                                design and content creation services.</h5>
                        </div>
                    </div>
                    <div className="row mt-40">
                        <div className="col-lg-5">
                            <div className="card-design">
                                <div className="card-image"><img alt="Nivia" src="/assets/imgs/page/homepage6/ready.png" /></div>
                                <div className="card-info">
                                    <h3 className="heading-2 mb-30">Ready to go</h3>
                                    <p className="heading-5 card-desc">Take your online presence to the next level with my
                                        expert web design and content creation services.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-7">
                            <div className="card-design card-design-style2">
                                <div className="card-image"><img alt="Nivia" src="/assets/imgs/page/homepage6/integration.png" />
                                </div>
                                <div className="card-info">
                                    <h3 className="heading-2 mb-30">Integration with popular third-party tools. Customer
                                        Relationship Management (CRM) Integration</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                            <div className="card-design card-design-style3">
                                <div className="card-image"><img alt="Nivia" src="/assets/imgs/page/homepage6/fast.png" /></div>
                                <div className="card-info">
                                    <h3 className="heading-3 mb-30">Fast loading speed</h3>
                                    <p className="heading-5 card-desc">The best money I have spent in my life. thank to this
                                        template, we saw a 120% increase in conversion rates and doubled revenue in three
                                        hours.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                            <div className="card-design card-design-style4">
                                <div className="card-image"><img alt="Nivia" src="/assets/imgs/page/homepage6/design.png" /></div>
                                <div className="card-info">
                                    <h3 className="heading-3 mb-30">Professional design</h3>
                                    <p className="heading-5 card-desc">Take your online presence to the next level with my
                                        expert web design and content creation services.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-4 col-lg-6">
                            <div className="card-design card-design-style5">
                                <div className="card-image"><img alt="Nivia" src="/assets/imgs/page/homepage6/power.png" /></div>
                                <div className="card-info">
                                    <h3 className="heading-3 mb-30">Powerful software to help your business scale super fast.
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h4>Boost your sales with our platform.<br className="d-none d-lg-block" /><Link className="link-green" href="#">Contact us</Link> now for a quote</h4>
                    </div>
                </div>
            </section>
        </>
    )
}
