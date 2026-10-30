"use client";
import Marquee from "react-fast-marquee";

export default function LogoTicker2() {
  return (
    <>
      <Marquee
        // style={{ width: "auto" }}
        pauseOnHover={true}
        direction="left"
        className="carouselTicker__list list-logos"
      >
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/avacado.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/aviral.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/forever.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/grace.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/lhz.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/mkg1.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/mkg.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/sit.png" alt="Nivia" />
          </div>
        </li>

        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/nhgoel.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/sva.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/tca.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div className="item-logo">
            <img src="/assets/imgs/page/homepage3/tulsi.png" alt="Nivia" />
          </div>
        </li>
        <li className="carouselTicker__item">
          <div>
            <img
              src="/assets/imgs/page/homepage3/vil.png"
              alt="Nivia"
              style={{}}
            />
          </div>
        </li>
      </Marquee>
    </>
  );
}
