// app/admin/about/page.js
"use client";
import { useState, useEffect } from "react";
import styles from "./About.module.css";

export default function AboutDashboard() {
  const [entries, setEntries] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' ya 'add'
  
  // Form State
  const [formData, setFormData] = useState({ year: "", heading: "", description: "" });
  const [editId, setEditId] = useState(null);

  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api/about";

  // Fetch entries from backend
  const fetchEntries = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (res.ok) setEntries(data);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        console.warn("Fetch aborted (timeout): about entries");
      } else {
        console.error("Error fetching data:", err);
      }
      setEntries([]);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Form (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editId ? `${API_URL}/${editId}` : API_URL;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchEntries();
        resetForm();
        setActiveTab("all");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Something went wrong");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  // Set form for editing
  const handleEdit = (entry) => {
    setEditId(entry._id);
    setFormData({
      year: entry.year,
      heading: entry.heading,
      description: entry.description,
    });
    setActiveTab("add"); // Form tab open karein
  };

  // Delete entry
  const handleDelete = async (id) => {
    if (!window.confirm("Kya aap sach me is entry ko delete karna chahte hain?")) return;
    
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEntries(entries.filter((entry) => entry._id !== id));
      }
    } catch (err) {
      console.error("Error deleting entry:", err);
    }
  };

  const resetForm = () => {
    setFormData({ year: "", heading: "", description: "" });
    setEditId(null);
  };

  return (
    <div className={styles.container}>
      {/* Title Header */}
      {/* <div className={styles.header}>
        <h1 className={styles.title}>About Us Timeline</h1>
        <p className={styles.subtitle}>Manage, filter and delete your company history milestones.</p>
      </div> */}

      {/* Tabs Layout */}
      <div className={styles.tabBar}>
        <button 
          className={`${styles.tab} ${activeTab === "all" ? styles.activeTab : ""}`}
          onClick={() => { setActiveTab("all"); resetForm(); }}
        >
          📁 All Entries
        </button>
        <button 
          className={`${styles.tab} ${activeTab === "add" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("add")}
        >
          {editId ? "📝 Edit Entry" : "➕ Add New Milestone"}
        </button>
      </div>

      {/* Dynamic Content Rendering */}
      {activeTab === "add" ? (
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Year</label>
              <input
                type="text"
                name="year"
                placeholder="e.g. 2021"
                value={formData.year}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label}>Heading</label>
              <input
                type="text"
                name="heading"
                placeholder="e.g. The Spark of an Idea"
                value={formData.heading}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
              <label className={styles.label}>Description</label>
              <textarea
                name="description"
                placeholder="Enter company milestone details..."
                value={formData.description}
                onChange={handleChange}
                className={styles.textarea}
                required
              />
            </div>

            <div className={styles.fullWidth}>
              <button type="submit" className={styles.btnPrimary}>
                {editId ? "Update Entry" : "Save Entry"}
              </button>
              {editId && (
                <button type="button" className={styles.btnSecondary} onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Data List View (Table layout mapping) */
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <div>Year</div>
            <div>Content Milestone</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {entries.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
              No history entries found. Add your first milestone!
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry._id} className={styles.tableRow}>
                <div className={styles.yearCol}>{entry.year}</div>
                <div className={styles.contentCol}>
                  <h4>{entry.heading}</h4>
                  <p>{entry.description}</p>
                </div>
                <div className={styles.actionsCol}>
                  <button 
                    onClick={() => handleEdit(entry)} 
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(entry._id)} 
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
