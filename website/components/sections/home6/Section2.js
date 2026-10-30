import LogoTicker from '@/components/elements/LogoTicker'


export default function Section2() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-logos">
                <div className="carouselTickerLogos carouselTicker_vertical" id="slide-logos">
                <LogoTicker />
                </div>
            </section>
        </>
    )
}
