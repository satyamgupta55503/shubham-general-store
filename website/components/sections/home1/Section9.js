"use client"

import { useEffect, useState } from "react";
import CounterUp from "@/components/elements/CounterUp";
import API from "@/utils/api"; // Adjust this import path to match your file structure

export default function Section9() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const response = await API.get("/pages/homepage");
        if (response.data && response.data.success) {
          setStatsData(response.data.data.statsSection);
        }
      } catch (error) {
        console.error("Error fetching statistics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsData();
  }, []);

  if (loading || !statsData) {
    return null; 
  }

  const cards = statsData.cards || [];

  return (
    <>
      <section className="section-box box-why-trusted box-why-trusted-black">
        <div className="container">
          <div className="row align-items-end">
            <div className="col-lg-4 mb-30">
              <h2 className="text-32-bold">
                {statsData.heading || "See why we are trusted worldwide"}
              </h2>
            </div>
            <div className="col-lg-8 mb-30">
              <div className="box-numbers">
                {cards.map((card) => (
                  <div className="item-number" key={card._id}>
                    <h3 className="heading-2">
                      <CounterUp count={card.value} />+
                    </h3>
                    <p className="text-xl neutral-700">{card.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}