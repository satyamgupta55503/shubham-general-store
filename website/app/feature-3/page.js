
import CounterUp from '@/components/elements/CounterUp'
import Layout from "@/components/layout/Layout"
import Link from 'next/link'
export default function Feature3() {

    return (
        <>

            <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4" >
                <div>
                    <section className="section-box box-content-feature box-content-feature-3">
                        <div className="container">
                            <div className="row align-items-center">
                                <div className="col-lg-6"><span className="btn btn-bg-brand-4 mb-25"><span>
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22.0532 15.1551L12.3032 1.65509C12.2684 1.60707 12.2228 1.56797 12.17 1.54102C12.1172 1.51406 12.0587 1.5 11.9994 1.5C11.9402 1.5 11.8817 1.51406 11.8289 1.54102C11.7761 1.56797 11.7305 1.60707 11.6957 1.65509L1.9457 15.1551C1.91663 15.1955 1.89588 15.2412 1.88466 15.2897C1.87344 15.3381 1.87198 15.3883 1.88035 15.4374C1.88873 15.4864 1.90678 15.5333 1.93345 15.5753C1.96012 15.6173 1.99487 15.6535 2.0357 15.682L11.7857 22.432C11.8485 22.4755 11.923 22.4988 11.9994 22.4988C12.0758 22.4988 12.1504 22.4755 12.2132 22.432L21.9632 15.682C22.004 15.6535 22.0388 15.6173 22.0654 15.5753C22.0921 15.5333 22.1102 15.4864 22.1185 15.4374C22.1269 15.3883 22.1254 15.3381 22.1142 15.2897C22.103 15.2412 22.0823 15.1955 22.0532 15.1551ZM11.9994 15.6445L8.6882 12.9951L11.9994 3.05946L15.3107 12.997L11.9994 15.6445ZM7.94945 12.832L3.22257 14.6676L10.8744 4.08134L7.94945 12.832ZM8.18382 13.5463L11.6244 16.312V21.4157L3.11195 15.5151L8.18382 13.5463ZM12.3744 16.312L15.8169 13.5501L20.9469 15.4738L12.3744 21.4082V16.312ZM16.0494 12.8432L13.1244 4.08134L20.7126 14.5813L16.0494 12.8432Z" fill="true" />
                                    </svg></span>Our Features</span>
                                    <h2 className="mt-15 mb-15">What You Get From<br className="d-none d-lg-block" />Nivia Platform</h2>
                                    <p className="text-lg neutral-500 mb-25">Let's browse through all the great features you'll get when<br className="d-none d-lg-block" />you're in the Nivia ecosystem</p>
                                </div>
                                <div className="col-lg-6">
                                    <div className="box-banner-feature"> <img src="/assets/imgs/page/features/banner.png" alt="Nivia" />
                                        <div className="card-number-feature card-number-bottom">
                                            <h4> <CounterUp count={17} />k+</h4>
                                            <p className="text-sm">Happy Clients</p>
                                        </div>
                                        <div className="card-number-feature card-number-top">
                                            <h4> <CounterUp count={12} />k+</h4>
                                            <p className="text-sm">Completed Cases</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section >
                    <section className="section-box box-benifit">
                        <div className="container">
                            <div className="box-border-rounded">
                                <div className="row align-items-center">
                                    <div className="col-lg-6 mb-40 text-center text-lg-start">
                                        <div className="image-feature-2"><img src="/assets/imgs/page/features/img-track.png" alt="Nivia" /></div>
                                    </div>
                                    <div className="col-lg-6 mb-40">
                                        <h3 className="heading-3 mb-20">What job profiles are we currently looking for?</h3>
                                        <div className="row mt-50">
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/marketing.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Marketing Strategy</h3></Link>
                                                        <p className="text-md neutral-700">Strategic approach that involves creating and distributing valuable, relevant</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/digital.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Digital Services</h3></Link>
                                                        <p className="text-md neutral-700">An infrastructure plan outlines a comprehensive strategy for designing, building</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/product.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Product Selling</h3></Link>
                                                        <p className="text-md neutral-700">Signifies the enhancement of security measures, typically through the use of advanced firewall</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/social.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Social Marketing</h3></Link>
                                                        <p className="text-md neutral-700">Involves overseeing an organization's technology resources, including hardware, software, networks</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="box-border-rounded">
                                <div className="row align-items-center">
                                    <div className="col-lg-6 mb-40">
                                        <h3 className="heading-3 mb-20">The full service we are offering is specifically designed to meet your business needs and projects</h3>
                                        <div className="row mt-50">
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/marketing.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Marketing</h3></Link>
                                                        <p className="text-md neutral-700">Marketing involves understanding customer needs and preferences</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/digital.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Strategy</h3></Link>
                                                        <p className="text-md neutral-700">Strategy in the context of business and marketing refers to a long-term plan</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/product.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Development</h3></Link>
                                                        <p className="text-md neutral-700">Development in the marketing context refers to the creation, refinement</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-lg-6 col-md-6">
                                                <div className="card-feature-2">
                                                    <div className="card-image"><img src="/assets/imgs/page/homepage3/social.svg" /></div>
                                                    <div className="card-info"><Link href="#">
                                                        <h3 className="text-22-bold">Data Analysis</h3></Link>
                                                        <p className="text-md neutral-700">Data analysis in marketing involves the interpretation and examination of data to generate insights</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-6 mb-40 text-center text-lg-end">
                                        <div className="image-feature-2"><img src="/assets/imgs/page/features/img-track2.png" alt="Nivia" /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-6">
                                    <div className="box-border-rounded-md">
                                        <div className="row align-items-center">
                                            <div className="col-md-7 mb-30">
                                                <h4 className="mb-20">Save your time and money by choosing our professional team</h4>
                                                <p className="text-md neutral-700">Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, iste</p>
                                            </div>
                                            <div className="col-md-5 mb-30 text-center text-md-end"><img src="/assets/imgs/page/features/save-time.png" /></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <div className="box-border-rounded-md">
                                        <div className="row align-items-center">
                                            <div className="col-md-7 mb-30">
                                                <h4 className="mb-20">Convinced yet? Let's make something great together</h4>
                                                <p className="text-md neutral-700">Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur, iste</p>
                                            </div>
                                            <div className="col-md-5 mb-30 text-center text-md-end"><img src="/assets/imgs/page/features/convin.png" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-4 col-md-6">
                                    <div className="card-question card-question-2">
                                        <div className="card-image"><img src="/assets/imgs/page/features/internet.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h6>Scalable Workforce</h6>
                                            <p className="text-md neutral-600">In general, analyses of famous case studies help your clients, partners, and visitors have a better understanding of what is going on in the market. Your helpful advice can also be beneficial for audiences, which keeps them coming back for more.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="card-question card-question-2">
                                        <div className="card-image"><img src="/assets/imgs/page/features/train.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h6>Trained for Efficiency</h6>
                                            <p className="text-md neutral-600">In general, analyses of famous case studies help your clients, partners, and visitors have a better understanding of what is going on in the market. Your helpful advice can also be beneficial for audiences, which keeps them coming back for more.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-4 col-md-6">
                                    <div className="card-question card-question-2">
                                        <div className="card-image"><img src="/assets/imgs/page/features/pricing.png" alt="Nivia" /></div>
                                        <div className="card-info">
                                            <h6>Predictable Pricing</h6>
                                            <p className="text-md neutral-600">In general, analyses of famous case studies help your clients, partners, and visitors have a better understanding of what is going on in the market. Your helpful advice can also be beneficial for audiences, which keeps them coming back for more.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="section-box wow animate__animated animate__fadeIn box-have-project box-have-project-3">
                        <div className="text-center">
                            <h2 className="heading-1 mt-15 mb-20">Have Any Project?<br className="d-none d-lg-block" />Let’s Talk  Grow your Business</h2>
                            <p className="text-lg neutral-500 mb-35">We’r ready to help you. Our expert is here, just send a message.</p><Link className="btn btn-brand-4" href="#">Get started
                                <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 22 22" fill="none">
                                    <path d="M22 10.9993L18.4791 7.47852V10.3064H0V11.6924H18.4791V14.5203L22 10.9993Z" fill="true" />
                                </svg></Link>
                        </div>
                    </section>
                </div >

            </Layout >
        </>
    )
}