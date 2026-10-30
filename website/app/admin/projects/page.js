"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit,
  X,
  PlusCircle,
  Filter,
  Settings,
  Check,
  Briefcase,
  Tags,
} from "lucide-react";
import "./ProjectsPage.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");

  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState("projects"); // 'projects' or 'categories'

  // --- Category Management State ---
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem("pm_categories");
      return saved
        ? JSON.parse(saved)
        : [
            "Web Development",
            "Application Development",
            "Branding",
            "Logo",
            "Social Media Post",
            "Video Animation",
          ];
    } catch {
      return [
        "Web Development",
        "Application Development",
        "Branding",
        "Logo",
        "Social Media Post",
        "Video Animation",
      ];
    }
  });
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [editingCatIndex, setEditingCatIndex] = useState(null);
  const [editingCatValue, setEditingCatValue] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    title: "",
    category: "",
    tags: "",
    thumbnail: "",
    type: "image",
    client: "",
    projectType: "",
    year: "",
    previewUrl: "",
    description: "",
    overview: {
      description: "",
      images: [],
    },
    quote: "",
    quoteAuthor: "",
    content: [],
    scopeOfWork: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  const API_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api/projects";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === "AbortError") {
        console.warn("Fetch aborted (timeout): projects");
      } else {
        console.error("Failed to fetch projects:", error);
      }
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (response.ok) {
        setProjects(projects.filter((project) => project._id !== id));
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  // ─── Category Handlers ───────────────────────────────────────────────────────

  const persistCategories = (updated) => {
    setCategories(updated);
    try {
      localStorage.setItem("pm_categories", JSON.stringify(updated));
    } catch {}
  };

  const handleAddCategory = () => {
    const val = newCategoryInput.trim();
    if (!val) return;
    if (categories.includes(val)) {
      alert("This category already exists.");
      return;
    }
    persistCategories([...categories, val]);
    setNewCategoryInput("");
  };

  const handleDeleteCategory = (index) => {
    if (!window.confirm(`Delete category "${categories[index]}"?`)) return;
    const updated = categories.filter((_, i) => i !== index);
    persistCategories(updated);
    if (filterCategory === categories[index]) setFilterCategory("All");
  };

  const handleStartEditCat = (index) => {
    setEditingCatIndex(index);
    setEditingCatValue(categories[index]);
  };

  const handleSaveEditCat = () => {
    const val = editingCatValue.trim();
    if (!val) return;
    if (categories.includes(val) && categories[editingCatIndex] !== val) {
      alert("This category already exists.");
      return;
    }
    const oldVal = categories[editingCatIndex];
    const updated = [...categories];
    updated[editingCatIndex] = val;
    persistCategories(updated);
    if (filterCategory === oldVal) setFilterCategory(val);
    setEditingCatIndex(null);
  };

  const handleCancelEditCat = () => {
    setEditingCatIndex(null);
    setEditingCatValue("");
  };

  // ─── Form Handlers ────────────────────────────────────────────────────────────

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOverviewDescChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      overview: { ...prev.overview, description: e.target.value },
    }));
  };

  const handleAddOverviewImage = () => {
    setFormData((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        images: [...prev.overview.images, { src: "", alt: "" }],
      },
    }));
  };

  const handleRemoveOverviewImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        images: prev.overview.images.filter((_, i) => i !== index),
      },
    }));
  };

  const handleOverviewImageChange = (index, field, value) => {
    const newImages = [...formData.overview.images];
    newImages[index][field] = value;
    setFormData((prev) => ({
      ...prev,
      overview: { ...prev.overview, images: newImages },
    }));
  };

  const handleAddContent = () => {
    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, { src: "", alt: "" }],
    }));
  };

  const handleRemoveContent = (index) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  };

  const handleContentChange = (index, field, value) => {
    const newContent = [...formData.content];
    newContent[index][field] = value;
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  const handleAddScope = () => {
    setFormData((prev) => ({
      ...prev,
      scopeOfWork: [...prev.scopeOfWork, { title: "", description: "" }],
    }));
  };

  const handleRemoveScope = (index) => {
    setFormData((prev) => ({
      ...prev,
      scopeOfWork: prev.scopeOfWork.filter((_, i) => i !== index),
    }));
  };

  const handleScopeChange = (index, field, value) => {
    const newScope = [...formData.scopeOfWork];
    newScope[index][field] = value;
    setFormData((prev) => ({ ...prev, scopeOfWork: newScope }));
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingId(project._id);
      setFormData({
        title: project.title || "",
        category: project.category || "",
        tags: project.tags || "",
        thumbnail: project.thumbnail || "",
        type: project.type || "image",
        client: project.client || "",
        projectType: project.projectType || "",
        year: project.year || "",
        previewUrl: project.previewUrl || "",
        description: project.description || "",
        overview: project.overview
          ? {
              description: project.overview.description || "",
              images: project.overview.images || [],
            }
          : { description: "", images: [] },
        quote: project.quote || "",
        quoteAuthor: project.quoteAuthor || "",
        content: project.content || [],
        scopeOfWork: project.scopeOfWork || [],
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${API_URL}/${editingId}` : API_URL;
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const savedProject = await response.json();
        if (editingId) {
          setProjects(
            projects.map((p) => (p._id === editingId ? savedProject : p)),
          );
        } else {
          setProjects([savedProject, ...projects]);
        }
        closeModal();
      } else {
        alert("Failed to save project.");
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const filteredProjects =
    filterCategory === "All"
      ? projects
      : projects.filter((project) => project.category === filterCategory);

  return (
    <div className="projects-container">
      {/* ── Tabs Navigation System (Image Style) ────────────────────────────────── */}
      <div className="custom-tabs-navbar">
        <button
          className={`custom-tab-item ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          <Briefcase size={16} className="tab-icon-img" />
          Projects Management
        </button>
        <button
          className={`custom-tab-item ${activeTab === "categories" ? "active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          <Tags size={16} className="tab-icon-img" />
          Manage Categories{" "}
        </button>
      </div>

      {/* ── TAB 1: PROJECTS VIEW ────────────────────────────────────────────────── */}
      {activeTab === "projects" && (
        <>
          <div className="projects-header">
            <h1 className="projects-title">All Projects</h1>

            <div className="header-actions">
              {/* Filter Dropdown */}
              <div className="filter-wrapper">
                <Filter size={15} className="filter-icon" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-dropdown"
                >
                  <option value="All">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add Project */}
              <button className="btn-add" onClick={() => openModal()}>
                <Plus size={18} />
                Add New Project
              </button>
            </div>
          </div>

          {/* Projects Table */}
          {isLoading ? (
            <p className="loading-text">Loading projects...</p>
          ) : (
            <div className="table-wrapper">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th>Year</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        {filterCategory === "All"
                          ? "No projects found. Create one to get started!"
                          : `No projects found in "${filterCategory}" category.`}
                      </td>
                    </tr>
                  ) : (
                    filteredProjects.map((project) => (
                      <tr key={project._id} className="table-row">
                        <td className="thumbnail-cell">
                          <img
                            src={
                              project.thumbnail ||
                              "https://via.placeholder.com/80x50?text=No+Image"
                            }
                            alt={project.title}
                            className="project-thumbnail"
                            loading="lazy"
                          />
                        </td>
                        <td className="title-cell">
                          {project.title || "Untitled"}
                        </td>
                        <td>{project.category || "N/A"}</td>
                        <td>{project.client || "N/A"}</td>
                        <td>
                          <span className="type-badge">
                            {project.projectType || "Uncategorized"}
                          </span>
                        </td>
                        <td>{project.year || "N/A"}</td>
                        <td className="actions-cell">
                          <button
                            className="btn-icon btn-edit"
                            title="Edit Project"
                            onClick={() => openModal(project)}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(project._id)}
                            className="btn-icon btn-delete"
                            title="Delete Project"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: CATEGORIES MANAGEMENT VIEW ────────────────────────────────────── */}
      {activeTab === "categories" && (
        <div className="categories-management-tab">
          <div className="projects-header">
            <h1 className="projects-title">Manage Categories</h1>

            {/* Inline Add Category */}
            <div className="cat-input-group">
              <input
                type="text"
                className="cat-text-input"
                placeholder="Type new category name..."
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
              />
              <button className="btn-add-cat" onClick={handleAddCategory}>
                <Plus size={15} />
                Add Category
              </button>
            </div>
          </div>

          <div className="cat-panel-static">
            <div className="cat-panel-header">
              <span>Available Categories</span>
              <span className="cat-count">{categories.length} total</span>
            </div>
            <div className="cat-panel-body-static">
              {categories.length === 0 ? (
                <p className="cat-empty">
                  No categories yet. Create one above.
                </p>
              ) : (
                categories.map((cat, i) => (
                  <div
                    key={i}
                    className={`cat-item ${editingCatIndex === i ? "editing" : ""}`}
                  >
                    {editingCatIndex === i ? (
                      <>
                        <input
                          className="cat-edit-input"
                          value={editingCatValue}
                          autoFocus
                          onChange={(e) => setEditingCatValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEditCat();
                            if (e.key === "Escape") handleCancelEditCat();
                          }}
                        />
                        <button
                          className="btn-icon btn-save-cat"
                          onClick={handleSaveEditCat}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          className="btn-icon btn-cancel-cat"
                          onClick={handleCancelEditCat}
                        >
                          <X size={15} />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="cat-item-name">{cat}</span>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleStartEditCat(i)}
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteCategory(i)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add / Edit Project Modal ────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content large-modal">
            <div className="modal-header">
              <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>
              <button className="btn-icon" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-scroll-area">
                <h3 className="section-title">Basic Information</h3>
               
                <div className="form-grid mt-3">
                  <div className="form-group full-width">
                    <label>Project Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                   <div className="form-group full-width mt-3">
                  <label>Description (Short)</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                  ></textarea>
                </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="" disabled>
                        Select a Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Client</label>
                    <input
                      type="text"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Project Type</label>
                    <input
                      type="text"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Tags (Comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="text"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Thumbnail Image URL</label>
                    <input
                      type="url"
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Media Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preview URL (Live Link)</label>
                    <input
                      type="url"
                      name="previewUrl"
                      value={formData.previewUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <hr className="divider" />

                {/* Project Overview */}
                <h3 className="section-title">Project Overview</h3>
                <div className="form-group full-width mt-3">
                  <label>Overview Detailed Description</label>
                  <textarea
                    value={formData.overview.description}
                    onChange={handleOverviewDescChange}
                    rows="4"
                    placeholder="Provide a detailed overview of the project here..."
                  ></textarea>
                </div>

                <div className="section-header mt-3">
                  <h4 className="section-title" style={{ fontSize: "1rem" }}>
                    Overview Images
                  </h4>
                  <button
                    type="button"
                    className="btn-add-small"
                    onClick={handleAddOverviewImage}
                  >
                    <PlusCircle size={16} /> Add Overview Image
                  </button>
                </div>
                {formData.overview.images.map((item, index) => (
                  <div key={index} className="array-item-card">
                    <div className="form-group full-width">
                      <label>Image Source URL *</label>
                      <input
                        type="url"
                        value={item.src}
                        onChange={(e) =>
                          handleOverviewImageChange(
                            index,
                            "src",
                            e.target.value,
                          )
                        }
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Alt Text / Description</label>
                      <input
                        type="text"
                        value={item.alt}
                        onChange={(e) =>
                          handleOverviewImageChange(
                            index,
                            "alt",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveOverviewImage(index)}
                    >
                      <Trash2 size={16} /> Remove Image
                    </button>
                  </div>
                ))}

                <hr className="divider" />

                {/* Media Content */}
                <div className="section-header">
                  <h3 className="section-title">
                    Other Media Content (Videos/Images)
                  </h3>
                  <button
                    type="button"
                    className="btn-add-small"
                    onClick={handleAddContent}
                  >
                    <PlusCircle size={16} /> Add Media
                  </button>
                </div>
                {formData.content.map((item, index) => (
                  <div key={index} className="array-item-card">
                    <div className="form-group full-width">
                      <label>Media Source URL *</label>
                      <input
                        type="url"
                        value={item.src}
                        onChange={(e) =>
                          handleContentChange(index, "src", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Alt Text / Description</label>
                      <input
                        type="text"
                        value={item.alt}
                        onChange={(e) =>
                          handleContentChange(index, "alt", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveContent(index)}
                    >
                      <Trash2 size={16} /> Remove Media
                    </button>
                  </div>
                ))}

                <hr className="divider" />

                {/* Scope of Work */}
                <div className="section-header">
                  <h3 className="section-title">Scope of Work</h3>
                  <button
                    type="button"
                    className="btn-add-small"
                    onClick={handleAddScope}
                  >
                    <PlusCircle size={16} /> Add Scope
                  </button>
                </div>
                {formData.scopeOfWork.map((item, index) => (
                  <div key={index} className="array-item-card">
                    <div className="form-group full-width">
                      <label>Title</label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleScopeChange(index, "title", e.target.value)
                        }
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          handleScopeChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        rows="2"
                      ></textarea>
                    </div>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveScope(index)}
                    >
                      <Trash2 size={16} /> Remove Scope
                    </button>
                  </div>
                ))}

                <hr className="divider" />

                {/* Quote */}
                <h3 className="section-title">Client / Project Quote</h3>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Quote Text</label>
                    <textarea
                      name="quote"
                      value={formData.quote}
                      onChange={handleInputChange}
                      rows="2"
                    ></textarea>
                  </div>
                  <div className="form-group full-width">
                    <label>Quote Author</label>
                    <input
                      type="text"
                      name="quoteAuthor"
                      value={formData.quoteAuthor}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions sticky-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingId ? "Update Project" : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
