const StoreSettings = require("../../models/store/StoreSettings");
const { isValidDigipin, osmEmbedFromDigipin } = require("../../utils/digipin");

const s = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Accept either a plain embed URL or the whole <iframe ...> snippet.
// Only Google Maps / OpenStreetMap embed URLs are allowed (this value is rendered inside an <iframe>).
const cleanMapUrl = (raw) => {
  let v = s(raw, 1500);
  if (!v) return "";
  const m = v.match(/src\s*=\s*["']([^"']+)["']/i);
  if (m) v = m[1];
  v = v.trim();
  return /^https:\/\/(www\.google\.com\/maps\/embed\?|www\.openstreetmap\.org\/export\/embed\.html\?)/i.test(v) ? v : "";
};

const cleanDigipin = (raw) => {
  const v = s(raw, 14).toUpperCase();
  return isValidDigipin(v) ? v : "";
};

const cleanUrl = (raw) => {
  const v = s(raw, 300);
  return /^https?:\/\/[^\s]+$/i.test(v) ? v : "";
};

// Keep only digits and a leading + (so tel: / wa.me links work)
const cleanPhone = (raw) => s(raw, 30).replace(/[^\d+\s\-()]/g, "");

const pick = (doc, { publicView }) => {
  const o = doc ? doc.toObject() : {};
  const out = {
    contact: { phone: "", whatsapp: "", email: "", address: "", city: "", hours: "", mapUrl: "", mapLink: "", digipin: "", ...(o.contact || {}) },
    social:  { instagram: "", facebook: "", youtube: "", ...(o.social || {}) },
    about:   { headline: "", story: "", stats: [], ...(o.about || {}) },
    careers: { intro: "", openings: [], ...(o.careers || {}) },
  };
  if (publicView) {
    out.careers.openings = (out.careers.openings || []).filter((x) => x.isActive !== false);
    out.about.stats = (out.about.stats || []).filter((x) => x.value && x.label);
  }
  return out;
};

// GET /api/store/settings  — public
exports.getPublic = async (req, res) => {
  try {
    const doc = await StoreSettings.findOne({ key: "main" });
    res.json({ success: true, data: pick(doc, { publicView: true }) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Could not load settings" });
  }
};

// GET /api/store/settings/admin — CMS (includes hidden openings)
exports.getAdmin = async (req, res) => {
  try {
    const doc = await StoreSettings.findOne({ key: "main" });
    res.json({ success: true, data: pick(doc, { publicView: false }) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/settings/admin — CMS
exports.update = async (req, res) => {
  try {
    const b = req.body || {};
    const c = b.contact || {};
    const so = b.social || {};
    const a = b.about || {};
    const cr = b.careers || {};

    const update = {
      contact: {
        phone: cleanPhone(c.phone),
        whatsapp: cleanPhone(c.whatsapp),
        email: s(c.email, 160),
        address: s(c.address, 400),
        city: s(c.city, 80),
        hours: s(c.hours, 160),
        mapUrl: cleanMapUrl(c.mapUrl),
        mapLink: cleanUrl(c.mapLink),
        digipin: cleanDigipin(c.digipin),
      },
      social: {
        instagram: cleanUrl(so.instagram),
        facebook: cleanUrl(so.facebook),
        youtube: cleanUrl(so.youtube),
      },
      about: {
        headline: s(a.headline, 160),
        story: s(a.story, 4000),
        stats: (Array.isArray(a.stats) ? a.stats : [])
          .map((x) => ({ value: s(x?.value, 20), label: s(x?.label, 60) }))
          .filter((x) => x.value || x.label)
          .slice(0, 6),
      },
      careers: {
        intro: s(cr.intro, 600),
        openings: (Array.isArray(cr.openings) ? cr.openings : [])
          .map((x) => ({
            title: s(x?.title, 120),
            type: s(x?.type, 40) || "Full-time",
            location: s(x?.location, 120),
            experience: s(x?.experience, 60),
            description: s(x?.description, 1500),
            isActive: x?.isActive !== false,
          }))
          .filter((x) => x.title)
          .slice(0, 30),
      },
    };

    if (update.contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(update.contact.email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (c.mapUrl && !update.contact.mapUrl) {
      return res.status(400).json({
        success: false,
        message: "Map embed must be a Google Maps or OpenStreetMap embed link. Or leave it empty and just enter your DIGIPIN.",
      });
    }
    if (c.digipin && !update.contact.digipin) {
      return res.status(400).json({ success: false, message: "DIGIPIN looks wrong. It should look like 2KM-9KK-3P98." });
    }
    if (c.mapLink && !update.contact.mapLink) {
      return res.status(400).json({ success: false, message: "Map link must start with https://" });
    }
    // No embed given but a DIGIPIN is → build a free OpenStreetMap embed from it
    if (!update.contact.mapUrl && update.contact.digipin) {
      update.contact.mapUrl = osmEmbedFromDigipin(update.contact.digipin);
    }

    const doc = await StoreSettings.findOneAndUpdate(
      { key: "main" },
      { $set: update, $setOnInsert: { key: "main" } },
      { upsert: true, returnDocument: "after", runValidators: true }
    );
    res.json({ success: true, data: pick(doc, { publicView: false }) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
