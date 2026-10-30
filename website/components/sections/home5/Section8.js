
import dynamic from 'next/dynamic'
import Link from 'next/link'
const TestimonialMasonary = dynamic(() => import('@/components/elements/TestimonialMasonary'), {
    ssr: false,
})

export default function Section8() {
    return (
        <>

            <section className="section-box box-testimonials">
                <div className="container">
                    <div className="row align-items-end">
                        <div className="col-lg-7">
                            <h2 className="display-2 title-review">Hear what our users have to say about us.</h2>
                            <p className="text-xl">We offer a range of digital marketing services that can help you reach more
                                customers,increase sales, and improve your brand.</p>
                        </div>
                        <div className="col-lg-5 text-end"><Link className="btn btn-linear-rounded" href="#">View All
                            <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                            </svg></Link></div>
                    </div>
                    <TestimonialMasonary />
                </div>
            </section>
        </>
    )
}
