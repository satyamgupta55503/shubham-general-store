/**
 * generate-sitemap.js — runs after `next build`
 * Overwrites public/sitemap.xml with the store's public pages.
 * Uses only Node.js built-ins (fs, path) — no extra dependencies.
 *
 * Set NEXT_PUBLIC_SITE_URL (e.g. https://your-store.vercel.app) in the host's
 * environment so the sitemap uses your real domain.
 */
const fs   = require("fs");
const path = require("path");

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.subhamgeneralstore.com").replace(/\/+$/, "");

const pages = [
  { url: "/",                changefreq: "daily",   priority: "1.0" },
  { url: "/products",        changefreq: "daily",   priority: "0.9" },
  { url: "/categories",      changefreq: "weekly",  priority: "0.9" },
  { url: "/brands",          changefreq: "weekly",  priority: "0.9" },
  { url: "/about",           changefreq: "monthly", priority: "0.7" },
  { url: "/contact",         changefreq: "monthly", priority: "0.7" },
  { url: "/careers",         changefreq: "weekly",  priority: "0.6" },
  { url: "/return-policy",   changefreq: "yearly",  priority: "0.4" },
  { url: "/privacy-policy",  changefreq: "yearly",  priority: "0.4" },
  { url: "/term-conditions", changefreq: "yearly",  priority: "0.4" },
];

const urls = pages.map(p => `
  <url>
    <loc>${BASE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

try {
  const outPath = path.join(__dirname, "../public/sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf8");
  console.log("sitemap.xml generated at public/sitemap.xml");
} catch (err) {
  // Non-fatal — don't break the build
  console.warn("Could not write sitemap.xml:", err.message);
}
