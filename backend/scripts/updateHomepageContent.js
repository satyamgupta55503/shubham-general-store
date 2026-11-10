/**
 * Apply the bilingual kirana homepage content (config/storeHomepageDefaults.js)
 * to the existing StoreHomepage document. Keeps uploaded hero/offer images and
 * section toggles as they are.
 *
 *   node scripts/updateHomepageContent.js
 */
require("dotenv").config();
const mongoose = require("mongoose");
const StoreHomepage = require("../models/store/StoreHomepage");
const D = require("../config/storeHomepageDefaults");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let doc = await StoreHomepage.findOne({ pageName: "StoreHomepage" });
  if (!doc) {
    await StoreHomepage.create(D);
    console.log("Created homepage with default content");
    process.exit(0);
  }

  const oldHero  = doc.heroSlides[0] || {};
  const oldOffer = doc.offerBanners || [];

  doc.promoBar.text = D.promoBar.text;
  // keep any image already uploaded in CMS
  doc.heroSlides   = D.heroSlides.map((s, i) => ({ ...s, image: (i === 0 && oldHero.image) || s.image }));
  doc.heroStats    = D.heroStats;
  doc.offerBanners = D.offerBanners.map((b, i) => ({ ...b, image: oldOffer[i]?.image || "" }));
  Object.assign(doc.headings, D.headings);
  Object.assign(doc.newsletter, D.newsletter);
  doc.sections.showTestimonials = false; // no real reviews yet

  await doc.save();
  console.log("Homepage content updated:", doc.heroSlides[0].title.replace(/\n/g, " "));
  process.exit(0);
})().catch((e) => { console.error("Failed:", e.message); process.exit(1); });
