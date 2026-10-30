"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import API from "@/utils/api";
import { MessageCircle, Facebook, Instagram, Send, Check, X, Loader2, Link2, Unlink, ExternalLink, Settings, Phone, RefreshCw, Plus, Trash2 } from "lucide-react";

const PLATFORMS = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageCircle,
    color: "#25D366",
    bgLight: "#f0fdf4",
    border: "#bbf7d0",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "EAAxxxxxxx...", required: true },
      { key: "phoneNumberId", label: "Phone Number ID", placeholder: "1234567890", required: true },
      { key: "apiKey", label: "Webhook Verify Token", placeholder: "your_verify_token" },
    ],
    helpUrl: "https://developers.facebook.com/docs/whatsapp/cloud-api/get-started",
    openUrl: "https://web.whatsapp.com",
    description: "Send/receive messages via WhatsApp Cloud API",
  },
  {
    id: "facebook",
    name: "Facebook Page",
    icon: Facebook,
    color: "#1877F2",
    bgLight: "#eff6ff",
    border: "#bfdbfe",
    fields: [
      { key: "accessToken", label: "Page Access Token", placeholder: "EAAxxxxxxx...", required: true },
      { key: "pageId", label: "Page ID", placeholder: "123456789012345", required: true },
    ],
    helpUrl: "https://developers.facebook.com/docs/pages/getting-started",
    openUrl: "https://www.facebook.com/latest/inbox",
    description: "Manage page messages, posts & insights",
  },
  {
    id: "instagram",
    name: "Instagram Business",
    icon: Instagram,
    color: "#E4405F",
    bgLight: "#fef2f2",
    border: "#fecaca",
    fields: [
      { key: "accessToken", label: "Access Token", placeholder: "IGQxxxxxxx...", required: true },
      { key: "pageId", label: "Instagram Business Account ID", placeholder: "17841400000000", required: true },
    ],
    helpUrl: "https://developers.facebook.com/docs/instagram-api/getting-started",
    openUrl: "https://www.instagram.com/direct/inbox/",
    description: "View DMs, posts, stories & reels",
  },
  {
    id: "telegram",
    name: "Telegram Bot",
    icon: Send,
    color: "#0088CC",
    bgLight: "#ecfeff",
    border: "#a5f3fc",
    fields: [
      { key: "accessToken", label: "Bot Token", placeholder: "123456:ABCdefGHIjklmnop...", required: true },
      { key: "apiKey", label: "Bot Username", placeholder: "@YourBotName" },
    ],
    helpUrl: "https://core.telegram.org/bots#how-do-i-create-a-bot",
    openUrl: "https://web.telegram.org",
    description: "Send/receive messages via Telegram Bot API (free)",
  },
];

export default function SocialIntegrationsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [expandedPlatform, setExpandedPlatform] = useState(null);
  const [formData, setFormData] = useState({});
  const [notification, setNotification] = useState("");
  const [activeTab, setActiveTab] = useState("settings"); // settings | messages
  const [sendTo, setSendTo] = useState("");
  const [sendMsg, setSendMsg] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    setUserRole(role);
    if (role !== "superadmin" && role !== "admin") {
      router.push("/admin/dashboard");
      return;
    }
    setAuthorized(true);
    fetchIntegrations();
  }, []);

  const notify = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/integrations");
      setIntegrations(data || []);
    } catch (err) {
      console.log("Fetch integrations failed");
    } finally {
      setLoading(false);
    }
  };

  const getIntegration = (platformId) => integrations.find((i) => i.platform === platformId) || null;

  const handleExpand = (platformId) => {
    if (expandedPlatform === platformId) { setExpandedPlatform(null); return; }
    setExpandedPlatform(platformId);
    const existing = getIntegration(platformId);
    setFormData(existing ? { accessToken: existing.accessToken || "", apiKey: existing.apiKey || "", phoneNumberId: existing.phoneNumberId || "", pageId: existing.pageId || "", webhookSecret: existing.webhookSecret || "" } : { accessToken: "", apiKey: "", phoneNumberId: "", pageId: "", webhookSecret: "" });
  };

  const handleSave = async (platformId) => {
    setSaving(platformId);
    try {
      await API.post("/integrations", { platform: platformId, ...formData });
      notify(`✅ ${platformId} connected successfully!`);
      setExpandedPlatform(null);
      fetchIntegrations();
    } catch (err) {
      notify("❌ Failed to save. Check credentials.");
    } finally {
      setSaving(null);
    }
  };

  const handleVerify = async (platformId) => {
    setVerifying(platformId);
    const integration = getIntegration(platformId);
    if (!integration || !integration.accessToken) {
      notify("❌ No credentials saved. Save first.");
      setVerifying(null);
      return;
    }

    // Verify by trying platform-specific API call
    try {
      if (platformId === "telegram") {
        const res = await fetch(`https://api.telegram.org/bot${integration.accessToken}/getMe`);
        const data = await res.json();
        if (data.ok) {
          notify(`✅ Telegram Bot verified: @${data.result.username}`);
        } else {
          notify("❌ Invalid Telegram bot token");
        }
      } else if (platformId === "whatsapp" || platformId === "facebook") {
        // Meta Graph API verification
        const res = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${integration.accessToken}`);
        const data = await res.json();
        if (data.id) {
          notify(`✅ ${platformId} verified! Account: ${data.name || data.id}`);
        } else {
          notify(`❌ ${platformId} verification failed: ${data.error?.message || "Invalid token"}`);
        }
      } else if (platformId === "instagram") {
        const res = await fetch(`https://graph.facebook.com/v18.0/${integration.pageId}?fields=username,name&access_token=${integration.accessToken}`);
        const data = await res.json();
        if (data.username || data.name) {
          notify(`✅ Instagram verified: @${data.username || data.name}`);
        } else {
          notify(`❌ Instagram verification failed: ${data.error?.message || "Invalid"}`);
        }
      }
    } catch (err) {
      notify(`❌ Verification error: ${err.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleDisconnect = async (platformId) => {
    if (!window.confirm(`Disconnect ${platformId}? All keys will be removed.`)) return;
    try {
      await API.put(`/integrations/${platformId}/disconnect`);
      notify(`${platformId} disconnected.`);
      fetchIntegrations();
    } catch (err) {
      notify("Failed to disconnect.");
    }
  };

  // Send message via platform API
  const handleSendMessage = async (platformId) => {
    if (!sendTo || !sendMsg) return notify("Enter recipient and message");
    setSending(true);
    const integration = getIntegration(platformId);
    if (!integration?.accessToken) { notify("Connect platform first!"); setSending(false); return; }

    try {
      if (platformId === "telegram") {
        const res = await fetch(`https://api.telegram.org/bot${integration.accessToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: sendTo, text: sendMsg }),
        });
        const data = await res.json();
        if (data.ok) notify("✅ Telegram message sent!");
        else notify(`❌ Failed: ${data.description}`);
      } else if (platformId === "whatsapp") {
        const res = await fetch(`https://graph.facebook.com/v18.0/${integration.phoneNumberId}/messages`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${integration.accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ messaging_product: "whatsapp", to: sendTo, type: "text", text: { body: sendMsg } }),
        });
        const data = await res.json();
        if (data.messages) notify("✅ WhatsApp message sent!");
        else notify(`❌ Failed: ${data.error?.message || "Error"}`);
      } else if (platformId === "facebook") {
        const res = await fetch(`https://graph.facebook.com/v18.0/${integration.pageId}/messages`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${integration.accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: { id: sendTo }, message: { text: sendMsg } }),
        });
        const data = await res.json();
        if (data.message_id) notify("✅ Facebook message sent!");
        else notify(`❌ Failed: ${data.error?.message || "Error"}`);
      }
      setSendMsg("");
    } catch (err) {
      notify(`❌ Send error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  if (!authorized) return null;

  const connectedPlatforms = integrations.filter((i) => i.isConnected);

  return (
    <div style={{ padding: "24px 28px", maxWidth: "1000px", margin: "0 auto" }}>
      {notification && (
        <div style={{ background: notification.includes("❌") ? "#fee2e2" : "#ecfccb", border: `1px solid ${notification.includes("❌") ? "#fecaca" : "#bef264"}`, color: notification.includes("❌") ? "#991b1b" : "#3f6212", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontWeight: "600", fontSize: "13px" }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05", margin: 0 }}>Social Integrations</h1>
          <p style={{ fontSize: "12px", color: "#6b7280", margin: "2px 0 0 0" }}>Connect & manage WhatsApp, Facebook, Instagram, Telegram</p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => setActiveTab("settings")} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: activeTab === "settings" ? "#8ce600" : "#f3f4f6", color: activeTab === "settings" ? "#1a2e05" : "#6b7280", border: "none" }}>
            <Settings size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Settings
          </button>
          <button onClick={() => setActiveTab("messages")} style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer", background: activeTab === "messages" ? "#8ce600" : "#f3f4f6", color: activeTab === "messages" ? "#1a2e05" : "#6b7280", border: "none" }}>
            <MessageCircle size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Messages
          </button>
        </div>
      </div>

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const integration = getIntegration(platform.id);
            const isConnected = integration?.isConnected;
            const isExpanded = expandedPlatform === platform.id;

            // Admin can only see connected ones
            if (userRole === "admin" && !isConnected) return null;

            return (
              <div key={platform.id} style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${isConnected ? platform.border : "#e5e7eb"}`, overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: platform.bgLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={20} color={platform.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>{platform.name}</h3>
                      <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{platform.description}</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {isConnected && (
                      <>
                        <span style={{ fontSize: "9px", fontWeight: "700", color: "#15803d", background: "#dcfce7", padding: "3px 8px", borderRadius: "12px" }}>● Connected</span>
                        <button onClick={() => handleVerify(platform.id)} disabled={verifying === platform.id} style={{ background: "#fff", border: "1px solid #e5e7eb", padding: "5px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", cursor: "pointer", color: "#374151" }}>
                          {verifying === platform.id ? "..." : "Verify"}
                        </button>
                        <a href={platform.openUrl} target="_blank" rel="noreferrer" style={{ background: platform.bgLight, padding: "5px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", color: platform.color, textDecoration: "none", border: `1px solid ${platform.border}` }}>Open ↗</a>
                        {userRole === "superadmin" && <button onClick={() => handleDisconnect(platform.id)} style={{ background: "#fee2e2", border: "none", padding: "5px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: "600", color: "#dc2626", cursor: "pointer" }}>Disconnect</button>}
                      </>
                    )}
                    {userRole === "superadmin" && (
                      <button onClick={() => handleExpand(platform.id)} style={{ background: isExpanded ? "#f3f4f6" : platform.bgLight, border: `1px solid ${isExpanded ? "#d1d5db" : platform.border}`, padding: "5px 12px", borderRadius: "6px", fontSize: "10px", fontWeight: "700", color: platform.color, cursor: "pointer" }}>
                        {isExpanded ? "Close" : isConnected ? "Edit" : "Connect"}
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && userRole === "superadmin" && (
                  <div style={{ padding: "0 20px 18px", borderTop: "1px solid #f3f4f6", paddingTop: "14px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {platform.fields.map((field) => (
                        <div key={field.key}>
                          <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#6b7280", marginBottom: "4px", textTransform: "uppercase" }}>{field.label} {field.required && <span style={{ color: "#dc2626" }}>*</span>}</label>
                          <input type="text" placeholder={field.placeholder} value={formData[field.key] || ""} onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })} style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", outline: "none", boxSizing: "border-box" }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px" }}>
                      <a href={platform.helpUrl} target="_blank" rel="noreferrer" style={{ fontSize: "11px", color: platform.color, textDecoration: "none", fontWeight: "600" }}>📖 How to get credentials →</a>
                      <button onClick={() => handleSave(platform.id)} disabled={saving === platform.id} style={{ background: platform.color, color: "#fff", border: "none", padding: "8px 18px", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        {saving === platform.id ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : <Link2 size={12} />}
                        {saving === platform.id ? "Saving..." : "Save & Connect"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === "messages" && (
        <div>
          {connectedPlatforms.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#9ca3af" }}>
              <MessageCircle size={40} style={{ opacity: 0.3, marginBottom: "12px" }} />
              <p style={{ fontSize: "14px" }}>No platforms connected yet.</p>
              <p style={{ fontSize: "12px" }}>Go to Settings tab and connect at least one platform.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {PLATFORMS.filter((p) => getIntegration(p.id)?.isConnected).map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.id} style={{ background: "#fff", borderRadius: "12px", border: `1px solid ${platform.border}`, padding: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                      <Icon size={20} color={platform.color} />
                      <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>{platform.name}</h3>
                      <span style={{ marginLeft: "auto", fontSize: "9px", fontWeight: "700", background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "10px" }}>● Live</span>
                    </div>

                    {/* Send Message Box */}
                    <div style={{ background: platform.bgLight, borderRadius: "8px", padding: "12px", border: `1px solid ${platform.border}` }}>
                      <input
                        type="text"
                        placeholder={platform.id === "telegram" ? "Chat ID" : platform.id === "whatsapp" ? "Phone (919876543210)" : "Recipient ID"}
                        value={sendTo}
                        onChange={(e) => setSendTo(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", outline: "none", marginBottom: "8px", boxSizing: "border-box" }}
                      />
                      <div style={{ display: "flex", gap: "6px" }}>
                        <input
                          type="text"
                          placeholder="Type message..."
                          value={sendMsg}
                          onChange={(e) => setSendMsg(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(platform.id)}
                          style={{ flex: 1, padding: "8px 10px", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", outline: "none" }}
                        />
                        <button onClick={() => handleSendMessage(platform.id)} disabled={sending} style={{ background: platform.color, color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                          {sending ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                      <a href={platform.openUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textAlign: "center", padding: "8px", background: "#f8faf5", borderRadius: "6px", fontSize: "11px", fontWeight: "600", color: "#374151", textDecoration: "none", border: "1px solid #e5e7eb" }}>
                        Open {platform.name.split(" ")[0]} ↗
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {PLATFORMS.map((p) => (
          <a key={p.id} href={p.openUrl} target="_blank" rel="noreferrer" style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", padding: "14px", textDecoration: "none", textAlign: "center" }}>
            {React.createElement(p.icon, { size: 20, color: p.color, style: { marginBottom: "4px" } })}
            <p style={{ fontSize: "11px", fontWeight: "600", color: "#1a2e05", margin: "4px 0 0 0" }}>{p.name.split(" ")[0]}</p>
          </a>
        ))}
      </div>

      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
