const express      = require("express");
const cors         = require("cors");
const cookieParser = require("cookie-parser");
const dotenv       = require("dotenv");
const helmet       = require("helmet");
const mongoSanitize= require("express-mongo-sanitize");
const hpp          = require("hpp");
const connectDB    = require("./config/db.js");

dotenv.config();

const app = express();

// ══════════════════════════════════════════════════════════════════
// 0. TRUST PROXY  (needed for rate-limit + IP behind Nginx/Cloudflare)
// ══════════════════════════════════════════════════════════════════
app.set("trust proxy", 1);

// ══════════════════════════════════════════════════════════════════
// 1. HTTPS REDIRECT  (production only)
// ══════════════════════════════════════════════════════════════════
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(301, "https://" + req.headers.host + req.url);
    }
    next();
  });
}

// ══════════════════════════════════════════════════════════════════
// 2. HELMET — HTTP security headers
// ══════════════════════════════════════════════════════════════════
app.use(
  helmet({
    contentSecurityPolicy: false, // CSP is handled by Next.js frontend
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow /uploads images
  })
);

// ══════════════════════════════════════════════════════════════════
// 3. CORS
// ══════════════════════════════════════════════════════════════════
const ALLOWED_ORIGINS = [
  "https://digikraftsocial.com",
  "https://www.digikraftsocial.com",
  "https://crm.digikraftsocial.com",
  "https://hrm.digikraftsocial.com",
  "https://emp.digikraftsocial.com",
  "http://localhost:3000",
  "http://localhost:3001",
  ...(process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
    : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server / Postman (dev)
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-session-id"],
  })
);

// ══════════════════════════════════════════════════════════════════
// 4. BODY PARSERS — with size limits to prevent DoS
// ══════════════════════════════════════════════════════════════════
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// ══════════════════════════════════════════════════════════════════
// 5. NoSQL INJECTION SANITIZE
// express-mongo-sanitize is incompatible with Express 5 read-only
// req.query getter — manually sanitize body and params only.
// ══════════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // Sanitize req.body (writable in Express 5)
  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body);
  }
  // Sanitize req.params (writable in Express 5)
  if (req.params) {
    req.params = mongoSanitize.sanitize(req.params);
  }
  // NOTE: req.query is read-only in Express 5 — we validate query params
  // at the controller level instead of sanitizing here globally.
  next();
});

// ══════════════════════════════════════════════════════════════════
// 6. HTTP PARAMETER POLLUTION PREVENTION
// ══════════════════════════════════════════════════════════════════
app.use(hpp());

// ══════════════════════════════════════════════════════════════════
// 7. COOKIE PARSER
// ══════════════════════════════════════════════════════════════════
app.use(cookieParser());

// ══════════════════════════════════════════════════════════════════
// 8. STATIC FILES
// ══════════════════════════════════════════════════════════════════
app.use("/uploads", express.static("uploads"));

// ══════════════════════════════════════════════════════════════════
// 9. DATABASE
// ══════════════════════════════════════════════════════════════════
connectDB();

// ══════════════════════════════════════════════════════════════════
// 10. ROUTES
// ══════════════════════════════════════════════════════════════════

// ── CMS ─────────────────────────────────────────────────────────
app.use("/api/auth",             require("./routes/authRoutes"));
app.use("/api/posts",            require("./routes/postRoutes"));
app.use("/api/categories",       require("./routes/categoryRoutes"));
app.use("/api/projects",         require("./routes/projectsRoutes"));
app.use("/api/pages",            require("./routes/homepageRoutes"));
app.use("/api/about",            require("./routes/aboutRoutes.js"));
app.use("/api/services-section", require("./routes/servicesRoutes.js"));
app.use("/api/contact-info",     require("./routes/contactInfoRoutes.js"));
app.use("/api/enquiry",          require("./routes/enquiryRoutes.js"));
app.use("/api/seo-submissions",  require("./routes/seoSubmissionRoutes"));
app.use("/api/integrations",     require("./routes/socialIntegrationRoutes"));
app.use("/api/telegram",         require("./routes/telegramRoutes"));
app.use("/api/messaging",        require("./routes/socialMessagingRoutes"));
app.use("/api/logs",             require("./routes/activityLogRoutes"));
app.use("/api/slides",           require("./routes/slideRoutes"));

// ── CRM ─────────────────────────────────────────────────────────
app.use("/api/crm/auth",          require("./routes/crm/crmAuthRoutes"));
app.use("/api/crm/dashboard",     require("./routes/crm/crmDashboardRoutes"));
app.use("/api/crm/clients",       require("./routes/crm/crmClientRoutes"));
app.use("/api/crm/services",      require("./routes/crm/crmServiceRoutes"));
app.use("/api/crm/projects",      require("./routes/crm/crmProjectRoutes"));
app.use("/api/crm/proposals",     require("./routes/crm/crmProposalRoutes"));
app.use("/api/crm/quotations",    require("./routes/crm/crmQuotationRoutes"));
app.use("/api/crm/invoices",      require("./routes/crm/crmInvoiceRoutes"));
app.use("/api/crm/payments",      require("./routes/crm/crmPaymentRoutes"));
app.use("/api/crm/portfolio",     require("./routes/crm/crmPortfolioRoutes"));
app.use("/api/crm/enquiries",     require("./routes/crm/crmEnquiryRoutes"));
app.use("/api/crm/notifications", require("./routes/crm/crmNotificationRoutes"));
app.use("/api/crm/history",       require("./routes/crm/crmHistoryRoutes"));
app.use("/api/crm/settings",      require("./routes/crm/crmSettingsRoutes"));
app.use("/api/crm/followups",     require("./routes/crm/crmFollowUpRoutes"));
app.use("/api/crm/reports",       require("./routes/crm/crmReportRoutes"));
app.use("/api/crm/ledger",        require("./routes/crm/crmLedgerRoutes"));
app.use("/api/crm/order-sheets",  require("./routes/crm/crmOrderSheetRoutes"));

// ── HRM ─────────────────────────────────────────────────────────
app.use("/api/hrm/auth",          require("./routes/hrm/hrmAuthRoutes"));
app.use("/api/hrm/employees",     require("./routes/hrm/hrmEmployeeRoutes"));
app.use("/api/hrm/org",           require("./routes/hrm/hrmDeptRoutes"));
app.use("/api/hrm/attendance",    require("./routes/hrm/hrmAttendanceRoutes"));
app.use("/api/hrm/leaves",        require("./routes/hrm/hrmLeaveRoutes"));
app.use("/api/hrm/payroll",       require("./routes/hrm/hrmPayrollRoutes"));
app.use("/api/hrm/holidays",      require("./routes/hrm/hrmHolidayRoutes"));
app.use("/api/hrm/announcements", require("./routes/hrm/hrmAnnouncementRoutes"));
app.use("/api/hrm/reports",       require("./routes/hrm/hrmReportRoutes"));
app.use("/api/hrm/tasks",         require("./routes/hrm/hrmTaskRoutes"));
app.use("/api/hrm",               require("./routes/hrm/hrmMiscRoutes"));

// ── EMP ─────────────────────────────────────────────────────────
app.use("/api/emp", require("./routes/emp/empRoutes"));

// ── STORE (Subham General Store — Grocery Ecommerce) ─────────────
app.use("/api/store/homepage",   require("./routes/store/storeHomepageRoutes"));
app.use("/api/store/media",      require("./routes/store/storeMediaRoutes"));
app.use("/api/store/categories", require("./routes/store/storeCategoryRoutes"));
app.use("/api/store/brands",     require("./routes/store/storeBrandRoutes"));
app.use("/api/store/settings",   require("./routes/store/storeSettingsRoutes"));
app.use("/api/store/products",   require("./routes/store/storeProductRoutes"));
app.use("/api/store/customers",  require("./routes/store/storeCustomerRoutes"));
app.use("/api/store/cart",       require("./routes/store/storeCartRoutes"));
app.use("/api/store/orders",     require("./routes/store/storeOrderRoutes"));
app.use("/api/store/ledger",     require("./routes/store/storeLedgerRoutes"));

// ══════════════════════════════════════════════════════════════════
// 11. GLOBAL ERROR HANDLERS
// ══════════════════════════════════════════════════════════════════
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Production: never leak stack traces or internal messages
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === "production";
  const status = err.status || 500;

  // Log full error server-side always
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${status}`);
  if (!isProd) console.error(err.stack);

  res.status(status).json({
    message: isProd && status === 500
      ? "Internal server error"          // never expose internals in prod
      : err.message || "Internal server error",
  });
});

// ══════════════════════════════════════════════════════════════════
// 12. START
// ══════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Subham General Store Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
  console.log(`   Helmet:          ✅`);
  console.log(`   Mongo-sanitize:  ✅`);
  console.log(`   HPP:             ✅`);
  console.log(`   Body limit:      2mb`);
  console.log(`   HTTPS redirect:  ${process.env.NODE_ENV === "production" ? "✅" : "dev-off"}`);
});
