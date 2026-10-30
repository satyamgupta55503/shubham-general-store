"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { Send, Trash2, Loader2, MessageCircle, RefreshCw, ArrowLeft, Settings, Globe } from "lucide-react";

export default function TelegramPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [botInfo, setBotInfo] = useState(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [notification, setNotification] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "superadmin" && role !== "admin") {
      router.push("/admin/dashboard");
      return;
    }
    setAuthorized(true);
    fetchChats();
    fetchBotInfo();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-refresh chats every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchChats();
      if (selectedChat) fetchMessages(selectedChat);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  const notify = (msg) => { setNotification(msg); setTimeout(() => setNotification(""), 3000); };

  const fetchBotInfo = async () => {
    try {
      const { data } = await API.get("/telegram/bot-info");
      if (data.ok) setBotInfo(data.result);
    } catch (err) { /* bot not connected yet */ }
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/telegram/chats");
      setChats(data || []);
    } catch (err) { /* ignore */ }
    finally { setLoading(false); }
  };

  const fetchMessages = async (chatId) => {
    try {
      setLoadingMsgs(true);
      const { data } = await API.get(`/telegram/chats/${chatId}`);
      setMessages(data || []);
    } catch (err) { notify("Failed to load messages"); }
    finally { setLoadingMsgs(false); }
  };

  const selectChat = (chatId) => {
    setSelectedChat(chatId);
    fetchMessages(chatId);
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !selectedChat) return;
    setSending(true);
    try {
      await API.post("/telegram/send", { chatId: selectedChat, text: newMsg });
      setNewMsg("");
      fetchMessages(selectedChat);
    } catch (err) {
      notify(err.response?.data?.message || "Send failed");
    } finally { setSending(false); }
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm("Delete entire chat history?")) return;
    try {
      await API.delete(`/telegram/chats/${chatId}`);
      notify("Chat deleted");
      setSelectedChat(null);
      setMessages([]);
      fetchChats();
    } catch (err) { notify("Failed to delete"); }
  };

  const handleSetupWebhook = async () => {
    if (!webhookUrl) return notify("Enter your public URL");
    try {
      const { data } = await API.post("/telegram/setup-webhook", { webhookUrl });
      if (data.ok) notify("✅ Webhook set successfully!");
      else notify("❌ " + (data.description || "Failed"));
    } catch (err) { notify("Failed to set webhook"); }
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

  if (!authorized) return null;

  return (
    <div style={{ display: "flex", height: "calc(100vh - 65px)", background: "#f8faf5" }}>
      {/* Notification */}
      {notification && (
        <div style={{ position: "fixed", top: "80px", right: "20px", background: notification.includes("❌") ? "#fee2e2" : "#ecfccb", border: `1px solid ${notification.includes("❌") ? "#fecaca" : "#bef264"}`, color: notification.includes("❌") ? "#991b1b" : "#3f6212", padding: "10px 16px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", zIndex: 100 }}>
          {notification}
        </div>
      )}

      {/* LEFT: Chat List */}
      <div style={{ width: "300px", borderRight: "1px solid #e5e7eb", background: "#fff", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "16px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Send size={18} color="#0088CC" />
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>Telegram</h2>
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button onClick={fetchChats} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px" }}><RefreshCw size={14} /></button>
              <button onClick={() => setShowSetup(!showSetup)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "4px" }}><Settings size={14} /></button>
            </div>
          </div>
          {botInfo && (
            <p style={{ fontSize: "11px", color: "#6b7280", margin: 0 }}>@{botInfo.username} • {botInfo.first_name}</p>
          )}
          {!botInfo && (
            <p style={{ fontSize: "11px", color: "#dc2626", margin: 0 }}>Bot not connected — add token in Integrations</p>
          )}
        </div>

        {/* Webhook Setup */}
        {showSetup && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", background: "#ecfeff" }}>
            <label style={{ fontSize: "10px", fontWeight: "600", color: "#0e7490", display: "block", marginBottom: "4px" }}>WEBHOOK URL (your public domain)</label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input type="text" placeholder="https://yourdomain.com" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} style={{ flex: 1, padding: "7px 10px", border: "1px solid #a5f3fc", borderRadius: "6px", fontSize: "11px", outline: "none" }} />
              <button onClick={handleSetupWebhook} style={{ background: "#0088CC", color: "#fff", border: "none", padding: "7px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer" }}>Set</button>
            </div>
          </div>
        )}

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
              <Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} />
            </div>
          ) : chats.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#9ca3af" }}>
              <MessageCircle size={28} style={{ opacity: 0.3, marginBottom: "8px" }} />
              <p style={{ fontSize: "12px" }}>No chats yet.</p>
              <p style={{ fontSize: "11px" }}>Messages will appear when someone texts your bot.</p>
            </div>
          ) : (
            chats.map((chat) => (
              <div key={chat._id} onClick={() => selectChat(chat._id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid #f8f9fa", background: selectedChat === chat._id ? "#f0fdf4" : "transparent", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#0088CC", flexShrink: 0 }}>
                    {(chat.from?.firstName || "U").charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a2e05", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {chat.from?.firstName || "User"} {chat.from?.lastName || ""}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {chat.lastMessage || "Media"}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "10px", color: "#9ca3af" }}>{formatDate(chat.lastTimestamp)}</div>
                  {chat.unreadCount > 0 && (
                    <span style={{ fontSize: "9px", fontWeight: "700", background: "#0088CC", color: "#fff", padding: "2px 6px", borderRadius: "10px", marginTop: "2px", display: "inline-block" }}>{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT: Chat Messages */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {!selectedChat ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "#9ca3af" }}>
            <Send size={40} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: "14px" }}>Select a chat to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#ecfeff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700", color: "#0088CC" }}>
                  {(chats.find((c) => c._id === selectedChat)?.from?.firstName || "U").charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#1a2e05", margin: 0 }}>
                    {chats.find((c) => c._id === selectedChat)?.from?.firstName || "User"} {chats.find((c) => c._id === selectedChat)?.from?.lastName || ""}
                  </h3>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                    @{chats.find((c) => c._id === selectedChat)?.from?.username || "unknown"} • Chat ID: {selectedChat}
                  </p>
                </div>
              </div>
              <button onClick={() => handleDeleteChat(selectedChat)} style={{ background: "#fee2e2", border: "none", padding: "7px 12px", borderRadius: "6px", cursor: "pointer", color: "#dc2626", fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                <Trash2 size={12} /> Delete Chat
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", background: "#f8faf5" }}>
              {loadingMsgs ? (
                <div style={{ textAlign: "center", padding: "20px" }}><Loader2 size={20} color="#0088CC" style={{ animation: "spin 1s linear infinite" }} /></div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "13px" }}>No messages in this chat.</div>
              ) : (
                messages.map((msg) => (
                  <div key={msg._id} style={{ display: "flex", justifyContent: msg.type === "outgoing" ? "flex-end" : "flex-start", marginBottom: "8px" }}>
                    <div style={{ maxWidth: "65%", padding: "10px 14px", borderRadius: msg.type === "outgoing" ? "12px 12px 2px 12px" : "12px 12px 12px 2px", background: msg.type === "outgoing" ? "#0088CC" : "#fff", color: msg.type === "outgoing" ? "#fff" : "#1a2e05", fontSize: "13px", lineHeight: "1.5", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: msg.type === "outgoing" ? "none" : "1px solid #e5e7eb" }}>
                      <p style={{ margin: 0 }}>{msg.text || "[Media]"}</p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "9px", opacity: 0.7, textAlign: "right" }}>{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Input */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #e5e7eb", background: "#fff", display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                style={{ flex: 1, padding: "11px 14px", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", outline: "none" }}
              />
              <button onClick={handleSend} disabled={sending || !newMsg.trim()} style={{ background: "#0088CC", color: "#fff", border: "none", padding: "11px 18px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: "600", fontSize: "13px", opacity: sending ? 0.7 : 1 }}>
                {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
