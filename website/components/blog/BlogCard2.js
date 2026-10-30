import Link from "next/link"

export default function BlogCard2({ item }) {
    return (
        <>
            <div className="col-lg-12">
                <div className="card-news-style-2 card-news-style-3">
                    <div className="card-image"> <Link href={`/blog/${item.id}`}><img src={`/assets/imgs/page/blog/${item.img}`} alt="Nivia" /></Link></div>
                    <div className="card-info">
                        <div className="card-meta"> <Link className="btn btn-tag-sm" href={`/blog/${item.id}`}>Education</Link><span className="date-post">16
                            October 2023</span></div>
                        <div className="card-title"> <Link className="link-new" href={`/blog/${item.id}`}>Savvy
                            brand marketing: from branding basics to key strategies</Link></div>
                        <div className="card-desc">
                            <p className="text-md neutral-500">Duis mollis, est non commodo luctus, nisi
                                erat porttitor ligula, eget lacinia odio sem nec elit. Nullam quis
                                risus eget urna mollis ornare vel. Nulla vitae elit libero, a
                                pharetra augue. Praesent commodo cursus magna, vel scelerisque nisl
                                consectetur et. Sed posuere consectetur est at lobortis. Cras mattis
                                consectetur purus sit amet fermentum. Fusce dapibus, tellus ac
                                cursus commodo, tortor mauris condimentum nibh. Cras mattis
                                consectetur purus sit amet fermentum. Sed posuere consectetur.</p>
                        </div>
                        <div className="card-more"> <Link className="btn btn-learmore-2" href={`/blog/${item.id}`}>Read More
                            <svg width={13} height={13} viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_599_4830)">
                                    <path d="M10.6537 3.8149L1.71801 12.7506L0.25 11.2826L9.18469 2.3469H1.31V0.270508H12.7301V11.6906H10.6537V3.8149Z" fill="true" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_599_4830">
                                        <rect width={13} height={13} fill="white" />
                                    </clipPath>
                                </defs>
                            </svg></Link>
                            <div className="card-author-comment"> <span className="author">By
                                Steven</span><span className="comments">3 comments</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
