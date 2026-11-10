/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },
    ],
  },

  // ── Redirects ────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Old agency URL → store homepage
      { source: "/company",   destination: "/", permanent: true },
      // Old agency pages → store equivalents
      { source: "/service",   destination: "/categories", permanent: true },
      { source: "/portfolio", destination: "/products",   permanent: true },
      { source: "/blog",      destination: "/",           permanent: true },
      { source: "/blog-2",    destination: "/",           permanent: true },
      { source: "/blog-post", destination: "/",           permanent: true },
      { source: "/pricing",   destination: "/",           permanent: true },
      { source: "/seo",       destination: "/",           permanent: true },
      { source: "/qr",        destination: "/",           permanent: true },
    ];
  },

  // ── Headers ─────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff"         },
          { key: "X-Frame-Options",            value: "DENY"            },
          { key: "X-XSS-Protection",           value: "1; mode=block"   },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Long-lived cache for static assets
        source: "/assets/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
