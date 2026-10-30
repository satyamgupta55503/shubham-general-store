"use client";

import React, { useState, useEffect } from "react";
import "./Homepage.css";

export default function PageManager() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("hero");

  // Temporary States for Forms
  const [tempService, setTempService] = useState({ heading: "", description: "", icon: "" });
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);

  const [tempProject, setTempProject] = useState({ image: "", category: "", icon: "" });
  const [editingProjectIndex, setEditingProjectIndex] = useState(null);

  const [tempFaq, setTempFaq] = useState({ question: "", answer: "" });
  const [editingFaqIndex, setEditingFaqIndex] = useState(null);

  const [tempTestimonial, setTempTestimonial] = useState({ quote: "", clientName: "", designation: "", photo: "", ratings: 5 });
  const [editingTestimonialIndex, setEditingTestimonialIndex] = useState(null);

  // Logo Array Temporary State
  const [newLogoUrl, setNewLogoUrl] = useState("");

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api/pages/homepage", { signal: controller.signal });
      clearTimeout(timeoutId);
      const json = await res.json();
      if (json.success && json.data) {
        setPageData(json.data);
      } else {
        // No homepage document yet — initialize with empty structure
        setPageData(getEmptyPageData());
      }
    } catch (error) {
      clearTimeout(timeoutId);
      // On any error, show empty form so admin can create data
      setPageData(getEmptyPageData());
    } finally {
      setLoading(false);
    }
  };

  const getEmptyPageData = () => ({
    pageName: "Homepage",
    hero:     { heading: "", description: "", image: "", buttons: { seeOurWork: { text: "Shop Now", link: "/products" }, bookCall: { text: "View Categories" } }, companyLogos: [] },
    videoSection: { heading: "", description: "", videoLink: "" },
    servicesSection: { heading: "", description: "", cards: [] },
    projectSection:  { heading: "", projects: [] },
    statsSection:    { heading: "", cards: [] },
    testimonials:    [],
    faqs:            [],
    footer: { logo: "", address: "", operatingHours: "", socialMedia: [], aboutPages: [], services: [], resources: [], support: [] },
  });

  const updatePageInDB = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/api/pages/homepage`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });
      const json = await res.json();
      if (json.success) {
        alert("डेटा सफलतापूर्वक डेटाबेस में अपडेट हो गया!");
        fetchPageData(); // Refresh seamlessly to append proper ObjectIds
      } else {
        alert("Validation Error: " + json.message);
      }
    } catch (error) {
      console.error("Error updating page:", error);
      alert("Server parsing constraint error.");
    }
  };

  if (loading) {
    return (
      <div className="cms-loading-wrapper">
        <div className="cms-loader"></div>
        <p>लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
      </div>
    );
  }
  if (!pageData) return null;

  const tabs = [
    { id: "hero", label: "Hero Section" },
    { id: "video", label: "Video Section" },
    { id: "services", label: "Services" },
    { id: "projects", label: "Projects" },
    { id: "stats", label: "Stats Section" },
    { id: "faq", label: "FAQs" },
    { id: "testimonials", label: "Testimonials" },
    { id: "footer", label: "Footer Settings" },
  ];

  const handleDirectFieldChange = (section, field, value, nestedField = null) => {
    const updated = { ...pageData };
    if (nestedField) {
      if (!updated[section]) updated[section] = {};
      if (!updated[section][field]) updated[section][field] = {};
      updated[section][field][nestedField] = value;
    } else {
      if (!updated[section]) updated[section] = {};
      updated[section][field] = value;
    }
    setPageData(updated);
  };

  // --- LOGO ARRAY CONFIG ---
  const addCompanyLogo = () => {
    if (!newLogoUrl) return;
    const updated = { ...pageData };
    if (!updated.hero) updated.hero = {};
    if (!updated.hero.companyLogos) updated.hero.companyLogos = [];
    updated.hero.companyLogos.push(newLogoUrl);
    setPageData(updated);
    setNewLogoUrl("");
  };

  const removeCompanyLogo = (index) => {
    const updated = { ...pageData };
    if (updated.hero && updated.hero.companyLogos) {
      updated.hero.companyLogos.splice(index, 1);
      setPageData(updated);
    }
  };

  // --- SERVICES CRUD ---
  const saveService = () => {
    if (!tempService.heading.trim() || !tempService.description.trim()) {
      alert("Heading and Description fields are required!");
      return;
    }

    const updated = { ...pageData };
    if (!updated.servicesSection) updated.servicesSection = { heading: "", cards: [] };
    if (!updated.servicesSection.cards) updated.servicesSection.cards = [];

    if (editingServiceIndex !== null) {
      updated.servicesSection.cards[editingServiceIndex] = {
        ...updated.servicesSection.cards[editingServiceIndex],
        heading: tempService.heading,
        description: tempService.description,
        icon: tempService.icon
      };
      setEditingServiceIndex(null);
    } else {
      const newService = {
        heading: tempService.heading,
        description: tempService.description,
        icon: tempService.icon
      };
      updated.servicesSection.cards.push(newService);
    }
    setPageData(updated);
    setTempService({ heading: "", description: "", icon: "" });
  };

  const deleteService = (index) => {
    const updated = { ...pageData };
    if (updated.servicesSection && updated.servicesSection.cards) {
      updated.servicesSection.cards.splice(index, 1);
      setPageData(updated);
    }
  };

  // --- PROJECTS CRUD ---
  const saveProject = () => {
    if (!tempProject.image.trim() || !tempProject.category.trim()) {
      alert("Image URL and Category are required!");
      return;
    }

    const updated = { ...pageData };
    if (!updated.projectSection) updated.projectSection = { heading: "", projects: [] };
    if (!updated.projectSection.projects) updated.projectSection.projects = [];

    if (editingProjectIndex !== null) {
      updated.projectSection.projects[editingProjectIndex] = {
        ...updated.projectSection.projects[editingProjectIndex],
        image: tempProject.image,
        category: tempProject.category,
        icon: tempProject.icon
      };
      setEditingProjectIndex(null);
    } else {
      const newProject = {
        image: tempProject.image,
        category: tempProject.category,
        icon: tempProject.icon
      };
      updated.projectSection.projects.push(newProject);
    }
    setPageData(updated);
    setTempProject({ image: "", category: "", icon: "" });
  };

  const deleteProject = (index) => {
    const updated = { ...pageData };
    if (updated.projectSection && updated.projectSection.projects) {
      updated.projectSection.projects.splice(index, 1);
      setPageData(updated);
    }
  };

  // --- FAQS CRUD ---
  const saveFaq = () => {
    if (!tempFaq.question.trim() || !tempFaq.answer.trim()) {
      alert("Question and Answer are required!");
      return;
    }

    const updated = { ...pageData };
    if (!updated.faqs) updated.faqs = [];

    if (editingFaqIndex !== null) {
      updated.faqs[editingFaqIndex] = {
        ...updated.faqs[editingFaqIndex],
        question: tempFaq.question,
        answer: tempFaq.answer
      };
      setEditingFaqIndex(null);
    } else {
      const newFaq = {
        question: tempFaq.question,
        answer: tempFaq.answer
      };
      updated.faqs.push(newFaq);
    }
    setPageData(updated);
    setTempFaq({ question: "", answer: "" });
  };

  const deleteFaq = (index) => {
    const updated = { ...pageData };
    if (updated.faqs) {
      updated.faqs.splice(index, 1);
      setPageData(updated);
    }
  };

  // --- TESTIMONIALS CRUD ---
  const saveTestimonial = () => {
    const updated = { ...pageData };
    if (!updated.testimonials) updated.testimonials = [];

    if (editingTestimonialIndex !== null) {
      updated.testimonials[editingTestimonialIndex] = {
        ...updated.testimonials[editingTestimonialIndex],
        quote: tempTestimonial.quote,
        clientName: tempTestimonial.clientName,
        designation: tempTestimonial.designation,
        photo: tempTestimonial.photo,
        ratings: tempTestimonial.ratings
      };
      setEditingTestimonialIndex(null);
    } else {
      const newTestimonial = { ...tempTestimonial };
      updated.testimonials.push(newTestimonial);
    }
    setPageData(updated);
    setTempTestimonial({ quote: "", clientName: "", designation: "", photo: "", ratings: 5 });
  };

  const deleteTestimonial = (index) => {
    const updated = { ...pageData };
    if (updated.testimonials) {
      updated.testimonials.splice(index, 1);
      setPageData(updated);
    }
  };

  // --- FOOTER DYNAMIC LINKS CRUD HELPERS ---
  const handleFooterLinkChange = (group, index, field, value) => {
    const updated = { ...pageData };
    if (!updated.footer) updated.footer = {};
    if (!updated.footer[group]) updated.footer[group] = [];
    updated.footer[group][index][field] = value;
    setPageData(updated);
  };

  const addFooterLink = (group) => {
    const updated = { ...pageData };
    if (!updated.footer) updated.footer = {};
    if (!updated.footer[group]) updated.footer[group] = [];
    updated.footer[group].push({ label: "", link: "" });
    setPageData(updated);
  };

  const removeFooterLink = (group, index) => {
    const updated = { ...pageData };
    if (updated.footer && updated.footer[group]) {
      updated.footer[group].splice(index, 1);
      setPageData(updated);
    }
  };

  const handleSocialMediaChange = (index, field, value) => {
    const updated = { ...pageData };
    if (!updated.footer) updated.footer = {};
    if (!updated.footer.socialMedia) updated.footer.socialMedia = [];
    updated.footer.socialMedia[index][field] = value;
    setPageData(updated);
  };

  const addSocialMedia = () => {
    const updated = { ...pageData };
    if (!updated.footer) updated.footer = {};
    if (!updated.footer.socialMedia) updated.footer.socialMedia = [];
    updated.footer.socialMedia.push({ platform: "", link: "", icon: "" });
    setPageData(updated);
  };

  const removeSocialMedia = (index) => {
    const updated = { ...pageData };
    if (updated.footer && updated.footer.socialMedia) {
      updated.footer.socialMedia.splice(index, 1);
      setPageData(updated);
    }
  };

  // UI Renderer for Footer Link Groups
  const renderFooterLinkGroup = (groupName, displayTitle) => {
    const items = pageData.footer?.[groupName] || [];
    return (
      <div className="dynamic-form-box mt-2">
        <div className="section-split-header mb-2">
          <h3 className="sub-box-title" style={{ margin: 0 }}>{displayTitle}</h3>
          <button type="button" onClick={() => addFooterLink(groupName)} className="btn-add-inline">➕ Add Link</button>
        </div>
        {items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Display Label (e.g., About Us)"
              className="form-input"
              value={item.label || ""}
              onChange={(e) => handleFooterLinkChange(groupName, index, "label", e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="text"
              placeholder="URL Link (e.g., /about)"
              className="form-input"
              value={item.link || ""}
              onChange={(e) => handleFooterLinkChange(groupName, index, "link", e.target.value)}
              style={{ flex: 2 }}
            />
            <button onClick={() => removeFooterLink(groupName, index)} className="btn-badge-remove" style={{ position: 'static', padding: '0 12px', height: 'auto' }}>×</button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="cms-container">
      {/* Tabs Navigation */}
      <nav className="tabs-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : "tab-btn-inactive"}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Dynamic Form Panel */}
      <main className="form-panel">
        
        {/* --- HERO SECTION --- */}
        {activeTab === "hero" && (
          <div className="fade-in">
            <h2 className="section-title">Hero Section Layout Configuration</h2>
            <div className="grid-1col">
              <div className="form-group">
                <label className="form-label">Main Heading Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.hero?.heading || ""}
                  onChange={(e) => handleDirectFieldChange("hero", "heading", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Detailed Description</label>
                <textarea
                  className="form-textarea"
                  value={pageData.hero?.description || ""}
                  onChange={(e) => handleDirectFieldChange("hero", "description", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Hero Banner Image URL Asset</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.hero?.image || ""}
                  onChange={(e) => handleDirectFieldChange("hero", "image", e.target.value)}
                />
              </div>

              <div className="grid-2col border-top-panel">
                <div className="form-group">
                  <label className="form-label">Button 1: Text Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.hero?.buttons?.seeOurWork?.text || ""}
                    onChange={(e) => {
                      const updated = { ...pageData };
                      if (!updated.hero) updated.hero = {};
                      if (!updated.hero.buttons) updated.hero.buttons = { seeOurWork: {}, bookCall: {} };
                      if (!updated.hero.buttons.seeOurWork) updated.hero.buttons.seeOurWork = {};
                      updated.hero.buttons.seeOurWork.text = e.target.value;
                      setPageData(updated);
                    }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Button 1: Hyperlink Redirect</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.hero?.buttons?.seeOurWork?.link || ""}
                    onChange={(e) => {
                      const updated = { ...pageData };
                      if (!updated.hero) updated.hero = {};
                      if (!updated.hero.buttons) updated.hero.buttons = { seeOurWork: {}, bookCall: {} };
                      if (!updated.hero.buttons.seeOurWork) updated.hero.buttons.seeOurWork = {};
                      updated.hero.buttons.seeOurWork.link = e.target.value;
                      setPageData(updated);
                    }}
                  />
                </div>
              </div>

              <div className="grid-1col border-top-panel">
                <div className="form-group">
                  <label className="form-label">Button 2: Text Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={pageData.hero?.buttons?.bookCall?.text || ""}
                    onChange={(e) => {
                      const updated = { ...pageData };
                      if (!updated.hero) updated.hero = {};
                      if (!updated.hero.buttons) updated.hero.buttons = { seeOurWork: {}, bookCall: {} };
                      if (!updated.hero.buttons.bookCall) updated.hero.buttons.bookCall = {};
                      updated.hero.buttons.bookCall.text = e.target.value;
                      setPageData(updated);
                    }}
                  />
                </div>
              </div>

              {/* Company Branding Partner Logos */}
              <div className="form-group border-top-panel">
                <label className="form-label">Company Logos System Stream</label>
                <div className="logo-input-mix">
                  <input
                    type="text"
                    placeholder="Paste Logo PNG/SVG Link here..."
                    className="form-input"
                    value={newLogoUrl}
                    onChange={(e) => setNewLogoUrl(e.target.value)}
                  />
                  <button type="button" onClick={addCompanyLogo} className="btn-add-inline">Add Logo</button>
                </div>
                <div className="logo-preview-row">
                  {pageData.hero?.companyLogos?.map((logo, index) => (
                    <div key={index} className="logo-preview-badge">
                      <span className="logo-text-truncate">{logo}</span>
                      <button type="button" onClick={() => removeCompanyLogo(index)} className="btn-badge-remove">×</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- VIDEO SECTION --- */}
        {activeTab === "video" && (
          <div className="fade-in">
            <h2 className="section-title">Video Center Overview</h2>
            <div className="grid-1col">
              <div className="form-group">
                <label className="form-label">Video Area Heading</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.videoSection?.heading || ""}
                  onChange={(e) => handleDirectFieldChange("videoSection", "heading", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Catchphrase / Brief Summary</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.videoSection?.description || ""}
                  onChange={(e) => handleDirectFieldChange("videoSection", "description", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">YouTube Source Embedded Video Link</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.videoSection?.videoLink || ""}
                  onChange={(e) => handleDirectFieldChange("videoSection", "videoLink", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- SERVICES SECTION --- */}
        {activeTab === "services" && (
          <div className="fade-in">
            <div className="section-split-header">
              <h2 className="section-title">Services Segment Settings</h2>
              <span className="counter-pill">{pageData.servicesSection?.cards?.length || 0} Core Services</span>
            </div>
            
            <div className="grid-2col mb-2">
              <div className="form-group">
                <label className="form-label">Section Main Header</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.servicesSection?.heading || ""}
                  onChange={(e) => handleDirectFieldChange("servicesSection", "heading", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Section Meta Subtext</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.servicesSection?.description || ""}
                  onChange={(e) => handleDirectFieldChange("servicesSection", "description", e.target.value)}
                />
              </div>
            </div>

            <div className="dynamic-form-box">
              <h3 className="sub-box-title">Create / Modify Card Entity</h3>
              <div className="grid-2col">
                <input
                  type="text"
                  placeholder="Service Strategic Heading"
                  className="form-input"
                  value={tempService.heading}
                  onChange={(e) => setTempService({ ...tempService, heading: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Lucide Vector Icon Name (e.g., Code, Cpu)"
                  className="form-input"
                  value={tempService.icon}
                  onChange={(e) => setTempService({ ...tempService, icon: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Write service description details..."
                className="form-input form-textarea-short mt-2"
                value={tempService.description}
                onChange={(e) => setTempService({ ...tempService, description: e.target.value })}
              />
              <button onClick={saveService} className="btn-primary-add mt-2">
                {editingServiceIndex !== null ? "⚡ Save Active Item Updates" : "➕ Append into Service Deck"}
              </button>
            </div>

            <div className="list-container-1col">
              {pageData.servicesSection?.cards?.map((service, index) => (
                <div key={service._id || index} className="list-item-row">
                  <div className="item-details">
                    <h4 className="item-title">
                      {service.heading} <span className="badge">{service.icon}</span>
                    </h4>
                    <p className="item-subtitle">{service.description}</p>
                  </div>
                  <div className="btn-action-group">
                    <button
                      onClick={() => {
                        setTempService({
                          heading: service.heading || "",
                          description: service.description || "",
                          icon: service.icon || ""
                        });
                        setEditingServiceIndex(index);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteService(index)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PROJECTS SECTION --- */}
        {activeTab === "projects" && (
          <div className="fade-in">
            <h2 className="section-title">Project Portfolio Catalog</h2>
            
            <div className="form-group mb-2">
              <label className="form-label">Project Section Main Heading</label>
              <input
                type="text"
                className="form-input"
                value={pageData.projectSection?.heading || ""}
                onChange={(e) => handleDirectFieldChange("projectSection", "heading", e.target.value)}
              />
            </div>

            <div className="dynamic-form-box">
              <h3 className="sub-box-title">Add / Edit Portfolio Entity</h3>
              <div className="grid-2col">
                <input
                  type="text"
                  placeholder="Classification Category"
                  className="form-input"
                  value={tempProject.category}
                  onChange={(e) => setTempProject({ ...tempProject, category: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Lucide Icon Vector Keyword"
                  className="form-input"
                  value={tempProject.icon}
                  onChange={(e) => setTempProject({ ...tempProject, icon: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="Cloud Asset Image CDN URL Address"
                className="form-input mt-2"
                value={tempProject.image}
                onChange={(e) => setTempProject({ ...tempProject, image: e.target.value })}
              />
              <button onClick={saveProject} className="btn-primary-add mt-2">
                {editingProjectIndex !== null ? "⚡ Refresh Selected Showcase Portfolio" : "🚀 Deploy Project to Main Track"}
              </button>
            </div>

            <div className="list-container-2col">
              {pageData.projectSection?.projects?.map((project, index) => (
                <div key={project._id || index} className="list-item-row asset-card">
                  <div className="item-details">
                    <p className="text-bold text-slate">
                      {project.category} <span className="badge">{project.icon}</span>
                    </p>
                    <span className="url-preview-text">{project.image}</span>
                  </div>
                  <div className="btn-action-group">
                    <button
                      onClick={() => {
                        setTempProject({
                          image: project.image || "",
                          category: project.category || "",
                          icon: project.icon || ""
                        });
                        setEditingProjectIndex(index);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteProject(index)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STATS SECTION --- */}
        {activeTab === "stats" && (
          <div className="fade-in">
            <h2 className="section-title">Data Matrix Scale Parameters</h2>
            <div className="form-group mb-2">
              <label className="form-label">Stats Heading Text Header</label>
              <input
                type="text"
                className="form-input"
                value={pageData.statsSection?.heading || ""}
                onChange={(e) => handleDirectFieldChange("statsSection", "heading", e.target.value)}
              />
            </div>
            
            <div className="grid-stats">
              {pageData.statsSection?.cards?.map((stat, index) => (
                <div key={stat._id || index} className="stat-card-input-box form-group">
                  <label className="form-label-caps">{stat.label} <span className="badge-icon-label">({stat.icon})</span></label>
                  <input
                    type="number"
                    className="form-input numeric-heavy-input"
                    value={stat.value}
                    onChange={(e) => {
                      const updated = { ...pageData };
                      updated.statsSection.cards[index].value = parseInt(e.target.value) || 0;
                      setPageData(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FAQS SECTION --- */}
        {activeTab === "faq" && (
          <div className="fade-in">
            <h2 className="section-title">F.A.Q Engine Management</h2>
            <div className="grid-1col dynamic-form-box">
              <input
                type="text"
                placeholder="User Query / Question Element Phrase"
                className="form-input"
                value={tempFaq.question}
                onChange={(e) => setTempFaq({ ...tempFaq, question: e.target.value })}
              />
              <textarea
                placeholder="Informational Database Response Sheet"
                className="form-input form-textarea-short"
                value={tempFaq.answer}
                onChange={(e) => setTempFaq({ ...tempFaq, answer: e.target.value })}
              />
              <button onClick={saveFaq} className="btn-primary-add">
                {editingFaqIndex !== null ? "⚡ Save Question Updates" : "➕ Inject F.A.Q Block Entry"}
              </button>
            </div>

            <div className="list-container-1col" style={{ gap: "0.85rem" }}>
              {pageData.faqs?.map((faq, index) => (
                <div key={faq._id || index} className="list-item-row list-item-start faq-row-theme">
                  <div className="item-content-max">
                    <p className="faq-q-text">💡 {faq.question}</p>
                    <p className="faq-a-text">{faq.answer}</p>
                  </div>
                  <div className="btn-action-group">
                    <button
                      onClick={() => {
                        setTempFaq({
                          question: faq.question || "",
                          answer: faq.answer || ""
                        });
                        setEditingFaqIndex(index);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteFaq(index)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TESTIMONIALS SECTION --- */}
        {activeTab === "testimonials" && (
          <div className="fade-in">
            <h2 className="section-title">Public Endorsement & Trust Records</h2>
            <div className="dynamic-form-box grid-layout-dense">
              <div className="grid-2col">
                <input
                  type="text"
                  placeholder="Reviewer Client Profile Name"
                  className="form-input"
                  value={tempTestimonial.clientName}
                  onChange={(e) => setTempTestimonial({ ...tempTestimonial, clientName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Designation Role / Business Corporate"
                  className="form-input"
                  value={tempTestimonial.designation}
                  onChange={(e) => setTempTestimonial({ ...tempTestimonial, designation: e.target.value })}
                />
              </div>
              <div className="grid-2col mt-2">
                <input
                  type="text"
                  placeholder="Avatar Image Hosted Link"
                  className="form-input"
                  value={tempTestimonial.photo}
                  onChange={(e) => setTempTestimonial({ ...tempTestimonial, photo: e.target.value })}
                />
                <input
                  type="number"
                  max={5}
                  min={1}
                  placeholder="Stars Weight Scale (1-5)"
                  className="form-input"
                  value={tempTestimonial.ratings}
                  onChange={(e) => setTempTestimonial({ ...tempTestimonial, ratings: parseInt(e.target.value) || 5 })}
                />
              </div>
              <textarea
                placeholder="Verbatim client statement citation text..."
                className="form-input form-textarea-short mt-2"
                value={tempTestimonial.quote}
                onChange={(e) => setTempTestimonial({ ...tempTestimonial, quote: e.target.value })}
              />
              <button onClick={saveTestimonial} className="btn-primary-add mt-2 w-full">
                {editingTestimonialIndex !== null ? "⚡ Apply Transformation Vector" : "🌟 Launch Profile Endorsement"}
              </button>
            </div>

            <div className="list-container-1col">
              {pageData.testimonials?.map((t, index) => (
                <div key={t._id || index} className="list-item-row quote-card-layout">
                  <div className="item-details">
                    <p className="quote-body">"{t.quote}"</p>
                    <p className="quote-author">
                      {t.clientName} <span className="author-meta">| {t.designation}</span>
                      <span className="star-badge">⭐ {t.ratings}/5</span>
                    </p>
                  </div>
                  <div className="btn-action-group">
                    <button
                      onClick={() => {
                        setTempTestimonial({
                          quote: t.quote || "",
                          clientName: t.clientName || "",
                          designation: t.designation || "",
                          photo: t.photo || "",
                          ratings: t.ratings || 5
                        });
                        setEditingTestimonialIndex(index);
                      }}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteTestimonial(index)} className="btn-delete">
                      Erase
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- FOOTER SECTION --- */}
        {activeTab === "footer" && (
          <div className="fade-in">
            <h2 className="section-title">Global Footer Parameters</h2>
            
            <div className="grid-1col">
              <div className="form-group">
                <label className="form-label">Corporate Footer Image Brand Asset</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.footer?.logo || ""}
                  onChange={(e) => handleDirectFieldChange("footer", "logo", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Headquarters Office Location Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.footer?.address || ""}
                  onChange={(e) => handleDirectFieldChange("footer", "address", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Operational Hours Frame</label>
                <input
                  type="text"
                  className="form-input"
                  value={pageData.footer?.operatingHours || ""}
                  onChange={(e) => handleDirectFieldChange("footer", "operatingHours", e.target.value)}
                />
              </div>
            </div>

            <div className="border-top-panel mt-4 pt-2">
              <h2 className="section-title">Footer Navigation Link Groups</h2>
              
              {/* Dynamic Quick Links Rendering */}
              {renderFooterLinkGroup("aboutPages", "About Pages Links")}
              {renderFooterLinkGroup("services", "Services Links")}
              {renderFooterLinkGroup("resources", "Resources Links")}
              {renderFooterLinkGroup("support", "Support Links")}

              {/* Social Media Links UI */}
              <div className="dynamic-form-box mt-4">
                <div className="section-split-header mb-2">
                  <h3 className="sub-box-title" style={{ margin: 0 }}>Social Media Network Integration</h3>
                  <button type="button" onClick={addSocialMedia} className="btn-add-inline">➕ Add Platform</button>
                </div>
                {pageData.footer?.socialMedia?.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      placeholder="Platform (e.g., LinkedIn)"
                      className="form-input"
                      value={item.platform || ""}
                      onChange={(e) => handleSocialMediaChange(index, "platform", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <input
                      type="text"
                      placeholder="Profile URL"
                      className="form-input"
                      value={item.link || ""}
                      onChange={(e) => handleSocialMediaChange(index, "link", e.target.value)}
                      style={{ flex: 2 }}
                    />
                    <input
                      type="text"
                      placeholder="Icon vector name"
                      className="form-input"
                      value={item.icon || ""}
                      onChange={(e) => handleSocialMediaChange(index, "icon", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => removeSocialMedia(index)} className="btn-badge-remove" style={{ position: 'static', padding: '0 12px', height: 'auto' }}>×</button>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}

      </main>

      {/* Global Sync Engine Action Bar */}
      <footer className="master-save-tray">
        <button onClick={updatePageInDB} className="btn-global-save">
          Commit Changes to Live Database
        </button>
      </footer>
    </div>
  );
}