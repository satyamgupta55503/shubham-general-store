/**
 * Subham General Store — Seed sample store data (1 of each)
 * Run: node scripts/seedStoreData.js
 *
 * Adds: 1 category, 1 featured product, 1 best-seller product,
 *       1 new-arrival product, 1 hero slide, 1 offer banner, 1 customer.
 * Safe to re-run — upserts by slug/email so no duplicates.
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const GroceryCategory = require("../models/store/GroceryCategory");
const Product         = require("../models/store/Product");
const Customer        = require("../models/store/Customer");
const StoreHomepage   = require("../models/store/StoreHomepage");

async function main() {
  console.log("\n🔄 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected!\n");

  // ── 1. CATEGORIES (add a few so the homepage strip looks real) ──────────
  console.log("🗂️  Seeding categories...");
  const categorySeed = [
    { name: "Vegetables",   slug: "vegetables",  description: "Farm-fresh vegetables delivered daily",     color: "#16a34a", sortOrder: 1, isActive: true, isFeatured: true },
    { name: "Fruits",       slug: "fruits",      description: "Sweet & juicy seasonal fruits",             color: "#ea580c", sortOrder: 2, isActive: true, isFeatured: true },
    { name: "Dairy & Eggs", slug: "dairy-eggs",  description: "Pure dairy products, fresh every morning",  color: "#2563eb", sortOrder: 3, isActive: true, isFeatured: true },
    { name: "Snacks",       slug: "snacks",      description: "Tasty & healthy snack options",             color: "#9333ea", sortOrder: 4, isActive: true },
    { name: "Beverages",    slug: "beverages",   description: "Juices, cold drinks & more",                color: "#0891b2", sortOrder: 5, isActive: true },
    { name: "Staples",      slug: "staples",     description: "Rice, dal, flour & daily essentials",       color: "#d97706", sortOrder: 6, isActive: true },
  ];

  const categories = {};
  for (const c of categorySeed) {
    const cat = await GroceryCategory.findOneAndUpdate(
      { slug: c.slug }, c, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categories[c.slug] = cat;
    console.log(`   ✅ ${c.name}`);
  }

  // ── 2. PRODUCTS (1 featured, 1 best-seller, 1 new-arrival) ──────────────
  console.log("\n🛒 Seeding products...");
  const productSeed = [
    {
      name: "Fresh Tomatoes", slug: "fresh-tomatoes",
      description: "Juicy, ripe red tomatoes sourced fresh from local farms. Perfect for curries, salads and sauces.",
      shortDesc: "Farm-fresh red tomatoes, rich in flavour.",
      price: 40, salePrice: 30, costPrice: 20,
      category: categories["vegetables"]._id,
      brand: "Local Farm", tags: ["fresh", "vegetable", "organic"],
      sku: "SGS-VEG-001", stockQty: 150, unit: "kg", packSize: "1 kg", weight: 1000,
      isActive: true, isFeatured: true, isNewArrival: false, isBestSeller: false,
      isOrganic: true, isVeg: true,
      thumbnail: "", images: [],
    },
    {
      name: "Amul Taaza Milk", slug: "amul-taaza-milk",
      description: "Amul Taaza toned fresh milk, 1 litre pack. Rich, pure and nutritious — delivered chilled every morning.",
      shortDesc: "Pure toned milk, 1L pack.",
      price: 72, salePrice: null, costPrice: 60,
      category: categories["dairy-eggs"]._id,
      brand: "Amul", tags: ["dairy", "milk", "daily"],
      sku: "SGS-DAI-001", stockQty: 80, unit: "L", packSize: "1 L", weight: 1000,
      isActive: true, isFeatured: false, isNewArrival: false, isBestSeller: true,
      isOrganic: false, isVeg: true,
      thumbnail: "", images: [],
    },
    {
      name: "Fresh Bananas", slug: "fresh-bananas",
      description: "Naturally ripened Robusta bananas, sweet and energy-packed. A healthy snack for the whole family.",
      shortDesc: "Sweet ripe bananas, 1 dozen.",
      price: 60, salePrice: 50, costPrice: 35,
      category: categories["fruits"]._id,
      brand: "Local Farm", tags: ["fruit", "fresh", "healthy"],
      sku: "SGS-FRU-001", stockQty: 120, unit: "dozen", packSize: "12 pcs", weight: 1200,
      isActive: true, isFeatured: true, isNewArrival: true, isBestSeller: false,
      isOrganic: true, isVeg: true,
      thumbnail: "", images: [],
    },
  ];

  for (const p of productSeed) {
    await Product.findOneAndUpdate(
      { slug: p.slug }, p, { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`   ✅ ${p.name}`);
  }

  // ── 3. STORE HOMEPAGE (hero slide + offer banner) ───────────────────────
  console.log("\n🏠 Seeding homepage content...");
  await StoreHomepage.findOneAndUpdate(
    { pageName: "StoreHomepage" },
    {
      pageName: "StoreHomepage",
      promoBar: { enabled: true, text: "Free delivery on orders above ₹499 | 100% Fresh & Natural" },
      heroSlides: [{
        tag: "Fresh & Organic",
        title: "Farm Fresh\nVegetables\nDelivered Daily",
        description: "Straight from local farms to your kitchen. Fresh, healthy, and affordable groceries at your doorstep.",
        image: "", accent: "#16a34a",
        bgGradient: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)",
        cta1Label: "Shop Now", cta1Link: "/products",
        cta2Label: "View Categories", cta2Link: "/categories",
        chips: ["Vegetables", "Fruits", "Dairy", "Staples"],
        sortOrder: 0, isActive: true,
      }],
      heroStats: [
        { value: "500+",  label: "Products" },
        { value: "1000+", label: "Customers" },
        { value: "Free",  label: "Delivery ₹499+" },
      ],
      offerBanners: [{
        tag: "Limited Offer",
        title: "Fresh Vegetables\nUp to 30% OFF",
        subtitle: "Valid today only",
        image: "", bgGradient: "linear-gradient(135deg,#16a34a,#15803d)",
        link: "/categories/vegetables", sortOrder: 0, isActive: true,
      }],
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log("   ✅ Hero slide + offer banner + promo bar");

  // ── 4. CUSTOMER (1 sample test customer) ────────────────────────────────
  console.log("\n👤 Seeding sample customer...");
  const custExists = await Customer.findOne({ email: "customer@subhamstore.com" });
  if (!custExists) {
    // pass raw password — the model's pre-save hook hashes it
    await Customer.create({
      name: "Test Customer",
      email: "customer@subhamstore.com",
      phone: "9999999999",
      password: "Customer@2026",
      isActive: true,
      addresses: [{
        label: "Home", fullName: "Test Customer", phone: "9999999999",
        line1: "123 Main Street", city: "Raipur", state: "Chhattisgarh",
        pincode: "492001", isDefault: true,
      }],
    });
    console.log("   ✅ customer@subhamstore.com / Customer@2026");
  } else {
    console.log("   ⏭️  Customer already exists");
  }

  // ── DONE ────────────────────────────────────────────────────────────────
  console.log("\n🎉 SEED COMPLETE!\n");
  console.log("┌──────────────────────────────────────────────┐");
  console.log("│  Categories : 6                                │");
  console.log("│  Products   : 3 (featured, best-seller, new)   │");
  console.log("│  Hero slide : 1                                │");
  console.log("│  Offer      : 1                                │");
  console.log("│  Customer   : customer@subhamstore.com         │");
  console.log("└──────────────────────────────────────────────┘\n");

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error("\n❌ Error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
