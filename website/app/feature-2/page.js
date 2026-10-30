
import LogoTicker from '@/components/elements/LogoTicker'
import Layout from "@/components/layout/Layout"
import Team2Slider from '@/components/slider/Team2Slider'
import Link from 'next/link'
export default function Feature2() {

    return (
        <>

            <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4" >
                <div>
                    <section className="section-box box-content-feature box-content-feature-2">
                        <div className="container">
                            <div className="text-center"> <span className="btn btn-bg-brand-4 mb-25"><span>
                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.0532 15.1551L12.3032 1.65509C12.2684 1.60707 12.2228 1.56797 12.17 1.54102C12.1172 1.51406 12.0587 1.5 11.9994 1.5C11.9402 1.5 11.8817 1.51406 11.8289 1.54102C11.7761 1.56797 11.7305 1.60707 11.6957 1.65509L1.9457 15.1551C1.91663 15.1955 1.89588 15.2412 1.88466 15.2897C1.87344 15.3381 1.87198 15.3883 1.88035 15.4374C1.88873 15.4864 1.90678 15.5333 1.93345 15.5753C1.96012 15.6173 1.99487 15.6535 2.0357 15.682L11.7857 22.432C11.8485 22.4755 11.923 22.4988 11.9994 22.4988C12.0758 22.4988 12.1504 22.4755 12.2132 22.432L21.9632 15.682C22.004 15.6535 22.0388 15.6173 22.0654 15.5753C22.0921 15.5333 22.1102 15.4864 22.1185 15.4374C22.1269 15.3883 22.1254 15.3381 22.1142 15.2897C22.103 15.2412 22.0823 15.1955 22.0532 15.1551ZM11.9994 15.6445L8.6882 12.9951L11.9994 3.05946L15.3107 12.997L11.9994 15.6445ZM7.94945 12.832L3.22257 14.6676L10.8744 4.08134L7.94945 12.832ZM8.18382 13.5463L11.6244 16.312V21.4157L3.11195 15.5151L8.18382 13.5463ZM12.3744 16.312L15.8169 13.5501L20.9469 15.4738L12.3744 21.4082V16.312ZM16.0494 12.8432L13.1244 4.08134L20.7126 14.5813L16.0494 12.8432Z" fill="true" />
                                </svg></span>Our Features</span>
                                <h2 className="mt-15 mb-15">What You Get From Nivia Platform</h2>
                                <p className="text-lg neutral-500 mb-25">Let's browse through all the great features you'll get when<br className="d-none d-lg-block" />you're in the Nivia ecosystem</p>
                            </div>
                            <div className="list-features-2">
                                <div className="item-list-feature">
                                    <div className="feature-left"> <Link href="#"><img src="/assets/imgs/page/features/img-feature.png" alt="Nivia" /></Link></div>
                                    <div className="feature-right">
                                        <h4 className="heading-4 mb-20">Access to the latest online courses to learn new tech and trends</h4>
                                        <p className="text-lg neutral-700">Nivia is an independent web design studio with a rich history. Founded in 1999, it gathered the best web designers  developers.</p>
                                        <div className="box-list-check">
                                            <ul className="list-check">
                                                <li>Trustworthy Research</li>
                                                <li>SEO Efficiency</li>
                                                <li>Time Efficiency</li>
                                                <li>Smart Installation Tools</li>
                                                <li>Dynamic Boosting</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="item-list-feature">
                                    <div className="feature-left"> <Link href="#"><img src="/assets/imgs/page/features/img-feature2.png" alt="Nivia" /></Link></div>
                                    <div className="feature-right">
                                        <h4 className="heading-4 mb-20">Monthly tracked skill and work quality improvements</h4>
                                        <p className="text-lg neutral-700">With lots of unique and useful features, you can easily manage your wallet easily without any problem.</p>
                                        <div className="box-list-checked">
                                            <ul className="list-checked">
                                                <li>You’ve been designing digital products for 2+ years.</li>
                                                <li>Push for and create inclusive, accessible design for all</li>
                                                <li>Unlimited paid vacation and paid company holidays</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="item-list-feature">
                                    <div className="feature-left"> <Link href="#"><img src="/assets/imgs/page/features/img-feature3.png" alt="Nivia" /></Link></div>
                                    <div className="feature-right">
                                        <h4 className="heading-4 mb-20">The Traditional Way of Hiring Creative Freelancers is Broken</h4>
                                        <p className="text-lg neutral-700">End-to-end payments and financial management in a single solution. Download our app and start your free trail to get started today!</p>
                                        <div className="box-list-check">
                                            <ul className="list-check">
                                                <li>Trustworthy Research</li>
                                                <li>SEO Efficiency</li>
                                                <li>Time Efficiency</li>
                                                <li>Smart Installation Tools</li>
                                                <li>Dynamic Boosting</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="section-box wow animate__animated animate__fadeIn box-have-project box-have-project-2">
                        <div className="text-center">
                            <h2 className="heading-1 mt-15 mb-20">Have Any Project?<br className="d-none d-lg-block" />Let’s Talk  Grow your Business</h2>
                            <p className="text-lg neutral-500 mb-35">We’r ready to help you. Our expert is here, just send a message.</p><Link className="btn btn-brand-4" href="#">Get started
                                <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none">
                                    <path d="M22 10.9993L18.4791 7.47852V10.3064H0V11.6924H18.4791V14.5203L22 10.9993Z" fill="true" />
                                </svg></Link>
                        </div>
                    </section>
                    <section className="section-box wow animate__animated animate__fadeIn box-logos-4">
                        <div className="container">
                            <div className="carouselTickerLogos2 carouselTicker_vertical" id="slide-logos">
                                <LogoTicker />
                            </div>
                        </div>
                    </section>
                    <section className="section-box wow animate__animated animate__fadeIn box-our-team-2">
                        <div className="box-our-team-2-inner">
                            <div className="container">
                                <div className="text-center"><Link className="btn btn-brand-4-sm" href="#">Our people</Link>
                                    <h2 className="mb-20 mt-20">Meet Our Team</h2>
                                    <p className="text-md neutral-500">This is our team, a lot of smiling happy people who work hard to<br className="d-none d-lg-block" />empower your teams.</p>
                                </div>
                                <div className="box-swiper mt-60">
                                    <Team2Slider />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

            </Layout>
        </>
    )
}