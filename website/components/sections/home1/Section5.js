
import Link from 'next/link'

export default function Section5() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-our-track-2">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 mb-40">
                            <div className="strate-icon"><span /> Strategies that work</div>
                            <h2 className="heading-2 mb-20">Track the progress towards objectives with key results</h2>
                            <p className="text-lg neutral-700">Nivia is an independent web design studio with a rich history.
                                Founded in 1999, it gathered the best web designers  developers.</p>
                            <div className="row mt-50">
                                <div className="col-lg-12">
                                    <div className="card-feature-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/discover.svg" /></div>
                                        <div className="card-info"><Link href="#">
                                            <h3 className="text-22-bold">Discover your best and worst performing audiences
                                            </h3>
                                        </Link>
                                            <p className="text-md neutral-700">Lorem ipsum dolor sit amet consectetur
                                                adipisicing elit. Aspernatur, iste</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-12">
                                    <div className="card-feature-2">
                                        <div className="card-image"><img src="/assets/imgs/page/homepage3/keep.svg" /></div>
                                        <div className="card-info"><Link href="#">
                                            <h3 className="text-22-bold">Keep your team in the loop</h3>
                                        </Link>
                                            <p className="text-md neutral-700">Lorem ipsum dolor sit amet consectetur
                                                adipisicing elit. Aspernatur, iste</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="box-buttons-feature-4"><Link className="btn btn-brand-4-medium mr-20" href="#">Subscribe
                                <svg width={22} height={8} viewBox="0 0 22 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 3.99934L18.4791 0.478516V3.30642H0V4.69236H18.4791V7.52031L22 3.99934Z" fill="true" />
                                </svg></Link><Link className="btn btn-learmore-2" href="#"><span>
                                    <svg width={39} height={38} viewBox="0 0 39 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="0.5" width={38} height={38} rx={19} fill="#191919" />
                                        <g clipPath="url(#clip0_1_376)">
                                            <path d="M24.1537 16.8139L15.218 25.7497L13.75 24.2817L22.6847 15.3459H14.81V13.2695H26.2301V24.6897H24.1537V16.8139Z" fill="#C5FF55" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1_376">
                                                <rect width={13} height={13} fill="white" transform="translate(13.5 13)" />
                                            </clipPath>
                                        </defs>
                                    </svg></span>Learn More</Link></div>
                        </div>
                        <div className="col-lg-6 text-center mb-40">
                            <div className="box-border-image">
                                <div className="box-image-line-1">
                                    <div className="wow fadeInDown img-1" data-wow-delay={0}><img src="/assets/imgs/page/homepage1/img-track2-1.png" alt="Nivia" /></div>
                                    <div className="wow fadeInDown img-1" data-wow-delay="0.3s"><img src="/assets/imgs/page/homepage1/img-track2-2.png" alt="Nivia" /></div>
                                </div>
                                <div className="box-image-line-2">
                                    <div className="wow fadeInLeft img-1" data-wow-delay={0}><img src="/assets/imgs/page/homepage1/img-track2-3.png" alt="Nivia" /></div>
                                    <div className="wow fadeInRight img-1" data-wow-delay="0.2s"><img src="/assets/imgs/page/homepage1/img-track2-4.png" alt="Nivia" /></div>
                                </div>
                                <div className="box-image-line-3">
                                    <div className="wow fadeInUp img-1" data-wow-delay={0}><img src="/assets/imgs/page/homepage1/img-track2-5.png" alt="Nivia" /></div>
                                    <div className="wow fadeInUp img-2" data-wow-delay="0.2s"><img src="/assets/imgs/page/homepage1/img-track2-6.png" alt="Nivia" /></div>
                                    <div className="wow fadeInUp img-3" data-wow-delay="0.4s"><img src="/assets/imgs/page/homepage1/img-track2-7.png" alt="Nivia" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
