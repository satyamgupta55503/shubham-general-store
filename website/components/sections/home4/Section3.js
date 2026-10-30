
import Link from 'next/link'

export default function Section3() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-our-track box-our-track-3">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 text-center mb-40"><img src="/assets/imgs/page/homepage4/img-track.png" alt="Nivia" /></div>
                        <div className="col-lg-6 mb-40">
                            <div className="box-padding-left-50">
                                <div className="strate-icon"><span /> Strategies that work</div>
                                <h2 className="heading-2 mb-20">Track the progress towards objectives with key results</h2>
                                <p className="text-lg neutral-700">Nivia is an independent web design studio with a rich
                                    history. Founded in 1999, it gathered the best web designers  developers.</p>
                                <div className="row mt-50">
                                    <div className="col-lg-6 col-sm-6">
                                        <div className="card-feature-2">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage3/marketing.svg" alt="Nivia" /></div>
                                            <div className="card-info"><Link href="#">
                                                <h3 className="text-22-bold">Intuitive Dashboard</h3>
                                            </Link>
                                                <p className="text-md neutral-700">Data-Driven Decisions: Leveraging Engagement
                                                    Analysis for Growth</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-sm-6">
                                        <div className="card-feature-2">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage3/digital.svg" /></div>
                                            <div className="card-info"><Link href="#">
                                                <h3 className="text-22-bold">Engagement Analysis</h3>
                                            </Link>
                                                <p className="text-md neutral-700">Boosting Conversions: Strategies Informed by
                                                    Engagement Analysis</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-sm-6">
                                        <div className="card-feature-2">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage3/product.svg" /></div>
                                            <div className="card-info"><Link href="#">
                                                <h3 className="text-22-bold">Advanced Security</h3>
                                            </Link>
                                                <p className="text-md neutral-700">Unlocking Audience Insights: A Deep Dive into
                                                    Engagement Analysis</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 col-sm-6">
                                        <div className="card-feature-2">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage3/social.svg" /></div>
                                            <div className="card-info"><Link href="#">
                                                <h3 className="text-22-bold">Weekly Email Reports</h3>
                                            </Link>
                                                <p className="text-md neutral-700">Decoding User Behavior: The Art of Engagement
                                                    Analysis</p>
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
