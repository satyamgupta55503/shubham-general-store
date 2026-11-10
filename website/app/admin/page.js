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
  ArrowRight
} from "lucide-react";

import "./dashboard/Dashboard.css";

const Dashboard = () => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [projects, setProjects] = useState([]);

  const [stats, setStats] = useState({
    posts: 0,
    users: 0,
    categories: 0,
    projects: 0,
  });

  const API = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/api";

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [postsRes, usersRes, categoriesRes, projectsRes] = await Promise.all([
        axios.get(`${API}/posts`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API}/users`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API}/categories`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
        axios.get(`${API}/projects`, { headers, timeout: 5000 }).catch(() => ({ data: [] })),
      ]);

      setPosts(postsRes.data);
      setUsers(usersRes.data);
      setCategories(categoriesRes.data);
      setProjects(projectsRes.data);

      setStats({
        posts: postsRes.data.length,
        users: usersRes.data.length || 0,
        categories: categoriesRes.data.length,
        projects: projectsRes.data.length,
      });

      setLoading(false);
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchDashboardData();
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  };

  const cards = [
    { title: "Total Posts", value: stats.posts, icon: FileText, link: "/admin/posts" },
    { title: "Total Users", value: stats.users, icon: Users, link: "/admin/users" },
    { title: "Categories", value: stats.categories, icon: FolderKanban, link: "/admin/categories" },
    { title: "Total Projects", value: stats.projects, icon: Film, link: "/admin/projects" },
  ];

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 size={40} className="spinner" />
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Manage your blog system easily</p>
        </div>
        <a href="/admin/posts" style={{ textDecoration: 'none' }}>
          <button className="create-btn">
            <Plus size={18} />
            Create Post
          </button>
        </a>
      </div>

      {/* STATS */}
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
                  <span>+12%</span>
                </div>
                <a href={card.link} className="card-view-link">
                  View All <ArrowRight size={14} />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-grid">
        {/* POSTS TABLE */}
        <div className="posts-section">
          <div className="section-header">
            <h2>Recent Posts</h2>
            <a href="/admin/posts" className="view-btn">View All</a>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Post</th>
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
                        <p>No posts found. Start by creating one!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post._id}>
                      <td>
                        <div className="post-info">
                          {post.image ? (
                            <img
                            src={/^https?:\/\//.test(post.image) ? post.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"}/uploads/${post.image}`}
                              alt={post.title}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                background: "#f3f4f6",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <FileText size={24} color="#9ca3af" />
                            </div>
                          )}
                          <div>
                            <h3>{post.title}</h3>
                            <p>
                              {post.content?.length > 40
                                ? `${post.content.slice(0, 40)}...`
                                : post.content}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status ${post.status?.toLowerCase() || "draft"}`}
                        >
                          {post.status || "Draft"}
                        </span>
                      </td>
                      <td>{post.category?.name || "Uncategorized"}</td>
                      <td>{post.author?.name || "Unknown"}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="edit-btn" title="Edit Post">
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deletePost(post._id)}
                            className="delete-btn"
                            title="Delete Post"
                          >
                            <Trash2 size={16} />
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

        {/* SIDEBAR */}
        <div className="sidebar">
          {/* USERS */}
          <div className="sidebar-card">
            <div className="section-header sidebar-header">
              <h2>Recent Users</h2>
              <a href="/admin/users" className="view-btn">View All</a>
            </div>

            <div className="users-list">
              {users.length === 0 ? (
                <div className="empty-state" style={{ padding: "10px" }}>
                  <p>No users registered yet.</p>
                </div>
              ) : (
                users.slice(0, 5).map((user) => (
                  <div key={user._id} className="user-item">
                    <div>
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                    </div>
                    <span className="role-badge">{user.role || "User"}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* CATEGORIES */}
          <div className="sidebar-card">
            <div className="section-header sidebar-header">
              <h2>Categories</h2>
              <a href="/admin/categories" className="view-btn">View All</a>
            </div>

            <div className="categories">
              {categories.length === 0 ? (
                <div className="empty-state" style={{ padding: "10px" }}>
                  <p>No categories found.</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <span key={cat._id} className="category-badge">
                    {cat.name}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
