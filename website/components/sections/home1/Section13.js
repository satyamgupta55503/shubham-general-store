
import NewsSlider from '@/components/slider/NewsSlider'

export default function Section13() {
    return (
        <>

            <section className="section-box box-latest-news box-latest-news-2">
                <div className="container">
                    <div className="row align-items-end">
                        <div className="col-lg-8 mb-30">
                            <h2 className="heading-2 mb-10">Latest News  Stories</h2>
                            <p className="text-lg neutral-700">Pellentesque at posuere tellus. Ut sed dui justo. Phasellus</p>
                        </div>
                        <div className="col-lg-4 mb-30">
                            <div className="box-button-slider box-button-slider-team justify-content-end">
                                <div className="swiper-button-prev swiper-button-prev-testimonials swiper-button-prev-3">
                                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M6.66667 3.33398L2 8.00065M2 8.00065L6.66667 12.6673M2 8.00065H14" stroke="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        </path>
                                    </svg>
                                </div>
                                <div className="swiper-button-next swiper-button-next-testimonials swiper-button-next-3">
                                    <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9.33333 3.33398L14 8.00065M14 8.00065L9.33333 12.6673M14 8.00065H2" stroke="true" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        </path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="box-swiper mt-30">
                        <NewsSlider />
                    </div>
                </div>
            </section>
        </>
    )
}
