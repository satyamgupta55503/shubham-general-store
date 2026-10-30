"use client";

import { FaCog, FaChartPie, FaClipboardCheck } from "react-icons/fa";

export default function UspSection() {
  return (
    <>
      {/* Custom CSS for Hover Effects & 3D Cards */}
      <style jsx global>{`
        .card-hover-light {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border: 1px solid #dee2e6;
          border-radius: 1rem;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          background: #ffffff;
        }

        .card-hover-light:hover {
          transform: translateY(-10px);
          box-shadow: 0 16px 32px rgba(0, 0, 0, 0.2);
          background-color: #f8f9fa !important;
        }

        .card-hover-light:hover .icon,
        .card-hover-light:hover .learn-more {
          color: #8ee013 !important;
        }

        .card-hover-light:hover .card-title {
          color: #212529 !important;
        }

        .card-hover-light:hover .card-text {
          color: #495057 !important;
        }

        .card-hover-light:hover .learn-more {
          text-decoration: underline !important;
        }

        .btn-outline-warning:hover {
          background-color: #8ee013 !important;
          color: #fff !important;
        }
      `}</style>

      <section
        className=""
        style={{
          paddingTop: "40px",
          paddingBottom: "80px",
        }}
      >
        <div className="container text-center">
          {/* Header Section */}
          <div className="row justify-content-center mb-4">
            <div className="col-md-8">
              <h1 className="display-4 fw-bold text-dark mb-3">
                Our Signature Style
              </h1>
              <p className="lead text-secondary mb-4">
                At DigiKraft Social, we mix smart ideas with creative design to
                build digital experiences that not only grab attention but also
                connect with people.
              </p>
            </div>
          </div>

          {/* Cards Section */}
          <div className="row justify-content-center g-4">
            {/* Build. Launch. Grow. Repeat. */}
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-lg card-hover-light">
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-4 text-warning">
                    <FaCog size={40} className="icon" color="#8ee013" />
                  </div>
                  <h3 className="text-24-semibold mb-4    ">
                    Build. Launch. Grow. Repeat.
                  </h3>
                  <p className="card-text mb-4">
                    From idea to execution, we help you scale fast. Start
                    strong, evolve smarter, grow consistently.
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Digital Ecosystems */}
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-lg card-hover-light">
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-4 text-warning">
                    <FaChartPie size={40} className="icon" color="#8ee013" />
                  </div>
                  <h3 className="text-24-semibold mb-4    ">
                    Complete Digital Ecosystems: Tech + Marketing
                  </h3>
                  <p className="card-text mb-4">
                    Seamless integration of technology and marketing. A 360°
                    solution to power your digital presence.
                  </p>
                </div>
              </div>
            </div>

            {/* All Under One Roof */}
            <div className="col-md-3">
              <div className="card h-100 border-0 shadow-lg card-hover-light">
                <div className="card-body d-flex flex-column p-4">
                  <div className="mb-4 text-warning">
                    <FaClipboardCheck
                      size={40}
                      className="icon"
                      color="#8ee013"
                    />
                  </div>
                  <h3 className="text-24-semibold mb-4    ">
                    Tech. Design. Marketing. All Under One Roof.
                  </h3>
                  <p className="card-text mb-4">
                    Unified teams for speed, quality, and impact. Everything you
                    need, handled by one expert crew.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
