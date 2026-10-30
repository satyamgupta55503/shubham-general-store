# DigiKraft Social — Authentication & User Management Documentation

> **Version:** 2.0 (Updated)
> **Last Updated:** October 2026
> **Project:** DKS-WEBSITE_latest-deployed
> **Portals:** CMS · CRM · HRM · EMP (4 Portals)

---

## Table of Contents

1. [System Overview — 4 Portals](#1-system-overview--4-portals)
2. [Portal Chooser Page](#2-portal-chooser-page)
3. [CMS Portal — Authentication](#3-cms-portal--authentication)
4. [CRM Portal — Authentication](#4-crm-portal--authentication)
5. [HRM Portal — Authentication](#5-hrm-portal--authentication)
6. [EMP Portal — Authentication](#6-emp-portal--authentication)
7. [Roles & Permissions — All Portals](#7-roles--permissions--all-portals)
8. [API Endpoints — All Portals](#8-api-endpoints--all-portals)
9. [Token System (JWT)](#9-token-system-jwt)
10. [User Management — All Portals](#10-user-management--all-portals)
11. [Current Credentials — All Portals](#11-current-credentials--all-portals)
12. [Security Notes](#12-security-notes)
13. [Quick Reference Card](#13-quick-reference-card)

---

## 1. System Overview — 4 Portals

DigiKraft Social ka system **4 alag portals** mein divided hai. Har portal ka apna login, database collection, JWT token key aur frontend route hai.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        digikraftsocial.com                                  │
│                                                                             │
│   /portals  ──────────────────────────────────────────────────────────      │
│   (Portal Chooser — 4 cards)                                                │
│                                                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│   │   CMS    │  │   CRM    │  │   HRM    │  │   EMP    │                 │
│   │ (Green)  │  │ (Green)  │  │ (Purple) │  │  (Blue)  │                 │
│   │          │  │          │  │          │  │          │                 │
│   │/admin/   │  │/crm/     │  │/hrm/     │  │/emp/     │                 │
│   │login     │  │login     │  │login     │  │login     │                 │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘                 │
│                                                                             │
│   Backend:  backend.digikraftsocial.com (Port 5000)                         │
│   ├── /api/*          → CMS routes                                         │
│   ├── /api/crm/*      → CRM routes                                         │
│   ├── /api/hrm/*      → HRM routes                                         │
│   └── /api/emp/*      → EMP routes                                         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4 Portals Comparison Table

| Property | CMS | CRM | HRM | EMP |
|---|---|---|---|---|
| **Login URL** | `/admin/login` | `/crm/login` | `/hrm/login` | `/emp/login` |
| **API Prefix** | `/api/` | `/api/crm/` | `/api/hrm/` | `/api/emp/` |
| **User Collection** | `users` | `crm_users` | `hrm_users` | `hrm_employees` |
| **DB Prefix** | *(none)* | `crm_` | `hrm_` | `hrm_` |
| **localStorage Token** | `token` | `crm_token` | `hrm_token` | `emp_token` |
| **localStorage User** | *(role only)* | `crm_user` | `hrm_user` | `emp_user` |
| **JWT Portal Claim** | *(none)* | `portal:'crm'` | `portal:'hrm'` | `portal:'emp'` |
| **Auth Middleware** | `authMiddleware.js` | `crmAuth.js` | `hrmAuth.js` | `empAuth.js` |
| **Token Expiry** | 7 days | 8 hours | 8 hours | 12 hours |
| **CSS Theme** | Green | Green | Purple #7c3aed | Blue #2563eb |
| **Axios Utility** | `utils/api.js` | `utils/crmApi.js` | `utils/hrmApi.js` | `utils/empApi.js` |
| **Purpose** | Website content | Client/billing | HR administration | Employee self-service |

---

## 2. Portal Chooser Page

**URL:** `digikraftsocial.com/portals`

Ek single page jahan sabhi 4 portals ke cards dikhte hain. Staff ko yaad nahi rehna ki kaunsa URL hai — bas `/portals` pe jao aur apna portal choose karo.

```
/portals
    ├── CMS Portal  → /admin/login
    ├── CRM Portal  → /crm/login
    ├── HRM Portal  → /hrm/login  (New 🟣)
    └── EMP Portal  → /emp/login  (New 🔵)
```

**CRM Sidebar mein bhi shortcut hai:**
- CRM sidebar ke bottom mein "Other Portals" section
- HRM Portal → direct link (new tab)
- EMP Portal → direct link (new tab)

---

## 3. CMS Portal — Authentication

### 3.1 Login Flow

```
User enters email + password
        ↓
POST /api/auth/login
        ↓
Backend checks "users" collection
        ↓
Password match → JWT token (7 days)
        ↓
Token → localStorage "token"
Role  → localStorage "role"
        ↓
Redirect → /admin/dashboard
```

### 3.2 Login API

```
POST /api/auth/login

Body:  { "email": "...", "password": "..." }

Response:
{
  "token": "eyJhbGci...",
  "role": "superadmin",
  "name": "Admin",
  "user": { ...user object... }
}
```

### 3.3 CMS Roles

| Role | Dashboard | Blog | Projects | Users | Settings | Integrations |
|------|-----------|------|----------|-------|----------|--------------|
| `superadmin` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `admin` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `author` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| `user` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 3.4 CMS localStorage Keys

| Key | Value |
|-----|-------|
| `token` | JWT access token |
| `role` | User role |
| `userName` | Display name |
| `userEmail` | User email |

---

## 4. CRM Portal — Authentication

### 4.1 Login Flow

```
User enters email + password
        ↓
POST /api/crm/auth/login
        ↓
Backend checks "crm_users" collection
        ↓
is_active check → false = "Account pending approval"
Lockout check   → if locked = "Account temporarily locked"
        ↓
Password match (bcrypt) → JWT (8 hours, portal:'crm')
        ↓
Token → localStorage "crm_token"
User  → localStorage "crm_user"
        ↓
Redirect → /crm/dashboard
```

### 4.2 CRM Roles

| Role | Access Level |
|------|-------------|
| `owner` | Full access to everything |
| `manager` | Most access, can approve users |
| `accountant` | Invoices + Payments only |
| `executive` | Clients + Projects + Proposals + Enquiries |

### 4.3 New CRM User Flow

```
Register → pending (is_active: false)
        ↓
Owner/Manager → /crm/dashboard/pending-users
        ↓
Approve + assign role + select page_access
        ↓
User can now login
```

### 4.4 CRM localStorage Keys

| Key | Value |
|-----|-------|
| `crm_token` | JWT token |
| `crm_user` | Full user JSON |

---

## 5. HRM Portal — Authentication

### 5.1 Login Flow

```
User enters email + password
        ↓
POST /api/hrm/auth/login
        ↓
Rate limit check → 10 requests / 15 min per IP
        ↓
Backend checks "hrm_users" collection
        ↓
is_active check → false = "Account pending approval by HR Admin"
Lockout check → if locked = "Account locked for X minutes"
        ↓
Password match (bcrypt-12) → JWT (8 hours, portal:'hrm')
        ↓
On wrong password → attempt counter++
At 5 attempts → account locked for 30 minutes
        ↓
Token → localStorage "hrm_token"
User  → localStorage "hrm_user"
        ↓
Redirect → /hrm/dashboard
```

### 5.2 Token Verification (Auto-check every route change)

```
GET /api/hrm/auth/verify
Authorization: Bearer <hrm_token>

Response: { "valid": true, "role": "hr_admin", "page_access": [...] }

Agar 401 → auto logout → /hrm/login redirect
```

### 5.3 HRM Roles

| Role | Description | Access |
|------|-------------|--------|
| `hr_admin` | HR Administrator | Full access — all employees, payroll, settings, user management |
| `hr_manager` | HR Manager | Employees, attendance, leaves, payroll (no settings, no user management) |
| `dept_manager` | Department Manager | Own department employees, own dept attendance, own dept leaves |

### 5.4 Department Manager Scope

`dept_manager` role wala user sirf apni department ke employees dekh sakta hai. Backend mein automatically filter hota hai — kisi bhi API call pe `department` filter add hota hai.

### 5.5 New HRM User Flow

```
POST /api/hrm/auth/register
        ↓
User created with is_active: false
        ↓
HR Admin → /hrm/dashboard/pending-users
        ↓
Approve + assign role (hr_admin/hr_manager/dept_manager)
+ select page_access array
        ↓
User can now login to HRM
```

### 5.6 HRM localStorage Keys

| Key | Value |
|-----|-------|
| `hrm_token` | JWT token (8h expiry) |
| `hrm_user` | Full HRM user JSON |

### 5.7 HRM Page Access Keys

```
dashboard, employees, departments, attendance,
leaves, payroll, pending-users, history,
notifications, settings
```

---

## 6. EMP Portal — Authentication

### 6.1 EMP Login — Alag hai CRM/HRM se

EMP portal mein **employees apna login use karte hain** — HR staff ka login nahi kaam karta. Employee ki `work_email` aur `password` se login hota hai.

```
Employee enters work_email + password
        ↓
POST /api/emp/auth/login
        ↓
Rate limit check → 10 requests / 15 min per IP
        ↓
Backend checks "hrm_employees" collection
(Same collection jo HRM portal use karta hai — dual use)
        ↓
is_active check → false = "Account disabled. Contact HR."
Status check    → only "active" or "probation" can login
Lockout check   → 5 attempts → 30 min lock
        ↓
Password match (bcrypt-12) → JWT (12 hours, portal:'emp')
        ↓
Token → localStorage "emp_token"
User  → localStorage "emp_user"
        ↓
Redirect → /emp/dashboard
```

### 6.2 EMP Token Verification

```
GET /api/emp/auth/verify
Authorization: Bearer <emp_token>

Response: { "valid": true, "employee_id": "DKS-EMP-001", "status": "active" }

Agar 401 → auto logout → /emp/login redirect
```

### 6.3 EMP Password (First Time Login)

Jab HR nayi employee create karta hai, ek **temporary password** auto-generate hoti hai:

```
Format: firstname@year
Example: rahul@2024

Employee ko recommend karein ki first login ke baad
/emp/dashboard/profile → Change Password use karein
```

### 6.4 EMP localStorage Keys

| Key | Value |
|-----|-------|
| `emp_token` | JWT token (12h expiry) |
| `emp_user` | Full employee JSON |

### 6.5 EMP — What Employee Can Access

Employee sirf apna khud ka data dekh sakta hai:
- ✅ Own attendance (view + check-in/out)
- ✅ Own leave requests (apply + cancel pending)
- ✅ Own leave balance
- ✅ Own salary slips (view + download PDF)
- ✅ Own CTC breakup
- ✅ Own profile (limited fields editable)
- ✅ Company announcements (read-only)
- ✅ Submit regularization requests
- ❌ Other employees' data
- ❌ Payroll processing
- ❌ Leave approval

---

## 7. Roles & Permissions — All Portals

### 7.1 CRM Roles

| Permission | owner | manager | accountant | executive |
|---|---|---|---|---|
| Clients | ✅ | ✅ | ❌ | ✅ |
| Services | ✅ | ✅ | ❌ | ❌ |
| Projects | ✅ | ✅ | ❌ | ✅ |
| Proposals | ✅ | ✅ | ❌ | ✅ |
| Quotations | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ✅ | ❌ |
| Payments | ✅ | ✅ | ✅ | ❌ |
| Portfolio | ✅ | ✅ | ❌ | ❌ |
| Pending Users | ✅ | ✅ | ❌ | ❌ |
| Enquiries | ✅ | ✅ | ❌ | ✅ |
| History | ✅ | ✅ | ❌ | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ❌ | ❌ |

### 7.2 HRM Roles

| Permission | hr_admin | hr_manager | dept_manager |
|---|---|---|---|
| View all employees | ✅ | ✅ | ✅ (own dept) |
| Add/edit employee | ✅ | ✅ | ❌ |
| Deactivate employee | ✅ | ❌ | ❌ |
| View attendance | ✅ | ✅ | ✅ (own dept) |
| Mark/edit attendance | ✅ | ✅ | ✅ (own dept) |
| Approve regularization | ✅ | ✅ | ✅ (own dept) |
| Approve leaves | ✅ | ✅ | ✅ (own dept) |
| Manage leave types | ✅ | ❌ | ❌ |
| Run payroll | ✅ | ✅ | ❌ |
| View salary slips | ✅ | ✅ | ❌ |
| Manage departments | ✅ | ❌ | ❌ |
| Manage designations | ✅ | ❌ | ❌ |
| Pending Users (HRM) | ✅ | ❌ | ❌ |
| HRM Settings | ✅ | ❌ | ❌ |
| History/Audit log | ✅ | ✅ | ❌ |
| Notifications | ✅ | ✅ | ✅ |

### 7.3 EMP Access (All employees same level — own data only)

| Action | Employee |
|---|---|
| Punch In / Punch Out | ✅ |
| View own attendance | ✅ |
| Request regularization | ✅ |
| Apply leave | ✅ |
| Cancel own pending leave | ✅ |
| View leave balance | ✅ |
| View own salary slips | ✅ |
| Download salary slip PDF | ✅ |
| View CTC breakup | ✅ |
| Edit personal contact info | ✅ |
| Change own password | ✅ |
| View bank details (read-only) | ✅ |
| Edit bank details | ❌ (HR only) |
| Edit designation/department | ❌ (HR only) |
| Approve others' leaves | ❌ |
| View other employees' salary | ❌ |

---

## 8. API Endpoints — All Portals

### 8.1 CMS Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | ❌ | CMS Login |
| POST | `/api/auth/register` | ❌ | New user |
| GET | `/api/auth/verify` | ✅ | Token verify |
| GET | `/api/auth/` | ✅ | All users |
| PUT | `/api/auth/:id` | ✅ | Update user |
| DELETE | `/api/auth/:id` | ✅ | Delete user |

### 8.2 CRM Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/crm/auth/register` | ❌ | Register (pending) |
| POST | `/api/crm/auth/login` | ❌ Rate limited | CRM Login |
| GET | `/api/crm/auth/me` | ✅ | Current user |
| PATCH | `/api/crm/auth/me` | ✅ | Update profile |
| POST | `/api/crm/auth/me/change-password` | ✅ | Change password |
| GET | `/api/crm/auth/verify` | ✅ | Token verify |
| GET | `/api/crm/auth/pending-users` | ✅ Manager+ | Pending list |
| GET | `/api/crm/auth/users` | ✅ Manager+ | Active users |
| PUT | `/api/crm/auth/users/:id/approve` | ✅ Owner/Mgr | Approve user |
| DELETE | `/api/crm/auth/users/:id/reject` | ✅ Owner/Mgr | Reject user |
| PUT | `/api/crm/auth/users/:id/deactivate` | ✅ Owner/Mgr | Deactivate |
| PATCH | `/api/crm/auth/users/:id` | ✅ Owner/Mgr | Update role/access |

### 8.3 HRM Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/hrm/auth/register` | ❌ | Register (pending) |
| POST | `/api/hrm/auth/login` | ❌ Rate limited | HRM Login |
| GET | `/api/hrm/auth/me` | ✅ | Current user |
| PATCH | `/api/hrm/auth/me` | ✅ | Update profile |
| POST | `/api/hrm/auth/me/change-password` | ✅ | Change password |
| GET | `/api/hrm/auth/verify` | ✅ | Token verify |
| POST | `/api/hrm/auth/logout` | ✅ | Logout + log |
| GET | `/api/hrm/auth/pending-users` | ✅ Manager+ | Pending list |
| GET | `/api/hrm/auth/users` | ✅ Manager+ | Active HRM users |
| PUT | `/api/hrm/auth/users/:id/approve` | ✅ Admin | Approve + role |
| DELETE | `/api/hrm/auth/users/:id/reject` | ✅ Admin | Reject |
| PUT | `/api/hrm/auth/users/:id/deactivate` | ✅ Admin | Deactivate |
| PATCH | `/api/hrm/auth/users/:id` | ✅ Admin | Update |

### 8.4 EMP Auth Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/emp/auth/login` | ❌ Rate limited | Employee Login |
| GET | `/api/emp/auth/me` | ✅ | Current employee |
| GET | `/api/emp/auth/verify` | ✅ | Token verify |
| PATCH | `/api/emp/auth/profile` | ✅ | Update own profile |
| POST | `/api/emp/auth/me/change-password` | ✅ | Change password |

---

## 9. Token System (JWT)

### 9.1 Token Payload Structure

```json
CMS Token:
{
  "id": "mongodb_object_id",
  "role": "superadmin",
  "iat": 1234567890,
  "exp": 1235172690
}

CRM Token:
{
  "id": "uuid-string",
  "role": "owner",
  "portal": "crm",
  "iat": 1234567890,
  "exp": 1234596490
}

HRM Token:
{
  "id": "uuid-string",
  "role": "hr_admin",
  "portal": "hrm",
  "iat": 1234567890,
  "exp": 1234596490
}

EMP Token:
{
  "id": "uuid-string",
  "portal": "emp",
  "iat": 1234567890,
  "exp": 1234610490
}
```

### 9.2 Token Expiry

| Portal | Expiry | Reason |
|---|---|---|
| CMS | 7 days | Legacy — longer session |
| CRM | 8 hours | Business security |
| HRM | 8 hours | HR data sensitive |
| EMP | 12 hours | Employee convenience |

### 9.3 Portal Claim Security

CRM, HRM, EMP tokens mein `portal` claim hota hai. Agar koi CRM token se HRM API access karne ki koshish kare, middleware reject kar deta hai:

```javascript
// hrmAuth.js
if (decoded.portal !== 'hrm')
  return res.status(401).json({ message: 'Invalid portal token' });
```

### 9.4 Usage

```javascript
// CMS
const token = localStorage.getItem("token");

// CRM
const token = localStorage.getItem("crm_token");

// HRM
const token = localStorage.getItem("hrm_token");

// EMP
const token = localStorage.getItem("emp_token");

// API call header:
Authorization: Bearer <token>
```

---

## 10. User Management — All Portals

### 10.1 New CMS User

```
POST /api/auth/register
Body: { name, email, password, role }
```

### 10.2 New CRM Staff Member

```
1. POST /api/crm/auth/register → pending
2. /crm/dashboard/pending-users → Approve + role + page_access
3. Login hoga
```

### 10.3 New HRM Staff Member (HR Team)

```
1. POST /api/hrm/auth/register → pending
2. /hrm/dashboard/pending-users → HR Admin approve kare
   + role (hr_admin/hr_manager/dept_manager)
   + page_access array
3. Login hoga
```

### 10.4 New Employee (EMP Portal Access)

```
HR Admin → /hrm/dashboard/employees → Add Employee
Form fill karo:
  - Full Name, Work Email, Phone
  - Department, Designation
  - Current CTC, Basic Salary
  - Date of Joining

System auto-generates:
  - Employee ID: DKS-EMP-001, 002...
  - Temp Password: firstname@year (e.g. rahul@2024)
  - Response mein _temp_password field aata hai

HR employee ko password secure way se bheje.
Employee → /emp/login → First login kare → Profile → Change Password
```

### 10.5 Employee Deactivate Karna

**HRM Portal se:**
- `/hrm/dashboard/employees` → Employee row → Deactivate button
- Employee turant EMP portal se bhi logout ho jayega (verify 401 dega)

### 10.6 HRM User Deactivate Karna

**HRM Portal se:**
- `/hrm/dashboard/pending-users` → Active Users tab → Deactivate

---

## 11. Current Credentials — All Portals

### 11.1 CMS Portal — Website Admin

| Field | Value |
|-------|-------|
| **Login URL (Local)** | `http://localhost:3000/admin/login` |
| **Login URL (Production)** | `https://digikraftsocial.com/admin/login` |
| **Email** | `srdani12@gmail.com` |
| **Password** | `digikraftsocial@2026` |
| **Role** | `superadmin` |
| **Access** | Full website content management |

---

### 11.2 CRM Portal — Client Management

| Field | Value |
|-------|-------|
| **Login URL (Local)** | `http://localhost:3000/crm/login` |
| **Login URL (Production)** | `https://digikraftsocial.com/crm/login` |
| **Email** | `admin@digikraftsocial.com` |
| **Password** | `Dks@Admin2024` |
| **Role** | `owner` |
| **Access** | Full CRM — clients, invoices, proposals, payments |

---

### 11.3 HRM Portal — HR Management

#### HR Admin (Full Access)

| Field | Value |
|-------|-------|
| **Login URL (Local)** | `http://localhost:3000/hrm/login` |
| **Login URL (Production)** | `https://digikraftsocial.com/hrm/login` |
| **Email** | `hradmin@digikraftsocial.com` |
| **Password** | `HRM@Admin2024` |
| **Role** | `hr_admin` |
| **Access** | Full HRM — employees, attendance, payroll, leaves, settings |

#### HR Manager (Limited Access)

| Field | Value |
|-------|-------|
| **Email** | `hrmanager@digikraftsocial.com` |
| **Password** | `HRM@Manager2024` |
| **Role** | `hr_manager` |
| **Access** | Employees, attendance, leaves, payroll (no settings, no user mgmt) |

---

### 11.4 EMP Portal — Employee Self-Service

| Field | Value |
|-------|-------|
| **Login URL (Local)** | `http://localhost:3000/emp/login` |
| **Login URL (Production)** | `https://digikraftsocial.com/emp/login` |
| **Work Email** | `rahul@digikraftsocial.com` |
| **Password** | `EMP@Rahul2024` |
| **Employee ID** | `DKS-EMP-001` |
| **Employee Name** | Rahul Sharma |
| **Access** | Own attendance, leaves, salary slips, profile |

---

### 11.5 Portal Chooser

| URL | `http://localhost:3000/portals` |
|---|---|
| **All 4 portals** | CMS · CRM · HRM · EMP — ek jagah |

---

## 12. Security Notes

### 12.1 Security Features Already Implemented

| Feature | CMS | CRM | HRM | EMP |
|---|---|---|---|---|
| bcrypt password hashing | ✅ | ✅ (rounds:12) | ✅ (rounds:12) | ✅ (rounds:12) |
| JWT portal claim check | ❌ | ✅ | ✅ | ✅ |
| Rate limiting on login | ❌ | ✅ (10/15min) | ✅ (10/15min) | ✅ (10/15min) |
| Brute-force lockout | ❌ | ❌ | ✅ (5 attempts, 30min) | ✅ (5 attempts, 30min) |
| is_active approval gate | ❌ | ✅ | ✅ | ✅ |
| Live DB lookup on verify | ❌ | ✅ | ✅ | ✅ |
| RBAC role guards | ✅ (basic) | ✅ | ✅ (4 guards) | ✅ |
| Dept scope restriction | ❌ | ❌ | ✅ | ❌ |
| Sensitive field masking | ❌ | ❌ | ✅ (aadhaar, pan) | ✅ |

### 12.2 Production Pe Jaane Se Pehle — Checklist

```
CMS:
[ ] Password change karo (digikraftsocial@2026 → strong)

CRM:
[ ] Password change karo (Dks@Admin2024 → strong)
[ ] admin2@digikraftsocial.com delete karo (duplicate test account)

HRM:
[ ] hradmin password change karo (HRM@Admin2024 → strong)
[ ] hrmanager password change karo
[ ] Test employee (rahul@digikraftsocial.com) delete karo ya real data se replace karo

EMP:
[ ] DKS-EMP-001 employee ka real data add karo ya delete karo

Common:
[ ] JWT_SECRET strong random string set karo in .env
[ ] .env file gitignore mein hai (confirm karo)
[ ] HTTPS enable karo production pe
[ ] CORS_ORIGIN set karo sahi domain se
```

### 12.3 JWT Secret

**Backend `.env` file mein:**
```
JWT_SECRET=YourVeryStrongRandomSecretKey@2026!#$%
```

> ⚠️ JWT Secret change karne ke baad **sabhi 4 portals ke sabhi users logout** ho jayenge — unhe dobara login karna hoga.

### 12.4 Password Requirements

| Requirement | Details |
|---|---|
| Minimum length | 8 characters |
| Uppercase | At least 1 |
| Number | At least 1 |
| Special char | At least 1 (@, #, $, !) |

HRM aur EMP portals backend pe minimum 8 characters enforce karte hain.

### 12.5 Account Lockout (HRM + EMP)

```
Wrong password attempt 1-4 → "Invalid credentials"
Wrong password attempt 5    → Account locked for 30 minutes
                             → "Account locked for 30 min"

After 30 minutes → Auto unlock → Try again
HR can also manually unlock from MongoDB by setting:
  locked_until: null
  login_attempts: 0
```

### 12.6 Sensitive Data Protection

EMP portal ke API responses mein sensitive fields hidden hain:

```
Hidden from EMP responses:
  - aadhaar_number
  - account_number (full)  → sirf last 4 digits
  - pan_number
  - pf_number (full)
  - login_attempts
  - locked_until
```

---

## 13. Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│              DIGIKRAFT SOCIAL — ALL PORTALS AUTH QUICK REF                  │
├────────────┬──────────────────┬───────────────────────┬──────────────────────┤
│  FIELD     │  CMS             │  CRM                  │  HRM                 │
├────────────┼──────────────────┼───────────────────────┼──────────────────────┤
│ URL        │ /admin/login     │ /crm/login            │ /hrm/login           │
│ Email      │srdani12@         │admin@                 │hradmin@              │
│            │gmail.com         │digikraftsocial.com    │digikraftsocial.com   │
│ Password   │digikraftsocial   │Dks@Admin2024          │HRM@Admin2024         │
│            │@2026             │                       │                      │
│ Role       │superadmin        │owner                  │hr_admin              │
│ Token Key  │token             │crm_token              │hrm_token             │
│ Expiry     │7 days            │8 hours                │8 hours               │
│ Theme      │Green             │Green                  │Purple #7c3aed        │
├────────────┴──────────────────┴───────────────────────┴──────────────────────┤
│                          EMP PORTAL                                          │
├────────────┬──────────────────────────────────────────────────────────────────┤
│ URL        │ /emp/login                                                       │
│ Work Email │ rahul@digikraftsocial.com                                        │
│ Password   │ EMP@Rahul2024                                                    │
│ Emp ID     │ DKS-EMP-001                                                      │
│ Token Key  │ emp_token                                                        │
│ Expiry     │ 12 hours                                                         │
│ Theme      │ Blue #2563eb                                                     │
├────────────┴──────────────────────────────────────────────────────────────────┤
│                         ADDITIONAL HRM ACCOUNT                               │
├────────────┬──────────────────────────────────────────────────────────────────┤
│ HRM Mgr    │ hrmanager@digikraftsocial.com  │  HRM@Manager2024  │ hr_manager  │
├────────────┴──────────────────────────────────────────────────────────────────┤
│                         SYSTEM INFO                                          │
├────────────────────────────────────────────────────────────────────────────── │
│ Portal Chooser  │  /portals (all 4 cards)                                    │
│ Backend Port    │  5000                                                       │
│ Frontend Port   │  3000                                                       │
│ Database        │  MongoDB Atlas → dks-website                                │
│ JWT Secret      │  process.env.JWT_SECRET (backend .env)                      │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Server Start Commands

```bash
# Terminal 1 — Backend
cd DKS-WEBSITE_latest-deployed\backend
npm start

# Terminal 2 — Frontend
cd DKS-WEBSITE_latest-deployed\website
npm run dev
```

---

*Document Version: 2.0*
*Updated: October 2026*
*Added in v2.0: HRM Portal (2 accounts) + EMP Portal (1 test employee) + Security comparison table + 4-portal architecture*
*Convert to Word: Google Docs → File → Download → Microsoft Word (.docx)*
