
import Countdown from "@/components/elements/Countdown"
import ResizeComingSoon from "@/components/elements/ResizeComingSoon"
import Layout from "@/components/layout/Layout"
import Link from 'next/link'
export default function CommingSoon() {
    const currentTime = new Date()
    return (
        <>
            <ResizeComingSoon />
            <Layout headerStyle={2} footerStyle={1} headerCls="header-style-6" >
                <section className="section-box box-content-comming-soon">
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-lg-7">
                                <div className="box-comming-soon-banner"><span className="btn btn-brand-4-sm">Coming Soon</span>
                                    <h1 className="title-banner">Our new website is<br />on its way.</h1>
                                    <div className="box-count box-count-square mb-70 mt-45 wow fadeInUp">
                                        <Countdown endDateTime={currentTime.setDate(currentTime.getDate() + 44)} />
                                    </div>
                                    <p className="text-xl">Get notified when we launch.</p>
                                    <div className="form-notify">
                                        <form action="#">
                                            <input className="form-control" type="text" placeholder="Email Address..." />
                                            <button className="btn btn-black btn-rounded btn-notify">Notify Me
                                                <svg xmlns="http://www.w3.org/2000/svg" width={22} height={8} viewBox="0 0 22 8" fill="none">
                                                    <path d="M22 4.00032L18.4791 0.479492V3.3074H0V4.69333H18.4791V7.52129L22 4.00032Z" fill="true" />
                                                </svg>
                                            </button>
                                        </form>
                                    </div>
                                    <div className="box-socials-commingsoon"><Link className="icon-socials icon-facebook" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/fb.svg" /></Link><Link className="icon-socials icon-instagram" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/in.svg" /></Link><Link className="icon-socials icon-twitter" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/tw.svg" /></Link><Link className="icon-socials icon-be" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/be.svg" /></Link></div>
                                </div>
                            </div>
                            <div className="col-lg-5">
                                <div className="box-image-banner-commingsoon" />
                            </div>
                        </div>
                    </div>
                </section>

            </Layout>
        </>
    )
}