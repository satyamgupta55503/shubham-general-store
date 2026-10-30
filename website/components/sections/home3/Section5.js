
import Link from 'next/link'

export default function Section5() {
    return (
        <>

            <section className="section-box box-companion">
                <div className="container">
                    <div className="row align-items-end">
                        <div className="col-lg-7 mb-30">
                            <h2 className="heading-1 neutral-0">Your<span className="text-bg-brand-4 neutral-1000">Ultimate</span> productivity and study companion
                            </h2>
                        </div>
                        <div className="col-lg-5 mb-30">
                            <p className="text-xl neutral-700">Weekly workout schedules are customized by your Future Coach for
                                you,</p>
                        </div>
                    </div>
                    <div className="row mt-130">
                        <div className="col-lg-6"><img alt="Nivia" src="/assets/imgs/page/homepage3/img-companion6.png" /></div>
                        <div className="col-lg-6">
                            <h2 className="heading-2 neutral-0 mb-20">Find actionable insights, and generate reports</h2>
                            <p className="text-lg neutral-200">Nivia is an independent web design studio with a rich history.
                                Founded in 1999, it gathered the best web designers  developers.</p>
                            <div className="box-list-feature mt-55">
                                <div className="card-feature-2 card-feature-brand-4">
                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/find.svg" /></div>
                                    <div className="card-info"><Link href="#">
                                        <h3 className="text-22-bold">Find creative insights and optimize size</h3>
                                    </Link>
                                        <p className="text-md neutral-200">Lorem ipsum dolor sit amet consectetur adipisicing
                                            elit. Aspernatur, iste</p>
                                    </div>
                                </div>
                                <div className="card-feature-2 card-feature-brand-4">
                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/discover.svg" /></div>
                                    <div className="card-info"><Link href="#">
                                        <h3 className="text-22-bold">Discover your best and worst performing audiences</h3>
                                    </Link>
                                        <p className="text-md neutral-200">Lorem ipsum dolor sit amet consectetur adipisicing
                                            elit. Aspernatur, iste</p>
                                    </div>
                                </div>
                                <div className="card-feature-2 card-feature-brand-4">
                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/keep.svg" /></div>
                                    <div className="card-info"><Link href="#">
                                        <h3 className="text-22-bold">Keep your team in the loop</h3>
                                    </Link>
                                        <p className="text-md neutral-200">Lorem ipsum dolor sit amet consectetur adipisicing
                                            elit. Aspernatur, iste</p>
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
