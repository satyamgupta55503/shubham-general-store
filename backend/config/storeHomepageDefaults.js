/**
 * Default (bilingual Hindi + English) homepage content for Subham General Store —
 * a kirana shop selling at footkar (retail) and thok (wholesale) rates.
 * Used to auto-seed the StoreHomepage document and by scripts/updateHomepageContent.js.
 * Everything here stays editable from CMS → Store → Homepage.
 */
module.exports = {
  pageName: "StoreHomepage",
  promoBar: {
    enabled: true,
    text: "फुटकर और थोक दोनों उपलब्ध  |  Retail & Wholesale Kirana, Chirmiri",
  },
  heroSlides: [
    {
      tag: "किराना  •  फुटकर  •  थोक",
      title: "घर हो या दुकान,\nहर सामान\nसही दाम पर",
      description:
        "बिस्किट, नमकीन, नमक, साबुन-सर्फ और रोज़ की ज़रूरत का हर सामान — फुटकर और थोक दोनों रेट पर।\nRetail & wholesale kirana from trusted brands, Chirmiri.",
      image: "",
      accent: "#16a34a",
      bgGradient: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 55%,#bbf7d0 100%)",
      cta1Label: "अभी खरीदें",   cta1Link: "/products",
      cta2Label: "थोक रेट पूछें", cta2Link: "/contact",
      chips: ["बिस्किट", "नमकीन", "साबुन", "डिटर्जेंट", "नमक"],
      sortOrder: 0, isActive: true,
    },
  ],
  heroStats: [
    { value: "फुटकर", label: "Retail rate" },
    { value: "थोक",   label: "Wholesale rate" },
    { value: "Top",   label: "Brands / ब्रांड" },
  ],
  offerBanners: [
    { tag: "थोक / Wholesale", title: "दुकानदारों के लिए\nस्पेशल थोक रेट",   subtitle: "Bulk orders for shops at wholesale rates", bgGradient: "linear-gradient(135deg,#16a34a,#15803d)", link: "/contact",                     sortOrder: 0, isActive: true },
    { tag: "रोज़ की ज़रूरत",     title: "बिस्किट और नमकीन\nटॉप ब्रांड्स",       subtitle: "Biscuits & namkeen from top brands",       bgGradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", link: "/categories/biscuits-cookies", sortOrder: 1, isActive: true },
    { tag: "Home Care",        title: "साबुन, सर्फ और सफ़ाई\nघर का हर सामान", subtitle: "Soap, detergent & cleaning essentials",    bgGradient: "linear-gradient(135deg,#ea580c,#dc2626)", link: "/categories/home-care",        sortOrder: 2, isActive: true },
  ],
  headings: {
    categoriesTitle:     "श्रेणियाँ  |  Shop by Category",
    categoriesSubtitle:  "बिस्किट, नमकीन, होम केयर और भी बहुत कुछ",
    featuredTitle:       "खास प्रोडक्ट्स  |  Featured",
    featuredSubtitle:    "Our top picks for your home and shop",
    offersTitle:         "आज के ऑफ़र  |  Today's Deals",
    bestSellersTitle:    "सबसे ज़्यादा बिकने वाले  |  Best Sellers",
    bestSellersSubtitle: "Most ordered by our customers",
  },
  newsletter: {
    heading: "थोक रेट और नए ऑफ़र की जानकारी पाएं",
    subtext: "Subscribe to get new arrivals, wholesale (thok) rates and offers from Subham General Store.",
  },
};
