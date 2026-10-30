# Subham General Store — All Credentials & Project Reference

> **Confidential — Internal Use Only**
> Last Updated: October 2026
> ✅ Credentials updated in DB via `node scripts/updateCredentials.js`

---

## 🌐 URLs

### Local Development
| Service | URL |
|---------|-----|
| 🛒 Store Homepage | http://localhost:3000 |
| 📦 Products | http://localhost:3000/products |
| 🗂️ Categories | http://localhost:3000/categories |
| 🛒 Cart | http://localhost:3000/cart |
| ✅ Checkout | http://localhost:3000/checkout |
| 👤 My Account | http://localhost:3000/account |
| 🔑 Customer Login | http://localhost:3000/account/login |
| 📋 My Orders | http://localhost:3000/account/orders |
| ❤️ Wishlist | http://localhost:3000/account/wishlist |
| 🔗 **Admin Portal Hub** | **http://localhost:3000/login** |
| 📝 CMS Admin | http://localhost:3000/admin/login |
| 💼 CRM | http://localhost:3000/crm/login |
| 👥 HRM | http://localhost:3000/hrm/login |
| 👤 EMP | http://localhost:3000/emp/login |
| ⚙️ Backend API | http://localhost:5000/api |

### Production
| Service | URL |
|---------|-----|
| 🛒 Store | https://www.subhamgeneralstore.com |
| 🔗 Admin Hub | https://www.subhamgeneralstore.com/login |

---

## 🚀 How to Run

```bash
# Terminal 1 — Backend (Port 5000)
cd backend
npm start

# Terminal 2 — Frontend (Port 3000)
cd website
npm run dev
```

---

## 🗄️ Database — MongoDB Atlas (Subham Gupta)

| Field | Value |
|-------|-------|
| Cluster | subhamgupta.lfaoxtc.mongodb.net |
| Username | hackhubhero_db_user |
| Password | YkIGjcLtkS3qrWjM |

---

## 📝 CMS Portal — Content Management

| Field | Value |
|-------|-------|
| **URL** | http://localhost:3000/admin/login |
| **Email** | `admin@subhamstore.com` |
| **Password** | `SubhamStore@2026` |
| **Role** | superadmin |

**Store Sections in CMS Sidebar:**
- `/admin/store/products` — Products CRUD
- `/admin/store/categories` — Grocery categories
- `/admin/store/orders` — Order management
- `/admin/store/customers` — Customer list

---

## 💼 CRM Portal — Client Management

| Field | Value |
|-------|-------|
| **URL** | http://localhost:3000/crm/login |
| **Email** | `crm@subhamstore.com` |
| **Password** | `CRM@Subham2026` |
| **Role** | owner |

---

## � HRM Portal — HR Management

| Field | Value |
|-------|-------|
| **URL** | http://localhost:3000/hrm/login |
| **Email** | `hrm@subhamstore.com` |
| **Password** | `HRM@Subham2026` |
| **Role** | hr_admin |

---

## � EMP Portal — Employee Self-Service

| Field | Value |
|-------|-------|
| **URL** | http://localhost:3000/emp/login |
| **Email** | `emp@subhamstore.com` |
| **Password** | `EMP@Subham2026` |
| **Employee ID** | SGS-EMP-001 |

---

## 🛒 Customer Portal (Store)

Customers self-register at:
- **Register:** http://localhost:3000/account/register
- **Login:** http://localhost:3000/account/login

Guest cart auto-merges on login.

---

## 🔑 JWT Secrets (backend/.env)

| Key | Purpose |
|-----|---------|
| `JWT_SECRET` | CMS admin |
| `JWT_CRM_SECRET` | CRM portal |
| `JWT_HRM_SECRET` | HRM portal |
| `JWT_EMP_SECRET` | EMP portal |
| `JWT_CUSTOMER_SECRET` | Store customers |

---

## 🔄 Update Credentials Again

```bash
cd backend
node scripts/updateCredentials.js
```

Edit `backend/scripts/updateCredentials.js` → change the `NEW_CREDS` object → re-run.

---

## 📁 Quick File Reference

| File | Purpose |
|------|---------|
| `backend/.env` | DB URI + JWT secrets |
| `backend/scripts/updateCredentials.js` | Credential updater script |
| `website/styles/store-globals.css` | All responsive CSS |
| `website/app/layout.js` | Root layout + metadata |
| `website/context/CustomerAuthContext.js` | Customer auth state |
| `website/context/CartContext.js` | Cart + guest merge |

---

*Subham General Store · Powered by Subham Gupta · October 2026*
