
import Team2Slider from '@/components/slider/Team2Slider'
import Link from 'next/link'

export default function Section7() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-our-team-2">
                <div className="box-our-team-2-inner">
                    <div className="container">
                        <div className="text-center"><Link className="btn btn-brand-4-sm" href="#">Our people</Link>
                            <h2 className="mb-20 mt-20">Meet Our Team</h2>
                            <p className="text-md neutral-500">This is our team, a lot of smiling happy people who work hard
                                to<br className="d-none d-lg-block" />empower your teams.</p>
                        </div>
                        <div className="box-swiper mt-60">
                            <Team2Slider />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
