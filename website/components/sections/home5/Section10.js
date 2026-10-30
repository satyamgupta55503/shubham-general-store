
import Link from 'next/link'

export default function Section10() {
    return (
        <>

            <section className="section-box box-news-events">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-4 mb-30">
                            <h2 className="display-2 mb-50">News, events, our internal activities</h2><Link className="btn btn-linear-rounded" href="/blog-post">Discover more
                                <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                                </svg></Link>
                        </div>
                        <div className="col-lg-8 mb-30">
                            <div className="card-news-main mb-30">
                                <div className="card-image" style={{ backgroundImage: 'url(assets/imgs/page/homepage6/img-news.png)' }} />
                                <div className="card-info">
                                    <div className="card-news-info"><Link className="btn btn-tag" href="/blog-post">Our
                                        Features</Link><Link className="heading-2" href="/blog-post">What to expect on your
                                            first technical interview?</Link></div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-news">
                                <div className="card-image"><Link href="/blog-post"><img src="/assets/imgs/page/homepage6/img-news2.png" alt="Nivia" /></Link></div>
                                <div className="card-info"><Link className="heading-5" href="/blog-post">What to expect on your
                                    first technical interview?</Link></div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-news">
                                <div className="card-image"><Link href="/blog-post"><img src="/assets/imgs/page/homepage6/img-news3.png" alt="Nivia" /></Link></div>
                                <div className="card-info"><Link className="heading-5" href="/blog-post">What to expect on your
                                    first technical interview?</Link></div>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="card-news">
                                <div className="card-image"><Link href="/blog-post"><img src="/assets/imgs/page/homepage6/img-news4.png" alt="Nivia" /></Link></div>
                                <div className="card-info"><Link className="heading-5" href="/blog-post">What to expect on your
                                    first technical interview?</Link></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
