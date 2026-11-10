"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { Pencil, Trash2, Plus, Save, X, Camera, Loader2, Shield, UserCircle } from "lucide-react";

export default function UserManagementPanel() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "admin" });
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", role: "" });
  const [uploadingImage, setUploadingImage] = useState(null);
  const fileInputRef = useRef(null);

  const UPLOADS_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000") + "/uploads";

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "superadmin") {
      router.push("/admin/dashboard");
      return;
    }
    setAuthorized(true);
    fetchUsers();
  }, []);

  const notify = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/auth");
      setUsers(res.data || []);
    } catch (err) {
      notify("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", addForm);
      notify("User created successfully!");
      setShowAddForm(false);
      setAddForm({ name: "", email: "", password: "", role: "admin" });
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to add user.");
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user._id);
    setEditForm({ name: user.name, email: user.email, password: user.password || "", role: user.role });
  };

  const handleUpdateUser = async (userId) => {
    try {
      await API.put(`/auth/${userId}`, editForm);
      notify("User updated!");
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user?")) return;
    try {
      await API.delete(`/auth/${userId}`);
      notify("User deleted.");
      fetchUsers();
    } catch (err) {
      notify("Failed to delete.");
    }
  };

  const handleImageUpload = async (userId, file) => {
    if (!file) return;
    setUploadingImage(userId);
    try {
      const formData = new FormData();
      formData.append("profileImage", file);
      await API.put(`/auth/${userId}/profile-image`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      notify("Profile image updated!");
      fetchUsers();
    } catch (err) {
      notify("Image upload failed.");
    } finally {
      setUploadingImage(null);
    }
  };

  const superAdmin = users.find((u) => u.role === "superadmin");
  const regularUsers = users.filter((u) => u.role !== "superadmin");

  if (!authorized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "#6b7280" }}>
        <Loader2 size={24} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 28px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Notification */}
      {message && (
        <div style={{ background: "#ecfccb", border: "1px solid #bef264", color: "#3f6212", padding: "12px 16px", borderRadius: "10px", marginBottom: "20px", fontWeight: "600", fontSize: "13px", animation: "slideIn 0.3s ease" }}>
          {message}
        </div>
      )}

      {/* Super Admin Card */}
      {superAdmin && (
        <div style={{ background: "linear-gradient(135deg, #fefce8, #f0fdf4)", border: "1px solid #d9f99d", borderRadius: "16px", padding: "28px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div style={{ position: "relative" }}>
              {superAdmin.profileImage ? (
                <img src={/^https?:\/\//.test(superAdmin.profileImage) ? superAdmin.profileImage : `${UPLOADS_URL}/${superAdmin.profileImage}`} alt={superAdmin.name} style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "3px solid #8ce600" }} />
              ) : (
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #8ce600, #6abf00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "800", color: "#1a2e05" }}>
                  {superAdmin.name.charAt(0)}
                </div>
              )}
              <label style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "24px", height: "24px", borderRadius: "50%", background: "#fff", border: "2px solid #8ce600", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <Camera size={12} color="#4a7a00" />
                <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(superAdmin._id, e.target.files[0])} />
              </label>
            </div>
            <div>
              <div style={{ fontSize: "10px", fontWeight: "800", color: "#ca8a04", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>System Owner</div>
              <div style={{ fontSize: "20px", fontWeight: "800", color: "#1a2e05" }}>{superAdmin.name}</div>
              <div style={{ fontSize: "13px", color: "#6b7280" }}>{superAdmin.email}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "10px", fontWeight: "800", color: "#7c3aed", background: "#f3e8ff", padding: "6px 14px", borderRadius: "20px", textTransform: "uppercase" }}>Superadmin</span>
            <button onClick={() => startEdit(superAdmin)} style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "7px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
              <Pencil size={12} /> Edit
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal for any user */}
      {editingUserId && (
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "14px", padding: "24px", marginBottom: "20px", boxShadow: "0 8px 24px rgba(0,0,0,0.06)", animation: "slideIn 0.3s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>Edit User</h3>
            <button onClick={() => setEditingUserId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><X size={18} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="text" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} style={inputStyle}>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="author">Author</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "16px" }}>
            <button onClick={() => handleUpdateUser(editingUserId)} style={{ background: "#8ce600", color: "#1a2e05", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <Save size={14} /> Save Changes
            </button>
            <button onClick={() => setEditingUserId(null)} style={{ background: "#f3f4f6", color: "#6b7280", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "600", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Team Section */}
      <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "28px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#1a2e05", margin: 0 }}>Team Management</h2>
            <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Add, update, or remove system users.</p>
          </div>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: showAddForm ? "#f3f4f6" : "#8ce600", color: showAddForm ? "#6b7280" : "#1a2e05", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
            {showAddForm ? <><X size={14} /> Cancel</> : <><Plus size={14} /> Add User</>}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddUser} style={{ background: "#f8faf5", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "20px", marginBottom: "20px", animation: "slideIn 0.3s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input required type="text" placeholder="John Doe" value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input required type="email" placeholder="john@example.com" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input required type="text" placeholder="password123" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} style={inputStyle}>
                  <option value="admin">Admin</option>
                  <option value="author">Author</option>
                  <option value="user">User</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "14px" }}>
              <button type="submit" style={{ background: "#8ce600", color: "#1a2e05", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>Create User</button>
            </div>
          </form>
        )}

        {/* Users List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
            <Loader2 size={28} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ marginTop: "8px", fontSize: "13px" }}>Loading users...</p>
          </div>
        ) : regularUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>
            <UserCircle size={40} style={{ opacity: 0.4 }} />
            <p style={{ marginTop: "8px", fontSize: "14px" }}>No team members found.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {regularUsers.map((user) => (
              <div key={user._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid #f3f4f6", transition: "all 0.2s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <div style={{ position: "relative" }}>
                    {user.profileImage ? (
                      <img src={/^https?:\/\//.test(user.profileImage) ? user.profileImage : `${UPLOADS_URL}/${user.profileImage}`} alt={user.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }} />
                    ) : (
                      <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#374151", border: "2px solid #e5e7eb" }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label style={{ position: "absolute", bottom: "-2px", right: "-2px", width: "20px", height: "20px", borderRadius: "50%", background: "#fff", border: "1.5px solid #d1d5db", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      {uploadingImage === user._id ? <Loader2 size={9} style={{ animation: "spin 1s linear infinite" }} /> : <Camera size={9} color="#6b7280" />}
                      <input type="file" accept="image/*" hidden onChange={(e) => handleImageUpload(user._id, e.target.files[0])} />
                    </label>
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1f2937" }}>{user.name}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "1px" }}>{user.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "10px", fontWeight: "700", color: getRoleColor(user.role).color, background: getRoleColor(user.role).bg, padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase" }}>
                    {user.role}
                  </span>
                  <button onClick={() => startEdit(user)} style={actionBtn}><Pencil size={13} /></button>
                  <button onClick={() => handleDeleteUser(user._id)} style={{ ...actionBtn, color: "#dc2626", background: "#fee2e2" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "11px", fontWeight: "600", color: "#6b7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" };
const inputStyle = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none", boxSizing: "border-box" };
const actionBtn = { background: "#f1f5f9", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#374151", transition: "all 0.15s" };

function getRoleColor(role) {
  switch (role) {
    case "superadmin": return { color: "#7c3aed", bg: "#f3e8ff" };
    case "admin": return { color: "#dc2626", bg: "#fee2e2" };
    case "author": return { color: "#2563eb", bg: "#dbeafe" };
    default: return { color: "#6b7280", bg: "#f3f4f6" };
  }
}
