'use client'
import Isotope from "isotope-layout"
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from "react"

export default function TestimonialMasonary() {
    // Isotope
    const isotope = useRef()
    const [filterKey, setFilterKey] = useState("*")
    useEffect(() => {
        setTimeout(() => {
            isotope.current = new Isotope(".mt-115", {
                itemSelector: ".col-lg-4",
                // layoutMode: "fitRows",
                percentPosition: true,
                masonry: {
                    columnWidth: ".col-lg-4",
                },
                animationOptions: {
                    duration: 750,
                    easing: "linear",
                    queue: false,
                },
            })
        }, 1000)
    }, [])
    useEffect(() => {
        if (isotope.current) {
            filterKey === "*"
                ? isotope.current.arrange({ filter: `*` })
                : isotope.current.arrange({ filter: `.${filterKey}` })
        }
    }, [filterKey])
    const handleFilterKeyChange = useCallback((key) => () => {
        setFilterKey(key)
    },
        []
    )

    const activeBtn = (value) => (value === filterKey ? "trans current" : "")
    return (
        <>

            <div className="row mt-115">
                <div className="col-lg-4">
                    <div className="card-testimonial">
                        <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                        <div className="card-comment">
                            <p className="text-md">As a small business most owner, effective communication and
                                collaboration are key to success. this app's<Link href="#">team collaboration</Link>
                                with feature has and helped us get things donefaster the interface is user-friendly
                            </p>
                        </div>
                        <div className="card-author">
                            <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                            <div className="author-image"><img src="/assets/imgs/page/homepage6/author.png" alt="Nivia" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-testimonial">
                        <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                        <div className="card-comment">
                            <p className="text-md">Little in examination transmitting the and country with it profitable
                                sure wrong continued in the queen's perhaps and simple fat denied adding worthy
                                little use as some he so high down am week conduct esteems by cottage to pasture
                                Little in examination transmitting the and country</p>
                        </div>
                        <div className="card-author">
                            <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                            <div className="author-image"><img src="/assets/imgs/page/homepage6/author2.png" alt="Nivia" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-testimonial">
                        <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                        <div className="card-comment">
                            <p className="text-md">As a small business most owner, effective communication and
                                collaboration are key to success. this app's<Link href="#">team collaboration</Link>
                                with feature has and helped us get things donefaster the interface is user-friendly
                                Comfort reached gay perhaps chamber his six detract besides add. Moonlight newspaper
                                up its enjoyment agreeable depending Comfort reached gay perhaps chamber his six</p>
                        </div>
                        <div className="card-author">
                            <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                            <div className="author-image"><img src="/assets/imgs/page/homepage6/author3.png" alt="Nivia" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-testimonial">
                        <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                        <div className="card-comment">
                            <p className="text-md">As a small business most owner, effective communication and
                                collaboration are key to success. this app's with feature has and helped us get
                                things donefaster the interface is user-friendly Little in examination transmitting
                                the and country with it profitable sure wrong continued in the queen's perhaps
                                and simple fat denie</p>
                        </div>
                        <div className="card-author">
                            <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                            <div className="author-image"><img src="/assets/imgs/page/homepage6/author4.png" alt="Nivia" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-testimonial">
                        <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                        <div className="card-comment">
                            <p className="text-md">With it profitable sure wrong continued in the queen's perhaps
                                and simple fat denied adding worthy little use as some he so high down am week
                                conduct esteems by cottage to pasture. Comfort reached gay perhaps chamber his six
                                detract besides add. Moonlight newspaper. the queen's perhaps and simple fat
                                denied adding worthy little use as some he so high</p>
                        </div>
                        <div className="card-author">
                            <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                            <div className="author-image"><img src="/assets/imgs/page/homepage6/author5.png" alt="Nivia" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card-testimonial">
                        <div className="card-rates"><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /><img src="/assets/imgs/template/icons/star.svg" alt="Nivia" /></div>
                        <div className="card-comment">
                            <p className="text-md">As a small business most owner, effective communication and
                                collaboration are key to success. this app's with feature has and helped us get
                                things donefaster the interface is user-friendly</p>
                        </div>
                        <div className="card-author">
                            <div className="author-info"><span className="text-md author-name mr-10">ROBERT FOX</span><span className="text-lg neutral-500">@Amazon</span></div>
                            <div className="author-image"><img src="/assets/imgs/page/homepage6/author.png" alt="Nivia" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
