// pages/index.js
"use client";
import React from "react";

const BusinessJourney = () => {
  const milestones = [
    {
      year: 2018,
      headline: "Sample Headline 2018",
      text: "Sample text goes here",
    },
    {
      year: 2010,
      headline: "Sample Headline 2010",
      text: "Sample text goes here",
    },
    {
      year: 2005,
      headline: "Sample Headline 2005",
      text: "Sample text goes here",
    },
    {
      year: 1998,
      headline: "Sample Headline 1998",
      text: "Sample text goes here",
    },
    {
      year: 1991,
      headline: "Sample Headline 1991",
      text: "Sample text goes here",
    },
  ];

  return (
    <div className="container mt-5 text-center">
      <h1 className="mb-4">BUSINESS JOURNEY</h1>
      <h5>Enter your sub headline here</h5>
      <div className="timeline mt-4">
        {milestones.map((milestone, index) => (
          <div className="timeline-item" key={index}>
            <div className="timeline-year">{milestone.year}</div>
            <div className="timeline-content">
              <h5>{milestone.headline}</h5>
              <p>{milestone.text}</p>
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        .timeline {
          position: relative;
          padding: 1rem 0;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 2rem;
        }
        .timeline-year {
          position: absolute;
          left: -80px;
          top: 0;
          font-weight: bold;
        }
        .timeline-content {
          padding-left: 20px;
          border-left: 2px solid #007bff;
        }
        .timeline-content h5 {
          margin: 0;
        }
      `}</style>
    </div>
  );
};

export default BusinessJourney;
