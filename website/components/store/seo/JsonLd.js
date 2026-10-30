/**
 * JsonLd — injects a JSON-LD script tag.
 * Server component — renders at build/request time, zero client JS.
 *
 * Usage:
 *   <JsonLd data={{ "@context":"https://schema.org", "@type":"Product", ... }} />
 */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
