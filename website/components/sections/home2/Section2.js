import LogoTicker from '@/components/elements/LogoTicker'


export default function Section2() {
    return (
        <>

            <section className="section-box wow animate__animated animate__fadeIn box-logos-2 box-logos-3">
                <div className="container">
                    <div className="carouselTickerLogos2 carouselTicker_vertical" id="slide-logos">
                    <LogoTicker />
                    </div>
                </div>
            </section>
        </>
    )
}
