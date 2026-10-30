"use client";
import { useState } from "react";

export default function VideoPopup({ style }) {
  const [isOpen, setOpen] = useState(false);

  const modalStyle = {
    display: isOpen ? "block" : "none",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    zIndex: 1050,
  };

  const videoWrapperStyle = {
    maxWidth: "800px",
    width: "100%",
  };

  return (
    <>
      {!style && (
        <a
          onClick={() => setOpen(true)}
          className="btn btn-play text-lg"
          style={{ cursor: "pointer", display: "inline-block" }}
        >
          <div className="video-play-button">
            <span />
          </div>
        </a>
      )}

      {style === 2 && (
        <a
          onClick={() => setOpen(true)}
          className="btn btn-play-2"
          style={{ cursor: "pointer", display: "inline-block" }}
        >
          <div className="video-play-button-2">
            <span />
          </div>
          How It Works
        </a>
      )}

      {/* Bootstrap Modal */}
      <div
        className={`modal fade ${isOpen ? "show" : ""}`}
        style={modalStyle}
        tabIndex="-1"
        role="dialog"
        onClick={() => setOpen(false)}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          role="document"
          style={videoWrapperStyle}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content bg-dark">
            <div className="modal-header border-0">
              <button
                type="button"
                className="btn-close btn-close-white ms-auto"
                aria-label="Close"
                onClick={() => setOpen(false)}
              />
            </div>
            <div className="modal-body p-0">
              <video controls autoPlay style={{ width: "100%" }}>
                <source
                  src="https://demo.digikraftsocial.com/public/uploads/slider_1703756145_72d28f262a1aedd9d145.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
