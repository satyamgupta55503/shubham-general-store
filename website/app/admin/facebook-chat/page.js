"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { Facebook, MessageCircle, Image, ThumbsUp, Users, BarChart3, Send, RefreshCw, Loader2, Trash2 } from "lucide-react";

export default function FacebookFullPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);

  // Messages
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  // Posts & Page Info
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "superadmin" && role !== "admin") { router.push("/admin/dashboard"); return; }
    setAuthorized(true);
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const { data } = await API.get("/integrations/facebook");
      setIntegration(data);
      if (data?.isConnected) { fetchPageInfo(data); fetchPosts(data); fetchChats(); }
    } catch (err) { /* not connected */ }
    finally { setLoading(false); }
  };

  const fetchPageInfo = async (creds) => {
    try {
      const resp = await fetch(`https://graph.facebook.com/v18.0/${creds.pageId}?fields=name,about,fan_count,followers_count,picture,cover,link&access_token=${creds.accessToken}`);
      const data = await resp.json();
      if (data.name) setPageInfo(data);
    } catch (err) { /* ignore */ }
  };

  const fetchPosts = async (creds) => {
    try {
      const resp = await fetch(`https://graph.facebook.com/v18.0/${creds.pageId}/posts?fields=id,message,created_time,full_picture,likes.limit(0).summary(true),comments.limit(0).summary(true),shares,permalink_url&limit=12&access_token=${creds.accessToken}`);
      const data = await resp.json();
      if (data.data) setPosts(data.data);
    } catch (err) { /* ignore */ }
  };

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/messaging/facebook/chats");
      setChats(data || []);
    } catch (err) { /* ignore */ }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await API.get(`/messaging/facebook/chats/${chatId}`);
      setMessages(data || []);
    } catch (err) { /* ignore */ }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    try {
      await API.post("/messaging/facebook/send", { chatId: selectedChat, text: newMsg });
      setNewMsg("");
      fetchMessages(selectedChat);
    } catch (err) { alert(err.response?.data?.message || "Send failed"); }
    finally { setSending(false); }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete this chat?")) return;
    await API.delete(`/messaging/facebook/chats/${chatId}`);
    setSelectedChat(null); setMessages([]); fetchChats();
  };

  const formatTime = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  if (!authorized) return null;

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Loader2 size={28} color="#1877F2" style={{ animation: "spin 1s linear infinite" }} /></div>;

  if (!integration?.isConnected) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center" }}>
        <Facebook size={48} color="#1877F2" style={{ marginBottom: "16px", opacity: 0.4 }} />
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a2e05" }}>Facebook Not Connected</h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>Go to Integrations and add your Facebook Page API credentials.</p>
        <a href="/admin/whatsapp" style={{ display: "inline-block", marginTop: "16px", background: "#1877F2", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>Go to Integrations →</a>
      </div>
    );
  }

  const tabs = [
    { id: "messages", name: "Messenger", icon: MessageCircle },
    { id: "posts", name: "Posts", icon: Image },
    { id: "page", name: "Page Info", icon: BarChart3 },
  ];

  return (
    <div style={{ height: "calc(100vh - 65px)", display: "flex", flexDirection: "column", background: "#f8faf5" }}>
      {/* Header */}
      <div style={{ padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Facebook size={22} color="#1877F2" />
          <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>Facebook</h1>
          {pageInfo && <span style={{ fontSize: "12px", color: "#6b7280" }}>{pageInfo.name}</span>}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "7px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", background: activeTab === tab.id ? "#eff6ff" : "transparent", color: activeTab === tab.id ? "#1877F2" : "#6b7280", border: activeTab === tab.id ? "1px solid #bfdbfe" : "1px solid transparent", display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon size={12} /> {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflow: "hidden" }}>
        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div style={{ display: "flex", height: "100%" }}>
            <div style={{ width: "280px", borderRight: "1px solid #e5e7eb", background: "#fff", overflowY: "auto" }}>
              <div style={{ padding: "12px", borderBottom: "1px solid #f3f4f6" }}>
                <button onClick={fetchChats} style={{ width: "100%", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#1877F2", cursor: "pointer" }}><RefreshCw size={11} /> Refresh</button>
              </div>
              {chats.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: "11px" }}>No Messenger chats yet</div>
              ) : chats.map((chat) => (
                <div key={chat._id} onClick={() => { setSelectedChat(chat._id); fetchMessages(chat._id); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #fafafa", background: selectedChat === chat._id ? "#eff6ff" : "transparent" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a2e05" }}>{chat.from?.name || chat._id}</div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{chat.lastMessage || "..."}</div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {!selectedChat ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}><p>Select a conversation</p></div>
              ) : (
                <>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600" }}>{chats.find(c => c._id === selectedChat)?.from?.name || selectedChat}</span>
                    <button onClick={() => handleDeleteChat(selectedChat)} style={{ background: "#fee2e2", border: "none", padding: "4px 8px", borderRadius: "4px", color: "#dc2626", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /></button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                    {messages.map((msg) => (
                      <div key={msg._id} style={{ display: "flex", justifyContent: msg.type === "outgoing" ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                        <div style={{ maxWidth: "60%", padding: "8px 12px", borderRadius: "10px", background: msg.type === "outgoing" ? "#1877F2" : "#fff", color: msg.type === "outgoing" ? "#fff" : "#1a2e05", fontSize: "12px", border: msg.type === "outgoing" ? "none" : "1px solid #e5e7eb" }}>
                          {msg.text || "[Media]"}
                          <div style={{ fontSize: "8px", opacity: 0.7, textAlign: "right", marginTop: "2px" }}>{formatTime(msg.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: "6px" }}>
                    <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Reply..." style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", outline: "none" }} />
                    <button onClick={handleSend} disabled={sending} style={{ background: "#1877F2", color: "#fff", border: "none", padding: "9px 14px", borderRadius: "6px", cursor: "pointer" }}><Send size={13} /></button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Page Posts ({posts.length})</h2>
              <button onClick={() => fetchPosts(integration)} style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#1877F2", cursor: "pointer" }}><RefreshCw size={11} /> Refresh</button>
            </div>
            {posts.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>No posts found.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {posts.map((post) => (
                  <div key={post.id} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", display: "flex", gap: "14px" }}>
                    {post.full_picture && <img src={post.full_picture} alt="" style={{ width: "80px", height: "80px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none"; }} />}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "12px", color: "#374151", margin: 0, lineHeight: "1.5" }}>{post.message?.slice(0, 150) || "No text"}{post.message?.length > 150 ? "..." : ""}</p>
                      <div style={{ display: "flex", gap: "14px", marginTop: "8px", fontSize: "10px", color: "#6b7280" }}>
                        <span><ThumbsUp size={10} /> {post.likes?.summary?.total_count || 0}</span>
                        <span><MessageCircle size={10} /> {post.comments?.summary?.total_count || 0}</span>
                        <span>Shares: {post.shares?.count || 0}</span>
                        <span>{formatTime(post.created_time)}</span>
                      </div>
                      {post.permalink_url && <a href={post.permalink_url} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: "#1877F2", marginTop: "4px", display: "inline-block", textDecoration: "none", fontWeight: "600" }}>View Post ↗</a>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAGE INFO TAB */}
        {activeTab === "page" && (
          <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%" }}>
            {pageInfo ? (
              <div style={{ maxWidth: "500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  {pageInfo.picture?.data?.url && <img src={pageInfo.picture.data.url} alt="" style={{ width: "64px", height: "64px", borderRadius: "50%", border: "2px solid #1877F2" }} />}
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>{pageInfo.name}</h2>
                    {pageInfo.link && <a href={pageInfo.link} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#1877F2", textDecoration: "none" }}>Visit Page ↗</a>}
                  </div>
                </div>
                {pageInfo.about && <p style={{ fontSize: "13px", color: "#374151", marginBottom: "16px" }}>{pageInfo.about}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05" }}>{pageInfo.fan_count?.toLocaleString() || "—"}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Page Likes</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05" }}>{pageInfo.followers_count?.toLocaleString() || "—"}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>Followers</div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>Page info not available.</p>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
