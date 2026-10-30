"use client";

import React, { useState, useEffect } from "react";
import "./Contact.css";

export default function ContactManagement() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Form/Modal States
  const [isEditing, setIsEditing] = useState(false);
  const [activeContact, setActiveContact] = useState({
    address: "",
    phone: "",
    email: "",
    mapLink: "",
    imageLink: ""
  });

  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api/contact-info";

  // Fetch all contacts
  const fetchContacts = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      setLoading(true);
      const res = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      const result = await res.json();
      if (result.success) {
        setContacts(result.data);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.warn("Fetch aborted (timeout): contact settings");
      } else {
        console.error("Error fetching contact settings:", error);
      }
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Delete contact handler
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this contact info?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        fetchContacts();
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  // Open edit setup
  const startEdit = (contact) => {
    setActiveContact(contact);
    setIsEditing(true);
  };

  // Update contact submit handler
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/${activeContact._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeContact),
      });
      const result = await res.json();
      if (result.success) {
        setIsEditing(false);
        fetchContacts();
      }
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  // Filter contacts locally via search input
  const filteredContacts = contacts.filter((c) =>
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      {/* Top Tabs Mockup matching screenshot style */}
      <div className="top-tabs-nav">
        <button className="tab-btn active">Contact Settings</button>
      
      </div>

      <div className="main-content-card">
        <h1 className="page-title">Contact Information</h1>
        <p className="page-subtitle">Manage, update and configure global business touchpoints.</p>

        {/* Action Bar */}
        <div className="action-bar-row">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search contacts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="new-post-btn" onClick={() => alert("Redirect to create API layout if needed.")}>
            ➕ New Contact Info
          </button>
        </div>

        {/* Dynamic Edit Modal / Form Layer */}
        {isEditing && (
          <div className="edit-modal-backdrop">
            <div className="modal-card">
              <h3>Edit Contact Details</h3>
              <form onSubmit={handleUpdate} className="modal-form">
                <label>Address</label>
                <input 
                  type="text" 
                  value={activeContact.address} 
                  onChange={(e) => setActiveContact({...activeContact, address: e.target.value})} 
                />
                
                <label>Phone</label>
                <input 
                  type="text" 
                  value={activeContact.phone} 
                  onChange={(e) => setActiveContact({...activeContact, phone: e.target.value})} 
                />

                <label>Email</label>
                <input 
                  type="email" 
                  value={activeContact.email} 
                  onChange={(e) => setActiveContact({...activeContact, email: e.target.value})} 
                />

                <label>Map Link</label>
                <input 
                  type="text" 
                  value={activeContact.mapLink} 
                  onChange={(e) => setActiveContact({...activeContact, mapLink: e.target.value})} 
                />

                <div className="modal-actions">
                  <button type="submit" className="save-btn">Save Updates</button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table View matching layout standard */}
        <div className="table-responsive-container">
          <table className="custom-dashboard-table">
            <thead>
              <tr>
                <th>OFFICE DETAILS & EMAIL</th>
                <th>PHONE NUMBER</th>
                <th>LOCATION METRIC</th>
                <th>STATUS</th>
                <th>CREATED DATE</th>
                <th style={{ textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">Loading settings data securely...</td>
                </tr>
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No contact settings records found.</td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact._id}>
                    <td>
                      <div className="primary-title">{contact.address}</div>
                      <div className="subtitle-url">{contact.email}</div>
                    </td>
                    <td>
                      <span className="category-badge">{contact.phone}</span>
                    </td>
                    <td>
                      <span className="author-text">
                        <a href={contact.mapLink} target="_blank" rel="noreferrer" className="link-text">
                          View Map 🔗
                        </a>
                      </span>
                    </td>
                    <td>
                      <span className="status-badge-draft">● LIVE</span>
                    </td>
                    <td>
                      <span className="date-text">
                        {new Date(contact.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="action-buttons-group">
                        <button className="action-icon-btn" title="Edit Item" onClick={() => startEdit(contact)}>
                          ✏️
                        </button>
                        <button className="action-icon-btn delete" title="Delete Item" onClick={() => handleDelete(contact._id)}>
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
