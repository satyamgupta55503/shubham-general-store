import CounterUp from '@/components/elements/CounterUp'


export default function Section8() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-our-client">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-6 text-center">
                            <div className="box-image-client"><img src="/assets/imgs/page/homepage2/chart.png" alt="Nivia" />
                                <div className="img-sold"><img src="/assets/imgs/page/homepage2/sold.png" alt="Nivia" /></div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <h4 className="neutral-0 mb-15">We are trusted by over 50000+ clients. Join them now and grow your
                                business</h4>
                            <p className="text-md neutral-500">We provide the most responsive and functional IT design for
                                companies and businesses worldwide. It’s possible to simultaneously manage and transform
                                information from one server to another.</p>
                            <div className="list-our-works">
                                <div className="item-work">
                                    <h4 className="brand-4"><CounterUp count={1000} />+</h4>
                                    <p className="text-lg neutral-0">Completed Projects</p>
                                </div>
                                <div className="item-work">
                                    <h4 className="brand-4"><CounterUp count={50} />K+</h4>
                                    <p className="text-lg neutral-0">Happy Customers</p>
                                </div>
                                <div className="item-work">
                                    <h4 className="brand-4"><CounterUp count={1680} />+</h4>
                                    <p className="text-lg neutral-0">Account numbers</p>
                                </div>
                                <div className="item-work">
                                    <h4 className="brand-4"><CounterUp count={79} />+</h4>
                                    <p className="text-lg neutral-0">Global brancheses</p>
                                </div>
                            </div>
                        </div >
                    </div >
                </div >
            </section >
        </>
    )
}
