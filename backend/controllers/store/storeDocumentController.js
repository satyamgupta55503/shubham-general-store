const mongoose  = require("mongoose");
const DocFolder = require("../../models/store/DocFolder");
const DocFile   = require("../../models/store/DocFile");
const { uploadToCloud, deleteFromCloud } = require("../../middleware/mediaUpload");

const CLOUD_FOLDER = "subham-store/documents";
const isId = (v) => mongoose.Types.ObjectId.isValid(v) && String(new mongoose.Types.ObjectId(v)) === String(v);
const cleanName = (v) => String(v ?? "").replace(/[\\/]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const bad = (res, message, code = 400) => res.status(code).json({ success: false, message });
const userId = (req) => {
  const id = req.user?.id || req.user?._id;
  return id && isId(id) ? id : null;
};
// "", "null", "root" → null (root); otherwise must be a valid id
const parseRef = (v) => (v === undefined || v === null || v === "" || v === "null" || v === "root" ? null : v);

const SORTS = {
  name:  { name: 1 },
  date:  { createdAt: -1 },
  size:  { bytes: -1 },
};
const buildSort = (sort, order) => {
  const base = SORTS[sort] || SORTS.name;
  const dir = order === "asc" ? 1 : order === "desc" ? -1 : null;
  if (!dir) return base;
  return Object.fromEntries(Object.keys(base).map((k) => [k, dir]));
};

const breadcrumbOf = async (folderId) => {
  const trail = [];
  let cur = folderId;
  for (let i = 0; cur && i < 50; i++) {
    const f = await DocFolder.findById(cur).select("name parent").lean();
    if (!f) break;
    trail.unshift({ _id: f._id, name: f.name });
    cur = f.parent;
  }
  return trail;
};

// ─── FOLDERS ──────────────────────────────────────────────────────────────

// GET /folders?parent=<id|root>&search=  → { folders (with fileCount, folderCount), breadcrumb, current }
exports.listFolders = async (req, res) => {
  try {
    const parent = parseRef(req.query.parent);
    if (parent && !isId(parent)) return bad(res, "Invalid parent folder id");
    const search = cleanName(req.query.search);

    let current = null;
    if (parent) {
      current = await DocFolder.findById(parent).lean();
      if (!current) return bad(res, "Folder not found", 404);
    }

    // Search looks through every folder; otherwise only direct children
    const filter = search ? { name: new RegExp(esc(search), "i") } : { parent };
    const folders = await DocFolder.find(filter).sort(buildSort(req.query.sort, req.query.order)).lean();
    // folder sort by size/date has no meaning for size; fall back to name for size
    if (req.query.sort === "size") folders.sort((a, b) => a.name.localeCompare(b.name));

    const ids = folders.map((f) => f._id);
    const [fileCounts, folderCounts] = await Promise.all([
      DocFile.aggregate([{ $match: { folder: { $in: ids } } }, { $group: { _id: "$folder", n: { $sum: 1 } } }]),
      DocFolder.aggregate([{ $match: { parent: { $in: ids } } }, { $group: { _id: "$parent", n: { $sum: 1 } } }]),
    ]);
    const fc = Object.fromEntries(fileCounts.map((x) => [String(x._id), x.n]));
    const sc = Object.fromEntries(folderCounts.map((x) => [String(x._id), x.n]));
    const data = folders.map((f) => ({
      ...f,
      fileCount: fc[String(f._id)] || 0,
      folderCount: sc[String(f._id)] || 0,
    }));

    res.json({
      success: true,
      data,
      breadcrumb: parent ? await breadcrumbOf(parent) : [],
      current,
    });
  } catch (err) {
    bad(res, err.message, 500);
  }
};

// POST /folders  { name, parent? }
exports.createFolder = async (req, res) => {
  try {
    const name = cleanName(req.body.name);
    if (!name) return bad(res, "Folder name is required");
    const parent = parseRef(req.body.parent);
    if (parent) {
      if (!isId(parent)) return bad(res, "Invalid parent folder id");
      if (!(await DocFolder.exists({ _id: parent }))) return bad(res, "Parent folder not found", 404);
    }
    if (await DocFolder.exists({ parent, name: new RegExp(`^${esc(name)}$`, "i") }))
      return bad(res, `A folder named "${name}" already exists here`);

    const folder = await DocFolder.create({ name, parent, createdBy: userId(req) });
    res.status(201).json({ success: true, data: folder, message: "Folder created" });
  } catch (err) {
    if (err.code === 11000) return bad(res, "A folder with this name already exists here");
    bad(res, err.message, 500);
  }
};

// PUT /folders/:id  { name?, parent? }  — rename and/or move
exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return bad(res, "Invalid folder id");
    const folder = await DocFolder.findById(id);
    if (!folder) return bad(res, "Folder not found", 404);

    let name = folder.name;
    let parent = folder.parent;

    if (req.body.name !== undefined) {
      name = cleanName(req.body.name);
      if (!name) return bad(res, "Folder name is required");
    }
    if (req.body.parent !== undefined) {
      parent = parseRef(req.body.parent);
      if (parent) {
        if (!isId(parent)) return bad(res, "Invalid parent folder id");
        if (!(await DocFolder.exists({ _id: parent }))) return bad(res, "Destination folder not found", 404);
        // cannot move into itself or any descendant
        const trail = await breadcrumbOf(parent);
        if (trail.some((t) => String(t._id) === String(id)))
          return bad(res, "A folder cannot be moved into itself or its own subfolder");
      }
    }

    const dup = await DocFolder.exists({
      _id: { $ne: id },
      parent,
      name: new RegExp(`^${esc(name)}$`, "i"),
    });
    if (dup) return bad(res, `A folder named "${name}" already exists in that location`);

    folder.name = name;
    folder.parent = parent;
    await folder.save();
    res.json({ success: true, data: folder, message: "Folder updated" });
  } catch (err) {
    if (err.code === 11000) return bad(res, "A folder with this name already exists in that location");
    bad(res, err.message, 500);
  }
};

// DELETE /folders/:id  — only when empty
exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return bad(res, "Invalid folder id");
    const folder = await DocFolder.findById(id);
    if (!folder) return bad(res, "Folder not found", 404);

    const [files, subs] = await Promise.all([
      DocFile.countDocuments({ folder: id }),
      DocFolder.countDocuments({ parent: id }),
    ]);
    if (files || subs) {
      return bad(
        res,
        `Folder is not empty (${files} file${files === 1 ? "" : "s"}, ${subs} subfolder${subs === 1 ? "" : "s"}). Move or delete its contents first.`,
        409
      );
    }
    await folder.deleteOne();
    res.json({ success: true, data: { _id: id }, message: "Folder deleted" });
  } catch (err) {
    bad(res, err.message, 500);
  }
};

// ─── FILES ────────────────────────────────────────────────────────────────

// GET /files?folder=<id|root>&search=&sort=name|date|size&order=asc|desc
// With ?search= the search covers ALL documents (every folder); each file then carries folderName.
exports.listFiles = async (req, res) => {
  try {
    const search = cleanName(req.query.search);
    const folder = parseRef(req.query.folder);
    if (folder && !isId(folder)) return bad(res, "Invalid folder id");

    const filter = search
      ? { $or: [{ name: new RegExp(esc(search), "i") }, { originalName: new RegExp(esc(search), "i") }] }
      : { folder };
    const files = await DocFile.find(filter)
      .sort(buildSort(req.query.sort, req.query.order))
      .populate("folder", "name")
      .lean();

    const data = files.map((f) => ({
      ...f,
      folderName: f.folder ? f.folder.name : "",
      folder: f.folder ? f.folder._id : null,
    }));
    res.json({ success: true, data });
  } catch (err) {
    bad(res, err.message, 500);
  }
};

// POST /files  multipart: files[] (max 10), folder? (id or empty for root)
exports.uploadFiles = async (req, res) => {
  const uploaded = [];
  try {
    const folder = parseRef(req.body.folder);
    if (folder) {
      if (!isId(folder)) return bad(res, "Invalid folder id");
      if (!(await DocFolder.exists({ _id: folder }))) return bad(res, "Folder not found", 404);
    }
    if (!req.files || !req.files.length) return bad(res, "No files received");

    const created = [];
    const failed = [];
    for (const file of req.files) {
      try {
        const r = await uploadToCloud(file, CLOUD_FOLDER, { docs: true });
        uploaded.push(r);
        const origName = Buffer.from(file.originalname || "file", "latin1").toString("utf8");
        const doc = await DocFile.create({
          name: cleanName(origName) || "file",
          originalName: origName.slice(0, 255),
          folder,
          url: r.url,
          public_id: r.public_id,
          resource_type: r.resource_type,
          format: r.format,
          kind: r.kind,
          mimetype: file.mimetype,
          bytes: r.bytes || file.size,
          uploadedBy: userId(req),
        });
        created.push(doc);
      } catch (e) {
        failed.push({ name: file.originalname, message: e.message });
      }
    }

    if (!created.length) return bad(res, failed[0]?.message || "Upload failed");
    res.status(201).json({
      success: true,
      data: created,
      failed,
      message: `${created.length} file${created.length === 1 ? "" : "s"} uploaded${failed.length ? `, ${failed.length} failed` : ""}`,
    });
  } catch (err) {
    // best-effort cleanup of anything already sent to Cloudinary
    await Promise.all(uploaded.map((u) => deleteFromCloud(u.public_id, u.resource_type)));
    bad(res, err.message, 500);
  }
};

// PUT /files/:id  { name?, folder? }  — rename and/or move (folder: id or null/"root")
exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return bad(res, "Invalid file id");
    const file = await DocFile.findById(id);
    if (!file) return bad(res, "File not found", 404);

    if (req.body.name !== undefined) {
      const name = cleanName(req.body.name);
      if (!name) return bad(res, "File name is required");
      file.name = name;
    }
    if (req.body.folder !== undefined) {
      const folder = parseRef(req.body.folder);
      if (folder) {
        if (!isId(folder)) return bad(res, "Invalid folder id");
        if (!(await DocFolder.exists({ _id: folder }))) return bad(res, "Destination folder not found", 404);
      }
      file.folder = folder;
    }
    await file.save();
    res.json({ success: true, data: file, message: "File updated" });
  } catch (err) {
    bad(res, err.message, 500);
  }
};

// DELETE /files/:id  — removes DB record and the Cloudinary asset
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isId(id)) return bad(res, "Invalid file id");
    const file = await DocFile.findById(id);
    if (!file) return bad(res, "File not found", 404);
    const removed = await deleteFromCloud(file.public_id, file.resource_type);
    if (!removed) {
      // keep a trace so orphaned Cloudinary assets can be cleaned manually
      console.warn(`[documents] Cloudinary delete failed for ${file.resource_type}:${file.public_id}`);
    }
    await file.deleteOne();
    res.json({ success: true, data: { _id: id }, message: "File deleted" });
  } catch (err) {
    bad(res, err.message, 500);
  }
};
