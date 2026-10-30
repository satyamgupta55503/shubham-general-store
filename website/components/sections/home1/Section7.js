
import Link from 'next/link'

export default function Section7() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-how-it-work">
                <div className="container"><Link className="btn btn-brand-4-sm" href="#">How It Works</Link>
                    <h2 className="mt-15 mb-20">Just 3 simple and quick steps to have a<br className="d-none d-lg-block" />perfect
                        automatic money making system</h2>
                    <p className="text-lg neutral-500 mb-55">Bole nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                        commodo conididunt ut labore et dolore<br className="d-none d-lg-block" />magna aliqua ut enim ad minim
                        veniam</p>
                    <div className="row">
                        <div className="col-lg-4">
                            <div className="box-border-rounded">
                                <div className="card-casestudy">
                                    <div className="card-title">
                                        <h6><span className="number">1</span>Signup for Service</h6>
                                    </div>
                                    <div className="card-desc">
                                        <p>This process is straightforward and swift, prioritizing your convenience and
                                            experience. It enables you to access tailored solutions and special offers
                                            swiftly, ensuring you can quickly begin enjoying our services.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="box-border-rounded">
                                <div className="card-casestudy">
                                    <div className="card-title">
                                        <h6><span className="number">2</span>Research  Development</h6>
                                    </div>
                                    <div className="card-desc">
                                        <p>We delve deeply into understanding your needs and objectives. We construct a
                                            customized strategy and solutions to ensure they reflect your goals and meet
                                            your expectations.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="box-border-rounded">
                                <div className="card-casestudy">
                                    <div className="card-title">
                                        <h6><span className="number">3</span>Sales  Earning</h6>
                                    </div>
                                    <div className="card-desc">
                                        <p>We monitor performance, optimize campaigns, and make certain that you attain the
                                            results you anticipate. This is the ultimate step to ensure you are well on your
                                            way to achieving success and revenue from your project.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container mt-25">
                    <div className="box-newsletter">
                        <div className="newsletter-left">
                            <h2>Join our community</h2>
                            <p className="text-md neutral-600">Work smarter with this time management and not hard join our
                                newsletter for a better expertrience</p>
                        </div>
                        <div className="newsletter-right">
                            <form action="#">
                                <input className="form-control" type="text" placeholder="Email address..." />
                                <button className="btn btn-subscribe" type="submit">Subscribe
                                    <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 10.9993L18.4791 7.47852V10.3064H0V11.6924H18.4791V14.5203L22 10.9993Z" fill="true" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
