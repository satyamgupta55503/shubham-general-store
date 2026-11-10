"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { EMPTY_SETTINGS } from "@/utils/storeSettings";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// One request shared by every component on the page (footer, contact card, …)
let cache = null;
let inflight = null;

/** Client hook: public store settings (contact details, social links). Falls back to empty values. */
export default function useStoreSettings() {
  const [settings, setSettings] = useState(cache || EMPTY_SETTINGS);

  useEffect(() => {
    if (cache) return;
    let alive = true;
    inflight = inflight || axios.get(`${API}/api/store/settings`).then((r) => (cache = { ...EMPTY_SETTINGS, ...(r.data.data || {}) })).catch(() => null);
    inflight.then((data) => { if (alive && data) setSettings(data); });
    return () => { alive = false; };
  }, []);

  return settings;
}
