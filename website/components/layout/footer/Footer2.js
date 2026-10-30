import Link from 'next/link'

export default function Footer2() {
    return (
        <>
            <footer className="footer footer-style-2 mt-50">
                <div className="container">
                    <div className="row">
                        <div className="col-md-3 col-sm-12 footer-1"><Link href="/"><img alt="Nivia" src="/assets/imgs/template/logo-black.svg" /></Link>
                            <div className="mt-20 mb-20">
                                <p className="text-md neutral-700"><span className="neutral-1000">Phone:</span> (000) 123 456 789</p>
                                <p className="text-md neutral-700"><span className="neutral-1000">Email:</span> youremail@gmail.com</p>
                                <p className="text-md neutral-700"><span className="neutral-1000">Address:</span> 102 Seddon Park,
                                    Hamilton New Zealnd</p>
                            </div>
                            <h6>Newsletter</h6>
                            <div className="form-newsletter">
                                <form>
                                    <input className="form-control border-gradient border-gradient-green" type="text" placeholder="email address" />
                                    <button className="btn btn-green-linear">Subscribe
                                        <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="col-md-2 col-xs-6 footer-2">
                            <h6>About Us</h6>
                            <ul className="menu-footer">
                                <li><a href="#">Company</a></li>
                                <li><a href="#">Careers</a></li>
                                <li><a href="#">Press media</a></li>
                                <li><a href="#">Our Blog</a></li>
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Sitemap</a></li>
                            </ul>
                        </div>
                        <div className="col-md-2 col-xs-6 footer-3">
                            <h6>Our Products</h6>
                            <ul className="menu-footer">
                                <li><a href="#">Designer</a></li>
                                <li><a href="#">CMS</a></li>
                                <li><a href="#">Ecommerce</a></li>
                                <li><a href="#">Interactions</a></li>
                                <li><a href="#">SEO</a></li>
                                <li><a href="#">Editor</a></li>
                                <li><a href="#">Hosting</a></li>
                                <li><a href="#">DevLink</a></li>
                            </ul>
                        </div>
                        <div className="col-md-2 col-xs-6 footer-4">
                            <h6>Explore</h6>
                            <ul className="menu-footer">
                                <li><a href="#">Marketplace</a></li>
                                <li><a href="#">Libraries</a></li>
                                <li><a href="#">Beta</a></li>
                                <li><a href="#">Hire an Expert</a></li>
                                <li><a href="#">Templates</a></li>
                                <li><a href="#">Resources</a></li>
                                <li><a href="#">Community</a></li>
                                <li><a href="#">Glossary</a></li>
                            </ul>
                        </div>
                        <div className="col-md-3 col-xs-6 footer-5">
                            <h6>Network</h6>
                            <ul className="menu-footer">
                                <li><a href="#">Google</a></li>
                                <li><a href="#">Dribbble</a></li>
                                <li><a href="#">LinkedIn</a></li>
                                <li><a href="#">Twitter</a></li>
                                <li><a href="#">Facebook</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom mt-50">
                        <div className="row">
                            <div className="col-md-6">
                                <p className="text-sm neutral-600">Copyright © 2023 Nivia. All rights reserved.</p>
                            </div>
                            <div className="col-md-6 text-md-end text-start">
                                <ul className="menu-bottom-footer">
                                    <li><a href="#">Privacy Policy</a></li>
                                    <li><a href="#">Terms Conditions</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

        </>
    )
}
