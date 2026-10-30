# Subham General Store — Sampurna Dastavez (Documentation)

> **Project ka Naam:** Subham General Store (Dual Grocery Marketplace)
> **Technology:** Next.js 14 (Frontend) + Node.js / Express + MongoDB (Backend)
> **Bhasha:** Hindi (Roman) — Word me convert karne ke liye taiyaar
> **Antim Update:** October 2026

---

## Vishay Suchi (Table of Contents)

1. [Project ka Parichay](#1-project-ka-parichay)
2. [System Architecture (Taknik Dhancha)](#2-system-architecture)
3. [User ke Prakaar (Roles)](#3-user-ke-prakaar-roles)
4. [Module Suchi — Ek Nazar Me](#4-module-suchi-ek-nazar-me)
5. [Module 1: Store Website (Grocery Marketplace)](#5-module-1-store-website)
6. [Module 2: Customer Account (Grahak Khata)](#6-module-2-customer-account)
7. [Module 3: CMS Admin Panel](#7-module-3-cms-admin-panel)
8. [Module 4: CRM Portal](#8-module-4-crm-portal)
9. [Module 5: HRM Portal](#9-module-5-hrm-portal)
10. [Module 6: EMP Portal (Karmchari)](#10-module-6-emp-portal)
11. [Business Flow (Vyapaar Prakriya)](#11-business-flow)
12. [User Flow (Grahak Yatra)](#12-user-flow)
13. [Khaas Feature: Order Tracking](#13-khaas-feature-order-tracking)
14. [Khaas Feature: Ledger / Khata](#14-khaas-feature-ledger-khata)
15. [Khaas Feature: Quotation / Invoice ka Customer Link](#15-khaas-feature-quotation-invoice)
16. [Login Credentials (Guptaniya)](#16-login-credentials)
17. [Project Chalane ka Tarika](#17-project-chalane-ka-tarika)

---

## 1. Project ka Parichay

Subham General Store ek **dual grocery marketplace** hai — yaani ek hi platform par **do tarah ki bikri** hoti hai:

| Prakaar | Hindi Naam | Vivaran |
|---------|-----------|---------|
| **Retail** | Footkar | Aam grahak ke liye — chhoti matra me saaman, aam (retail) daam par |
| **Wholesale** | Thok | Dukandar / bade khareedar ke liye — bulk me saaman, kam (thok) daam par |

Platform me ek **customer-facing online store** hai (jahan log saaman khareedte hain) aur **chaar alag-alag admin portals** hain (CMS, CRM, HRM, EMP) jinse poora business sambhala jaata hai.

### Mukhya Visheshtaayein (Key Highlights)
- Dual pricing — ek hi product retail aur wholesale dono daam par
- CMS se control hone wala homepage (image upload ke saath)
- Grahak approval system — naya grahak register karta hai, admin approve karta hai, tabhi login hota hai
- Ledger / Khata (jama-baaki) — udhaar ka paardarshi (transparent) hisaab, grahak aur admin dono ko dikhe
- Order tracking — har order ka status date-time ke saath
- CRM se grahak ko quotation / invoice bhejna — subject + message ke saath
- Poora system mobile + desktop dono par responsive

---

## 2. System Architecture

### Do Mukhya Hisse

| Hissa | Folder | Port | Kaam |
|-------|--------|------|------|
| **Frontend** | `website` | 3000 | Website + saare admin panels (Next.js) |
| **Backend** | `backend` | 5000 | API + Database connection (Express) |

### Database
- **MongoDB Atlas** (cloud database)
- Har portal ke alag collections — jaise `crm_`, store ke alag, HRM ke alag

### Suraksha (Security)
- Har portal ka alag **JWT token secret** — ek portal ka token doosre me nahi chalta (portal isolation)
- Password **hashed** form me store hote hain (bcrypt)
- Role-based access control (RBAC) — kaun kya kar sakta hai, role se tay hota hai

---

## 3. User ke Prakaar (Roles)

| Role | Kahan Login | Kya Kar Sakta Hai |
|------|-------------|-------------------|
| **Customer (Grahak)** | Store | Saaman khareedna, order, khata dekhna, quotation/invoice dekhna |
| **Superadmin** | CMS | Sab kuch — full access |
| **Admin** | CMS | Content + store management |
| **CRM Owner / Manager** | CRM | Client, quotation, invoice, payment, ledger |
| **CRM Accountant** | CRM | Finance — invoice, payment dekhna |
| **HR Admin** | HRM | Employee, attendance, payroll, leave |
| **Employee (Karmchari)** | EMP | Apni attendance, salary slip, leave, task |

---

## 4. Module Suchi — Ek Nazar Me

| # | Module | Submodule (Mukhya Pages) |
|---|--------|--------------------------|
| 1 | **Store Website** | Homepage, Products, Categories, Cart, Checkout |
| 2 | **Customer Account** | Profile, Orders, Order Tracking, Quotations, Invoices, Addresses, Wishlist, Khata |
| 3 | **CMS Admin** | Dashboard, Homepage Editor, Products, Categories, Orders, Customers, Ledger, Sent Documents, Enquiries, Logs, Users |
| 4 | **CRM Portal** | Dashboard, Clients, Projects, Quotations, Invoices, Payments, Proposals, Ledger, Follow-ups, Reports, Settings |
| 5 | **HRM Portal** | Dashboard, Employees, Attendance, Leaves, Payroll, Departments, Holidays, Reports, Announcements |
| 6 | **EMP Portal** | Dashboard, Attendance, Salary, Leaves, Tasks, Team, Profile |

---

## 5. Module 1: Store Website

Ye wo hissa hai jo aam grahak dekhta hai — grocery khareedne ke liye.

### Submodule 1.1: Homepage
- **Vivaran:** Store ka mukhya pehla page. Poora **CMS se control** hota hai — admin hero image, offer banner, text sab badal sakta hai.
- **Mini-module:**
  - Hero Section (badi image + heading)
  - Offer Banners (special deals)
  - Category highlights (shop by category)
  - Featured products (chuninda saaman)
  - Why Choose Us (hamari khaasiyat)
  - Testimonials (grahak ki rai)

### Submodule 1.2: Products (Saaman)
- **Vivaran:** Saare products ki list, search aur filter ke saath.
- **Mini-module:**
  - Product listing (grid me saaman)
  - Product detail page (ek saaman ki poori jankari)
  - **Dual pricing** — retail grahak ko footkar daam, approved wholesale grahak ko thok daam
  - Add to Cart (login zaroori — bina login cart me add karne par login page khulta hai)

### Submodule 1.3: Categories (Shreniyaan)
- **Vivaran:** Saaman ko shreni ke hisaab se dekhna — jaise Vegetables, Fruits, Dairy, Snacks, Beverages, Staples.
- **Mini-module:** Category page + us category ke products

### Submodule 1.4: Cart (Tokri)
- **Vivaran:** Jo saaman grahak ne chuna, uski list + total daam.
- **Mini-module:** Quantity badalna, saaman hatana, total dekhna, checkout par jana

### Submodule 1.5: Checkout
- **Vivaran:** Order final karna — pata (address) + payment tarika chunna.
- **Mini-module:** Delivery address, payment method (COD / online), order confirm

### Submodule 1.6: Policy Pages (Niyam)
- **Vivaran:** Grahak ki jankari ke liye niyam-shartein.
- **Mini-module:**
  - Privacy Policy (gopniyta niti)
  - Terms & Conditions (niyam-shartein)
  - Return & Refund Policy (vapasi niti)
- **Footer** me in sabke link + Subham General Store branding

---

## 6. Module 2: Customer Account

Login kiye hue grahak ka personal area.

### Submodule 2.1: My Profile (Mera Khata)
- **Vivaran:** Grahak ki jankari — naam, email, phone, account type (retail/wholesale).
- **Mini-module:** Profile edit, stats (total orders, total spent)

### Submodule 2.2: My Orders (Mere Order)
- **Vivaran:** Grahak ke saare order — status filter ke saath (Placed, Processing, Shipped, Delivered, Cancelled).

### Submodule 2.3: Order Tracking (Order ka Track)
- **Vivaran:** Ek order kis stage par hai, yeh visual progress bar me dikhta hai.
- **Mini-module:**
  - Progress tracker (Placed → Confirmed → Processing → Shipped → Out for Delivery → Delivered)
  - **Tracking Updates timeline** — har update date + time + admin ka note ke saath
  - Tracking number + estimated delivery date
  - Cancel order (sirf early stage par)

### Submodule 2.4: My Quotations (Mere Quotation)
- **Vivaran:** CRM se bheje gaye quotation yahan dikhte hain (sirf jab send kiye gaye hon).
- **Mini-module:**
  - Quotation list (number, date, status, total)
  - Store ka message (subject + description)
  - **View & Download PDF** — poora quotation A4 PDF me

### Submodule 2.5: My Invoices (Mere Invoice)
- **Vivaran:** CRM se bheje gaye invoice — paid / due balance ke saath.
- **Mini-module:**
  - Invoice list (number, date, due date, status, total)
  - Paid / Balance Due dikhata hai
  - **View & Download PDF**

### Submodule 2.6: Addresses (Pate)
- **Vivaran:** Grahak ke delivery pate — add, edit, delete, default set karna.
- **Mini-module:** Multiple address (Home / Work / Shop), default address

### Submodule 2.7: Wishlist (Pasand ki Suchi)
- **Vivaran:** Grahak ke save kiye hue pasandida saaman.

### Submodule 2.8: Khata / Ledger (sirf Wholesale)
- **Vivaran:** Wholesale grahak ka udhaar ka hisaab — jama (jo diya) aur baaki (jo bacha).
- **Mini-module:** Har entry date-time ke saath, running balance

---

## 7. Module 3: CMS Admin Panel

Content aur store ko manage karne wala panel (Superadmin / Admin).

### Submodule 3.1: Dashboard
- **Vivaran:** Mukhya aankde — total orders, customers, revenue, pending.

### Submodule 3.2: Store Homepage Editor
- **Vivaran:** Homepage ka saara content yahan se badalta hai — image upload ke saath.
- **Mini-module:** Hero slide, offer banner, text — sab editable

### Submodule 3.3: Products (Saaman)
- **Vivaran:** Products add / edit / delete — retail daam, wholesale daam, stock, image.
- **Mini-module:** Dual pricing set karna, MOQ (minimum order quantity), stock manage

### Submodule 3.4: Grocery Categories
- **Vivaran:** Shreniyaan banana aur manage karna.

### Submodule 3.5: Orders (Order Management)
- **Vivaran:** Saare orders dekhna + **status update karna** (jisse grahak ko tracking dikhe).
- **Mini-module:**
  - Order list (retail / wholesale filter)
  - Status change + **note + tracking number + delivery date**
  - **Tracking history timeline** — har update ka record
  - Order detail (customer, address, items)

### Submodule 3.6: Customers (Grahak)
- **Vivaran:** Saare grahak + approval + khata management.
- **Mini-module:**
  - Customer list (retail / wholesale / pending approval)
  - **Approve / Reject** naye grahak
  - Customer detail + uska ledger + orders

### Submodule 3.7: Ledger / Khata
- **Vivaran:** Wholesale grahkon ka udhaar overview — kiska kitna baaki hai.

### Submodule 3.8: Sent Documents (Bheje Gaye Dastavez)
- **Vivaran:** CRM se grahkon ko bheje gaye saare quotation + invoice ka record — sirf Superadmin / Admin ko dikhta hai.
- **Mini-module:**
  - List — type (quotation/invoice), number, customer, subject, amount, kab bheja, kisne bheja
  - Detail drawer — poora subject + message

### Submodule 3.9: Enquiries (Puchhtaach)
- **Vivaran:** Website se aayi puchhtaach / sampark.

### Submodule 3.10: Activity Logs
- **Vivaran:** System me kya-kya hua, uska record.

### Submodule 3.11: Admin Users
- **Vivaran:** Admin users manage karna (role ke saath).

---

## 8. Module 4: CRM Portal

Client aur bikri ka prabandhan (Owner / Manager / Accountant).

### Submodule 4.1: Dashboard
- **Vivaran:** CRM ke mukhya aankde — clients, revenue, pending invoices.

### Submodule 4.2: Clients (Grahak/Firm)
- **Vivaran:** Business clients ki jankari.

### Submodule 4.3: Projects
- **Vivaran:** Har client ke project / kaam.

### Submodule 4.4: Quotations (Bhav-Patra)
- **Vivaran:** Grahak ko bhejne ke liye daam ka quotation.
- **Mini-module:**
  - Line items (saaman + qty + rate), GST, discount, grand total
  - **Link to Store Customer** — kisi store grahak se jodna
  - **Send to Customer** — subject + message ke saath bhejna
  - PDF download / print

### Submodule 4.5: Invoices (Bill)
- **Vivaran:** Pakka bill — GST ke saath.
- **Mini-module:**
  - Line items, GST, paid / balance due
  - **Link to Store Customer**
  - **Send to Customer** (subject + message)
  - PDF download / print

### Submodule 4.6: Payments
- **Vivaran:** Invoice ke against payment record karna.

### Submodule 4.7: Proposals
- **Vivaran:** Grahak ko prastaav (proposal) bhejna.

### Submodule 4.8: Ledger / Khata (CRM)
- **Vivaran:** Client ka jama-baaki hisaab — note, date-time, saaman, quantity, unit, rate (optional) ke saath.
- **Mini-module:** Add client, add entry (jama / baaki), running balance

### Submodule 4.9: Follow-ups
- **Vivaran:** Client se dobara sampark ke reminder.

### Submodule 4.10: Reports
- **Vivaran:** Bikri / revenue ki report (CSV export).

### Submodule 4.11: Settings
- **Vivaran:** Company details, bank details, GST defaults, prefix.

---

## 9. Module 5: HRM Portal

Human Resource prabandhan (HR Admin).

| Submodule | Vivaran |
|-----------|---------|
| **Dashboard** | HR ke mukhya aankde |
| **Employees** | Karmchari list + detail + onboarding |
| **Attendance** | Haaziri record |
| **Leaves** | Chhutti ke aavedan manzoori |
| **Payroll** | Salary / payslip |
| **Departments** | Vibhag |
| **Holidays** | Chhutti calendar |
| **Announcements** | Suchnaayein |
| **Reports** | HR report |
| **Pending Users** | Naye HR user ki manzoori |
| **Settings** | HRM settings |

---

## 10. Module 6: EMP Portal (Karmchari Self-Service)

Karmchari apne liye (Employee).

| Submodule | Vivaran |
|-----------|---------|
| **Dashboard** | Karmchari ka mukhya page |
| **Attendance** | Apni haaziri lagana / dekhna |
| **Salary** | Apni salary slip |
| **Leaves** | Chhutti ka aavedan |
| **Tasks** | Apne kaam / task |
| **Team** | Apni team |
| **Profile** | Apni jankari |
| **Announcements** | Company suchnaayein |

---

## 11. Business Flow (Vyapaar Prakriya)

### A. Retail (Footkar) Bikri ka Flow
```
Grahak register karta hai
        ↓
Admin approve karta hai (CMS)
        ↓
Grahak login karta hai
        ↓
Saaman dekhta hai → Cart me daalta hai → Checkout
        ↓
Order ban jaata hai (status: Placed)
        ↓
Admin order status badalta hai (Processing → Shipped → Delivered)
        ↓
Grahak apne account me tracking dekhta hai
```

### B. Wholesale (Thok) Bikri ka Flow
```
Dukandar wholesale account register karta hai (business details ke saath)
        ↓
Admin approve karta hai + credit limit set karta hai
        ↓
Dukandar login → thok daam par bulk order
        ↓
Udhaar (COD) order → Ledger me "baaki" entry auto ban jaati hai
        ↓
Jab payment aata hai → Ledger me "jama" entry → balance kam
```

### C. Quotation / Invoice ka Flow (CRM se Customer tak)
```
CRM me quotation / invoice banta hai
        ↓
Usme "Link to Store Customer" se grahak chuna jaata hai
        ↓
"Send to Customer" — subject + message likhkar bheja jaata hai
        ↓
Grahak ke account me "My Quotations / My Invoices" me dikhta hai
        ↓
Grahak PDF download / view kar sakta hai
        ↓
Superadmin / Admin ko CMS "Sent Documents" me record dikhta hai
```

---

## 12. User Flow (Grahak Yatra)

### Naye Grahak ki Yatra
1. Website par aata hai → saaman dekhta hai (bina login)
2. Cart me daalne ya khareedne ke liye → **login page** khulta hai
3. Register karta hai (retail ya wholesale chunta hai)
4. **Admin approval ka intezaar** — bina approve login nahi hoga
5. Approve hone ke baad → login → order
6. Order ke baad → account me tracking dekhta hai

### Purane (Approved) Grahak ki Yatra
1. Login → saaman → cart → checkout → order
2. My Orders me tracking
3. My Quotations / My Invoices — agar CRM ne kuch bheja ho
4. Khata (wholesale) — apna udhaar balance

---

## 13. Khaas Feature: Order Tracking

- Har order me **8 stage** possible hain: Placed, Confirmed, Processing, Shipped, Out for Delivery, Delivered, Cancelled, Returned
- **Admin side (CMS):** status badalta hai + note + tracking number + delivery date deta hai
- **System** har change ko date-time + note ke saath **statusHistory** me save karta hai
- **Customer side:** visual progress bar + "Tracking Updates" timeline — grahak ko saaf dikhta hai "kya hua, kab hua"
- Ek hi record dono taraf dikhta hai (shared)

---

## 14. Khaas Feature: Ledger / Khata

- **Do jagah:** Store (wholesale grahak) + CRM (business client)
- **Do tarah ki entry:**
  - **Jama** — grahak ne jo paisa diya (balance kam karta hai)
  - **Baaki** — grahak par jo udhaar hai (balance badhata hai)
- Har entry me: amount, note, date + time, saaman, quantity, unit, rate (optional)
- **Auto** — wholesale COD order par "baaki" entry, payment par "jama" entry
- **Paardarshi (transparent)** — grahak aur admin dono ko balance dikhta hai
- **RBAC** — sirf authorized log (owner/manager/accountant) entry daal sakte hain
- CRUD — add, edit, delete sab possible (permission ke saath)

---

## 15. Khaas Feature: Quotation / Invoice ka Customer Link

### Kaise Kaam Karta Hai
1. **Link** — CRM me quotation/invoice banate waqt ek dropdown se store grahak chun sakte hain (ya "Not linked" rakh sakte hain)
2. **Send** — "Send to Customer" button se:
   - **Subject** (zaroori)
   - **Message** (grahak ko kuch kehna ho to)
3. **Visibility (dikhne ka niyam):**
   - Agar grahak chuna + send kiya → grahak ke account me dikhega
   - Agar grahak nahi chuna → kuch nahi dikhega
   - Sirf **sent** dastavez hi grahak ko dikhte hain (sirf link karne se nahi)
4. **Dono taraf:** CRM me bhi dikhta hai, grahak ke account me bhi
5. **Download:** grahak PDF download / print kar sakta hai
6. **Admin record:** Superadmin / Admin ko CMS "Sent Documents" me poora record (subject, message, kab, kisne bheja)

> **Note:** "Send to Customer" sirf CRM Owner / Manager kar sakte hain (RBAC).

---

## 16. Login Credentials (Guptaniya)

> **Confidential — sirf internal use ke liye**

| Portal | URL | Email | Password |
|--------|-----|-------|----------|
| **CMS Admin** | /admin/login | admin@subhamstore.com | SubhamStore@2026 |
| **CRM** | /crm/login | crm@subhamstore.com | CRM@Subham2026 |
| **HRM** | /hrm/login | hrm@subhamstore.com | HRM@Subham2026 |
| **EMP** | /emp/login | emp@subhamstore.com | EMP@Subham2026 |
| **Test Customer** | /account/login | customer@subhamstore.com | Customer@2026 |

**Database:** MongoDB Atlas — Cluster `subhamgupta.lfaoxtc.mongodb.net`

---

## 17. Project Chalane ka Tarika

### Zaroori: Do Terminal Chahiye

**Terminal 1 — Backend (Port 5000)**
```bash
cd backend
npm start
```

**Terminal 2 — Frontend (Port 3000)**
```bash
cd website
npm run dev
```

### Mahatvapurna Baatein
- Backend ka code badalne par **backend restart zaroori** (Ctrl+C phir `npm start`)
- Frontend apne aap reload hota hai (hot reload)
- Pehli baar chalane se pehle `npm install` dono folder me

### URLs
| Kya | URL |
|-----|-----|
| Store | http://localhost:3000 |
| Admin Hub | http://localhost:3000/login |
| Backend API | http://localhost:5000/api |

---

*Subham General Store · Dual Grocery Marketplace · Powered by Subham Gupta · October 2026*
