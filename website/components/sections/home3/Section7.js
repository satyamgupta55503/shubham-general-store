
import CounterUp from '@/components/elements/CounterUp'
import Link from 'next/link'

export default function Section7() {
    return (
        <>

            <section className="section-box box-lead">
                <div className="container">
                    <div className="box-lead-inner">
                        <div className="row">
                            <div className="col-lg-6 mb-30"><Link className="btn btn-border-brand-4 text-linear-3" href="#">Lead
                                Management</Link>
                                <h3 className="heading-2 neutral-0 mt-20 mb-20">Maximize your marketing potential with our
                                    solutions</h3>
                                <p className="text-lg neutral-200 mb-35">Nivia is an independent web design studio with a rich
                                    history. Founded in 1999, it gathered the best web designers  developers.</p>
                                <div className="card-lead-list">
                                    <div className="item-lead">
                                        <div className="card-lead">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage3/discover.svg" alt="Nivia" /></div>
                                            <div className="card-info">
                                                <h3 className="text-22-bold">3000+</h3>
                                            <p className="text-md neutral-200">Success Projects</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="item-lead">
                                    <div className="card-lead">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/discover.svg" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h3 className="text-22-bold">6.8K</h3>
                                        <p className="text-md neutral-200">Happy Clients</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-lg neutral-200">Dolor sit amet, consectetur adipiscing elita florai psum
                            dolor sit amet consecteture Borem ipsum dolor sitter consectetur adipiscing elita florai
                            psum. eiusmod temporincididunt ut labore magna</p>
                    </div>
                    <div className="col-lg-6 mb-30 text-center text-lg-end">
                        <div className="box-border-linear-3 linear-3">
                            <div className="box-border-linear-3-inner"><img src="/assets/imgs/page/homepage3/img-lead.png" alt="Nivia" /></div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
            </section >
        </>
    )
}
