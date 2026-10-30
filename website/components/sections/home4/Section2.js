
import VideoPopup from '@/components/elements/VideoPopup'
import Link from 'next/link'

export default function Section2() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-what-we-do">
                <div className="container">
                    <div className="text-center"><Link className="btn btn-brand-5" href="#">What do we do?</Link>
                        <h2 className="heading-1 neutral-0 mt-15 mb-65">We provide wide range of<br className="d-none d-md-block" />digital services</h2>
                    </div>
                    <div className="box-list-we-do">
                        <div className="row">
                            <div className="col-xl-3 col-lg-5">
                                <div className="card-features-6 hover-up">
                                    <div className="card-image"><img src="/assets/imgs/page/homepage4/web.png" alt="Nivia" /></div>
                                    <div className="card-info">
                                        <h6>Collect Website Leads With Embedded</h6>
                                        <p className="text-sm neutral-400">A startup is started by individual founders or
                                            entrepreneurs to search for a repeatable</p><img className="mt-25" src="/assets/imgs/page/homepage4/img-web.png" alt="Nivia" />
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-4 col-lg-7">
                                <div className="card-features-6 hover-up">
                                    <div className="card-image"><img src="/assets/imgs/page/homepage4/global.png" alt="Nivia" />
                                    </div>
                                    <div className="card-info">
                                        <h6>World best web design<br className="d-none d-md-block" />service provider</h6>
                                        <p className="text-sm neutral-400">We embrace holistic development and support for<br className="d-none d-md-block" />employees with the aim of being a first-choice<br className="d-none d-md-block" />employer within our sectors.</p>
                                    </div>
                                </div>
                                <div className="card-features-6 card-arrow-2 hover-up">
                                    <div className="card-image"><img src="/assets/imgs/page/homepage4/laptop.png" alt="Nivia" />
                                    </div>
                                    <div className="card-info">
                                        <h6>UI/UX Analysis</h6>
                                        <p className="text-sm neutral-400">Our design services starts and ends best in class
                                            experience.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-xl-5 col-lg-12">
                                <div className="row">
                                    <div className="col-lg-12">
                                        <div className="card-features-6 card-arrow-3 hover-up">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage4/brain.png" alt="Nivia" /></div>
                                            <div className="card-info">
                                                <div className="card-info-inner">
                                                    <div className="card-info-left">
                                                        <h6>Strategy  Research.</h6>
                                                        <p className="text-sm neutral-400">Build an online store that rank
                                                            higher  sell more and integrates easily.</p>
                                                    </div>
                                                    <div className="card-info-right"><Link className="btn btn-learmore-2 neutral-0" href="#"><span>
                                                        <svg width={38} height={38} viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect width={38} height={38} rx={19} fill="#2B2C2D">
                                                            </rect>
                                                            <g clipPath="url(#clip0_9_2340)">
                                                                <path d="M23.6537 16.8149L14.718 25.7506L13.25 24.2826L22.1847 15.3469H14.31V13.2705H25.7301V24.6906H23.6537V16.8149Z" fill="#C5FF55" />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_9_2340">
                                                                    <rect width={13} height={13} fill="white" transform="translate(13 13)" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg></span>Learn More</Link></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="card-features-6 card-features-300 hover-up">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage4/search.png" alt="Nivia" /></div>
                                            <div className="card-info">
                                                <h6>Search Optimization</h6>
                                                <p className="text-sm neutral-400">Through a unique combination of engineering,
                                                    construction and design disciplines and expertise.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="card-features-6 card-features-300 hover-up">
                                            <div className="card-image"><img src="/assets/imgs/page/homepage4/cloud.png" alt="Nivia" /></div>
                                            <div className="card-info">
                                                <h6>Cloud Computing</h6>
                                                <p className="text-sm neutral-400">Our design services starts and ends best in
                                                    class experience.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="box-buttons justify-content-center mt-35"><Link className="btn btn-brand-4-medium mr-15" href="#">Subscribe
                        <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true">
                            </path>
                        </svg></Link>
                        <VideoPopup />
                    </div>
                </div>
            </section>
        </>
    )
}
