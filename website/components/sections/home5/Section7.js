
import Link from 'next/link'
import Marquee from "react-fast-marquee"
export default function Section7() {
    return (
        <>

            <section className="section-box box-our-app">
                <div className="container">
                    <div className="block-app">
                        <div className="left-app">
                            <div className="info-app">
                                <h2 className="display-2 mb-65 neutral-0">Easy to Manage Your All Data by One App</h2>
                                <div className="box-download-app"><Link href="#"><img src="/assets/imgs/page/homepage6/googleplay.png" alt="Nivia" /></Link><Link href="#"><img src="/assets/imgs/page/homepage6/appstore.png" alt="Nivia" /></Link></div>
                            </div>
                        </div>
                        <div className="right-app">
                            <div className="slide-app-1">
                                <div className="carouselTicker carouselTicker_vertical" id="slide-top">
                                    <li className="carouselTicker__item"><img src="/assets/imgs/page/homepage6/app-1.png" alt="Nivia" /></li>
                                    <li className="carouselTicker__item"><img src="/assets/imgs/page/homepage6/app-2.png" alt="Nivia" /></li>
                                </div>
                            </div>
                            <div className="slide-app-2">
                                <div className="carouselTicker2 carouselTicker_vertical" id="slide-bottom">
                                    <li className="carouselTicker__item"><img src="/assets/imgs/page/homepage6/app-3.png" alt="Nivia" /></li>
                                    <li className="carouselTicker__item"><img src="/assets/imgs/page/homepage6/app-4.png" alt="Nivia" /></li>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
