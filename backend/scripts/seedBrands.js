/**
 * Subham General Store — Seed dealer brands, product lines, categories & sample products
 * Run: node scripts/seedBrands.js
 *
 * - Safe to re-run: everything is upserted by slug (no duplicates, nothing deleted).
 * - Brands:  Sunder Biscuits & Namkeen, Nirma, Hulchal
 * - Hulchal is created WITHOUT product lines/products (add them in CMS → Brands).
 * - Sample products are tagged "sample-data" and use PLACEHOLDER prices —
 *   review prices/stock in CMS → Products before taking real orders.
 *   Remove them any time:  node scripts/seedBrands.js --remove-samples
 */
require("dotenv").config();
const mongoose = require("mongoose");

const Brand           = require("../models/store/Brand");
const GroceryCategory = require("../models/store/GroceryCategory");
const Product         = require("../models/store/Product");

const slugify = (s) => s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// ── Store-wide grocery categories (type 1) ───────────────────────────────────
const CATEGORIES = [
  { name: "Biscuits & Cookies", slug: "biscuits-cookies", description: "Biscuits, cookies, rusk and cream biscuits", color: "#d97706", sortOrder: 10 },
  { name: "Namkeen & Snacks",   slug: "namkeen-snacks",   description: "Namkeen, mixtures, chips and fryums",         color: "#ea580c", sortOrder: 11 },
  { name: "Home Care",          slug: "home-care",        description: "Detergents, dishwash and cleaning essentials", color: "#2563eb", sortOrder: 12 },
  { name: "Personal Care",      slug: "personal-care",    description: "Bathing soaps and personal hygiene",           color: "#9333ea", sortOrder: 13 },
  { name: "Salt & Staples",     slug: "salt-staples",     description: "Salt and daily kitchen essentials",            color: "#16a34a", sortOrder: 14 },
];

// ── Dealer brands (type 2) with their own product lines (type 3) ─────────────
const BRANDS = [
  {
    name: "Sunder Biscuits & Namkeen", slug: "sunder",
    tagline: "Biscuits & Namkeen",
    description: "Sunder makes a wide range of biscuits, namkeen, chips, rusk, fryums, sweets, cakes and noodles. Subham General Store is an authorised dealer.",
    color: "#dc2626", isDealer: true, dealerType: "Authorised Dealer", sortOrder: 1, isFeatured: true,
    lines: [
      ["Biscuit", "Cookies, marie, digestive and cream biscuits"],
      ["Namkeen", "Mixtures, bhujia and traditional namkeen"],
      ["Chips", "Crispy chips and wafers"],
      ["Rusk", "Tea-time rusk"],
      ["Fryums", "Fryums and papad snacks"],
      ["Sweets", "Packed sweets"],
      ["Cakes", "Packed cakes"],
      ["Noodles", "Instant noodles"],
    ],
  },
  {
    name: "Nirma", slug: "nirma",
    tagline: "Detergents, soaps & salt",
    description: "Nirma's household range — detergent powder and cakes, bathing soap, dishwash bars and salt. Subham General Store is an authorised dealer.",
    color: "#2563eb", isDealer: true, dealerType: "Authorised Dealer", sortOrder: 2, isFeatured: true,
    lines: [
      ["Detergent Powder", "Washing powder for everyday laundry"],
      ["Detergent Cake", "Washing bars"],
      ["Bathing Soap", "Bathing soaps"],
      ["Dishwash Bar", "Utensil cleaning bars"],
      ["Salt", "Iodised table salt"],
    ],
  },
  {
    name: "Hulchal", slug: "hulchal",
    tagline: "",
    description: "Subham General Store is an authorised Hulchal dealer.",
    color: "#16a34a", isDealer: true, dealerType: "Authorised Dealer", sortOrder: 3, isFeatured: true,
    lines: [], // add product lines in CMS → Brands
  },
];

// ── Sample products (PLACEHOLDER prices — edit in CMS) ───────────────────────
// [brandSlug, lineName, productName, categorySlug, MRP, unit, packSize]
const SAMPLES = [
  ["sunder", "Biscuit", "Sunder Super Coconut Cookies", "biscuits-cookies", 30, "pack", "Pack"],
  ["sunder", "Biscuit", "Sunder Digestiva",             "biscuits-cookies", 40, "pack", "Pack"],
  ["sunder", "Biscuit", "Sunder Jaggy Marie",           "biscuits-cookies", 20, "pack", "Pack"],
  ["sunder", "Biscuit", "Sunder Dark Bliss",            "biscuits-cookies", 30, "pack", "Pack"],
  ["sunder", "Biscuit", "Sunder Fruit Bite",            "biscuits-cookies", 20, "pack", "Pack"],
  ["sunder", "Biscuit", "Sunder Doodh Shakti Atta Biscuits", "biscuits-cookies", 25, "pack", "Pack"],
  ["sunder", "Namkeen", "Sunder Kadiyadi Mixture",      "namkeen-snacks",   60, "pack", "Pack"],
  ["nirma",  "Detergent Powder", "Nirma Detergent Powder", "home-care",     60, "pack", "Pack"],
  ["nirma",  "Detergent Cake",   "Nirma Detergent Cake",   "home-care",     20, "piece", "1 cake"],
  ["nirma",  "Bathing Soap",     "Nirma Bathing Soap",     "personal-care", 25, "piece", "1 bar"],
  ["nirma",  "Dishwash Bar",     "Nirma Dishwash Bar",     "home-care",     15, "piece", "1 bar"],
  ["nirma",  "Salt",             "Nirma Iodised Salt",     "salt-staples",  25, "kg",    "1 kg"],
];

async function main() {
  await mongoose.connect(process.env.MONGO_URI);

  if (process.argv.includes("--remove-samples")) {
    const r = await Product.deleteMany({ tags: "sample-data" });
    console.log(`Removed ${r.deletedCount} sample product(s).`);
    await mongoose.disconnect();
    return;
  }

  console.log("Categories...");
  const cats = {};
  for (const c of CATEGORIES) {
    cats[c.slug] = await GroceryCategory.findOneAndUpdate(
      { slug: c.slug },
      { $setOnInsert: { ...c, isActive: true, isFeatured: false } },
      { upsert: true, returnDocument: "after" }
    );
    console.log("  ok", c.name);
  }

  console.log("Brands...");
  const brands = {};
  for (const b of BRANDS) {
    const existing = await Brand.findOne({ slug: b.slug });
    const productLines = b.lines.map(([name, description], i) => ({ name, slug: slugify(name), description, sortOrder: i }));
    if (existing) {
      // Keep any edits made in CMS; only add product lines that are missing
      const have = new Set(existing.productLines.map((l) => l.slug));
      productLines.filter((l) => !have.has(l.slug)).forEach((l) => existing.productLines.push(l));
      await existing.save();
      brands[b.slug] = existing;
    } else {
      const { lines, ...rest } = b;
      brands[b.slug] = await Brand.create({ ...rest, productLines, isActive: true });
    }
    console.log("  ok", b.name, `(${b.lines.length} lines)`);
  }

  console.log("Sample products...");
  for (const [brandSlug, lineName, name, catSlug, price, unit, packSize] of SAMPLES) {
    const brand = brands[brandSlug];
    const slug = slugify(name);
    const doc = {
      name, slug, price, unit, packSize,
      shortDesc: `${name} — ${brand.name}`,
      description: `${name} from ${brand.name}. Available at Subham General Store (authorised dealer).`,
      category: cats[catSlug]._id,
      brand: brand.name, brandRef: brand._id, brandLine: slugify(lineName),
      tags: ["sample-data", brandSlug],
      sku: `SGS-${brandSlug.toUpperCase().slice(0, 3)}-${slug.slice(0, 12).toUpperCase()}`,
      stockQty: 100, isActive: true, isVeg: true,
    };
    // Don't overwrite a product the owner has already edited
    const exists = await Product.findOne({ slug });
    if (!exists) { await Product.create(doc); console.log("  +", name); }
    else console.log("  =", name, "(already exists, left unchanged)");
  }

  console.log("\nDone. Sample prices are placeholders — review them in CMS → Products.");
  await mongoose.disconnect();
}

main().catch((e) => { console.error("ERROR:", e.message); process.exit(1); });
