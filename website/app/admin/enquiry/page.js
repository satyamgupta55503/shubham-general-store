"use client";

import { useState, useEffect } from "react";

export default function EnquiryCMS() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [unreadIds, setUnreadIds] = useState([]);

  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api/enquiry";

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(`${API_URL}/send`, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error("Failed to fetch data from backend");
      const data = await response.json();
      
      const fetchedData = Array.isArray(data) ? data : data.data || data.enquiries || [];
      setEnquiries(fetchedData);

      const readMessages = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
      const unread = fetchedData
        .map((item) => item._id || item.id)
        .filter((id) => !readMessages.includes(id));

      setUnreadIds(unread);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        setError("Request timed out. Please try refreshing.");
      } else {
        setError(err.message);
      }
      setEnquiries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  // JAISE HI MESSAGE VIEW KARENGE TAB COUNTER MINUS HOGA AUR DOT GAYAB HO JAYEGA
  const handleViewEnquiry = (enquiry) => {
    const currentId = enquiry._id || enquiry.id;
    setSelectedEnquiry(enquiry);

    if (unreadIds.includes(currentId)) {
      // Local state update karein
      const updatedUnread = unreadIds.filter((id) => id !== currentId);
      setUnreadIds(updatedUnread);

      // LocalStorage me save karein taaki refresh par wapas red dot na aaye
      const readMessages = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
      if (!readMessages.includes(currentId)) {
        readMessages.push(currentId);
        localStorage.setItem("readEnquiries", JSON.stringify(readMessages));
      }

      // Live Trigger: Header component ko instant notify karne ke liye event fire karein
      window.dispatchEvent(new Event("cms_navigated"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEnquiries((prev) => prev.filter((item) => (item._id !== id && item.id !== id)));
        setUnreadIds((prev) => prev.filter((unreadId) => unreadId !== id));
        
        const readMessages = JSON.parse(localStorage.getItem("readEnquiries") || "[]");
        const updatedRead = readMessages.filter((readId) => readId !== id);
        localStorage.setItem("readEnquiries", JSON.stringify(updatedRead));

        // Delete ke baad bhi header ko recalibrate karein
        window.dispatchEvent(new Event("cms_navigated"));

        alert("Enquiry deleted successfully!");
      } else {
        alert("Failed to delete enquiry.");
      }
    } catch (err) {
      console.error("Error deleting:", err);
      alert("An error occurred while deleting.");
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "sans-serif", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#111827" }}>CMS - Enquiries Management</h1>
          <p style={{ color: "#6B7280", marginTop: "5px" }}>Manage and view user requests submitted from the contact form.</p>
        </div>
        
        <button 
          onClick={fetchEnquiries} 
          style={{ padding: "10px 15px", backgroundColor: "#3B82F6", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "500" }}
        >
          Refresh Data
        </button>
      </div>

      <hr style={{ border: "0", height: "1px", backgroundColor: "#E5E7EB", marginBottom: "30px" }} />

      {/* Loading & Error States */}
      {loading && <p style={{ textAlign: "center", fontSize: "18px", color: "#4B5563" }}>Loading enquiries...</p>}
      {error && <p style={{ textAlign: "center", color: "#EF4444", fontWeight: "bold" }}>Error: {error}</p>}

      {/* Data Table */}
      {!loading && !error && (
        <div style={{ overflowX: "auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ backgroundColor: "#F3F4F6", borderBottom: "2px solid #E5E7EB" }}>
                <th style={{ padding: "15px" }}>Status</th>
                <th style={{ padding: "15px" }}>Name</th>
                <th style={{ padding: "15px" }}>Email</th>
                <th style={{ padding: "15px" }}>Message Preview</th>
                <th style={{ padding: "15px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: "30px", textAlign: "center", color: "#9CA3AF" }}>
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                enquiries.map((enquiry) => {
                  const currentId = enquiry._id || enquiry.id;
                  const isUnread = unreadIds.includes(currentId);

                  return (
                    <tr 
                      key={currentId} 
                      style={{ 
                        borderBottom: "1px solid #E5E7EB", 
                        backgroundColor: isUnread ? "#EFF6FF" : "transparent",
                        transition: "0.2s" 
                      }}
                    >
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        {isUnread && (
                          <span style={{ height: "8px", width: "8px", backgroundColor: "#3B82F6", borderRadius: "50%", display: "inline-block" }} title="New Enquiry" />
                        )}
                      </td>
                      <td style={{ padding: "15px", fontWeight: isUnread ? "600" : "500", color: "#1F2937" }}>{enquiry.name}</td>
                      <td style={{ padding: "15px", color: "#4B5563" }}>{enquiry.email}</td>
                      <td style={{ padding: "15px", color: "#6B7280", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {enquiry.message}
                      </td>
                      <td style={{ padding: "15px", textAlign: "center" }}>
                        <button
                          onClick={() => handleViewEnquiry(enquiry)}
                          style={{ marginRight: "10px", padding: "6px 12px", backgroundColor: "#10B981", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(currentId)}
                          style={{ padding: "6px 12px", backgroundColor: "#EF4444", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL */}
      {selectedEnquiry && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "white", padding: "30px", borderRadius: "8px", width: "500px", maxWidth: "90%", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginBottom: "15px", color: "#111827" }}>Enquiry Details</h2>
            <p style={{ marginBottom: "10px" }}><strong>Name:</strong> {selectedEnquiry.name}</p>
            <p style={{ marginBottom: "10px" }}><strong>Email:</strong> {selectedEnquiry.email}</p>
            <div style={{ marginBottom: "20px" }}>
              <strong>Message:</strong>
              <p style={{ backgroundColor: "#F3F4F6", padding: "15px", borderRadius: "6px", marginTop: "5px", color: "#374151", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                {selectedEnquiry.message}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <button 
                onClick={() => setSelectedEnquiry(null)}
                style={{ padding: "8px 16px", backgroundColor: "#6B7280", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
