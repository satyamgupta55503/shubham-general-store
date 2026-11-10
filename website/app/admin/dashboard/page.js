"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Users,
  FolderKanban,
  Film,
  TrendingUp,
  Plus,
  Trash2,
  Pencil,
  Loader2,
  Inbox,
  ArrowRight,
  Layers,
  Image as ImageIcon
} from "lucide-react";

import "./Dashboard.css";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");
  const [weather, setWeather] = useState(null);

  // States for backend data
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);

  // Stats Counters
  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    categories: 0,
    projects: 0,
  });

  const API = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api` : "https://backend.localhost:5000/api";
  const UPLOADS_URL = process.env.NEXT_PUBLIC_BACKEND_URL ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads` : "https://backend.localhost:5000/uploads";

  useEffect(() => {
    setMounted(true);
    setUserName(localStorage.getItem("userName") || "User");
    setUserRole(localStorage.getItem("role") || "");
    fetchDashboardData();

    // Live clock update every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Fetch weather (Raipur, India)
    fetchWeather();

    return () => clearInterval(clockInterval);
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        "https://api.open-meteo.com/v1/forecast?latitude=21.25&longitude=81.63&current=temperature_2m,weather_code&timezone=Asia/Kolkata"
      );
      if (res.data?.current) {
        setWeather({
          temp: Math.round(res.data.current.temperature_2m),
          code: res.data.current.weather_code,
        });
      }
    } catch (err) {
      console.log("Weather fetch failed:", err);
    }
  };

  const getWeatherIcon = (code) => {
    if (code <= 3) return "☀️";
    if (code <= 48) return "☁️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "🌨️";
    if (code <= 82) return "🌦️";
    if (code <= 99) return "⛈️";
    return "🌤️";
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  // Centralized Data Fetcher
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // standard requests with fallbacks to avoid crashes — 5 second timeout
      const [postsRes, usersRes, categoriesRes, projectsRes] = await Promise.all([
        axios.get(`${API}/posts`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API}/auth`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API}/categories`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API}/projects`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
      ]);

      // Array validation ensure kar rahe hain taaki frontend crash na ho
      const postsData = Array.isArray(postsRes.data) ? postsRes.data : [];
      const usersData = Array.isArray(usersRes.data) ? usersRes.data : [];
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
      const projectsData = Array.isArray(projectsRes.data) ? projectsRes.data : [];

      setPosts(postsData);
      setUsers(usersData);
      setCategories(categoriesData);
      setProjects(projectsData);

      setStats({
        posts: postsData.length,
        users: usersData.length,
        categories: categoriesData.length,
        projects: projectsData.length,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  // Delete Post
  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData(); // Refresh Data
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Check permissions.");
    }
  };

  // Delete Project
  const deleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData(); // Refresh Data
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project.");
    }
  };

  // Stat Cards Configuration - Role based
  const allCards = [
    { title: "Total Posts", value: stats.posts, icon: FileText, link: "/admin/blog", roles: ["superadmin", "admin", "author"] },
    { title: "Total Users", value: stats.users, icon: Users, link: "/admin/users", roles: ["superadmin"] },
    { title: "Categories", value: stats.categories, icon: FolderKanban, link: "/admin/blog", roles: ["superadmin", "admin"] },
    { title: "Total Projects", value: stats.projects, icon: Film, link: "/admin/projects", roles: ["superadmin", "admin", "author"] },
  ];

  const cards = allCards.filter((c) => c.roles.includes(userRole));

  if (!mounted) return null;

  // ✅ Don't block entire page — show content with subtle loading indicator
  // if (loading) { ... } removed — loading spinner was blocking all content

  return (
    <div className="dashboard">
      {/* WELCOME BANNER WITH CLOCK */}
      <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfccb 50%, #fefce8 100%)", borderRadius: "16px", padding: "24px 32px", marginBottom: "28px", border: "1px solid #d9f99d", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#15803d", background: "#dcfce7", padding: "3px 10px", borderRadius: "20px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {userRole || "admin"}
            </span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#1a2e05", margin: "0" }}>
            Welcome back, {userName} 👋
          </h1>
          <p style={{ color: "#4b5563", fontSize: "14px", marginTop: "4px" }}>
            Manage your Multi Media, Posts and Portfolio Projects
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {/* Weather */}
          {weather && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", lineHeight: "1" }}>{getWeatherIcon(weather.code)}</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a2e05", marginTop: "2px" }}>{weather.temp}°C</div>
              <div style={{ fontSize: "10px", color: "#6b7280" }}>Raipur</div>
            </div>
          )}
          {/* Clock */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "28px", fontWeight: "800", color: "#1a2e05", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>
              {formatTime(currentTime)}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
              {formatDate(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {userRole === "author" ? "Author Dashboard" : userRole === "admin" ? "Admin Dashboard" : "Admin Dashboard"}
          </h1>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          {(userRole === "superadmin" || userRole === "admin" || userRole === "author") && (
            <a href="/admin/projects" style={{ textDecoration: 'none' }}>
              <button className="create-btn dynamic-secondary-btn">
                <Plus size={18} />
                Add Project
              </button>
            </a>
          )}
          {(userRole === "superadmin" || userRole === "admin" || userRole === "author") && (
            <a href="/admin/blog" style={{ textDecoration: 'none' }}>
              <button className="create-btn">
                <Plus size={18} />
                Create Post
              </button>
            </a>
          )}
        </div>
      </div>

      {/* STATS COUNTER GRID */}
      <div className="stats-grid">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="stats-card">
              <div className="stats-card-top">
                <div>
                  <p className="card-label">{card.title}</p>
                  <h2 className="card-value">{card.value}</h2>
                </div>
                <div className="card-icon">
                  <Icon size={24} />
                </div>
              </div>

              <div className="card-bottom">
                <div className="card-growth">
                  <TrendingUp size={16} />
                  <span>Live Sync</span>
                </div>
                <a href={card.link} className="card-view-link">
                  View <ArrowRight size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT SECTION */}
      <div className="dashboard-grid">
        
        {/* LEFT COLUMN: POSTS & PROJECTS */}
        <div className="main-content-flow">
          
          {/* RECENT POSTS TABLE */}
          <div className="posts-section">
            <div className="section-header">
              <h2>Recent Blog Posts</h2>
              <a href="/admin/blog" className="view-btn">View All</a>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Post Details</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan="5">
                        <div className="empty-state">
                          <Inbox size={40} opacity={0.5} />
                          <p>No posts found on port 5000. Create your first post!</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    posts.slice(0, 5).map((post) => (
                      <tr key={post._id || post.id}>
                        <td>
                          <div className="post-info">
                            {post.image || post.thumbnail ? (
                              <img
                                src={/^https?:\/\//.test(post.image || post.thumbnail) ? (post.image || post.thumbnail) : `${UPLOADS_URL}/${post.image || post.thumbnail}`}
                                alt={post.title}
                                onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Blog"; }}
                              />
                            ) : (
                              <div className="fallback-img-box">
                                <FileText size={22} color="#9ca3af" />
                              </div>
                            )}
                            <div>
                              <h3>{post.title || "Untitled Post"}</h3>
                              <p>
                                {post.content?.replace(/<[^>]*>/g, '').length > 45
                                  ? `${post.content.replace(/<[^>]*>/g, '').slice(0, 45)}...`
                                  : post.content?.replace(/<[^>]*>/g, '') || "No description provided."}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status ${post.status?.toLowerCase() || "published"}`}>
                            {post.status || "Published"}
                          </span>
                        </td>
                        <td>
                          <span className="table-tag">
                            {typeof post.category === 'object' ? post.category?.name : post.category || "General"}
                          </span>
                        </td>
                        <td>{post.author?.name || post.user?.name || "Admin"}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="edit-btn" title="Edit Post">
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => deletePost(post._id || post.id)}
                              className="delete-btn"
                              title="Delete Post"
                            >
                              <Trash2 size={15} />
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

          {/* DYNAMIC PROJECTS SECTION */}
          {(userRole === "superadmin" || userRole === "admin" || userRole === "author") && (
          <div className="posts-section" style={{ marginTop: "24px" }}>
            <div className="section-header">
              <h2>Portfolio Projects</h2>
              <a href="/admin/projects" className="view-btn">View All</a>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Project Details</th>
                    <th>Tech Stack / Tags</th>
                    <th>Link / Context</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr>
                      <td colSpan="4">
                        <div className="empty-state">
                          <Layers size={40} opacity={0.5} />
                          <p>No projects found. Check for path overlap with Homepage route.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    projects.slice(0, 4).map((project) => (
                      <tr key={project._id || project.id}>
                        <td>
                          <div className="post-info">
                            {project.image || project.cover ? (
                              <img
                                src={/^https?:\/\//.test(project.image || project.cover) ? (project.image || project.cover) : `${UPLOADS_URL}/${project.image || project.cover}`}
                                alt={project.title}
                                onError={(e) => { e.target.src = "https://placehold.co/60x60?text=Project"; }}
                              />
                            ) : (
                              <div className="fallback-img-box" style={{ background: '#e0e7ff' }}>
                                <ImageIcon size={22} color="#4f46e5" />
                              </div>
                            )}
                            <div>
                              <h3>{project.title || project.name || "Untitled Project"}</h3>
                              <p>{project.description?.slice(0, 50) || "No description loaded."}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {Array.isArray(project.technologies) ? (
                              project.technologies.map((tech, idx) => (
                                <span key={idx} className="mini-tag">{tech}</span>
                              ))
                            ) : project.tags ? (
                              <span className="mini-tag">{project.tags}</span>
                            ) : (
                              <span className="mini-tag">FullStack</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <a href={project.liveLink || project.github || "#"} target="_blank" rel="noreferrer" className="project-table-link">
                            {project.liveLink ? "Live Link ↗" : "No Link"}
                          </a>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              onClick={() => deleteProject(project._id || project.id)}
                              className="delete-btn"
                              title="Delete Project"
                            >
                              <Trash2 size={15} />
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
          )}

        </div>

        {/* RIGHT COLUMN: USERS & CATEGORIES SIDEBAR */}
        <div className="sidebar">
          
          {/* USERS MANAGEMENT - Superadmin only */}
          {userRole === "superadmin" && (
          <div className="sidebar-card">
            <div className="section-header sidebar-header">
              <h2>Recent Registered Users</h2>
              <a href="/admin/users" className="view-btn">View All</a>
            </div>

            <div className="users-list">
              {users.length === 0 ? (
                <div className="empty-state-sidebar">
                  <p>No registered users found over API.</p>
                </div>
              ) : (
                users.slice(0, 5).map((user) => (
                  <div key={user._id || user.id} className="user-item">
                    <div>
                      <h3>{user.name || "Anonymous User"}</h3>
                      <p>{user.email || "No email available"}</p>
                    </div>
                    <span className={`role-badge ${(user.role || 'user').toLowerCase()}`}>
                      {user.role || "User"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          )}

          {/* DYNAMIC CATEGORIES */}
          {(userRole === "superadmin" || userRole === "admin") && (
          <div className="sidebar-card">
            <div className="section-header sidebar-header">
              <h2>Blog Categories</h2>
              <a href="/admin/blog" className="view-btn">View All</a>
            </div>

            <div className="categories-container">
              {categories.length === 0 ? (
                <div className="empty-state-sidebar">
                  <p>No categories found in backend.</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <span key={cat._id || cat.id} className="category-badge">
                    {cat.name}
                    {cat.count !== undefined && <span className="badge-count">{cat.count}</span>}
                  </span>
                ))
              )}
            </div>
          </div>
          )}

          {/* QUICK SYSTEM METRICS */}
          {/* <div className="sidebar-card API-status-card">
            <h3>Backend Environment Status</h3>
            <div className="status-indicator-row">
              <span className="pulse-green"></span>
              <p>Connected to <code>localhost:5000</code></p>
            </div>
            <div className="api-paths-list">
              <div><span>Static Assets:</span> <code>/uploads/*</code></div>
              <div><span>Project Base:</span> <code>/api/projects</code></div>
            </div>
          </div> */}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
