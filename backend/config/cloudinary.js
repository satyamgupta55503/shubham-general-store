const cloudinary = require("cloudinary").v2;

const isConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

// Lazy config: dotenv may load after this module is required, so read the
// environment at call time. Secrets live only in environment variables.
let configured = false;
const ensureConfigured = () => {
  if (configured) return true;
  if (!isConfigured()) return false;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
  configured = true;
  return true;
};

module.exports = { cloudinary, isConfigured, ensureConfigured };
