// "use client";

// import { useRouter, useParams } from "next/navigation";
// import { useEffect, useState } from "react";
// import "../../../public/assets/css/ProjectDetail.css";
// import Layout from "@/components/layout/Layout";
// import { projects } from "@/public/project";

// export default function ProjectDetail() {
//   const router = useRouter();
//   const { id } = useParams();

//   const [project, setProject] = useState(null);
//   const [relatedProjects, setRelatedProjects] = useState([]);
//   const [loading, setLoading] = useState(true); // ✅ new state

//   useEffect(() => {
//     if (id) {
//       const timer = setTimeout(() => {
//         const foundProject = projects.find((p) => p.id === id);
//         setProject(foundProject);

//         if (foundProject) {
//           const related = projects
//             .filter((p) => p.category === foundProject.category && p.id !== id)
//             .slice(0, 3);
//           setRelatedProjects(related);
//         }

//         setLoading(false); // ✅ done loading
//       }, 200); // small delay to simulate data fetching

//       return () => clearTimeout(timer);
//     }
//   }, [id]);

//   // ✅ Show loader while waiting for data
//   if (loading) {
//     return (
//       <Layout
//         headerStyle={1}
//         footerStyle={1}
//         headerCls="header-style-2 header-style-4"
//       >
//         <div className="portfolio-wrapper min-vh-100 d-flex align-items-center justify-content-center">
//           <div className="text-center">
//             <div
//               className="spinner-border text-primary mb-3"
//               role="status"
//             ></div>
//             <p className="text-muted">Loading project details...</p>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   // ✅ Now show "not found" only if no project after loading
//   if (!project) {
//     return (
//       <Layout
//         headerStyle={1}
//         footerStyle={1}
//         headerCls="header-style-2 header-style-4"
//       >
//         <div className="portfolio-wrapper min-vh-100 d-flex align-items-center justify-content-center">
//           <div className="text-center">
//             <i className="bi bi-exclamation-circle display-4 text-muted mb-3"></i>
//             <h3 className="text-muted">Project Not Found</h3>
//             <button
//               className="btn btn-primary mt-3"
//               onClick={() => router.push("/portfolio")}
//             >
//               Back to Portfolio
//             </button>
//           </div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout
//       headerStyle={1}
//       footerStyle={1}
//       headerCls="header-style-2 header-style-4"
//     >
//       <div className="portfolio-wrapper">
//         <main className="portfolio-container">
//           {/* Hero Section */}
//           <div className="project-hero">
//             {project.video && project.category === "Video Animation" ? (
//               <iframe
//                 src={project.video}
//                 title={project.title}
//                 className="project-hero-video"
//                 frameBorder="0"
//                 allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//                 loading="lazy"
//                 style={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                   borderRadius: "10px",
//                 }}
//               />
//             ) : (
//               <div
//                 className="project-hero-image"
//                 style={{
//                   backgroundImage: `url(${
//                     project.image || "/placeholder.svg"
//                   })`,
//                 }}
//               ></div>
//             )}
//             <div className="project-hero-overlay">
//               <span className="category-badge badge">{project.category}</span>
//               <span className="status-badge badge">
//                 <i className="bi bi-check-circle-fill me-1"></i>
//                 {project.progress}
//               </span>
//             </div>
//           </div>

//           {/* Project Info */}
//           <section className="project-info py-5">
//             <div className="row">
//               <div className="col-lg-8">
//                 <h2 className="project-title">{project.title}</h2>
//                 <p className="project-description lead">
//                   {project.description}
//                 </p>
//                 <div className="project-tags d-flex flex-wrap gap-2 mb-4">
//                   {project.tags?.map((tag, index) => (
//                     <span key={index} className="project-tag badge">
//                       {tag}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//               <div className="col-lg-4">
//                 <div className="project-meta card shadow-sm p-4">
//                   <h5 className="fw-bold mb-3">Project Details</h5>
//                   <p className="mb-2">
//                     <strong>Category:</strong> {project.category}
//                   </p>
//                   <p className="mb-2">
//                     <strong>Industry:</strong> {project?.industry}
//                   </p>
//                   <p className="mb-2">
//                     <strong>Project Type:</strong> {project?.projectType}
//                   </p>
//                   <p className="mb-2">
//                     <strong>Status:</strong> {project.progress}
//                   </p>
//                   <p className="mb-2">
//                     <strong>Technologies:</strong>{" "}
//                     {project?.technologies?.join(", ")}
//                   </p>
//                   <div className="project-links mt-4">
//                     {project.links.live !== "N/A" && (
//                       <a
//                         href={project.links.live}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="btn btn-primary w-100 mb-2"
//                       >
//                         View Live{" "}
//                         <i className="bi bi-box-arrow-up-right ms-1"></i>
//                       </a>
//                     )}
//                     {project.links.github !== "N/A" && (
//                       <a
//                         href={project.links.github}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="btn btn-outline-secondary w-100 mb-2"
//                       >
//                         GitHub <i className="bi bi-github ms-1"></i>
//                       </a>
//                     )}
//                     {project.links.codepen !== "N/A" && (
//                       <a
//                         href={project.links.codepen}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="btn btn-outline-secondary w-100"
//                       >
//                         CodePen <i className="bi bi-code-slash ms-1"></i>
//                       </a>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Project Overview */}
//           <section className="project-details py-5 border-top">
//             <h3 className="mb-4">Project Overview</h3>
//             <div className="mb-5">
//               <p className="project-description">
//                 {project.detailedDescription}
//               </p>
//             </div>
//             <div className="row" style={{ paddingTop: "10px" }}>
//               {project.details?.challenges && (
//                 <div className="col-md-6">
//                   <h5 className="fw-bold">Challenges</h5>
//                   <p>{project.details?.challenges}</p>
//                 </div>
//               )}
//               {project.details?.approach && (
//                 <div className="col-md-6">
//                   <h5 className="fw-bold">Approach</h5>
//                   <p>{project.details?.approach}</p>
//                 </div>
//               )}
//               {project.details?.outcomes && (
//                 <div className="col-md-6">
//                   <h5 className="fw-bold">Outcomes</h5>
//                   <p>{project.details?.outcomes}</p>
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* Related Projects */}
//           {relatedProjects.length > 0 && (
//             <section className="related-projects py-5 border-top">
//               <h3 className="mb-4">Related Projects</h3>
//               <div className="row row-cols-1 row-cols-md-3 g-4">
//                 {relatedProjects.map((related) => (
//                   <div className="col" key={related.id}>
//                     <div className="project-card card h-100 border-0 shadow-sm">
//                       <div
//                         className="card-img-top"
//                         style={{
//                           backgroundImage: `url(${
//                             related.image || "/placeholder.svg"
//                           })`,
//                           height: "180px",
//                           backgroundSize: "cover",
//                           backgroundPosition: "center",
//                         }}
//                       ></div>
//                       <div className="card-body d-flex flex-column">
//                         <h5 className="card-title fw-bold">{related.title}</h5>
//                         <p className="card-text text-muted flex-grow-1">
//                           {related.description}
//                         </p>
//                         <a
//                           href={`/feature/${related.id}`}
//                           className="btn btn-primary btn-sm mt-auto"
//                         >
//                           View Details{" "}
//                           <i className="bi bi-arrow-right ms-1"></i>
//                         </a>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )}
//         </main>
//       </div>
//     </Layout>
//   );
// }


"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../../../public/assets/css/ProjectDetail.css";
import Layout from "@/components/layout/Layout";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetching all projects to easily get related ones by category
      const response = await fetch("https://backend.digikraftsocial.com/api/projects");
      if (response.ok) {
        const allProjects = await response.json();
        
        // Find current project
        const foundProject = allProjects.find((p) => p._id === id);
        setProject(foundProject);

        // Find related projects (same category, exclude current)
        if (foundProject) {
          const related = allProjects
            .filter((p) => (p.category === foundProject.category || p.projectType === foundProject.projectType) && p._id !== id)
            .slice(0, 3);
          setRelatedProjects(related);
        }
      }
    } catch (error) {
      console.error("Failed to fetch project details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4">
        <div className="portfolio-wrapper min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <p className="text-muted">Loading project details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4">
        <div className="portfolio-wrapper min-vh-100 d-flex align-items-center justify-content-center">
          <div className="text-center">
            <i className="bi bi-exclamation-circle display-4 text-muted mb-3"></i>
            <h3 className="text-muted">Project Not Found</h3>
            <button className="btn btn-primary mt-3" onClick={() => router.push("/portfolio")}>
              Back to Portfolio
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Safe variables mapping from MongoDB schema
  const videoUrl = project.content && project.content.length > 0 ? project.content[0].src : null;
  const tagsArray = project.tags ? project.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <Layout headerStyle={1} footerStyle={1} headerCls="header-style-2 header-style-4">
      <div className="portfolio-wrapper">
        <main className="portfolio-container">
          {/* Hero Section */}
          <div className="project-hero">
            {videoUrl ? (
              <iframe
                src={videoUrl}
                title={project.title}
                className="project-hero-video"
                frameBorder="0"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }}
              />
            ) : (
              <div
                className="project-hero-image"
                style={{
                  backgroundImage: `url(${project.thumbnail || "https://via.placeholder.com/1200x600?text=No+Image"})`,
                }}
              ></div>
            )}
            <div className="project-hero-overlay">
              <span className="category-badge badge">{project.category || project.projectType || "Project"}</span>
              <span className="status-badge badge">
                <i className="bi bi-check-circle-fill me-1"></i>
                Completed
              </span>
            </div>
          </div>

          {/* Project Info */}
          <section className="project-info py-5">
            <div className="row">
              <div className="col-lg-8">
                <h2 className="project-title">{project.title}</h2>
                <p className="project-description lead" style={{ whiteSpace: "pre-wrap" }}>
                  {project.description}
                </p>
                
                {tagsArray.length > 0 && (
                  <div className="project-tags d-flex flex-wrap gap-2 mb-4">
                    {tagsArray.map((tag, index) => (
                      <span key={index} className="project-tag badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Client Quote if available */}
                {project.quote && (
                  <blockquote className="blockquote border-start border-4 border-primary ps-4 mt-4">
                    <p className="mb-2 fst-italic">"{project.quote}"</p>
                    {project.quoteAuthor && <footer className="blockquote-footer">{project.quoteAuthor}</footer>}
                  </blockquote>
                )}
              </div>

              <div className="col-lg-4">
                <div className="project-meta card shadow-sm p-4">
                  <h5 className="fw-bold mb-3">Project Details</h5>
                  <p className="mb-2"><strong>Client:</strong> {project.client || "N/A"}</p>
                  <p className="mb-2"><strong>Category:</strong> {project.category || "N/A"}</p>
                  <p className="mb-2"><strong>Type:</strong> {project.projectType || "N/A"}</p>
                  <p className="mb-2"><strong>Year:</strong> {project.year || "N/A"}</p>
                  
                  <div className="project-links mt-4">
                    {project.previewUrl && (
                      <a href={project.previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-100 mb-2">
                        View Live <i className="bi bi-box-arrow-up-right ms-1"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Scope of Work (Replaced Challenges/Approach) */}
          {project.scopeOfWork && project.scopeOfWork.length > 0 && (
            <section className="project-details py-5 border-top">
              <h3 className="mb-4">Scope of Work</h3>
              <div className="row" style={{ paddingTop: "10px" }}>
                {project.scopeOfWork.map((scope, index) => (
                  <div className="col-md-6 mb-4" key={scope._id || index}>
                    {scope.title && <h5 className="fw-bold">{scope.title}</h5>}
                    {scope.description && <p>{scope.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="related-projects py-5 border-top">
              <h3 className="mb-4">Related Projects</h3>
              <div className="row row-cols-1 row-cols-md-3 g-4">
                {relatedProjects.map((related) => (
                  <div className="col" key={related._id}>
                    <div className="project-card card h-100 border-0 shadow-sm">
                      <div
                        className="card-img-top"
                        style={{
                          backgroundImage: `url(${related.thumbnail || "https://via.placeholder.com/600x400?text=No+Image"})`,
                          height: "180px",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      ></div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title fw-bold text-truncate">{related.title}</h5>
                        <p className="card-text text-muted flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {related.description}
                        </p>
                        <a href={`/feature/${related._id}`} className="btn btn-primary btn-sm mt-auto">
                          View Details <i className="bi bi-arrow-right ms-1"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </Layout>
  );
}