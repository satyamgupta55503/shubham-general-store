
import Link from 'next/link'

export default function Section8() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-more-question">
                <div className="container">
                    <div className="block-more-question">
                        <div className="question-left">
                            <h3 className="mb-10">Have more questions</h3>
                            <p className="text-lg mb-20">If you still can’t find the answer you’re looking for, let we help you.
                            </p><Link className="btn btn-brand-4" href="#">Go to Support Center
                                <svg width={23} height={22} viewBox="0 0 23 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_449_3780)">
                                        <path d="M22.5 10.9993L18.9791 7.47852V10.3064H0.5V11.6924H18.9791V14.5203L22.5 10.9993Z" fill="#191919" />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_449_3780">
                                            <rect width={22} height={22} fill="white" transform="translate(0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg></Link>
                        </div>
                        <div className="question-right"><img src="/assets/imgs/page/homepage4/bg-question.png" alt="Nivia" /></div>
                    </div>
                </div>
            </section>
        </>
    )
}
