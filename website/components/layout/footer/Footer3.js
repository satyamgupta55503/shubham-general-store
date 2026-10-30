import Link from 'next/link'

export default function Footer3() {
    return (
        <>
            <footer className="footer footer-style-3">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-3 col-md-3 col-sm-12"><Link href="/"><img alt="Nivia" src="/assets/imgs/template/logo.svg" /></Link>
                            <div className="mt-20 mb-20">
                                <p className="text-md neutral-600 mb-10">4517 Washington Ave. Manchester, Kentucky 39495</p>
                                <p className="text-md neutral-600">Hours: 8:00 - 17:00, Mon - Sat </p>
                            </div>
                        </div>
                        <div className="col-lg-6 col-md-5 col-xs-6">
                            <div className="row mt-80">
                                <div className="col-lg-3">
                                    <ul className="menu-footer">
                                        <li><a href="#">Company</a></li>
                                        <li><a href="#">Careers</a></li>
                                        <li><a href="#">Press media</a></li>
                                        <li><a href="#">Our Blog</a></li>
                                    </ul>
                                </div>
                                <div className="col-lg-3">
                                    <ul className="menu-footer">
                                        <li><a href="#">Privacy Policy</a></li>
                                        <li><a href="#">Terms of Service</a></li>
                                        <li><a href="#">Sitemap </a></li>
                                    </ul>
                                </div>
                                <div className="col-lg-3">
                                    <ul className="menu-footer">
                                        <li><a href="#">Privacy Policy</a></li>
                                        <li><a href="#">Terms of Service</a></li>
                                        <li><a href="#">Sitemap</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col-md-4 col-xs-6 text-start text-md-end">
                            <div className="text-start d-inline-block mt-70">
                                <p className="text-lg title-follow neutral-0">Follow us
                                </p><div className="box-socials-footer" /><a className="icon-socials icon-facebook" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/fb.svg" /></a><a className="icon-socials icon-instagram" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/in.svg" /></a><a className="icon-socials icon-twitter" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/tw.svg" /></a><a className="icon-socials icon-be" href="#"><img alt="Nivia" src="/assets/imgs/template/icons/be.svg" /></a>
                                <p />
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom mt-50">
                        <div className="row">
                            <div className="col-md-6 text-md-start text-center">
                                <p className="text-sm neutral-600">Copyright © 2023 Nivia. All rights reserved.</p>
                            </div>
                            <div className="col-md-6 text-md-end text-center">
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
