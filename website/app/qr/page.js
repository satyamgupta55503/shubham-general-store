"use client";

import { useState } from "react";
import QRCode from "qrcode";
import Layout from "@/components/layout/Layout";

export default function QRGeneratorPage() {
  const [url, setUrl] = useState("");
  const [svgCode, setSvgCode] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCode = async () => {
    if (!url) {
      alert("Please enter a valid URL");
      return;
    }

    setIsGenerating(true);
    try {
      const svgString = await QRCode.toString(url, {
        type: "svg",
        errorCorrectionLevel: "H",
        margin: 1,
        width: 600, // Reduced from 1000
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(blob);
      setDownloadUrl(svgUrl);
      setSvgCode(svgString);
    } catch (err) {
      console.error("Failed to generate QR Code", err);
      alert("Failed to generate QR Code. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!downloadUrl) return;

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = "qr-code.svg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearQRCode = () => {
    setSvgCode("");
    setDownloadUrl("");
    setUrl("");
  };

  return (
    <Layout
      headerStyle={1}
      footerStyle={1}
      headerCls="header-style-2 header-style-4"
    >
      <style jsx>{`
        .bg-custom-green {
          background-color: #8ee013 !important;
        }
        .text-custom-green {
          color: #8ee013 !important;
        }
        .btn-custom-green {
          background-color: #8ee013;
          border-color: #8ee013;
          color: #000;
        }
        .btn-custom-green:hover {
          background-color: #7dd011;
          border-color: #7dd011;
          color: #000;
        }
        .large-a-bg {
          position: absolute;
          right: 0;
          top: 0;
          font-size: 25rem;
          line-height: 1;
          color: rgba(142, 224, 19, 0.1);
          pointer-events: none;
          font-weight: bold;
          z-index: 1;
        }
        .content-overlay {
          position: relative;
          z-index: 2;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .qr-placeholder {
          background: rgba(248, 249, 250, 0.8);
          backdrop-filter: blur(10px);
          border: 2px dashed rgba(142, 224, 19, 0.5);
        }
        .feature-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .spinner-border-sm {
          width: 1rem;
          height: 1rem;
        }
      `}</style>

      <div className="min-vh-100 bg-white text-dark">

        <div className="position-relative">
          
          <div className="large-a-bg">DKS</div>

          <div className="content-overlay">
            <div className="container py-5">
              <div
                className="row align-items-center g-5"
                style={{ minHeight: "80vh" }}
              >
              
                <div className="col-lg-6">
                  <h1 className="display-2 fw-bold text-dark mb-4 lh-1">
                    Generate High-Quality QR Codes
                  </h1>
                  <p className="lead text-muted mb-5">
                    Create professional QR codes for your business, marketing
                    campaigns, or personal use. Fast, secure, and completely
                    free.
                  </p>

                  {/* QR Generator Form */}
                  <div
                    className="card glass-card border-0 shadow-lg"
                    style={{
                      marginTop: "20px",
                    }}
                  >
                    <div className="card-body p-4">
                      <div className="mb-4">
                        <label
                          htmlFor="url-input"
                          className="form-label fw-semibold text-custom-green"
                        >
                          Enter URL or Text
                        </label>
                        <input
                          id="url-input"
                          type="text"
                          className="form-control form-control-lg border-2"
                          style={{ borderColor: "#8ee013" }}
                          placeholder="https://example.com or any text"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && generateQRCode()
                          }
                        />
                      </div>

                      <button
                        onClick={generateQRCode}
                        disabled={!url.trim() || isGenerating}
                        className="btn btn-custom-green btn-lg w-100 fw-semibold"
                      >
                        {isGenerating ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Generating...
                          </>
                        ) : (
                          "Generate QR Code"
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="d-flex justify-content-center">
                    {svgCode ? (
                      <div className="text-center">
                        <div className="card border-0 shadow-lg mb-4">
                          <div className="card-body p-3">
                            <div
                              // style={{ maxWidth: "200px" }}
                              dangerouslySetInnerHTML={{ __html: svgCode }}
                            />
                          </div>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                          <button
                            onClick={downloadQRCode}
                            className="btn btn-custom-green btn-lg fw-semibold"
                          >
                            <i className="bi bi-download me-2"></i>
                            Download SVG
                          </button>

                          <button
                            onClick={clearQRCode}
                            className="btn btn-outline-secondary btn-lg fw-semibold"
                          >
                            Generate New
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="qr-placeholder rounded p-4 text-center"
                        style={{ width: "250px", height: "250px" }}
                      >
                        <div className="d-flex flex-column justify-content-center h-100">
                          <div
                            className="bg-custom-green bg-opacity-25 rounded d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                            style={{ width: "60px", height: "60px" }}
                          >
                            <i className="bi bi-plus-lg fs-3 text-custom-green"></i>
                          </div>
                          <p className="text-muted fw-medium mb-0 small">
                            Your QR code will appear here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-light py-5">
          <div className="container py-4">
            <h2 className="display-5 fw-bold text-center text-dark mb-5">
              Why Choose Our QR Generator?
            </h2>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="card feature-card border-0 h-100 text-center shadow-sm">
                  <div className="card-body p-4">
                    <div
                      className="bg-custom-green rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "64px", height: "64px" }}
                    >
                      <i className="bi bi-lightning-fill text-dark fs-4"></i>
                    </div>
                    <h5 className="card-title fw-bold text-dark">
                      High Quality
                    </h5>
                    <p className="card-text text-muted small">
                      Vector-based SVG format for crisp, scalable QR codes
                      perfect for any size
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card feature-card border-0 h-100 text-center shadow-sm">
                  <div className="card-body p-4">
                    <div
                      className="bg-custom-green rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "64px", height: "64px" }}
                    >
                      <i className="bi bi-shield-lock-fill text-dark fs-4"></i>
                    </div>
                    <h5 className="card-title fw-bold text-dark">
                      100% Secure
                    </h5>
                    <p className="card-text text-muted small">
                      All processing happens locally in your browser. No data is
                      sent to our servers
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card feature-card border-0 h-100 text-center shadow-sm">
                  <div className="card-body p-4">
                    <div
                      className="bg-custom-green rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "64px", height: "64px" }}
                    >
                      <i className="bi bi-printer-fill text-dark fs-4"></i>
                    </div>
                    <h5 className="card-title fw-bold text-dark">
                      Print Ready
                    </h5>
                    <p className="card-text text-muted small">
                      Perfect for business cards, flyers, posters, and all
                      marketing materials
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
