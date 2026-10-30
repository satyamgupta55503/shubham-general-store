const StoreHomepage = require("../../models/store/StoreHomepage");

// Default seed data used when no document exists yet
const DEFAULTS = {
  pageName: "StoreHomepage",
  promoBar: {
    enabled: true,
    text: "Free delivery on orders above ₹499 | 100% Fresh & Natural",
  },
  heroSlides: [
    {
      tag: "Fresh & Organic",
      title: "Farm Fresh\nVegetables\nDelivered Daily",
      description: "Straight from local farms to your kitchen. Fresh, healthy, and affordable groceries at your doorstep.",
      image: "",
      accent: "#16a34a",
      bgGradient: "linear-gradient(135deg,#f0fdf4 0%,#dcfce7 50%,#bbf7d0 100%)",
      cta1Label: "Shop Now",  cta1Link: "/products",
      cta2Label: "View Categories", cta2Link: "/categories",
      chips: ["Carrots", "Broccoli", "Tomatoes", "Leafy Greens"],
      sortOrder: 0, isActive: true,
    },
  ],
  heroStats: [
    { value: "500+",  label: "Products" },
    { value: "1000+", label: "Customers" },
    { value: "Free",  label: "Delivery ₹499+" },
  ],
  offerBanners: [
    { tag: "Limited Offer",    title: "Fresh Vegetables\nUp to 30% OFF", subtitle: "Valid today only",     bgGradient: "linear-gradient(135deg,#16a34a,#15803d)", link: "/categories/vegetables",  sortOrder: 0, isActive: true },
    { tag: "Daily Essentials", title: "Dairy & Eggs\nFlat 20% OFF",     subtitle: "On orders above ₹299", bgGradient: "linear-gradient(135deg,#2563eb,#1d4ed8)", link: "/categories/dairy-eggs", sortOrder: 1, isActive: true },
    { tag: "Weekend Special",  title: "Fresh Fruits\nBuy 2 Get 1 Free", subtitle: "Selected items only",  bgGradient: "linear-gradient(135deg,#ea580c,#dc2626)", link: "/categories/fruits",     sortOrder: 2, isActive: true },
  ],
};

// GET /api/store/homepage  (public)
exports.getHomepage = async (req, res) => {
  try {
    let doc = await StoreHomepage.findOne({ pageName: "StoreHomepage" });
    if (!doc) {
      doc = await StoreHomepage.create(DEFAULTS);  // auto-seed on first call
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/store/homepage/admin  (admin)
exports.updateHomepage = async (req, res) => {
  try {
    const doc = await StoreHomepage.findOneAndUpdate(
      { pageName: "StoreHomepage" },
      req.body,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, message: "Homepage updated", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/store/homepage/admin/upload  (admin) — single image upload
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }
    // Return the public path (served via /uploads static)
    const imagePath = `uploads/${req.file.filename}`;
    res.json({ success: true, path: imagePath, url: `${req.protocol}://${req.get("host")}/${imagePath}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
