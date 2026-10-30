"use client";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { projects } from "../../public/project"; // Adjust path based on your project structure

const AddProjectForm = ({ onAddProject }) => {
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    category: "",
    industry: "",
    projectType: "",
    image: "",
    video: "",
    description: "",
    links: { live: "", github: "", codepen: "" },
    progress: "Completed",
    tags: [],
    technologies: [],
    details: { challenges: "", outcomes: "" },
    detailedDescription: "",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes("links.")) {
      const linkType = name.split(".")[1];
      setFormData({
        ...formData,
        links: { ...formData.links, [linkType]: value },
      });
    } else if (name.includes("details.")) {
      const detailType = name.split(".")[1];
      setFormData({
        ...formData,
        details: { ...formData.details, [detailType]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value.split(",").map((item) => item.trim());
    setFormData({ ...formData, [field]: value });
  };

  const handleImageChange = (e) => {
    setImageFiles([...e.target.files]);
  };

  const handleVideoChange = (e) => {
    setVideoFiles([...e.target.files]);
  };

  const uploadFiles = async (files) => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("multipleimages", file);
    });

    try {
      const response = await fetch(
        "https://api.motoplatform.in/api/v1/image/multipleupload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("Error uploading files");
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus("");

    // Upload images and get URLs
    const imageUrls = await uploadFiles(imageFiles);
    const primaryImageUrl =
      imageUrls.length > 0 ? imageUrls[0] : formData.image;

    // Upload videos and get URLs
    const videoUrls = await uploadFiles(videoFiles);
    const primaryVideoUrl =
      videoUrls.length > 0 ? videoUrls[0] : formData.video;

    // Generate a new ID
    const newId =
      projects.length > 0
        ? (parseInt(projects[projects.length - 1].id) + 1).toString()
        : "1";
    const newProject = {
      ...formData,
      id: newId,
      image: primaryImageUrl,
      video: primaryVideoUrl,
    };

    // Call onAddProject if it exists
    if (typeof onAddProject === "function") {
      onAddProject(newProject);
      setUploadStatus("Project added successfully!");
    } else {
      setUploadStatus("Error: onAddProject is not a function");
      console.error("onAddProject is not a function");
      return;
    }

    // Reset form
    setFormData({
      id: "",
      title: "",
      category: "",
      industry: "",
      projectType: "",
      image: "",
      video: "",
      description: "",
      links: { live: "", github: "", codepen: "" },
      progress: "Completed",
      tags: [],
      technologies: [],
      details: { challenges: "", outcomes: "" },
      detailedDescription: "",
    });
    setImageFiles([]);
    setVideoFiles([]);
  };

  return (
    <div className="container mt-5">
      <div className="card shadow">
        <div className="card-body">
          <h2 className="card-title mb-4">Add New Project</h2>
          {uploadStatus && (
            <div
              className={`alert ${
                uploadStatus.includes("Error")
                  ? "alert-danger"
                  : "alert-success"
              }`}
              role="alert"
            >
              {uploadStatus}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                className="form-select"
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="Web Development">Web Development</option>
                <option value="Application Development">
                  Application Development
                </option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Video Animation">Video Animation</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="industry" className="form-label">
                Industry
              </label>
              <input
                type="text"
                className="form-control"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="projectType" className="form-label">
                Project Type
              </label>
              <input
                type="text"
                className="form-control"
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="imageFiles" className="form-label">
                Upload Images
              </label>
              <input
                type="file"
                className="form-control"
                id="imageFiles"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="videoFiles" className="form-label">
                Upload Videos
              </label>
              <input
                type="file"
                className="form control"
                id="videoFiles"
                multiple
                accept="video/*"
                onChange={handleVideoChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="linksLive" className="form-label">
                Live URL
              </label>
              <input
                type="text"
                className="form-control"
                id="linksLive"
                name="links.live"
                value={formData.links.live}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="linksGithub" className="form-label">
                GitHub URL
              </label>
              <input
                type="text"
                className="form-control"
                id="linksGithub"
                name="links.github"
                value={formData.links.github}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="linksCodepen" className="form-label">
                CodePen URL
              </label>
              <input
                type="text"
                className="form-control"
                id="linksCodepen"
                name="links.codepen"
                value={formData.links.codepen}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="progress" className="form-label">
                Progress
              </label>
              <select
                className="form-select"
                id="progress"
                name="progress"
                value={formData.progress}
                onChange={handleChange}
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Planned">Planned</option>
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="tags" className="form-label">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                className="form-control"
                id="tags"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={(e) => handleArrayChange(e, "tags")}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="technologies" className="form-label">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                className="form-control"
                id="technologies"
                name="technologies"
                value={formData.technologies.join(", ")}
                onChange={(e) => handleArrayChange(e, "technologies")}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="detailsChallenges" className="form-label">
                Challenges
              </label>
              <textarea
                className="form-control"
                id="detailsChallenges"
                name="details.challenges"
                value={formData.details.challenges}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="detailsOutcomes" className="form-label">
                Outcomes
              </label>
              <textarea
                className="form-control"
                id="detailsOutcomes"
                name="details.outcomes"
                value={formData.details.outcomes}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="detailedDescription" className="form-label">
                Detailed Description
              </label>
              <textarea
                className="form-control"
                id="detailedDescription"
                name="detailedDescription"
                value={formData.detailedDescription}
                onChange={handleChange}
                rows="6"
              />
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Add Project
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProjectForm;
