
import VideoPopup from '@/components/elements/VideoPopup'
import Link from 'next/link'

export default function Section1() {
    return (
        <>

            <section className="section-box">
                <div className="banner-hero hero-4">
                    <div className="banner-inner">
                        <div className="container"><Link className="btn btn-brand-5" href="#">Easy Collaboration</Link>
                            <h1 className="display-2 mb-40 mt-15 neutral-0">Grow your business with our<br />marketing solutions
                            </h1>
                            <div className="box-buttons justify-content-center"><Link className="btn btn-brand-4-medium mr-15" href="#">Subscribe
                                <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                                </svg></Link>
                                <VideoPopup />
                            </div>
                            <div className="text-center box-image-banner"><img src="/assets/imgs/page/homepage2/banner.png" alt="Nivia" /></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
