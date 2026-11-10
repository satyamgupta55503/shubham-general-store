const multer = require("multer");
const path   = require("path");
const { cloudinary, ensureConfigured } = require("../config/cloudinary");

/**
 * Shared media upload (images, PDFs, videos) → Cloudinary.
 *
 * Files are kept in memory (multer.memoryStorage) and streamed straight to
 * Cloudinary, so nothing is written to the server disk. This matters on hosts
 * like Render where the disk is wiped on every restart/redeploy.
 *
 * Limits follow Cloudinary's free plan: image/PDF up to 10 MB, video up to 50 MB
 * here (free plan allows 100 MB, but memory on a small server is limited).
 */
const MB = 1024 * 1024;
const LIMITS = { image: 10 * MB, pdf: 10 * MB, video: 50 * MB, doc: 10 * MB };

// Word documents (opt-in: only the Documents module accepts these)
const DOC_MIMES = {
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
};
// Documents module: PDF, Word, and jpg/png/webp images only
const DOC_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp"];
const docKindOf = (mimetype = "") => {
  if (DOC_MIMES[mimetype]) return "doc";
  if (mimetype === "application/pdf") return "pdf";
  if (DOC_IMAGE_MIMES.includes(mimetype)) return "image";
  return null;
};

const kindOf = (mimetype = "") => {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("video/")) return "video";
  return null;
};

const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITS.doc, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (docKindOf(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF, Word (.doc, .docx) and image (jpg, png, webp) files are allowed"));
  },
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMITS.video, files: 10 },
  fileFilter: (_req, file, cb) => {
    if (kindOf(file.mimetype)) return cb(null, true);
    cb(new Error("Only images, PDF files and videos are allowed"));
  },
});

// Upload one in-memory file to Cloudinary. Returns a plain result object.
const uploadToCloud = (file, folder = "subham-store", opts = {}) =>
  new Promise((resolve, reject) => {
    if (!ensureConfigured()) {
      return reject(new Error("Cloudinary is not configured on the server"));
    }
    const kind = opts.docs ? docKindOf(file.mimetype) : kindOf(file.mimetype);
    if (!kind) return reject(new Error("Unsupported file type"));
    if (file.size > LIMITS[kind]) {
      return reject(new Error(`${kind.toUpperCase()} is too large (max ${LIMITS[kind] / MB} MB)`));
    }

    const base = path
      .parse(file.originalname || "file")
      .name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "file";
    const stamp = Date.now();

    const options = { folder };
    if (kind === "video") {
      options.resource_type = "video";
    } else if (kind === "doc") {
      const ext = DOC_MIMES[file.mimetype];
      options.resource_type = "raw";
      options.public_id = `${base}-${stamp}.${ext}`;
    } else if (kind === "pdf") {
      // PDFs go in as "raw" files; the public_id must carry the extension
      options.resource_type = "raw";
      options.public_id = `${base}-${stamp}.pdf`;
    } else {
      options.resource_type = "image";
    }

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve({
        url:           result.secure_url,
        public_id:     result.public_id,
        resource_type: result.resource_type,
        format:        result.format || (kind === "pdf" ? "pdf" : kind === "doc" ? DOC_MIMES[file.mimetype] : ""),
        bytes:         result.bytes,
        width:         result.width,
        height:        result.height,
        duration:      result.duration,
        kind,
        original_name: file.originalname,
      });
    });
    stream.end(file.buffer);
  });

// Delete a file from Cloudinary (best effort — never throws)
const deleteFromCloud = async (public_id, resource_type = "image") => {
  try {
    if (!public_id || !ensureConfigured()) return false;
    await cloudinary.uploader.destroy(public_id, { resource_type, invalidate: true });
    return true;
  } catch {
    return false;
  }
};

// Extract the Cloudinary public_id + resource type from a delivery URL.
// Returns null for legacy local paths (e.g. "uploads/avatars/x.png") or foreign URLs.
const parseCloudUrl = (url) => {
  if (typeof url !== "string" || !/res\.cloudinary\.com/.test(url)) return null;
  const m = url.match(/\/(image|video|raw)\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(.+)$/);
  if (!m) return null;
  let id = decodeURIComponent(m[2].split("?")[0]);
  const resource_type = m[1];
  // images/videos: public_id has no extension; raw files keep it
  if (resource_type !== "raw") id = id.replace(/\.[a-z0-9]+$/i, "");
  return { public_id: id, resource_type };
};

// Delete whatever a stored URL points to (best effort; ignores legacy paths)
const deleteByUrl = async (url) => {
  const p = parseCloudUrl(url);
  if (!p) return false;
  return deleteFromCloud(p.public_id, p.resource_type);
};

// Wrap multer so upload errors become clean JSON responses (not HTML 500s)
const handle = (mw) => (req, res, next) =>
  mw(req, res, (err) => {
    if (!err) return next();
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "File is too large" :
      err.code === "LIMIT_UNEXPECTED_FILE" ? "Unexpected file field" :
      err.message || "Upload failed";
    res.status(400).json({ success: false, message });
  });

module.exports = {
  single: (field = "file") => handle(upload.single(field)),
  array:  (field = "files", max = 10) => handle(upload.array(field, max)),
  docArray: (field = "files", max = 10) => handle(docUpload.array(field, max)),
  uploadToCloud,
  deleteFromCloud,
  deleteByUrl,
  parseCloudUrl,
  kindOf,
};
