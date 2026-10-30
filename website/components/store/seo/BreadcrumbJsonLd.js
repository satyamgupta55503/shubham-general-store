/**
 * BreadcrumbJsonLd — emits schema.org BreadcrumbList JSON-LD.
 * Server component — no client JS.
 *
 * @param {Array<{name:string, href:string}>} items
 *
 * Usage:
 *   <BreadcrumbJsonLd items={[
 *     { name:"Home",       href:"/" },
 *     { name:"Vegetables", href:"/categories/vegetables" },
 *     { name:"Tomatoes",   href:"/products/tomatoes" },
 *   ]} />
 */
const BASE = "https://www.subhamgeneralstore.com";

export default function BreadcrumbJsonLd({ items = [] }) {
  const data = {
    "@context":        "https://schema.org",
    "@type":           "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type":   "ListItem",
      position:  i + 1,
      name:      item.name,
      item:      `${BASE}${item.href}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
