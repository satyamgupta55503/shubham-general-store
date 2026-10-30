/**
 * generate-sitemap.js — runs after `next build`
 * Overwrites public/sitemap.xml with latest routes.
 * Uses only Node.js built-ins (fs, path) — no extra dependencies.
 */
const fs   = require("fs");
const path = require("path");

const BASE_URL = "https://www.digikraftsocial.com";

const pages = [
  { url: "/",               changefreq: "weekly",  priority: "1.0" },
  { url: "/about",          changefreq: "monthly", priority: "0.9" },
  { url: "/service",        changefreq: "weekly",  priority: "0.9" },
  { url: "/contact",        changefreq: "monthly", priority: "0.8" },
  { url: "/portfolio",      changefreq: "weekly",  priority: "0.85" },
  { url: "/blog",           changefreq: "weekly",  priority: "0.8" },
  { url: "/blog-2",         changefreq: "weekly",  priority: "0.7" },
  { url: "/careers",        changefreq: "weekly",  priority: "0.75" },
  { url: "/pricing",        changefreq: "monthly", priority: "0.8" },
  { url: "/feature",        changefreq: "monthly", priority: "0.75" },
  { url: "/feature-2",      changefreq: "monthly", priority: "0.7" },
  { url: "/feature-3",      changefreq: "monthly", priority: "0.7" },
  { url: "/integration",    changefreq: "monthly", priority: "0.7" },
  { url: "/seo",            changefreq: "monthly", priority: "0.75" },
  { url: "/qr",             changefreq: "monthly", priority: "0.6" },
  { url: "/help",           changefreq: "monthly", priority: "0.6" },
  { url: "/privacy-policy", changefreq: "yearly",  priority: "0.4" },
  { url: "/term-conditions",changefreq: "yearly",  priority: "0.4" },
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
  console.log("✅ sitemap.xml generated at public/sitemap.xml");
} catch (err) {
  // Non-fatal — don't break the build
  console.warn("⚠️  Could not write sitemap.xml:", err.message);
}
