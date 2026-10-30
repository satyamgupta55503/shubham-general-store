import { Urbanist, Poppins } from "next/font/google";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import GoogleAnalytics    from "@/components/slider/GoogleAnalytics";
import StoreProviders     from "@/context/StoreProviders";
import "@/styles/store-globals.css";

const urban = Urbanist({
  weight:  ["200","300","400","500","600","700"],
  subsets: ["latin"],
  variable:"--tg-body-font-family",
  display: "swap",
  preload: false,
});

const poppins = Poppins({
  weight:  ["300","400","500","600","700","800"],
  subsets: ["latin"],
  variable:"--store-font",
  display: "swap",
  preload: false,
});

export const BASE_URL = "https://www.subhamgeneralstore.com";
const OG_IMAGE = `${BASE_URL}/assets/imgs/store/og-image.png`;

export const metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default:  "Subham General Store — Fresh Groceries Delivered",
    template: "%s | Subham General Store",
  },
  description:
    "Subham General Store — your trusted neighbourhood grocery store online. Shop fresh vegetables, fruits, dairy, snacks, and daily essentials. Fast delivery, best prices.",
  keywords: [
    "Subham General Store","online grocery","fresh vegetables online",
    "grocery delivery","fruits online","dairy products","daily essentials",
    "grocery store","subham gupta store","online kirana",
  ],
  authors:   [{ name: "Subham General Store", url: BASE_URL }],
  creator:   "Subham General Store",
  publisher: "Subham General Store",

  // ── Canonical: set per-page via generateMetadata — root = homepage ──
  alternates: { canonical: BASE_URL },

  openGraph: {
    type:        "website",
    locale:      "en_IN",
    url:         BASE_URL,
    siteName:    "Subham General Store",
    title:       "Subham General Store — Fresh Groceries Delivered",
    description: "Shop fresh groceries, vegetables, fruits, dairy & daily essentials online.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Subham General Store" }],
  },

  twitter: {
    card:        "summary_large_image",
    title:       "Subham General Store — Fresh Groceries Delivered",
    description: "Shop fresh groceries online with fast delivery at best prices.",
    images:      [OG_IMAGE],
  },

  robots: {
    index:  true,
    follow: true,
    googleBot: {
      index: true, follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  verification: { google: "7291f555c270186f" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon"    href="/favicon.ico" />
        {/* No hardcoded canonical here — each page sets its own via generateMetadata */}
        <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
        <link rel="apple-touch-icon" href="/assets/imgs/store/og-image.png" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="viewport"    content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <GoogleAnalytics />
      <body className={`${urban.variable} ${poppins.variable}`} suppressHydrationWarning>
        <StoreProviders>
          {children}
        </StoreProviders>
      </body>
    </html>
  );
}
