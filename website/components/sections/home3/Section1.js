
import Link from 'next/link'

export default function Section1() {
    return (
        <>

            <section className="section-box">
                <div className="banner-hero hero-3">
                    <div className="banner-inner">
                        <div className="container">
                            <h1 className="display-2 mb-25">Build Your&nbsp;<span className="text-bg-brand-4">Dream</span> Website with
                                Our<br className="d-none d-lg-block" /> Skilled Development Team</h1>
                            <p className="text-lg mb-25">Are you looking for a way to close all marketing, technical and
                                customer support<br className="d-none d-lg-block" /> tasks for your company in one place</p>
                            <div className="box-download-app justify-content-center"><Link href="#"><img src="/assets/imgs/page/homepage6/googleplay.png" alt="Nivia" /></Link><Link href="#"><img src="/assets/imgs/page/homepage6/appstore.png" alt="Nivia" /></Link></div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
