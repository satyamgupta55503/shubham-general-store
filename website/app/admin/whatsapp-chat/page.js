"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { MessageCircle, Phone, Send, RefreshCw, Loader2, Trash2, ExternalLink, Users } from "lucide-react";

export default function WhatsAppFullPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [newChatNumber, setNewChatNumber] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "superadmin" && role !== "admin") { router.push("/admin/dashboard"); return; }
    setAuthorized(true);
    fetchIntegration();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => { fetchChats(); if (selectedChat) fetchMessages(selectedChat); }, 10000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const fetchIntegration = async () => {
    try {
      const { data } = await API.get("/integrations/whatsapp");
      setIntegration(data);
      if (data?.isConnected) fetchChats();
    } catch (err) { /* not connected */ }
    finally { setLoading(false); }
  };

  const fetchChats = async () => {
    try { const { data } = await API.get("/messaging/whatsapp/chats"); setChats(data || []); } catch (err) { /* ignore */ }
  };

  const fetchMessages = async (chatId) => {
    try { const { data } = await API.get(`/messaging/whatsapp/chats/${chatId}`); setMessages(data || []); } catch (err) { /* ignore */ }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    try {
      await API.post("/messaging/whatsapp/send", { chatId: selectedChat, text: newMsg });
      setNewMsg(""); fetchMessages(selectedChat);
    } catch (err) { alert(err.response?.data?.message || "Send failed — check WhatsApp Business API"); }
    finally { setSending(false); }
  };

  const handleNewChat = () => {
    if (!newChatNumber.trim()) return;
    setSelectedChat(newChatNumber.replace(/[^0-9]/g, ""));
    setMessages([]); setShowNewChat(false); setNewChatNumber("");
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete this chat?")) return;
    await API.delete(`/messaging/whatsapp/chats/${chatId}`);
    setSelectedChat(null); setMessages([]); fetchChats();
  };

  const formatTime = (d) => new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  if (!authorized) return null;
  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}><Loader2 size={28} color="#25D366" style={{ animation: "spin 1s linear infinite" }} /></div>;

  if (!integration?.isConnected) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center" }}>
        <Phone size={48} color="#25D366" style={{ marginBottom: "16px", opacity: 0.4 }} />
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a2e05" }}>WhatsApp Not Connected</h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>Go to Integrations and add your WhatsApp Business API credentials.</p>
        <a href="/admin/whatsapp" style={{ display: "inline-block", marginTop: "16px", background: "#25D366", color: "#fff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>Go to Integrations →</a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)", background: "#f8faf5" }}>
      {/* Chat List */}
      <div style={{ width: "300px", borderRight: "1px solid #e5e7eb", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <Phone size={18} color="#25D366" />
            <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>WhatsApp Business</h2>
          </div>
          <button onClick={() => setShowNewChat(!showNewChat)} style={{ width: "100%", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#25D366", cursor: "pointer" }}>+ New Message</button>
          {showNewChat && (
            <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
              <input type="text" placeholder="919876543210" value={newChatNumber} onChange={(e) => setNewChatNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNewChat()} style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px", outline: "none" }} />
              <button onClick={handleNewChat} style={{ background: "#25D366", color: "#fff", border: "none", padding: "7px 10px", borderRadius: "6px", fontSize: "10px", cursor: "pointer" }}>Go</button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {chats.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af", fontSize: "11px" }}>
              <MessageCircle size={24} style={{ opacity: 0.3, marginBottom: "6px" }} />
              <p>No conversations yet.</p>
            </div>
          ) : chats.map((chat) => (
            <div key={chat._id} onClick={() => { setSelectedChat(chat._id); fetchMessages(chat._id); }} style={{ padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #fafafa", background: selectedChat === chat._id ? "#f0fdf4" : "transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#1a2e05" }}>{chat.from?.name || chat._id}</span>
                <span style={{ fontSize: "9px", color: "#9ca3af" }}>{formatTime(chat.lastTimestamp)}</span>
              </div>
              <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>{chat.lastMessage || "Media"}</div>
              {chat.unreadCount > 0 && <span style={{ fontSize: "8px", background: "#25D366", color: "#fff", padding: "1px 5px", borderRadius: "8px", marginTop: "4px", display: "inline-block" }}>{chat.unreadCount}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!selectedChat ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", flexDirection: "column", gap: "8px" }}>
            <Phone size={36} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: "13px" }}>Select a chat or start new conversation</p>
          </div>
        ) : (
          <>
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1a2e05", margin: 0 }}>{chats.find(c => c._id === selectedChat)?.from?.name || selectedChat}</h3>
                <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>+{selectedChat}</p>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <a href={`https://wa.me/${selectedChat}`} target="_blank" rel="noreferrer" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "6px 10px", borderRadius: "6px", fontSize: "10px", color: "#25D366", textDecoration: "none", fontWeight: "600" }}>Open in WA ↗</a>
                <button onClick={() => handleDeleteChat(selectedChat)} style={{ background: "#fee2e2", border: "none", padding: "6px 10px", borderRadius: "6px", color: "#dc2626", fontSize: "10px", cursor: "pointer" }}><Trash2 size={11} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", background: "#f0fdf4" }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "12px" }}>No messages. Send one below!</div>
              ) : messages.map((msg) => (
                <div key={msg._id} style={{ display: "flex", justifyContent: msg.type === "outgoing" ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                  <div style={{ maxWidth: "60%", padding: "9px 13px", borderRadius: msg.type === "outgoing" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", background: msg.type === "outgoing" ? "#25D366" : "#fff", color: msg.type === "outgoing" ? "#fff" : "#1a2e05", fontSize: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: msg.type === "outgoing" ? "none" : "1px solid #e5e7eb" }}>
                    {msg.text || "[Media]"}
                    <div style={{ fontSize: "8px", opacity: 0.7, textAlign: "right", marginTop: "2px" }}>{formatTime(msg.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 20px", borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: "8px" }}>
              <input type="text" value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", outline: "none" }} />
              <button onClick={handleSend} disabled={sending} style={{ background: "#25D366", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }}>
                {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
              </button>
            </div>
          </>
        )}
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
