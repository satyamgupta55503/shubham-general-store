

export default function Section12() {
    return (
        <>

            <section className="section-box box-newsletter">
                <div className="container">
                    <div className="block-newsletter">
                        <div className="block-newsletter-inner">
                            <p className="text-lg mb-5">$20 discount for your first order</p>
                            <h3 className="heading-1 mb-55">Subscribe to our newsletter and get updates</h3>
                            <div className="form-newsletter">
                                <form>
                                    <input className="form-control border-gradient border-gradient-green" type="text" placeholder="Email Address..." />
                                    <button className="btn btn-green-linear">Subscribe
                                        <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22 11.0003L18.4791 7.47949V10.3074H0V11.6933H18.4791V14.5213L22 11.0003Z" fill="true" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
