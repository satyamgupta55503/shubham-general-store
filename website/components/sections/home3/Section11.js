
import Link from 'next/link'

export default function Section11() {
    return (
        <>

            <section className="section-box box-ready-started">
                <div className="container">
                    <div className="box-content-ready">
                        <h2 className="mb-20 text-48-semibold">Ready to get started?</h2>
                        <p className="text-lg neutral-700 mb-40">Start conquering the heights of your business career with our
                            platform. Join the community of more than +5000 successful businesses.</p><Link className="btn btn-brand-4" href="#">Get Started
                            <svg width={23} height={8} viewBox="0 0 23 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.5 3.99934L18.9791 0.478516V3.30642H0.5V4.69236H18.9791V7.52031L22.5 3.99934Z" fill="true" />
                            </svg></Link>
                    </div>
                </div>
            </section>
        </>
    )
}
