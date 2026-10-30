"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { Send, Trash2, Loader2, MessageCircle, RefreshCw, ExternalLink } from "lucide-react";

export default function SocialChatPage({ platform, platformName, color, bgLight, openUrl, recipientLabel }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [notification, setNotification] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "superadmin" && role !== "admin") { router.push("/admin/dashboard"); return; }
    setAuthorized(true);
    fetchChats();
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const interval = setInterval(() => { fetchChats(); if (selectedChat) fetchMessages(selectedChat); }, 10000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/messaging/${platform}/chats`);
      setChats(data || []);
    } catch (err) { /* Platform not connected */ }
    finally { setLoading(false); }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoadingMsgs(true);
      const { data } = await API.get(`/messaging/${platform}/chats/${chatId}`);
      setMessages(data || []);
    } catch (err) { notify("Failed to load messages"); }
    finally { setLoadingMsgs(false); }
  };

  const selectChat = (chatId) => { setSelectedChat(chatId); fetchMessages(chatId); };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    try {
      await API.post(`/messaging/${platform}/send`, { chatId: selectedChat, text: newMsg });
      setNewMsg("");
      fetchMessages(selectedChat);
    } catch (err) { notify(err.response?.data?.message || "Send failed — check integration"); }
    finally { setSending(false); }
  };

  const handleNewChat = () => {
    if (!newChatId.trim()) return;
    setSelectedChat(newChatId.trim());
    setMessages([]);
    setShowNewChat(false);
    setNewChatId("");
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete entire chat?")) return;
    try {
      await API.delete(`/messaging/${platform}/chats/${chatId}`);
      notify("Chat deleted");
      setSelectedChat(null); setMessages([]); fetchChats();
    } catch (err) { notify("Delete failed"); }
  };

  const formatTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  if (!authorized) return null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)", background: "#f8faf5" }}>
      {notification && (
        <div style={{ position: "fixed", top: "80px", right: "20px", background: notification.includes("fail") || notification.includes("Failed") ? "#fee2e2" : "#ecfccb", border: "1px solid #bef264", padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", zIndex: 100, color: "#3f6212" }}>{notification}</div>
      )}

      {/* LEFT: Chat List */}
      <div style={{ width: "300px", borderRight: "1px solid #e5e7eb", background: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: bgLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={14} color={color} />
              </div>
              <h2 style={{ fontSize: "15px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>{platformName}</h2>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <button onClick={fetchChats} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}><RefreshCw size={13} /></button>
              <a href={openUrl} target="_blank" rel="noreferrer" style={{ color: "#9ca3af", padding: "4px" }}><ExternalLink size={13} /></a>
            </div>
          </div>
          {/* New Chat Button */}
          <button onClick={() => setShowNewChat(!showNewChat)} style={{ marginTop: "10px", width: "100%", background: bgLight, border: `1px solid ${color}30`, color, padding: "8px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer" }}>
            + New Conversation
          </button>
          {showNewChat && (
            <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
              <input type="text" placeholder={recipientLabel} value={newChatId} onChange={(e) => setNewChatId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleNewChat()} style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "11px", outline: "none" }} />
              <button onClick={handleNewChat} style={{ background: color, color: "#fff", border: "none", padding: "7px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer" }}>Go</button>
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /></div>
          ) : chats.length === 0 ? (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "#9ca3af" }}>
              <MessageCircle size={24} style={{ opacity: 0.3, marginBottom: "6px" }} />
              <p style={{ fontSize: "11px" }}>No chats yet. Messages will appear here when received.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat._id} onClick={() => selectChat(chat._id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", cursor: "pointer", borderBottom: "1px solid #fafafa", background: selectedChat === chat._id ? bgLight : "transparent" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: bgLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", color, flexShrink: 0 }}>
                    {(chat.from?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "12px", fontWeight: "600", color: "#1a2e05", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.from?.name || chat._id}</div>
                    <div style={{ fontSize: "10px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.lastMessage || "Media"}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "9px", color: "#9ca3af" }}>{formatDate(chat.lastTimestamp)}</div>
                  {chat.unreadCount > 0 && <span style={{ fontSize: "8px", fontWeight: "700", background: color, color: "#fff", padding: "2px 5px", borderRadius: "8px", display: "inline-block", marginTop: "2px" }}>{chat.unreadCount}</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Messages */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!selectedChat ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "10px", color: "#9ca3af" }}>
            <MessageCircle size={36} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: "13px" }}>Select a chat or start new conversation</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: bgLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color }}>{(chats.find((c) => c._id === selectedChat)?.from?.name || "U").charAt(0)}</div>
                <div>
                  <h3 style={{ fontSize: "13px", fontWeight: "600", color: "#1a2e05", margin: 0 }}>{chats.find((c) => c._id === selectedChat)?.from?.name || selectedChat}</h3>
                  <p style={{ fontSize: "10px", color: "#9ca3af", margin: 0 }}>ID: {selectedChat}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteChat(selectedChat)} style={{ background: "#fee2e2", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontSize: "10px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}><Trash2 size={11} /> Delete</button>
            </div>

            {/* Messages List */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px", background: "#f8faf5" }}>
              {loadingMsgs ? (
                <div style={{ textAlign: "center", padding: "20px" }}><Loader2 size={18} color={color} style={{ animation: "spin 1s linear infinite" }} /></div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "12px" }}>No messages. Send one below!</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} style={{ display: "flex", justifyContent: msg.type === "outgoing" ? "flex-end" : "flex-start", marginBottom: "6px" }}>
                    <div style={{ maxWidth: "60%", padding: "9px 13px", borderRadius: msg.type === "outgoing" ? "10px 10px 2px 10px" : "10px 10px 10px 2px", background: msg.type === "outgoing" ? color : "#fff", color: msg.type === "outgoing" ? "#fff" : "#1a2e05", fontSize: "12px", lineHeight: "1.5", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", border: msg.type === "outgoing" ? "none" : "1px solid #e5e7eb" }}>
                      <p style={{ margin: 0 }}>{msg.text || `[${msg.mediaType || "Media"}]`}</p>
                      <p style={{ margin: "3px 0 0", fontSize: "8px", opacity: 0.7, textAlign: "right" }}>{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send */}
            <div style={{ padding: "10px 20px", borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: "8px" }}>
              <input type="text" placeholder="Type a message..." value={newMsg} onChange={(e) => setNewMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} style={{ flex: 1, padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "12px", outline: "none" }} />
              <button onClick={handleSend} disabled={sending || !newMsg.trim()} style={{ background: color, color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", fontWeight: "600", fontSize: "12px", opacity: sending ? 0.7 : 1 }}>
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
