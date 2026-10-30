import Link from "next/link";

export default function BlogCard1({ item }) {
  return (
    <>
      <div className="col-lg-4 col-md-6">
        <div className="card-news-style-2">
          <div className="card-image">
            <Link href={`/blog/${item.id}`}>
              <img
                src={`/assets/imgs/page/blog/${item.img}`}
                alt="img"
                className="img-fluid"
              />
            </Link>
          </div>
          <div className="card-info">
            <div className="card-meta">
              <Link className="btn btn-tag-sm" href={`/blog/${item.id}`}>
                Development
              </Link>
              <span className="date-post">11 October 2024</span>
            </div>
            <div className="card-title">
              <Link className="link-new" href={`/blog/${item.id}`}>
                Hey Business Owners, Are You Invisible Online? Here's How to
                Rank #1 in Local Searches and Get More Customers!
              </Link>
            </div>
            <div className="card-more">
              <Link className="btn btn-learmore-2" href={`/blog/${item.id}`}>
                Read More
                <svg
                  width={13}
                  height={13}
                  viewBox="0 0 13 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clipPath="url(#clip0_599_4830)">
                    <path
                      d="M10.6537 3.8149L1.71801 12.7506L0.25 11.2826L9.18469 2.3469H1.31V0.270508H12.7301V11.6906H10.6537V3.8149Z"
                      fill="true"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_599_4830">
                      <rect width={13} height={13} fill="white" />
                    </clipPath>
                  </defs>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
