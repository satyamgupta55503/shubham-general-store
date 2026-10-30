'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Section10() {
    const [isActive, setIsActive] = useState({
        status: false,
        key: 1,
    })

    const handleClick = (key) => {
        if (isActive.key === key) {
            setIsActive({
                status: false,
            })
        } else {
            setIsActive({
                status: true,
                key,
            })
        }
    }
    return (
        <>

            <section className="section-box box-faqs">
                <div className="container">
                    <div className="text-center mb-70">
                        <h3 className="heading-2 mb-20">Frequently Asked Questions</h3>
                        <p className="text-md neutral-700">Find answers to common questions in our comprehensive FAQ section,<br className="d-none d-lg-block" /> providing clarity and support for your crypto journey</p>
                    </div>
                    <div className="box-2-col-faqs">
                        <div className="faqs-col">
                            <div className="accordion accordion-flush" id="accordionFAQS">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="flush-headingOne" onClick={() => handleClick(1)}>
                                        <button className={isActive.key == 1 ? "accordion-button " : "accordion-button collapsed"}  type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne" aria-expanded="false" aria-controls="flush-collapseOne">Where is my order? Quisque molestie</button>
                                    </h2>
                                    <div className={isActive.key == 1 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} id="flush-collapseOne" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFAQS">
                                        <div className="accordion-body">
                                            <p>Discover what sets this apart as the market's easiest and most powerful
                                                video interviewing platform, and why hiring managers consistently choose us
                                                over the competition</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="flush-headingTwo" onClick={() => handleClick(2)}>
                                        <button className={isActive.key == 2 ? "accordion-button " : "accordion-button collapsed"}  type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo" aria-expanded="false" aria-controls="flush-collapseTwo">How can I return an item purchased
                                            online?</button>
                                    </h2>
                                    <div className={isActive.key == 2 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} id="flush-collapseTwo" aria-labelledby="flush-headingTwo" data-bs-parent="#accordionFAQS">
                                        <div className="accordion-body">Discover what sets this apart as the market's
                                            easiest and most powerful video interviewing platform, and why hiring managers
                                            consistently choose us over the competition</div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="flush-headingThree" onClick={() => handleClick(3)}>
                                        <button className={isActive.key == 3 ? "accordion-button " : "accordion-button collapsed"}  type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree" aria-expanded="false" aria-controls="flush-collapseThree">I have promotional or discount
                                            code?</button>
                                    </h2>
                                    <div className={isActive.key == 3 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} id="flush-collapseThree" aria-labelledby="flush-headingThree" data-bs-parent="#accordionFAQS">
                                        <div className="accordion-body">Discover what sets this apart as the market's
                                            easiest and most powerful video interviewing platform, and why hiring managers
                                            consistently choose us over the competition</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="faqs-col">
                            <div className="accordion accordion-flush" id="accordionFAQS2">
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="flush-headingOne2" onClick={() => handleClick(4)}>
                                        <button className={isActive.key == 4 ? "accordion-button " : "accordion-button collapsed"}  type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseOne2" aria-expanded="false" aria-controls="flush-collapseOne2">What are the delivery types you use?</button>
                                    </h2>
                                    <div className={isActive.key == 4 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} id="flush-collapseOne2" aria-labelledby="flush-headingOne" data-bs-parent="#accordionFAQS2">
                                        <div className="accordion-body">
                                            <p>Discover what sets this apart as the market's easiest and most powerful
                                                video interviewing platform, and why hiring managers consistently choose us
                                                over the competition</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="flush-headingTwo2" onClick={() => handleClick(5)}>
                                        <button className={isActive.key == 5 ? "accordion-button " : "accordion-button collapsed"}  type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseTwo2" aria-expanded="false" aria-controls="flush-collapseTwo2">How can I pay for my purchases?</button>
                                    </h2>
                                    <div className={isActive.key == 5 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} id="flush-collapseTwo2" aria-labelledby="flush-headingTwo2" data-bs-parent="#accordionFAQS2">
                                        <div className="accordion-body">Discover what sets this apart as the market's
                                            easiest and most powerful video interviewing platform, and why hiring managers
                                            consistently choose us over the competition</div>
                                    </div>
                                </div>
                                <div className="accordion-item">
                                    <h2 className="accordion-header" id="flush-headingThree2" onClick={() => handleClick(6)}>
                                        <button className={isActive.key == 6 ? "accordion-button " : "accordion-button collapsed"}  type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapseThree2" aria-expanded="false" aria-controls="flush-collapseThree2">Can I cancel or change my order?</button>
                                    </h2>
                                    <div className={isActive.key == 6 ? "accordion-collapse collapse show" : "accordion-collapse collapse"} id="flush-collapseThree2" aria-labelledby="flush-headingThree2" data-bs-parent="#accordionFAQS2">
                                        <div className="accordion-body">Discover what sets this apart as the market's
                                            easiest and most powerful video interviewing platform, and why hiring managers
                                            consistently choose us over the competition</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
