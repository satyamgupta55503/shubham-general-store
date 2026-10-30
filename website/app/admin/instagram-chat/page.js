"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { Instagram, MessageCircle, Image, Film, Heart, Users, BarChart3, Send, RefreshCw, Loader2, Trash2, ExternalLink } from "lucide-react";

export default function InstagramFullPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);

  // Messages state
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);

  // Posts/Stories/Insights state
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [insights, setInsights] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "superadmin" && role !== "admin") { router.push("/admin/dashboard"); return; }
    setAuthorized(true);
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const { data } = await API.get("/integrations/instagram");
      setIntegration(data);
      if (data?.isConnected) { fetchProfile(data); fetchPosts(data); fetchStories(data); fetchChats(); }
    } catch (err) { /* not connected */ }
    finally { setLoading(false); }
  };

  const fetchProfile = async (creds) => {
    try {
      const resp = await fetch(`https://graph.facebook.com/v18.0/${creds.pageId}?fields=username,name,biography,followers_count,follows_count,media_count,profile_picture_url&access_token=${creds.accessToken}`);
      const data = await resp.json();
      if (data.username || data.name) setProfile(data);
    } catch (err) { /* ignore */ }
  };

  const fetchPosts = async (creds) => {
    try {
      const resp = await fetch(`https://graph.facebook.com/v18.0/${creds.pageId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=12&access_token=${creds.accessToken}`);
      const data = await resp.json();
      if (data.data) setPosts(data.data);
    } catch (err) { /* ignore */ }
  };

  const fetchStories = async (creds) => {
    try {
      const resp = await fetch(`https://graph.facebook.com/v18.0/${creds.pageId}/stories?fields=id,media_type,media_url,timestamp&access_token=${creds.accessToken}`);
      const data = await resp.json();
      if (data.data) setStories(data.data);
    } catch (err) { /* ignore */ }
  };

  const fetchChats = async () => {
    try {
      const { data } = await API.get("/messaging/instagram/chats");
      setChats(data || []);
    } catch (err) { /* ignore */ }
  };

  const fetchMessages = async (chatId) => {
    try {
      const { data } = await API.get(`/messaging/instagram/chats/${chatId}`);
      setMessages(data || []);
    } catch (err) { /* ignore */ }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    try {
      await API.post("/messaging/instagram/send", { chatId: selectedChat, text: newMsg });
      setNewMsg("");
      fetchMessages(selectedChat);
    } catch (err) { alert(err.response?.data?.message || "Send failed"); }
    finally { setSending(false); }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete this chat?")) return;
    await API.delete(`/messaging/instagram/chats/${chatId}`);
    setSelectedChat(null); setMessages([]); fetchChats();
  };

  const formatTime = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  if (!authorized) return null;

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Loader2 size={28} color="#E4405F" style={{ animation: "spin 1s linear infinite" }} /></div>;

  if (!integration?.isConnected) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center" }}>
        <Instagram size={48} color="#E4405F" style={{ marginBottom: "16px", opacity: 0.4 }} />
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a2e05" }}>Instagram Not Connected</h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>Go to Integrations and add your Instagram Business API credentials.</p>
        <a href="/admin/whatsapp" style={{ display: "inline-block", marginTop: "16px", background: "#E4405F", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>Go to Integrations →</a>
      </div>
    );
  }

  const tabs = [
    { id: "messages", name: "Messages", icon: MessageCircle },
    { id: "posts", name: "Posts", icon: Image },
    { id: "stories", name: "Stories", icon: Film },
    { id: "insights", name: "Profile", icon: BarChart3 },
  ];

  return (
    <div style={{ height: "calc(100vh - 65px)", display: "flex", flexDirection: "column", background: "#f8faf5" }}>
      {/* Header with Tabs */}
      <div style={{ padding: "14px 24px", background: "#fff", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Instagram size={22} color="#E4405F" />
          <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>Instagram</h1>
          {profile && <span style={{ fontSize: "12px", color: "#6b7280" }}>@{profile.username}</span>}
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "7px 14px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", background: activeTab === tab.id ? "#fef2f2" : "transparent", color: activeTab === tab.id ? "#E4405F" : "#6b7280", border: activeTab === tab.id ? "1px solid #fecaca" : "1px solid transparent", display: "flex", alignItems: "center", gap: "4px" }}>
                <Icon size={12} /> {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div style={{ display: "flex", height: "100%" }}>
            {/* Chat List */}
            <div style={{ width: "280px", borderRight: "1px solid #e5e7eb", background: "#fff", overflowY: "auto" }}>
              <div style={{ padding: "12px", borderBottom: "1px solid #f3f4f6" }}>
                <button onClick={fetchChats} style={{ width: "100%", background: "#fef2f2", border: "1px solid #fecaca", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#E4405F", cursor: "pointer" }}><RefreshCw size={11} /> Refresh Chats</button>
              </div>
              {chats.length === 0 ? (
                <div style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: "11px" }}>No DMs yet</div>
              ) : chats.map((chat) => (
                <div key={chat._id} onClick={() => { setSelectedChat(chat._id); fetchMessages(chat._id); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid #fafafa", background: selectedChat === chat._id ? "#fef2f2" : "transparent" }}>
                  <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a2e05" }}>{chat.from?.name || chat._id}</div>
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{chat.lastMessage || "Media"}</div>
                </div>
              ))}
            </div>
            {/* Messages */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {!selectedChat ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}><p>Select a conversation</p></div>
              ) : (
                <>
                  <div style={{ padding: "10px 16px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600" }}>{chats.find(c => c._id === selectedChat)?.from?.name || selectedChat}</span>
                    <button onClick={() => handleDeleteChat(selectedChat)} style={{ background: "#fee2e2", border: "none", padding: "4px 8px", borderRadius: "4px", color: "#dc2626", fontSize: "10px", cursor: "pointer" }}><Trash2 size={10} /> Delete</button>
                  </div>
                  <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px" }}>
                    {messages.map((msg) => (
                      <div key={msg._id} style={{ display: "flex", justifyContent: msg.type === "outgoing" ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                        <div style={{ maxWidth: "60%", padding: "8px 12px", borderRadius: "10px", background: msg.type === "outgoing" ? "#E4405F" : "#fff", color: msg.type === "outgoing" ? "#fff" : "#1a2e05", fontSize: "12px", border: msg.type === "outgoing" ? "none" : "1px solid #e5e7eb" }}>
                          {msg.text || "[Media]"}
                          <div style={{ fontSize: "8px", opacity: 0.7, textAlign: "right", marginTop: "2px" }}>{formatTime(msg.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "10px 16px", borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: "6px" }}>
                    <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Reply..." style={{ flex: 1, padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", outline: "none" }} />
                    <button onClick={handleSend} disabled={sending} style={{ background: "#E4405F", color: "#fff", border: "none", padding: "9px 14px", borderRadius: "6px", cursor: "pointer" }}><Send size={13} /></button>
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
              <h2 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>Recent Posts ({posts.length})</h2>
              <button onClick={() => fetchPosts(integration)} style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#E4405F", cursor: "pointer" }}><RefreshCw size={11} /> Refresh</button>
            </div>
            {posts.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>No posts found or API not returning data.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                {posts.map((post) => (
                  <div key={post.id} style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    {post.media_url && (
                      <img src={post.thumbnail_url || post.media_url} alt="" style={{ width: "100%", height: "180px", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                    )}
                    <div style={{ padding: "10px" }}>
                      <p style={{ fontSize: "11px", color: "#374151", margin: 0, lineHeight: "1.4" }}>{post.caption?.slice(0, 80) || "No caption"}{post.caption?.length > 80 ? "..." : ""}</p>
                      <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "10px", color: "#6b7280" }}>
                        <span><Heart size={10} style={{ verticalAlign: "middle" }} /> {post.like_count || 0}</span>
                        <span><MessageCircle size={10} style={{ verticalAlign: "middle" }} /> {post.comments_count || 0}</span>
                        <span>{post.media_type}</span>
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <a href={post.permalink} target="_blank" rel="noreferrer" style={{ fontSize: "10px", color: "#E4405F", textDecoration: "none", fontWeight: "600" }}>View on Instagram ↗</a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STORIES TAB */}
        {activeTab === "stories" && (
          <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Active Stories ({stories.length})</h2>
            {stories.length === 0 ? (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>No active stories. Stories expire after 24 hours.</p>
            ) : (
              <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px" }}>
                {stories.map((story) => (
                  <div key={story.id} style={{ minWidth: "160px", background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    {story.media_url && (
                      <img src={story.media_url} alt="" style={{ width: "100%", height: "240px", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
                    )}
                    <div style={{ padding: "8px", fontSize: "10px", color: "#6b7280" }}>{formatTime(story.timestamp)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE/INSIGHTS TAB */}
        {activeTab === "insights" && (
          <div style={{ padding: "20px 24px", overflowY: "auto", height: "100%" }}>
            {profile ? (
              <div style={{ maxWidth: "500px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                  {profile.profile_picture_url && <img src={profile.profile_picture_url} alt="" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #E4405F" }} />}
                  <div>
                    <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>{profile.name}</h2>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "2px 0" }}>@{profile.username}</p>
                  </div>
                </div>
                {profile.biography && <p style={{ fontSize: "13px", color: "#374151", marginBottom: "16px", lineHeight: "1.5" }}>{profile.biography}</p>}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05" }}>{profile.followers_count?.toLocaleString() || "—"}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Followers</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05" }}>{profile.follows_count?.toLocaleString() || "—"}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Following</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05" }}>{profile.media_count?.toLocaleString() || "—"}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Posts</div>
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: "#9ca3af", textAlign: "center", padding: "40px" }}>Profile data not available. Check API permissions.</p>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
