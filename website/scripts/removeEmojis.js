/**
 * Remove all emojis and symbols from store frontend files.
 * Run: node scripts/removeEmojis.js
 */
const fs   = require("fs");
const path = require("path");

// Emoji Unicode ranges
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{27BF}]|[\u{1FA00}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}\u{2B55}]|[\u{FE00}-\u{FEFF}]/gu;

// Specific named emoji/symbols used in our store files
const NAMED_REPLACEMENTS = [
  // Promo bar
  [/🚚/g, ""],
  [/🌿/g, ""],
  // Nav
  [/❤️/g, ""],
  // Hero
  [/🥦/g, ""], [/🥕/g, ""], [/🍅/g, ""], [/🥬/g, ""],
  [/🍎/g, ""], [/🍌/g, ""], [/🍊/g, ""], [/🍇/g, ""],
  [/🥛/g, ""], [/🧀/g, ""], [/🧈/g, ""], [/🥚/g, ""],
  // Categories
  [/🛒/g, ""], [/🍿/g, ""], [/🧃/g, ""], [/🌾/g, ""],
  [/🌶️/g, ""], [/🍞/g, ""], [/🧴/g, ""], [/🧹/g, ""],
  [/🗂️/g, ""], [/📦/g, ""], [/👥/g, ""],
  // Features
  [/⚡/g, ""], [/💰/g, ""], [/🛡️/g, ""], [/📱/g, ""], [/🤝/g, ""],
  // Offers
  [/🏷️/g, ""],
  // Cart/Checkout
  [/🎉/g, ""], [/🗑/g, ""],
  // Account
  [/👤/g, ""], [/📍/g, ""], [/🔑/g, ""], [/✨/g, ""], [/🚪/g, ""],
  // Orders
  [/📋/g, ""], [/✅/g, ""], [/⚙️/g, ""], [/🚚/g, ""],
  // Reviews
  [/⭐/g, ""], [/★/g, "★"], // keep rating star but remove emoji stars
  // Footer
  [/📘/g, ""], [/📷/g, ""], [/🐦/g, ""], [/💬/g, ""],
  // Why us
  [/🌿/g, ""],
  // Testimonials
  [/😊/g, ""],
  // Newsletter
  [/🎁/g, ""],
  // Login hub
  [/🏠/g, ""],
  // Store globals badge text
  [/🌿 100% Fresh/g, "100% Fresh"],
  [/⚡ Fast Delivery/g, "Fast Delivery"],
  [/✅ Quality Assured/g, "Quality Assured"],
  // Promo bar text
  [/🚚 Free delivery/g, "Free delivery"],
  [/🌿 100% Fresh & Natural/g, "100% Fresh & Natural"],
  // Rating stars (keep ★ for actual stars, remove emoji)
  [/⭐/g, ""],
  // Misc
  [/💳/g, ""], [/🔄/g, ""], [/📞/g, ""], [/✉️/g, ""], [/🕐/g, ""], [/📫/g,""],
  [/👋/g, ""], [/🌡️/g, ""],
];

function removeEmojiFromFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  // Apply named replacements first
  for (const [regex, replacement] of NAMED_REPLACEMENTS) {
    content = content.replace(regex, replacement);
  }

  // Then strip remaining emoji via regex
  content = content.replace(EMOJI_REGEX, "");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

function walkDir(dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
      files.push(...walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(fullPath);
    }
  }
  return files;
}

// Only process store frontend files (not CRM/HRM/EMP — they're portals, untouched)
const TARGET_DIRS = [
  path.join(__dirname, "../components/store"),
  path.join(__dirname, "../app/products"),
  path.join(__dirname, "../app/categories"),
  path.join(__dirname, "../app/cart"),
  path.join(__dirname, "../app/checkout"),
  path.join(__dirname, "../app/account"),
  path.join(__dirname, "../app/login"),
];

let changed = 0;
for (const dir of TARGET_DIRS) {
  for (const file of walkDir(dir)) {
    if (removeEmojiFromFile(file)) {
      console.log("  cleaned:", path.relative(process.cwd(), file));
      changed++;
    }
  }
}

// Also clean the homepage page.js and main page
const extraFiles = [
  path.join(__dirname, "../app/page.js"),
];
for (const file of extraFiles) {
  if (fs.existsSync(file) && removeEmojiFromFile(file)) {
    console.log("  cleaned:", path.relative(process.cwd(), file));
    changed++;
  }
}

console.log(`\nDone. Cleaned ${changed} files.`);
