// components/GoogleAnalytics.js
// GA4 tracking with Next.js App Router
// useSearchParams MUST be inside a Suspense boundary to avoid build errors
"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-LF7XKHQLQH";

function pageview(url) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("config", GA_ID, { page_path: url });
}

// ── Inner component: uses useSearchParams — must be inside <Suspense> ──────────
function GATracker() {
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID) return;
    const url = pathname + (searchParams?.toString() ? "?" + searchParams.toString() : "");
    pageview(url);
  }, [pathname, searchParams]);

  return null; // renders nothing, just fires the pageview effect
}

// ── Exported component: wraps GATracker in Suspense ───────────────────────────
export default function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Load gtag.js async — doesn't block page render */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      {/* Initialise GA4 */}
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_path: window.location.pathname,
            send_page_view: true,
            anonymize_ip: true
          });
        `}
      </Script>
      {/* Suspense required because useSearchParams() suspends during SSR/prerender */}
      <Suspense fallback={null}>
        <GATracker />
      </Suspense>
    </>
  );
}
