const mongoose = require("mongoose");

/**
 * StoreHomepage — CMS-controlled content for the grocery store homepage.
 * Single document (pageName: "StoreHomepage").
 */

const HeroSlideSchema = new mongoose.Schema({
  tag:       { type: String, default: "" },        // e.g. "Kirana | Footkar & Thok"
  title:     { type: String, default: "" },        // supports \n line breaks
  description:{ type: String, default: "" },
  image:     { type: String, default: "" },        // uploaded image path
  accent:    { type: String, default: "#16a34a" }, // theme color
  bgGradient:{ type: String, default: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)" },
  cta1Label: { type: String, default: "Shop Now" },
  cta1Link:  { type: String, default: "/products" },
  cta2Label: { type: String, default: "View Categories" },
  cta2Link:  { type: String, default: "/categories" },
  chips:     [{ type: String }],                   // small item tags
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { _id: true });

const OfferBannerSchema = new mongoose.Schema({
  tag:       { type: String, default: "" },
  title:     { type: String, default: "" },
  subtitle:  { type: String, default: "" },
  image:     { type: String, default: "" },
  bgGradient:{ type: String, default: "linear-gradient(135deg,#16a34a,#15803d)" },
  link:      { type: String, default: "/products" },
  sortOrder: { type: Number, default: 0 },
  isActive:  { type: Boolean, default: true },
}, { _id: true });

const StoreHomepageSchema = new mongoose.Schema(
  {
    pageName: { type: String, default: "StoreHomepage", unique: true },

    // ── Top promo bar ──
    promoBar: {
      enabled: { type: Boolean, default: true },
      text:    { type: String, default: "Footkar & Thok dono available | Kirana ka poora saaman, sahi daam par" },
    },

    // ── Hero slides ──
    heroSlides: [HeroSlideSchema],

    // ── Hero stats (shown in hero side box) ──
    heroStats: [
      {
        value: { type: String, default: "" },
        label: { type: String, default: "" },
      },
    ],

    // ── Offer banners ──
    offerBanners: [OfferBannerSchema],

    // ── Section toggles (control which homepage sections show) ──
    sections: {
      showCategories:     { type: Boolean, default: true },
      showFeatured:       { type: Boolean, default: true },
      showOffers:         { type: Boolean, default: true },
      showBestSellers:    { type: Boolean, default: true },
      showWhyChooseUs:    { type: Boolean, default: true },
      showTestimonials:   { type: Boolean, default: false },
      showNewsletter:     { type: Boolean, default: true },
    },

    // ── Section headings (editable) ──
    headings: {
      categoriesTitle:    { type: String, default: "Shop by Category" },
      categoriesSubtitle: { type: String, default: "Explore our kirana range" },
      featuredTitle:      { type: String, default: "Featured Products" },
      featuredSubtitle:   { type: String, default: "Our most popular picks this week" },
      offersTitle:        { type: String, default: "Today's Best Deals" },
      bestSellersTitle:   { type: String, default: "Best Sellers" },
      bestSellersSubtitle:{ type: String, default: "Most ordered by our customers" },
    },

    // ── Newsletter ──
    newsletter: {
      heading:  { type: String, default: "Get Updates & Wholesale Rates" },
      subtext:  { type: String, default: "Subscribe to stay updated on new arrivals, bulk (thok) rates and offers from Subham General Store." },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StoreHomepage || mongoose.model("StoreHomepage", StoreHomepageSchema);
