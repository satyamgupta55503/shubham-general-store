"use client";

import { useState, useEffect } from "react";
// Import your Axios API instance
import API from "@/utils/api"; // Adjust this import path to match your file structure

export function VideoSection() {
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Homepage Content on Mount
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        const response = await API.get("/pages/homepage");
        if (response.data && response.data.success) {
          setVideoData(response.data.data.videoSection);
        }
      } catch (error) {
        console.error("Error fetching video section structural data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, []);

  // Prevent layout shifts while loading structural data
  if (loading) {
    return null;
  }

  // Fallback to S3 video asset if API videoLink isn't provided or is a placeholder text link
  const isYouTube = videoData?.videoLink?.includes("youtube.com") || videoData?.videoLink?.includes("youtu.be");
  const videoSrc = videoData?.videoLink && !videoData.videoLink.includes("example")
    ? videoData.videoLink
    : "https://digikraftsocial.s3.ap-south-1.amazonaws.com/DKS+Website+Video.mp4";

  return (
    <section
      className="w-100 py-5"
      style={{
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      <div className="container">
        {/* Optional Section Text Header matching your API structural layout */}
        {/* {(videoData?.heading || videoData?.description) && (
          <div className="row justify-content-center mb-4 text-center">
            <div className="col-12 col-lg-10">
              {videoData?.heading && <h2 className="mb-2">{videoData.heading}</h2>}
              {videoData?.description && <p className="text-muted">{videoData.description}</p>}
            </div>
          </div>
        )} */}

        <div className="row justify-content-center">
          <div className="col-12 col-lg-10">
            <div className="ratio ratio-16x9 rounded shadow-lg overflow-hidden">
              {isYouTube ? (
                <iframe
                  className="w-100 h-100"
                  src={videoSrc.replace("watch?v=", "embed/")}
                  title={videoData?.heading || "Video player"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              ) : (
                <video className="w-100 h-100" autoPlay muted loop playsInline>
                  <source src={videoSrc} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}