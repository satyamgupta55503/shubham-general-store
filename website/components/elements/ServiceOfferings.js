import React from "react";
import "../../public/assets/css/ServiceOfferings.css";

const offerings = [
  {
    title: <>Branding & Creative Design</>,
    desc: "Designs unique, memorable logos—both 2D and 3D—that reflect brand values and establish visual recognition.",
    circleClass: "offer-circle-1",
    cardClass: "offer-card-1",
    contentClass: "offer-content-1",
    list: [
      "Logo Design",
      "Graphic Design",
      "Mockup & Package Design",
      "Layout & Print Design",
    ],
  },
  {
    title: <>Web & App Development</>,
    desc: "Creates consistent and engaging graphics for digital and print, ensuring strong visual branding across all channels.",
    circleClass: "offer-circle-2",
    cardClass: "offer-card-2",
    contentClass: "offer-content-2",
    list: [
      "Website Development",
      "E-commerce Website Development",
      "App Development",
    ],
  },
  {
    title: <>Digital Marketing</>,
    desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
    circleClass: "offer-circle-3",
    cardClass: "offer-card-3",
    contentClass: "offer-content-3",
    list: [
      "Social Media Marketing",
      "SEO & Keyword Ranking",
      "Paid Marketing (PPC)",
      "Email Marketing",
      "Influencer Marketing",
    ],
  },
  {
    title: <>Video & Animation</>,
    desc: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames.",
    circleClass: "offer-circle-4",
    cardClass: "offer-card-4",
    contentClass: "offer-content-4",
    list: ["Video Editing", "Animations", "After Effects & Motion Graphics"],
  },
];

export default function ServiceOfferings() {
  return (
    <section className="service-section">
      <span className="service-subtitle">
        what we're offering
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="subtitle-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
          />
        </svg>
      </span>
      <h1 className="service-title">
        Services Built Specifically for your Business
      </h1>
      <div className="service-grid-offer">
        {offerings.map((item, idx) => (
          <div key={idx} className={`card ${item.cardClass}`}>
            <div className={`circle ${item.circleClass}`} />
            <div className={`offer-content ${item.contentClass}`}>
              <h2 className="offer-heading font-playfair">{item.title}</h2>
              <p className="offer-desc">{item.desc}</p>

              <div className="offer-list">
                <ul>
                  {item?.list?.map((item, idx) => (
                    <li key={idx} className="offer-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
