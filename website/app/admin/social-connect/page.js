"use client";

import React, { useState, useEffect } from "react";
import API from "@/utils/api";
import { MessageCircle, Instagram, Facebook, Send, ExternalLink, Link2, Check, Loader2 } from "lucide-react";

const PLATFORMS = [
  { id: "whatsapp", name: "WhatsApp", icon: MessageCircle, color: "#25D366", bg: "#f0fdf4", url: "https://web.whatsapp.com", desc: "Open WhatsApp Web to manage chats" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "#1877F2", bg: "#eff6ff", url: "https://www.facebook.com/latest/inbox", desc: "Manage Facebook Page messages & posts" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F", bg: "#fef2f2", url: "https://www.instagram.com/direct/inbox/", desc: "Manage Instagram DMs & content" },
  { id: "telegram", name: "Telegram", icon: Send, color: "#0088CC", bg: "#ecfeff", url: "https://web.telegram.org", desc: "Open Telegram Web for messaging" },
];

export default function SocialConnectPage() {
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "User");
    setUserRole(localStorage.getItem("role") || "");
  }, []);

  const logActivity = async (platform, action) => {
    try {
      await API.post("/logs", { action, platform, userName, userRole, details: `${userName} opened ${platform}` });
    } catch (err) { /* silent */ }
  };

  const handleOpen = (platform) => {
    logActivity(platform.id, `Opened ${platform.name}`);
    window.open(platform.url, "_blank");
  };

  return (
    <div style={{ padding: "32px 28px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "800", color: "#1a2e05", margin: 0 }}>Social Media</h1>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px" }}>Manage your social media accounts. Open any platform to handle chats, posts & content.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {PLATFORMS.map((platform) => {
          const Icon = platform.icon;
          return (
            <div key={platform.id} style={{ background: "#fff", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "24px", transition: "all 0.2s", cursor: "pointer" }} onClick={() => handleOpen(platform)}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: platform.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} color={platform.color} />
                </div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1a2e05", margin: 0 }}>{platform.name}</h3>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>{platform.desc}</p>
                </div>
              </div>
              <button style={{ width: "100%", background: platform.bg, border: `1px solid ${platform.color}30`, color: platform.color, padding: "10px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                <ExternalLink size={14} /> Open {platform.name}
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "24px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px 18px", fontSize: "12px", color: "#92400e" }}>
        💡 <strong>Note:</strong> Aapki activity logged hoti hai. Superadmin Activity Logs mein dekh sakta hai ki aapne kab kya platform use kiya.
      </div>
    </div>
  );
}
