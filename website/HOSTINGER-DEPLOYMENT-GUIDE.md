# Hostinger Deployment Guide — DigiKraft Social

## Project Structure (2 Zip Files)

```
📁 backend.zip          → Backend API (Node.js/Express)
📁 website.zip          → Frontend (Next.js)
```

---

## STEP 1: Backend Deployment (Node.js on Hostinger VPS/Cloud)

### A. Prepare backend.zip

**Include these files/folders:**
```
backend/
├── controllers/
├── middleware/
├── models/
├── routes/
├── uploads/        (empty folder — for file uploads)
├── server.js
├── package.json
├── .env            (create on server, NOT in zip)
└── package-lock.json
```

**Exclude from zip:**
- `node_modules/` (will be installed on server)
- `.env` (add manually on server)

### B. Upload to Hostinger

1. Login to Hostinger hPanel → **Hosting** → **File Manager**
2. Navigate to your domain folder (e.g., `public_html/api/` or a subdomain)
3. Upload `backend.zip` and extract
4. Or use SSH: `unzip backend.zip`

### C. Set Environment Variables (.env)

Create `.env` file on the server:

```env
PORT=5000
MONGO_URI=mongodb+srv://your-connection-string
JWT_SECRET=your-secret-key-here
```

**Hostinger VPS mein .env kaise set karein:**

**Option 1: File Manager**
1. hPanel → File Manager → backend folder
2. Create new file → name: `.env`
3. Paste the env content above → Save

**Option 2: SSH Terminal**
```bash
cd /path/to/backend
nano .env
# Paste content, Ctrl+X, Y, Enter
```

**Option 3: Hostinger Node.js Panel (if available)**
1. hPanel → Advanced → Node.js
2. Select your app
3. "Environment Variables" section
4. Add each key-value pair:
   - `PORT` = `5000`
   - `MONGO_URI` = `your-mongo-uri`
   - `JWT_SECRET` = `your-secret`

### D. Install Dependencies & Start

```bash
cd /path/to/backend
npm install
npm start
```

For process manager (keeps running after SSH disconnect):
```bash
npm install -g pm2
pm2 start server.js --name "dks-backend"
pm2 save
pm2 startup
```

### E. Backend Environment Variables Reference

| Variable | Value | Description |
|----------|-------|-------------|
| PORT | 5000 | Server port |
| MONGO_URI | mongodb+srv://... | MongoDB Atlas connection string |
| JWT_SECRET | any-random-string | Token signing secret (keep secure) |

---

## STEP 2: Frontend Deployment (Next.js on Hostinger)

### A. Update API URL for Production

Before building, update `website/utils/api.js`:

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: "https://api.yourdomain.com/api",  // Change this to your production backend URL
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
```

Also update any hardcoded `http://localhost:5000` references in:
- `website/app/admin/dashboard/page.js` (API variable)
- `website/app/seo/page.js` (if any localhost references)

### B. Build the Project

```bash
cd website
npm install
npm run build
```

This creates a `.next` folder with the production build.

### C. Prepare website.zip

**Include these files/folders:**
```
website/
├── .next/           (production build)
├── public/          (static assets)
├── package.json
├── package-lock.json
├── next.config.js   (if exists)
└── node_modules/    (OR run npm install on server)
```

**Two deployment options:**

**Option A: Static Export (simpler for Hostinger shared hosting)**

Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
module.exports = nextConfig;
```

Then `npm run build` will create an `out/` folder — upload that to `public_html`.

**Option B: Node.js Server (Hostinger VPS)**

Upload the whole project → `npm install` → `npm start`

### D. Hostinger Shared Hosting (Static Export)

1. Build with `output: 'export'`
2. Upload contents of `out/` folder to `public_html/`
3. Done — works like any static website

### E. Hostinger VPS/Cloud (Node.js Server)

1. Upload website folder
2. `npm install`
3. `npm run build`
4. `npm start` (or use PM2)
5. Set up Nginx reverse proxy for port 3000

---

## STEP 3: Connect Frontend to Backend

### CORS Configuration

Update `backend/server.js` for production:

```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true,
}));
```

### Domain Setup

| Purpose | Subdomain | Points To |
|---------|-----------|-----------|
| Website | yourdomain.com | Frontend (port 3000 or static) |
| API | api.yourdomain.com | Backend (port 5000) |

---

## STEP 4: SSL & Final Setup

1. **SSL Certificate:** Enable in Hostinger hPanel → SSL → Install
2. **Force HTTPS:** Add redirect in `.htaccess` or Nginx config
3. **File Uploads:** Ensure `uploads/` folder has write permissions (`chmod 755`)
4. **Webhook URLs:** Update all platform webhooks to production domain

---

## Environment Variables Summary

### Backend (.env on server)
```env
PORT=5000
MONGO_URI=mongodb+srv://tech:sD0wJfOF1l1hwMmI@ac-fhvbazu-shard-00-00.di3spki.mongodb.net:27017,ac-fhvbazu-shard-00-01.di3spki.mongodb.net:27017,ac-fhvbazu-shard-00-02.di3spki.mongodb.net:27017/dks-website?ssl=true&replicaSet=atlas-9dctsw-shard-0&authSource=admin&retryWrites=true&w=majority
JWT_SECRET=blogSecretKey
```

### Frontend (update in code before build)
- `website/utils/api.js` → `baseURL: "https://api.yourdomain.com/api"`
- Dashboard pages → Replace `http://localhost:5000` with production URL

---

## Quick Checklist Before Deployment

- [ ] Update `utils/api.js` baseURL to production
- [ ] Replace all `localhost:5000` references with production URL
- [ ] Set `CORS` origin to your domain in server.js
- [ ] Create `.env` on server (don't upload local .env)
- [ ] Run `npm run build` for frontend
- [ ] Test login after deployment
- [ ] Set up webhooks with production URL
- [ ] Verify file upload works (uploads folder permissions)
- [ ] Enable SSL (HTTPS)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API not responding | Check if backend process is running (`pm2 status`) |
| CORS error | Update cors origin in server.js |
| Login not working | Check JWT_SECRET matches in .env |
| Images not loading | Check uploads folder permissions |
| 404 on refresh | Configure Nginx/Apache for SPA routing |
| Build fails | Delete `.next` folder and rebuild |

---

*Guide prepared for Hostinger deployment*
