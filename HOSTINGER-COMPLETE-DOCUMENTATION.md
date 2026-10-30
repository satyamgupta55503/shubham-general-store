# 🌐 Hostinger Deployment — Complete Documentation

> **Project:** DigiKraft Social (DKS Website)  
> **Date:** June 2026  
> **Stack:** Next.js 14 (Frontend) + Express.js (Backend) + MongoDB Atlas (Database)  
> **Hosting:** Hostinger VPS / Shared Hosting  
> **Domain:** digikraftsocial.com

---

## 📋 Table of Contents

1. [Project Overview & Structure](#project-overview--structure)
2. [Hostinger Hosting Plan Discussion](#hostinger-hosting-plan-discussion)
3. [Backend Deployment — Complete Process](#backend-deployment--complete-process)
4. [Frontend Deployment — Complete Process](#frontend-deployment--complete-process)
5. [Problems Faced & Solutions](#problems-faced--solutions)
6. [Environment Variables Setup](#environment-variables-setup)
7. [Domain & Subdomain Configuration](#domain--subdomain-configuration)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [CORS Configuration Issues](#cors-configuration-issues)
10. [PM2 Process Manager](#pm2-process-manager)
11. [File Upload Issues](#file-upload-issues)
12. [Webhook Configuration for Production](#webhook-configuration-for-production)
13. [GitHub Suspension Impact on Deployment](#github-suspension-impact-on-deployment)
14. [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
15. [Deployment Checklist](#deployment-checklist)
16. [Quick Reference Commands](#quick-reference-commands)
17. [Final Status & Notes](#final-status--notes)

---

## 1. Project Overview & Structure

### Kya Deploy Karna Hai

```
📁 DKS-WEBSITE/
├── 📁 backend/          → Node.js/Express API (Port 5000)
├── 📁 website/          → Next.js 14 Frontend (Port 3000)
├── backend-deploy.zip   → Backend deployment ready zip
├── backend_dks.zip      → Backend backup
├── dks-web_admin.zip    → Admin panel zip
└── dks_website.zip      → Website zip
```

### Architecture

```
[User Browser] → [digikraftsocial.com (Frontend - Next.js)]
                         ↓
              [backend.digikraftsocial.com (API - Express.js)]
                         ↓
              [MongoDB Atlas (Cloud Database)]
```

### Key Points
- Frontend aur Backend **alag-alag** deploy hote hain
- Database **MongoDB Atlas** pe hai (Hostinger pe nahi, cloud mein)
- Backend `.env` file manually server pe create karni hoti hai
- `node_modules/` kabhi upload nahi karna — server pe `npm install` karna

---

## 2. Hostinger Hosting Plan Discussion

### Konsa Plan Chahiye?

| Feature | Shared Hosting | VPS / Cloud |
|---------|---------------|-------------|
| Node.js Support | ⚠️ Limited (hPanel Node.js section) | ✅ Full SSH + PM2 |
| Custom Port | ❌ Not reliable | ✅ Port 5000, 3000 etc. |
| SSH Access | ❌ No / Limited | ✅ Full root access |
| Nginx Config | ❌ No control | ✅ Full control |
| PM2 Process Manager | ❌ Not possible | ✅ Works perfectly |
| Subdomain Reverse Proxy | ❌ Limited | ✅ Full control |
| **Price** | ₹150-300/month | ₹500-1500/month |

### Recommendation
- **VPS Plan** best hai agar Node.js backend + Next.js frontend dono chalane hain
- **Shared Hosting** sirf tab kaam aata hai agar frontend ko static export (`next export`) karo
- Backend ke liye VPS zaruri hai kyunki custom port + PM2 chahiye

### Discussion Summary
- Pehle shared hosting try kiya — Node.js support limited mili
- Phir VPS plan liya — full control mila (SSH, PM2, Nginx)
- Backend subdomain (`backend.digikraftsocial.com`) VPS pe point kiya
- Frontend main domain (`digikraftsocial.com`) pe

---

## 3. Backend Deployment — Complete Process

### Step 1: Backend Zip Prepare Karo

**Include:**
```
backend/
├── controllers/       (all controller files)
├── middleware/        (authMiddleware.js, upload.js)
├── models/           (all model files)
├── routes/           (all route files)
├── uploads/          (empty folder — .gitkeep)
├── config/           (db.js)
├── server.js
├── package.json
└── package-lock.json
```

**Exclude:**
- ❌ `node_modules/` (10,000+ files — server pe install hoga)
- ❌ `.env` (secrets expose honge — manually create karo)
- ❌ `.git/` (unnecessary)

### Step 2: Upload to Hostinger VPS

**Method 1: File Manager**
1. Hostinger hPanel → File Manager
2. Navigate to `/home/username/` ya `/var/www/`
3. Upload `backend.zip`
4. Extract

**Method 2: SSH (Recommended)**
```bash
# SSH connect
ssh root@your-vps-ip

# Create directory
mkdir -p /var/www/dks-backend
cd /var/www/dks-backend

# Upload via SCP (from local machine)
scp backend.zip root@your-vps-ip:/var/www/dks-backend/

# Extract
unzip backend.zip
```

### Step 3: Install Dependencies

```bash
cd /var/www/dks-backend
npm install
```

### Step 4: Create .env File

```bash
nano .env
```

Content:
```env
PORT=5000
MONGO_URI=mongodb+srv://tech:sD0wJfOF1l1hwMmI@ac-fhvbazu-shard-00-00.di3spki.mongodb.net:27017,ac-fhvbazu-shard-00-01.di3spki.mongodb.net:27017,ac-fhvbazu-shard-00-02.di3spki.mongodb.net:27017/dks-website?ssl=true&replicaSet=atlas-9dctsw-shard-0&authSource=admin&retryWrites=true&w=majority
JWT_SECRET=blogSecretKey
```

### Step 5: Start with PM2

```bash
npm install -g pm2
pm2 start server.js --name "dks-backend"
pm2 save
pm2 startup    # Auto-restart on server reboot
```

### Step 6: Verify

```bash
pm2 status               # Check running status
pm2 logs dks-backend     # Check logs for errors
curl http://localhost:5000/api/posts   # Test API locally
```

---

## 4. Frontend Deployment — Complete Process

### Option A: Static Export (Shared Hosting)

**Step 1:** Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
};
module.exports = nextConfig;
```

**Step 2:** Update API URL in `website/utils/api.js`:
```javascript
const API = axios.create({
  baseURL: "https://backend.digikraftsocial.com/api",
});
```

**Step 3:** Build:
```bash
cd website
npm run build
```

**Step 4:** Upload `out/` folder contents to Hostinger `public_html/`

**Limitation:** Static export mein dynamic routes aur API routes kaam nahi karte

---

### Option B: Node.js Server (VPS — Recommended)

**Step 1:** Update API URL:
```javascript
// website/utils/api.js
const API = axios.create({
  baseURL: "https://backend.digikraftsocial.com/api",
});
```

**Step 2:** Upload to VPS:
```bash
mkdir -p /var/www/dks-frontend
cd /var/www/dks-frontend
# Upload website files (without node_modules)
npm install
npm run build
```

**Step 3:** Start with PM2:
```bash
pm2 start npm --name "dks-frontend" -- start
pm2 save
```

**Step 4:** Configure Nginx reverse proxy (port 3000 → domain)

---

## 5. Problems Faced & Solutions

### Problem 1: Node.js Shared Hosting mein Kaam Nahi Kar Raha

**Issue:** Hostinger shared hosting mein Node.js apps properly nahi run hote — custom ports nahi milte, PM2 nahi chalta

**Root Cause:** Shared hosting ka limited environment — custom port binding restricted hai

**Solution:**
- VPS plan liya jahan full SSH access mila
- Custom ports (5000, 3000) freely use kar sakte hain
- PM2 install karke process persistent banaya

---

### Problem 2: CORS Error — Frontend se Backend Connect Nahi Ho Raha

**Issue:** Browser mein "Access-Control-Allow-Origin" error aa raha tha

**Root Cause:** Backend `server.js` mein CORS origin localhost tha, production domain nahi

**Solution:** `server.js` mein CORS update kiya:
```javascript
app.use(cors({
  origin: [
    'https://digikraftsocial.com',
    'https://www.digikraftsocial.com',
    'https://backend.digikraftsocial.com',
    'http://localhost:3000'   // Development ke liye
  ],
  credentials: true,
}));
```

---

### Problem 3: API URL localhost References

**Issue:** Deployment ke baad bhi kuch pages `http://localhost:5000` call kar rahe the

**Root Cause:** Multiple files mein hardcoded localhost URLs the

**Files Affected:**
- `website/utils/api.js` (main API config)
- `website/app/admin/dashboard/page.js`
- `website/app/seo/page.js`

**Solution:** Sabhi files mein `localhost:5000` ko production URL se replace kiya:
```
http://localhost:5000 → https://backend.digikraftsocial.com
```

---

### Problem 4: .env File Missing on Server

**Issue:** Server start hone ke baad "Cannot connect to MongoDB" error

**Root Cause:** `.env` file locally thi lekin server pe nahi banayi

**Solution:**
1. SSH se server pe login
2. `nano .env` se file create ki
3. MONGO_URI, PORT, JWT_SECRET add kiya
4. PM2 restart kiya: `pm2 restart dks-backend`

---

### Problem 5: Uploads Folder Permission Denied

**Issue:** Admin panel se image upload karne pe error: "Permission denied"

**Root Cause:** `uploads/` folder ki write permission nahi thi server pe

**Solution:**
```bash
chmod 755 /var/www/dks-backend/uploads
# Ya agar abhi bhi issue ho:
chmod 777 /var/www/dks-backend/uploads
```

---

### Problem 6: Backend Process Kill Ho Jata Hai (SSH Disconnect pe)

**Issue:** SSH session close karne ke baad backend band ho jata tha

**Root Cause:** Normal `npm start` foreground process hota hai — SSH close = process kill

**Solution:** PM2 process manager install kiya:
```bash
npm install -g pm2
pm2 start server.js --name "dks-backend"
pm2 save
pm2 startup   # System reboot pe auto-start
```

---

### Problem 7: 404 Error on Page Refresh (Next.js)

**Issue:** Browser mein kisi bhi page ko refresh karne pe 404 aa raha tha

**Root Cause:** Next.js client-side routing use karta hai — server ko pata nahi hota ki route exist karta hai

**Solution:** Nginx mein SPA fallback configure kiya:
```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

### Problem 8: SSL Certificate Not Working

**Issue:** HTTPS enable karne ke baad "Not Secure" dikha raha tha

**Root Cause:** SSL certificate install hua tha lekin Nginx mein SSL config nahi thi

**Solution:**
1. Hostinger hPanel → SSL → Install (Let's Encrypt free)
2. Nginx config update:
```nginx
server {
    listen 443 ssl;
    server_name digikraftsocial.com;
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    # ... rest config
}

server {
    listen 80;
    server_name digikraftsocial.com;
    return 301 https://$host$request_uri;
}
```

---

### Problem 9: MongoDB Connection Timeout

**Issue:** Server start hota tha lekin MongoDB se connect nahi ho raha tha

**Root Cause:** Hostinger VPS ka IP MongoDB Atlas whitelist mein nahi tha

**Solution:**
1. MongoDB Atlas → Network Access
2. Add IP: `0.0.0.0/0` (allow from anywhere) ya specific VPS IP
3. Restart backend: `pm2 restart dks-backend`

---

### Problem 10: Build Failed — Memory Issue

**Issue:** `npm run build` karte waqt "JavaScript heap out of memory"

**Root Cause:** VPS mein RAM kam thi (1GB plan) aur Next.js build heavy hai

**Solution:**
```bash
# Memory limit increase karke build
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Ya swap memory add karo:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

### Problem 11: Webhook URL Not Reachable

**Issue:** Telegram/WhatsApp webhook set karne pe "URL not reachable" error

**Root Cause:** Webhooks ko publicly accessible HTTPS URL chahiye — localhost pe nahi chalte

**Solution:**
1. Pehle backend production pe deploy kiya
2. SSL enable kiya (HTTPS mandatory for webhooks)
3. Webhook URLs update kiye:
   - Telegram: `https://backend.digikraftsocial.com/api/telegram/webhook`
   - WhatsApp: `https://backend.digikraftsocial.com/api/messaging/whatsapp/webhook`
   - Facebook: `https://backend.digikraftsocial.com/api/messaging/facebook/webhook`
   - Instagram: `https://backend.digikraftsocial.com/api/messaging/instagram/webhook`

---

### Problem 12: GitHub Account Suspended — Code Access Lost

**Issue:** GitHub account suspend ho gaya — deployment ke liye code pull nahi ho raha

**Root Cause:** GitHub Terms of Service violation (possible reasons: copyrighted content, automated activity, payment failure, account compromise)

**Impact on Deployment:**
- ❌ Server pe `git pull` karna possible nahi
- ❌ CI/CD pipeline blocked
- ✅ Local code safe hai

**Solution:**
1. Local code se manually zip banake deploy kiya
2. GitHub support ko contact kiya (recovery process)
3. Backup plan: GitLab pe migrate karne ka plan
4. Future: Multiple backup locations maintain karna

---

## 6. Environment Variables Setup

### Backend .env (Server pe Create Karo)

```env
PORT=5000
MONGO_URI=mongodb+srv://tech:sD0wJfOF1l1hwMmI@ac-fhvbazu-shard-00-00.di3spki.mongodb.net:27017,ac-fhvbazu-shard-00-01.di3spki.mongodb.net:27017,ac-fhvbazu-shard-00-02.di3spki.mongodb.net:27017/dks-website?ssl=true&replicaSet=atlas-9dctsw-shard-0&authSource=admin&retryWrites=true&w=majority
JWT_SECRET=blogSecretKey
```

### Hostinger pe .env Set Karne ke 3 Tarike

**Method 1: File Manager (Easy)**
1. hPanel → File Manager → backend folder
2. Create new file → name: `.env`
3. Paste content → Save

**Method 2: SSH Terminal (Best)**
```bash
cd /var/www/dks-backend
nano .env
# Paste, Ctrl+X, Y, Enter
```

**Method 3: Hostinger Node.js Panel (if available)**
1. hPanel → Advanced → Node.js
2. Select app
3. Environment Variables section
4. Add each key-value pair manually

### Important Notes:
- ⚠️ `.env` file **KABHI** zip mein nahi daalni — server pe manually create karo
- ⚠️ `.env` **KABHI** Git mein push nahi karni
- ✅ `.gitignore` mein `.env` already listed hai

---

## 7. Domain & Subdomain Configuration

### Current Setup

| Purpose | Domain | Points To | Port |
|---------|--------|-----------|------|
| Website (Frontend) | digikraftsocial.com | VPS IP → Nginx → localhost:3000 | 3000 |
| Website (www) | www.digikraftsocial.com | Same as above | 3000 |
| API (Backend) | backend.digikraftsocial.com | VPS IP → Nginx → localhost:5000 | 5000 |

### Hostinger DNS Setup

1. hPanel → Domains → DNS Zone
2. Add A record:
   - `@` → VPS IP address
   - `www` → VPS IP address
   - `backend` → VPS IP address
3. Wait 15-30 minutes for DNS propagation

### Verify DNS

```bash
nslookup digikraftsocial.com
nslookup backend.digikraftsocial.com
ping digikraftsocial.com
```

---

## 8. SSL Certificate Setup

### Hostinger Free SSL (Let's Encrypt)

**Method 1: hPanel (Easiest)**
1. hPanel → SSL → Install
2. Select domain
3. Auto-install hota hai

**Method 2: Certbot (VPS)**
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d digikraftsocial.com -d www.digikraftsocial.com -d backend.digikraftsocial.com

# Auto-renew test
sudo certbot renew --dry-run
```

### Force HTTPS Redirect

Nginx config mein:
```nginx
server {
    listen 80;
    server_name digikraftsocial.com www.digikraftsocial.com;
    return 301 https://$host$request_uri;
}
```

---

## 9. CORS Configuration Issues

### Problem
Frontend (`digikraftsocial.com`) se backend (`backend.digikraftsocial.com`) ko call karne pe CORS block hota tha

### Current Working CORS Config (server.js)

```javascript
app.use(cors({
  origin: [
    'https://digikraftsocial.com',
    'https://www.digikraftsocial.com',
    'https://backend.digikraftsocial.com',
    'http://localhost:3000'
  ],
  credentials: true,
}));
```

### Key Points:
- `credentials: true` zaroori hai — JWT token cookies ke liye
- Localhost bhi rakhna padta hai development ke liye
- Agar naya subdomain add karo toh yahan add karna mat bhoolna

---

## 10. PM2 Process Manager

### Kyu Chahiye?
- SSH disconnect hone pe bhi backend chalta rahe
- Server reboot pe auto-start ho
- Crash hone pe auto-restart kare
- Logs manage kare

### Setup Commands

```bash
# Install globally
npm install -g pm2

# Start backend
pm2 start server.js --name "dks-backend"

# Start frontend (Next.js)
pm2 start npm --name "dks-frontend" -- start

# Save process list
pm2 save

# Enable auto-start on reboot
pm2 startup
# (Copy-paste the command it outputs)
```

### Useful PM2 Commands

| Command | Purpose |
|---------|---------|
| `pm2 status` | Sabhi processes ka status |
| `pm2 logs` | Live logs dekho |
| `pm2 logs dks-backend` | Specific process logs |
| `pm2 restart dks-backend` | Restart backend |
| `pm2 restart all` | Restart everything |
| `pm2 stop dks-backend` | Stop process |
| `pm2 delete dks-backend` | Remove from PM2 |
| `pm2 monit` | Real-time monitoring |
| `pm2 flush` | Clear all logs |

### Auto-Restart on Crash

PM2 automatically restart karta hai agar app crash ho. Agar baar baar crash ho raha hai:
```bash
pm2 logs dks-backend --lines 50    # Last 50 lines check karo
```

---

## 11. File Upload Issues

### Problem
Admin panel se images upload nahi ho rahi thi

### Causes & Solutions

| Cause | Solution |
|-------|----------|
| Folder permission | `chmod 755 uploads/` |
| Folder doesn't exist | `mkdir -p /var/www/dks-backend/uploads` |
| Disk full | `df -h` check karo, purani files delete karo |
| Nginx file size limit | Nginx config mein `client_max_body_size 10M;` add karo |
| Multer config issue | Check `middleware/upload.js` |

### Nginx mein File Size Limit Fix

```nginx
server {
    # ... other config
    client_max_body_size 10M;   # Maximum 10MB upload allow
}
```

### Verify Uploads Working

```bash
# Check folder exists
ls -la /var/www/dks-backend/uploads/

# Check permissions
stat /var/www/dks-backend/uploads/

# Fix if needed
chmod 755 /var/www/dks-backend/uploads/
chown www-data:www-data /var/www/dks-backend/uploads/
```

---

## 12. Webhook Configuration for Production

### Webhook URLs (Production)

| Platform | Webhook URL |
|----------|------------|
| Telegram | `https://backend.digikraftsocial.com/api/telegram/webhook` |
| WhatsApp | `https://backend.digikraftsocial.com/api/messaging/whatsapp/webhook` |
| Facebook | `https://backend.digikraftsocial.com/api/messaging/facebook/webhook` |
| Instagram | `https://backend.digikraftsocial.com/api/messaging/instagram/webhook` |

### Requirements for Webhooks:
- ✅ HTTPS mandatory (SSL certificate active hona chahiye)
- ✅ Publicly accessible URL (localhost nahi chalega)
- ✅ Backend running & responding (PM2 se stable)
- ✅ Correct verify token (WhatsApp/Facebook ke liye)

### Telegram Webhook Set Karna
```bash
# Admin panel se: Integrations → Telegram → Settings → Set Webhook
# Ya manually:
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://backend.digikraftsocial.com/api/telegram/webhook"
```

---

## 13. GitHub Suspension Impact on Deployment

### Kya Hua
- 7 June 2026 ko GitHub account suspend hua
- Company ke saare repositories inaccessible ho gaye
- `git pull` se code update karna blocked

### Deployment pe Impact
- ❌ Server pe `git pull origin main` nahi kar sakte
- ❌ CI/CD (agar setup tha) completely blocked
- ✅ Local code safe hai — manually deploy kar sakte hain

### Workaround (Current)
1. Local machine pe code hai → zip banate hain
2. SCP/File Manager se upload karte hain
3. Server pe extract → npm install → pm2 restart

### Long-term Plan
- GitHub support se account recovery
- GitLab/Bitbucket pe backup repos maintain karna
- Manual zip-based deployment continue karna jab tak resolve na ho

---

## 14. Nginx Reverse Proxy Setup

### Full Nginx Configuration

**File:** `/etc/nginx/sites-available/digikraftsocial.com`

```nginx
# Frontend - Main Domain
server {
    listen 443 ssl;
    server_name digikraftsocial.com www.digikraftsocial.com;

    ssl_certificate /etc/letsencrypt/live/digikraftsocial.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/digikraftsocial.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Backend - API Subdomain
server {
    listen 443 ssl;
    server_name backend.digikraftsocial.com;

    ssl_certificate /etc/letsencrypt/live/backend.digikraftsocial.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/backend.digikraftsocial.com/privkey.pem;

    client_max_body_size 10M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static uploads folder
    location /uploads/ {
        alias /var/www/dks-backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}

# HTTP to HTTPS Redirect
server {
    listen 80;
    server_name digikraftsocial.com www.digikraftsocial.com backend.digikraftsocial.com;
    return 301 https://$host$request_uri;
}
```

### Nginx Commands

```bash
# Config test
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Enable site
sudo ln -s /etc/nginx/sites-available/digikraftsocial.com /etc/nginx/sites-enabled/

# Check status
sudo systemctl status nginx
```

---

## 15. Deployment Checklist

### Pre-Deployment ✅

- [ ] `utils/api.js` mein baseURL production pe set kiya
- [ ] Sabhi `localhost:5000` references replace kiye
- [ ] `server.js` mein CORS origins production domains add kiye
- [ ] `.env` file zip mein nahi hai
- [ ] `node_modules/` zip mein nahi hai
- [ ] Frontend build successful: `npm run build`

### Server Setup ✅

- [ ] VPS pe SSH access working
- [ ] Node.js install hai: `node -v`
- [ ] PM2 install hai: `pm2 -v`
- [ ] Nginx install hai: `nginx -v`
- [ ] MongoDB Atlas mein VPS IP whitelist kiya

### Backend Deployment ✅

- [ ] Backend files upload kiye
- [ ] `npm install` successful
- [ ] `.env` file create ki (server pe)
- [ ] PM2 se start kiya: `pm2 start server.js --name "dks-backend"`
- [ ] API test: `curl http://localhost:5000/api/posts`
- [ ] PM2 save + startup configured

### Frontend Deployment ✅

- [ ] Frontend files upload kiye
- [ ] `npm install` successful
- [ ] `npm run build` successful
- [ ] PM2 se start kiya
- [ ] Website accessible on domain

### Post-Deployment ✅

- [ ] SSL certificate install kiya (HTTPS working)
- [ ] Nginx reverse proxy configured
- [ ] HTTP → HTTPS redirect working
- [ ] Login test kiya (JWT working)
- [ ] Image upload test kiya
- [ ] Webhook URLs set kiye (Telegram, WhatsApp, etc.)
- [ ] All social integrations verified
- [ ] `uploads/` folder permissions correct

---

## 16. Quick Reference Commands

### SSH Connect
```bash
ssh root@<VPS-IP>
```

### Backend Manage
```bash
cd /var/www/dks-backend
pm2 restart dks-backend      # Restart
pm2 logs dks-backend         # Logs dekho
pm2 status                   # Status check
```

### Frontend Manage
```bash
cd /var/www/dks-frontend
pm2 restart dks-frontend     # Restart
pm2 logs dks-frontend        # Logs dekho
```

### Update Code (Manual — GitHub suspended)
```bash
# Local machine se:
scp new-backend.zip root@<VPS-IP>:/var/www/dks-backend/

# Server pe:
cd /var/www/dks-backend
pm2 stop dks-backend
unzip -o new-backend.zip      # -o = overwrite
npm install                    # New dependencies ke liye
pm2 start dks-backend
```

### Nginx
```bash
sudo nginx -t                  # Config test
sudo systemctl restart nginx   # Restart
sudo systemctl status nginx    # Status
```

### SSL Renew
```bash
sudo certbot renew             # Auto-renew check
sudo certbot renew --force-renewal  # Force renew
```

### Logs & Debugging
```bash
pm2 logs --lines 100          # Last 100 lines
pm2 monit                     # Real-time monitoring
sudo tail -f /var/log/nginx/error.log   # Nginx errors
```

---

## 17. Final Status & Notes

### Current Deployment Status

| Component | Status | Location |
|-----------|--------|----------|
| Frontend | ✅ Running | digikraftsocial.com (Port 3000) |
| Backend | ✅ Running | backend.digikraftsocial.com (Port 5000) |
| Database | ✅ Cloud | MongoDB Atlas |
| SSL | ✅ Active | Let's Encrypt |
| PM2 | ✅ Configured | Auto-restart on crash/reboot |
| Nginx | ✅ Configured | Reverse proxy + HTTPS |

### Important Reminders

1. **Code Update karna ho:** Zip upload → extract → `npm install` → `pm2 restart`
2. **New .env variable add karna ho:** SSH → `nano .env` → add → `pm2 restart`
3. **Domain change karna ho:** DNS A record update + Nginx config update + SSL regenerate
4. **Backup:** Regularly `.env` aur `uploads/` folder ka backup lo
5. **Monitoring:** `pm2 monit` se real-time check karo

### Key Contacts / Resources

| Resource | Link/Info |
|----------|-----------|
| Hostinger hPanel | https://hpanel.hostinger.com |
| MongoDB Atlas | https://cloud.mongodb.com |
| Let's Encrypt | https://letsencrypt.org |
| PM2 Docs | https://pm2.keymetrics.io |
| GitHub Support | https://support.github.com/contact |
| Domain | digikraftsocial.com |

---

> **📝 Note:** Ye document continuously update hota rahega jaise-jaise naye issues aur solutions aayenge. Last updated: June 2026

---

*Document prepared for DigiKraft Social — Hostinger VPS Deployment*
