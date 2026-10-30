# Subham General Store

Dual grocery marketplace — **retail (footkar)** + **wholesale (thok)** — built with Next.js and Express/MongoDB. Includes a customer storefront plus four admin portals: **CMS**, **CRM**, **HRM**, and **EMP**.

## Monorepo Structure

```
subham-general-store/
├── backend/     # Express + MongoDB REST API (port 5000)
└── website/     # Next.js 14 frontend — store + all admin panels (port 3000)
```

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Auth:** JWT (per-portal secrets), bcrypt password hashing

## Features

- Dual pricing — retail & wholesale rates per product
- CMS-controlled homepage with image upload
- Customer registration + admin approval flow
- Order tracking with status timeline (date + time + notes)
- Ledger / Khata (jama / baaki) for credit customers
- CRM quotations & invoices that can be linked and **sent** to store customers (subject + message), visible in the customer's profile with PDF download
- Responsive on mobile & desktop

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB connection string

### 1. Backend

```bash
cd backend
npm install
# create a .env file (see backend/.env.production.example)
npm start          # runs on http://localhost:5000
```

Required env variables (`backend/.env`):

```
MONGO_URI=...
JWT_SECRET=...
JWT_CRM_SECRET=...
JWT_HRM_SECRET=...
JWT_EMP_SECRET=...
JWT_CUSTOMER_SECRET=...
```

### 2. Frontend

```bash
cd website
npm install
# create .env.local
npm run dev        # runs on http://localhost:3000
```

Required env variable (`website/.env.local`):

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Deployment (Vercel)

- **Frontend (`website/`)** deploys to Vercel. Set the project **Root Directory** to `website` and add the env var `NEXT_PUBLIC_BACKEND_URL` pointing to your deployed backend URL.
- **Backend (`backend/`)** should be deployed to a Node host (Render, Railway, or Vercel serverless). Set all `JWT_*` secrets and `MONGO_URI` in that host's environment.

> **Note:** `.env` and `.env.local` are git-ignored and must never be committed. Configure secrets directly in your hosting provider.

## Documentation

Full Hindi documentation (business flow, user flow, modules) is in `DOCUMENTATION-HINDI.md` (also exported as `.docx` and `.pdf`).

---

*Powered by Subham Gupta*
