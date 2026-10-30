
import VideoPopup from '@/components/elements/VideoPopup'
import Link from 'next/link'

export default function Section1() {
    return (
        <>

            <section className="section-box">
                <div className="banner-hero hero-1"><span className="bg-icon-banner shape-1" />
                    <div className="banner-inner"><span className="bg-circle shape-3" />
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8">
                                    <div className="block-banner">
                                        <h1 className="heading-banner display-1 mb-30 wow animate__animated animate__fadeInUp">
                                            Product Designer<br className="d-none d-lg-block" /> Digital Marketer</h1>
                                        <div className="banner-description text-xl mb-60 mt-30 wow animate__animated animate__fadeInUp" data-wow-delay=".1s">We are a company that focuses on establishing long term<br className="d-none d-lg-block" />relationships with customers. We love to turn
                                            great ideas into beautiful products.</div>
                                        <div className="box-buttons"><Link className="btn btn-green-linear mr-15" href="#">Subscribe
                                            <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                                            </svg></Link>
                                            <VideoPopup style={2} />
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
