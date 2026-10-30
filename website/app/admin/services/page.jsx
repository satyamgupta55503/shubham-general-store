"use client";

import React, { useState, useEffect } from "react";
import styles from "./services.module.css";

export default function ServicesAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sectionId, setSectionId] = useState("");
  
  const [formData, setFormData] = useState({
    sectionName: "Services",
    heading: "",
    services: []
  });

  useEffect(() => {
    const fetchServices = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com") + "/api/services-section", { signal: controller.signal });
        clearTimeout(timeoutId);
        const json = await res.json();
        if (json.success && json.data) {
          const data = Array.isArray(json.data) ? json.data[0] : json.data;
          if (data) {
            setSectionId(data._id);
            setFormData({
              sectionName: data.sectionName || "Services",
              heading: data.heading || "",
              services: data.services || []
            });
          }
        }
      } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === "AbortError") {
          console.warn("Fetch aborted (timeout): services-section");
        } else {
          console.error("Error fetching database schema values:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleMainChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;
    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  const handleWorkTagsChange = (index, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index].listOfWorks = value.split(",").map(item => item.trim());
    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sectionId) {
      alert("No services configuration found to update.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.digikraftsocial.com"}/api/services-section/${sectionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const json = await res.json();
      if (json.success) {
        alert("Configuration saved successfully!");
      } else {
        alert("Update failed: " + json.message);
      }
    } catch (error) {
      console.error("Error updating system configuration:", error);
      alert("An unexpected API error occurred.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <svg className={styles.spinner} fill="none" viewBox="0 0 24 24" style={{ stroke: "#64748b", strokeWidth: "4" }}>
          <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" />
          <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        Loading dynamic backend components...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      {/* Top Menu Tabs Block */}
      <div className={styles.topNav}>
        <button type="button" className={styles.activeTab}>
          📖 All Sections
        </button>
        {/* <button type="button" className={styles.inactiveTab}>
          📝 Dynamic Content
        </button> */}
      </div>

      {/* Main Form Body Container */}
      <div className={styles.mainLayout}>
        
        <div className={styles.headerBlock}>
          <h1>All Services Sections</h1>
          <p>Manage, filter and modify your front facing services data.</p>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* Main Layout Global Details */}
          <div className={styles.panel}>
            <h3 className={styles.panelTitle}>Global Configuration</h3>
            <div className={styles.gridTwo}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Section Key Identity</label>
                <input
                  type="text"
                  name="sectionName"
                  value={formData.sectionName}
                  onChange={handleMainChange}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Primary Section Header</label>
                <input
                  type="text"
                  name="heading"
                  value={formData.heading}
                  onChange={handleMainChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          {/* Sub-cards Array Field Iteration Loop */}
          <div>
            <h2 className={styles.subHeading}>
              Active Offerings Sub-Cards ({formData.services.length})
            </h2>

            <div className={styles.gridTwo}>
              {formData.services.map((service, index) => (
                <div key={service._id || index} className={styles.card}>
                  
                  <div className={styles.cardHeader}>
                    <span className={styles.badge}>Index Card #{index + 1}</span>
                    <span className={styles.docId}>
                      DOC_ID: {service._id ? service._id.substring(16) : "NEW"}
                    </span>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Card Heading Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Description Paragraph</label>
                    <textarea
                      rows={3}
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, "description", e.target.value)}
                      className={styles.textarea}
                      required
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.label}>
                      List of Works <span style={{ textTransform: "none", color: "#cbd5e1" }}>(separate items with commas)</span>
                    </label>
                    <input
                      type="text"
                      value={service.listOfWorks.join(", ")}
                      onChange={(e) => handleWorkTagsChange(index, e.target.value)}
                      className={styles.input}
                      placeholder="Tag A, Tag B, Tag C"
                    />
                    
                    {/* Visual Pill Elements mapping Category Layout */}
                    <div className={styles.pillContainer}>
                      {service.listOfWorks.map((work, idx) => (
                        work && (
                          <span key={idx} className={styles.pill}>
                            {work}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Form Processing Submit Area */}
          <div className={styles.actionBar}>
            <button type="submit" disabled={saving} className={styles.saveButton}>
              {saving ? (
                <>
                  <svg className={styles.spinner} fill="none" viewBox="0 0 24 24" style={{ stroke: "#ffffff", strokeWidth: "4" }}>
                    <circle opacity="0.25" cx="12" cy="12" r="10" stroke="currentColor" />
                    <path opacity="0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing Sync...
                </>
              ) : (
                <>+ Save Configuration</>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}