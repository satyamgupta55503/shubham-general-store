# DigiKraft Social — Complete Portals Planning Document
## CMS + CRM + HRM + Employee Portal (EMP)

> **Document Type:** Technical Planning & Architecture  
> **Company:** DigiKraft Social, Raipur, Chhattisgarh  
> **Tech Stack:** Node.js (Express) + MongoDB + Next.js 14  
> **Prepared For:** Word conversion + implementation reference  
> **Date:** October 2026  

---

## TABLE OF CONTENTS

1. [System Overview — 4 Portals Architecture](#1-system-overview)
2. [Existing Portals (Already Built)](#2-existing-portals)
   - [Portal 1 — CMS (Website Admin)](#portal-1--cms-website-admin)
   - [Portal 2 — CRM (Client Relationship Management)](#portal-2--crm-client-relationship-management)
3. [New Portals (To Be Built)](#3-new-portals-to-be-built)
   - [Portal 3 — HRM (Human Resource Management)](#portal-3--hrm-human-resource-management)
   - [Portal 4 — EMP (Employee Self-Service Portal)](#portal-4--emp-employee-self-service-portal)
4. [How All 4 Portals Connect](#4-how-all-4-portals-connect)
5. [HRM — Detailed Module Breakdown](#5-hrm--detailed-module-breakdown)
6. [EMP — Detailed Module Breakdown](#6-emp--detailed-module-breakdown)
7. [Database Collections Plan](#7-database-collections-plan)
8. [Backend API Endpoints Plan](#8-backend-api-endpoints-plan)
9. [Frontend File Structure Plan](#9-frontend-file-structure-plan)
10. [Roles & Permissions Matrix](#10-roles--permissions-matrix)
11. [Implementation Roadmap](#11-implementation-roadmap)

---

## 1. SYSTEM OVERVIEW

DigiKraft Social ke paas ek single web application hai jo **4 alag portals** mein divided hai. Har portal ka apna login system, apna database, apni JWT token key, aur apna frontend route hai.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        digikraftsocial.com                                  │
│                                                                             │
│   /portals  ───────────────────────────────────────────────────────────     │
│   (Portal Chooser — 4 cards, koi bhi portal choose karo)                   │
│                                                                             │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│   │    CMS      │  │    CRM      │  │    HRM      │  │    EMP      │     │
│   │  Portal     │  │  Portal     │  │  Portal     │  │  Portal     │     │
│   │             │  │             │  │             │  │             │     │
│   │/admin/login │  │/crm/login   │  │/hrm/login   │  │/emp/login   │     │
│   │             │  │             │  │             │  │             │     │
│   │Website CMS  │  │Client Mgmt  │  │HR Admin     │  │Employee     │     │
│   │Blog, Pages  │  │Projects     │  │Team Mgmt    │  │Self-Service │     │
│   │Media        │  │Invoices     │  │Payroll      │  │Leave Apply  │     │
│   │SEO, Slides  │  │Proposals    │  │Attendance   │  │Salary Slip  │     │
│   └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘     │
│                                                                             │
│   Backend:  backend.digikraftsocial.com                                     │
│   ├── /api/*        → CMS routes                                           │
│   ├── /api/crm/*    → CRM routes (already built)                           │
│   ├── /api/hrm/*    → HRM routes (to build)                                │
│   └── /api/emp/*    → Employee Portal routes (to build)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Core Architecture Pattern (jo CRM mein hai, wahi HRM + EMP mein follow hoga)

| Property | CMS | CRM | HRM | EMP |
|---|---|---|---|---|
| Login URL | `/admin/login` | `/crm/login` | `/hrm/login` | `/emp/login` |
| API prefix | `/api/` | `/api/crm/` | `/api/hrm/` | `/api/emp/` |
| User collection | `users` | `crm_users` | `hrm_users` | `hrm_employees` |
| DB prefix | *(none)* | `crm_` | `hrm_` | `hrm_emp_` |
| localStorage token key | `token` | `crm_token` | `hrm_token` | `emp_token` |
| localStorage user key | — | `crm_user` | `hrm_user` | `emp_user` |
| JWT portal claim | — | `portal:'crm'` | `portal:'hrm'` | `portal:'emp'` |
| Auth middleware | `authMiddleware.js` | `crmAuth.js` | `hrmAuth.js` | `empAuth.js` |
| CSS file | `globals.css` | `crm.css` | `hrm.css` | `emp.css` |
| Axios utility | `utils/api.js` | `utils/crmApi.js` | `utils/hrmApi.js` | `utils/empApi.js` |

---

## 2. EXISTING PORTALS (ALREADY BUILT)

### Portal 1 — CMS (Website Admin)

> **URL:** `digikraftsocial.com/admin/login`  
> **Purpose:** DigiKraft Social ki public website ka content manage karna  
> **Users:** Internal team (superadmin, admin, author)

#### Modules & Pages

| Module | Pages | Description |
|---|---|---|
| Dashboard | `/admin/dashboard` | Stats, recent posts, users overview |
| Blog Management | `/admin/blog` | Create, edit, delete blog posts + categories |
| Projects/Portfolio | `/admin/projects` | Website portfolio projects manage karna |
| Homepage | `/admin/homepage` | Hero section, slides, featured content |
| About Page | `/admin/about` | Company info, team section |
| Services | `/admin/services` | Service packages displayed on website |
| Contact Info | `/admin/contact` | Address, phone, email, map settings |
| SEO Manager | `/admin/seo` | Meta tags, Open Graph, keywords |
| Slides/CMS | `/admin/slides` | Banner slides, carousel content |
| Enquiries | `/admin/enquiry` | Website contact form submissions |
| Social Connect | `/admin/social-connect` | Facebook, Instagram, WhatsApp integration |
| Telegram Bot | `/admin/telegram` | Telegram message management |
| Activity Logs | `/admin/logs` | System-wide activity tracking |
| User Management | `/admin/users` | CMS staff user CRUD |

#### Roles
- `superadmin` — Full access
- `admin` — Most pages, no system/user management
- `author` — Blog + projects only

---

### Portal 2 — CRM (Client Relationship Management)

> **URL:** `digikraftsocial.com/crm/login`  
> **Purpose:** Client management, projects, billing, proposals, invoices  
> **Users:** Business team (owner, manager, accountant, executive)

#### Modules & Pages

| Module | Sub-Pages | Description |
|---|---|---|
| Dashboard | `/crm/dashboard` | Revenue stats, recent clients, active projects, overdue invoices |
| Clients | `/crm/dashboard/clients`, `/crm/dashboard/clients/[id]` | Client CRUD + per-client Projects/Proposals/Quotations/Invoices tabs |
| Services | `/crm/dashboard/services` | Digital marketing service catalogue (SEO, SMM, PPC, etc.) |
| Projects | `/crm/dashboard/projects` | Projects linked to clients and services |
| Proposals | `/crm/dashboard/proposals`, `/crm/dashboard/proposals/[id]` | Business proposals with PDF download, copy, history |
| Quotations | `/crm/dashboard/quotations`, `/crm/dashboard/quotations/[id]` | Quotations with line items, GST, PDF, copy, history |
| Invoices | `/crm/dashboard/invoices`, `/crm/dashboard/invoices/[id]` | Invoices with GST, PDF, status tracking |
| Portfolio | `/crm/dashboard/portfolio` | Internal case studies, results tracking |
| Payments | `/crm/dashboard/payments` | Payment records against invoices |
| Pending Users | `/crm/dashboard/pending-users` | New CRM user approval workflow |
| Enquiries | `/crm/dashboard/enquiries` | Lead/enquiry management |
| History | `/crm/dashboard/history` | Complete activity audit trail |
| Notifications | `/crm/dashboard/notifications` | In-app notification center |
| Settings | `/crm/dashboard/settings` | Company info, GST, bank details, invoice settings, profile |

#### Roles
- `owner` — Full access
- `manager` — All except certain financial restrictions
- `accountant` — Invoices + Payments only
- `executive` — Clients + Projects + Proposals + Enquiries

---

## 3. NEW PORTALS (TO BE BUILT)

---

### Portal 3 — HRM (Human Resource Management)

> **URL:** `digikraftsocial.com/hrm/login`  
> **Purpose:** HR team ka portal — employees manage karna, attendance, payroll, leaves, performance  
> **Users:** HR Admin, HR Manager, Department Manager  
> **Theme:** Purple/Violet — `#7c3aed` primary color

#### Description

HRM portal ek **admin-facing** system hai. Isme HR team aur managers login karte hain. Employees yahan login nahi karte (unke liye alag EMP portal hai). HRM mein sab kuch manage hota hai — employee records se lekar payroll processing tak.

---

### Portal 4 — EMP (Employee Self-Service Portal)

> **URL:** `digikraftsocial.com/emp/login`  
> **Purpose:** Employee ka personal portal — apni attendance dekho, leave apply karo, salary slip download karo  
> **Users:** All employees of DigiKraft Social  
> **Theme:** Blue/Indigo — `#2563eb` primary color

#### Description

EMP portal ek **employee-facing** system hai. Har employee yahan apna personal data access karta hai. HRM portal se alag auth system hai — same MongoDB database but alag collection (`hrm_employees` vs `hrm_users`).

---

## 4. HOW ALL 4 PORTALS CONNECT

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SHARED DATABASE (MongoDB Atlas)                   │
│                    Database Name: dks-website                        │
│                                                                      │
│  CMS Collections:        CRM Collections:                           │
│  ├── users               ├── crm_users                             │
│  ├── posts               ├── crm_clients                           │
│  ├── categories          ├── crm_projects                          │
│  ├── projects (web)      ├── crm_invoices                          │
│  ├── homepages           ├── crm_quotations                        │
│  └── ... etc             └── ... etc                               │
│                                                                      │
│  HRM Collections:        EMP Collections (shared with HRM):        │
│  ├── hrm_users           ├── hrm_employees (login + profile)       │
│  ├── hrm_departments     ├── hrm_emp_leave_requests                │
│  ├── hrm_designations    ├── hrm_emp_attendance_log                │
│  ├── hrm_employees       ├── hrm_emp_salary_slips                  │
│  ├── hrm_attendance      └── hrm_emp_documents                     │
│  ├── hrm_leaves                                                     │
│  ├── hrm_payroll                                                    │
│  ├── hrm_performance                                                │
│  └── hrm_settings                                                   │
└─────────────────────────────────────────────────────────────────────┘

KEY RELATIONSHIP:
- hrm_employees collection ek hi hai
- HRM portal HR team use karta hai employees ko manage karne ke liye
- EMP portal employees khud use karte hain (read + limited write access)
- Same document, different auth middleware, different views
```

---

## 5. HRM — DETAILED MODULE BREAKDOWN

### Module 1: Dashboard

**URL:** `/hrm/dashboard`  
**Access:** hr_admin, hr_manager, department_manager  

#### Description
HRM ka main landing page. Company-wide HR overview dikhata hai — total employees, today's attendance, pending leaves, upcoming payroll, recent joinings, birthday/anniversary alerts.

#### Sub-pages / Features

| Feature | Description |
|---|---|
| **Stats Cards** | Total Employees, Present Today, On Leave, New Joinings This Month |
| **Department Wise Strength** | Bar chart — each department ka headcount |
| **Attendance Summary** | Today's attendance % with present/absent/late breakdown |
| **Pending Leave Requests** | Quick list of leaves awaiting approval |
| **Upcoming Events** | Birthdays, work anniversaries, holidays this week |
| **Recent Activities** | Last 10 HR actions (onboarding, payroll processed, etc.) |
| **Payroll Status** | Current month payroll processed/pending |

---

### Module 2: Employee Management

**URL:** `/hrm/dashboard/employees`  
**Access:** hr_admin, hr_manager  

#### Description
Company ke sabhi employees ka central record. Hire se retire tak sab kuch manage karna. Employee profile me personal info, professional info, documents, salary history sab ek jagah.

#### Sub-Module 2.1 — Employee List

**URL:** `/hrm/dashboard/employees`

| Feature | Description |
|---|---|
| **Employee Table** | Name, Employee ID, Department, Designation, Status (Active/On Leave/Resigned) |
| **Search & Filter** | By name, department, designation, employment type, status |
| **Bulk Actions** | Bulk status update, bulk department change |
| **Export** | CSV/Excel export of employee list |
| **Add Employee Button** | Opens Add Employee form/modal |

#### Sub-Module 2.2 — Employee Detail Page

**URL:** `/hrm/dashboard/employees/[id]`

Left panel — Employee Profile Card:
| Field | Description |
|---|---|
| Profile Photo | Upload + display |
| Employee ID | Auto-generated (DKS-EMP-001) |
| Full Name | |
| Designation | |
| Department | |
| Employment Type | Full-time, Part-time, Intern, Freelancer, Contract |
| Date of Joining | |
| Status | Active, On Probation, Notice Period, Resigned, Terminated |
| Reporting Manager | Reference to another employee |

Right panel — Tabs:

**Tab 1: Personal Info**
- Personal Email, Personal Phone
- Date of Birth, Gender
- Blood Group
- Emergency Contact (name + phone)
- Current Address, Permanent Address
- Aadhaar Number, PAN Number

**Tab 2: Professional Info**
- Work Email (auto-generated)
- Work Phone Extension
- Office Location
- Shift Timing
- Work Schedule (Mon-Fri, Mon-Sat, etc.)
- Skills / Technologies
- Previous Employment History

**Tab 3: Salary & Payroll**
- Current CTC (per month, per annum)
- Basic Salary, HRA, Allowances breakdown
- Account Number, IFSC (for salary transfer)
- Salary revision history (date + amount + revised by)
- ESI Number, PF Number

**Tab 4: Documents**
- Offer Letter (PDF upload/download)
- Appointment Letter
- Aadhaar Card copy
- PAN Card copy
- Experience Letters
- Educational Certificates
- Any custom documents

**Tab 5: Attendance Summary**
- Monthly attendance calendar view
- Present, Absent, Half-day, Late counts
- Link to full attendance history

**Tab 6: Leave Balance**
- Earned Leave (EL), Sick Leave (SL), Casual Leave (CL) remaining
- Leave history table

**Tab 7: Performance**
- Latest performance review score
- KPIs assigned
- Goal progress

#### Sub-Module 2.3 — Add / Edit Employee

Form fields:
- Basic info: Name, personal email, phone, DOB, gender
- Professional: Department, Designation, Employment Type, Joining Date
- Salary: CTC, Basic, HRA
- Bank: Account No, IFSC, Bank Name
- Login credentials: work email + temp password (employee will change on first login to EMP portal)

#### Sub-Module 2.4 — Onboarding Checklist

| Step | Description |
|---|---|
| Welcome Email Sent | HR sends welcome + login credentials |
| Documents Collected | Offer letter signed, ID proof, photos |
| System Access Given | Email, tools, software access |
| Induction Completed | Orientation session done |
| Equipment Issued | Laptop, ID card, etc. |
| Profile Complete | All employee fields filled |

---

### Module 3: Departments & Designations

**URL:** `/hrm/dashboard/departments`  
**Access:** hr_admin  

#### Description
Company ki organizational structure define karna — departments, designations, reporting hierarchy.

#### Sub-Module 3.1 — Departments

**URL:** `/hrm/dashboard/departments`

| Feature | Description |
|---|---|
| **Department List** | Name, HOD (Head of Department), Employee Count, Created Date |
| **Add Department** | Name, Description, HOD (select from employees) |
| **Edit / Delete** | Update department info |
| **Department Strength** | How many employees in each department |

Example departments for DigiKraft Social:
- Design & Creative
- Social Media Management
- SEO & Content
- Web Development
- Sales & Business Development
- Accounts & Finance
- Human Resources
- Operations

#### Sub-Module 3.2 — Designations

**URL:** `/hrm/dashboard/designations`

| Feature | Description |
|---|---|
| **Designation List** | Title, Department, Level (Junior/Mid/Senior/Lead/Manager) |
| **Add Designation** | Title, Department, Level, Description |
| **Salary Grade** | Optional salary range for this designation |

Example designations:
- Social Media Executive
- SEO Analyst, Senior SEO Analyst, SEO Manager
- Graphic Designer, Senior Designer, Creative Director
- Web Developer, Senior Developer, Tech Lead
- HR Executive, HR Manager
- Business Development Executive, BDE Manager

---

### Module 4: Attendance Management

**URL:** `/hrm/dashboard/attendance`  
**Access:** hr_admin, hr_manager, department_manager  

#### Description
Employee attendance track karna — daily check-in/check-out, monthly reports, regularization requests. Employees apna attendance EMP portal se mark karte hain (ya manual entry).

#### Sub-Module 4.1 — Daily Attendance

**URL:** `/hrm/dashboard/attendance`

| Feature | Description |
|---|---|
| **Date Picker** | Select any date to view attendance |
| **Attendance Table** | Employee Name, Check-in Time, Check-out Time, Work Hours, Status |
| **Status Filter** | Present, Absent, Late, Half-day, On Leave, Holiday |
| **Manual Entry** | HR manually mark attendance for an employee |
| **Bulk Download** | Download day's attendance as CSV |

Status Types:
- **P** — Present (on time)
- **L** — Late (came after grace time)
- **A** — Absent (no check-in, no leave applied)
- **H** — Half Day (only half day worked)
- **OL** — On Leave (approved leave)
- **WFH** — Work From Home
- **HD** — Holiday

#### Sub-Module 4.2 — Monthly Report

**URL:** `/hrm/dashboard/attendance/monthly`

| Feature | Description |
|---|---|
| **Month Selector** | Choose month and year |
| **Employee-wise Summary** | Working Days, Present, Absent, Leave, Late count |
| **Calendar View** | Full month calendar for one employee |
| **Export Report** | Download monthly attendance report as Excel |

#### Sub-Module 4.3 — Regularization Requests

**URL:** `/hrm/dashboard/attendance/regularizations`

When employee forgets to check-in/out → they request from EMP portal → HR approves/rejects here.

| Field | Description |
|---|---|
| Employee | Name + ID |
| Date | Which date needs correction |
| Requested Check-in | What time they want to enter |
| Requested Check-out | What time they want to exit |
| Reason | Explanation |
| Status | Pending / Approved / Rejected |
| Actions | Approve, Reject buttons |

#### Sub-Module 4.4 — Holidays & Shifts

**URL:** `/hrm/dashboard/attendance/holidays`

| Feature | Description |
|---|---|
| **Holiday Calendar** | Add/edit company holidays (Diwali, Holi, Republic Day, etc.) |
| **Holiday Types** | National, Regional, Optional, Company |
| **Shift Management** | Morning 9-6, Evening 2-11, Night 10-7, etc. |
| **Assign Shifts** | Assign shift to employee or department |

---

### Module 5: Leave Management

**URL:** `/hrm/dashboard/leaves`  
**Access:** hr_admin, hr_manager, department_manager  

#### Description
Leave management — leave types define karna, employee leave balance manage karna, leave requests approve/reject karna, leave policies set karna.

#### Sub-Module 5.1 — Leave Requests

**URL:** `/hrm/dashboard/leaves`

| Column | Description |
|---|---|
| Employee | Name + photo |
| Leave Type | EL, SL, CL, LWP, Maternity, Paternity, etc. |
| From Date — To Date | Leave dates |
| Days | Number of days |
| Reason | Employee ki reason |
| Applied On | When request was submitted |
| Status | Pending, Approved, Rejected, Cancelled |
| Actions | Approve, Reject, View Details |

Filters: By status, department, leave type, date range

#### Sub-Module 5.2 — Leave Types

**URL:** `/hrm/dashboard/leaves/types`

| Leave Type | Full Form | Description |
|---|---|---|
| EL | Earned Leave | Accumulated monthly (12/year) |
| SL | Sick Leave | Medical purposes (12/year) |
| CL | Casual Leave | Personal urgent work (12/year) |
| LWP | Leave Without Pay | When no balance, unpaid |
| ML | Maternity Leave | 26 weeks for female employees |
| PL | Paternity Leave | 15 days for male employees |
| BL | Bereavement Leave | Death in family (3-5 days) |
| OL | Optional Leave | Festival of choice (2/year) |

HR can add custom leave types, set annual quota, encashment policy.

#### Sub-Module 5.3 — Leave Balance

**URL:** `/hrm/dashboard/leaves/balance`

| Feature | Description |
|---|---|
| **Balance Table** | Employee-wise all leave balances in one view |
| **Year Selection** | Check balance for any fiscal year |
| **Manual Credit/Debit** | HR manually adjust leave balance |
| **Carry Forward** | Auto carry forward at year end (configurable) |
| **Lapse Policy** | How many days lapse vs encash at year end |

#### Sub-Module 5.4 — Leave Calendar

**URL:** `/hrm/dashboard/leaves/calendar`

Visual calendar showing:
- Who is on leave on which day
- Multiple employees' leaves visible simultaneously
- Color coded by leave type
- Helps in planning — avoid too many people off same day

---

### Module 6: Payroll Management

**URL:** `/hrm/dashboard/payroll`  
**Access:** hr_admin, hr_manager  

#### Description
Monthly payroll processing — salary calculate karna, deductions apply karna, salary slips generate karna, payment records maintain karna. DigiKraft Social ka sabse critical module.

#### Sub-Module 6.1 — Payroll Dashboard

| Feature | Description |
|---|---|
| **Month Status** | Current month payroll status (Draft / Processing / Processed / Paid) |
| **Stats** | Total Employees, Total Payout, ESI Deduction, PF Deduction |
| **Quick Actions** | Run Payroll, View Slips, Download Sheet |

#### Sub-Module 6.2 — Salary Structure

**URL:** `/hrm/dashboard/payroll/structure`

Define salary components for each employee:

**Earnings (Credit) Components:**
| Component | Type | Description |
|---|---|---|
| Basic Salary | Fixed | 40-50% of CTC |
| HRA | Fixed | House Rent Allowance (40% of basic) |
| Conveyance Allowance | Fixed | Travel expenses |
| Medical Allowance | Fixed | Medical benefit |
| Special Allowance | Variable | Performance/project based |
| Overtime Pay | Variable | Extra hours worked |

**Deductions (Debit) Components:**
| Component | Type | Description |
|---|---|---|
| Provident Fund (PF) | Fixed % | 12% of basic (employee + employer) |
| ESI | Fixed % | 0.75% employee + 3.25% employer |
| Professional Tax | Fixed | State-wise (₹200/month in CG) |
| TDS | Variable | Income tax deduction at source |
| Loan EMI | Variable | If employee has advance/loan |
| Leave Without Pay | Variable | Auto-calculated from attendance |

#### Sub-Module 6.3 — Run Payroll

**URL:** `/hrm/dashboard/payroll/run`

Step-by-step payroll processing:

**Step 1 — Select Month & Department**
- Select pay period (e.g., October 2026)
- Select which departments to process (or all)

**Step 2 — Review Attendance Data**
- System pulls attendance for the month
- Shows Present days, LWP days, Leave days
- HR can manually override any discrepancy

**Step 3 — Calculate Salaries**
- System auto-calculates gross pay, deductions, net pay
- Shows breakdown per employee
- Edit individual employee entries if needed

**Step 4 — Apply Deductions**
- LWP auto-deducted based on attendance
- PF, ESI, PT auto-calculated
- TDS applied as per tax slab
- Any arrears or bonus added

**Step 5 — Review & Finalize**
- Full summary table
- Total payout amount
- Confirm & finalize (marks payroll as Processed)

**Step 6 — Generate Salary Slips**
- Auto-generate PDF salary slips for all employees
- Employees can see it on EMP portal immediately

#### Sub-Module 6.4 — Salary Slips

**URL:** `/hrm/dashboard/payroll/slips`

| Feature | Description |
|---|---|
| **Month Filter** | Select any month |
| **Employee Filter** | Search specific employee |
| **View Slip** | Opens formatted PDF salary slip |
| **Download** | Download individual or bulk slips |
| **Email Slips** | Email salary slip to employee |
| **Slip History** | All past slips for any employee |

Salary Slip format:
- Company header (DigiKraft Social logo, address, GSTIN)
- Employee details (Name, ID, Department, Designation, DOJ)
- Pay period
- Earnings table (Basic, HRA, Allowances, etc.)
- Deductions table (PF, ESI, PT, TDS, etc.)
- Net Pay (bold, highlighted)
- UAN number, PAN number
- Digital signature field

#### Sub-Module 6.5 — Payroll History

**URL:** `/hrm/dashboard/payroll/history`

| Column | Description |
|---|---|
| Month | October 2026, September 2026, etc. |
| Total Employees | How many got paid |
| Total Payout | Gross payout amount |
| Status | Draft / Processed / Paid |
| Processed On | Date + by whom |
| Actions | View Details, Download Sheet |

---

### Module 7: Performance Management

**URL:** `/hrm/dashboard/performance`  
**Access:** hr_admin, hr_manager, department_manager  

#### Description
Employee performance track karna — KPI goals set karna, quarterly reviews, ratings, feedback. DigiKraft Social mein creative/digital agency work ke liye relevant performance metrics.

#### Sub-Module 7.1 — Performance Reviews

**URL:** `/hrm/dashboard/performance/reviews`

| Feature | Description |
|---|---|
| **Review Cycles** | Monthly, Quarterly, Annual, Probation review |
| **Review Status** | Draft, In Progress, Submitted, HR Approved |
| **Reviewer** | Manager or HR fills the review |
| **Rating Scale** | 1-5 star rating or 1-10 numeric |
| **Summary** | Overall comment and recommendation |

#### Sub-Module 7.2 — KPI Goals

**URL:** `/hrm/dashboard/performance/kpis`

Per employee / per role goals:

| KPI | Role | Target | How Measured |
|---|---|---|---|
| Client Retention Rate | BDE Manager | >90% | CRM data |
| Projects Delivered On Time | Project Manager | >85% | Project tracker |
| Social Media Reach Growth | SMM Executive | +20%/month | Analytics |
| Organic Traffic Growth | SEO Analyst | +15%/month | GA data |
| Design Delivery Time | Designer | < 2 days avg | Task tracker |
| Response Time to Clients | All | < 4 hours | CRM |

#### Sub-Module 7.3 — Appraisal Management

**URL:** `/hrm/dashboard/performance/appraisals`

Year-end appraisal process:

| Step | Feature |
|---|---|
| **Initiate Appraisal** | HR starts appraisal cycle |
| **Self-Assessment** | Employee fills their own assessment (from EMP portal) |
| **Manager Assessment** | Manager reviews + scores |
| **HR Review** | HR finalizes rating |
| **Salary Revision** | Based on rating, auto-suggest increment % |
| **Letter Generation** | Generate appraisal letter PDF |

Rating → Increment mapping (configurable):
- Rating 5/5 → 30-40% increment
- Rating 4/5 → 20-30% increment
- Rating 3/5 → 10-15% increment
- Rating 2/5 → 0-5% increment
- Rating 1/5 → PIP (Performance Improvement Plan)

---

### Module 8: Recruitment

**URL:** `/hrm/dashboard/recruitment`  
**Access:** hr_admin, hr_manager  

#### Description
Hiring pipeline manage karna — job openings post karna, applications track karna, interview rounds schedule karna, offer letter generate karna.

#### Sub-Module 8.1 — Job Openings

**URL:** `/hrm/dashboard/recruitment/jobs`

| Field | Description |
|---|---|
| Job Title | e.g. Senior SEO Analyst |
| Department | SEO & Content |
| Positions | How many vacancies |
| Experience Required | 2-4 years |
| Skills Required | SEMrush, Ahrefs, GSC |
| Salary Range | ₹25,000 - ₹40,000/month |
| Status | Open, Closed, On Hold |
| Posted On | Date |
| Application Deadline | Date |

#### Sub-Module 8.2 — Applicant Tracker (ATS)

**URL:** `/hrm/dashboard/recruitment/applicants`

Kanban-style pipeline:

```
Applied → Screening → Interview Round 1 → Interview Round 2 → Offer → Hired / Rejected
```

Per applicant card:
- Name, email, phone
- Resume download link
- Applied position
- Current stage
- Rating (1-5 stars)
- Notes from interviewer
- Next action + scheduled date

#### Sub-Module 8.3 — Interview Scheduling

| Feature | Description |
|---|---|
| **Schedule Interview** | Date, time, interviewer, mode (in-person/video) |
| **Send Invitation** | Auto-email invite to candidate |
| **Feedback Form** | Post-interview feedback by interviewer |
| **Round Summary** | All rounds consolidated view |

#### Sub-Module 8.4 — Offer Letter

| Feature | Description |
|---|---|
| **Generate Offer** | Auto-fill offer letter with employee + salary details |
| **Offer Letter Template** | Customizable template with company letterhead |
| **Digital Send** | Email offer letter to candidate |
| **Acceptance Tracking** | Track if candidate accepted/declined |
| **Joining Confirmation** | Once accepted, move to onboarding |

---

### Module 9: Company Calendar & Policies

**URL:** `/hrm/dashboard/calendar`  
**Access:** hr_admin  

#### Sub-Module 9.1 — Company Calendar

| Feature | Description |
|---|---|
| **Annual Calendar** | Full year view with all marked events |
| **Holiday Types** | National, State, Company, Optional |
| **Add Holiday** | Name, date, type |
| **Generate Holiday List** | Printable/downloadable holiday list |

#### Sub-Module 9.2 — Company Policies

| Feature | Description |
|---|---|
| **Policy Documents** | Upload PDF policies (Leave policy, Code of conduct, etc.) |
| **Policy Categories** | HR Policy, IT Policy, Code of Conduct, Benefits |
| **Employee Visibility** | Mark which policies employees can see on EMP portal |
| **Version History** | Track policy updates |

---

### Module 10: Announcements & Communication

**URL:** `/hrm/dashboard/announcements`  
**Access:** hr_admin, hr_manager  

| Feature | Description |
|---|---|
| **Create Announcement** | Title, body, target audience (all/department/specific) |
| **Announcement Types** | General, Event, Policy Update, Emergency |
| **Scheduled Announcements** | Post at a future date/time |
| **View Statistics** | How many employees saw the announcement |
| **Comments** | Enable/disable employee comments |

---

### Module 11: HRM Settings

**URL:** `/hrm/dashboard/settings`  
**Access:** hr_admin  

| Tab | Settings |
|---|---|
| **Company Info** | Company name, logo, address, HR contact |
| **Working Hours** | Standard work hours, grace period, overtime rules |
| **Leave Policy** | Annual quota per leave type, carry-forward rules |
| **Payroll Config** | PF %, ESI %, Professional Tax, TDS slab |
| **Attendance Rules** | Late mark time, half-day cutoff, WFH policy |
| **Email Templates** | Offer letter, salary slip, leave approval emails |
| **User Management** | Add/manage HR portal users |

---

## 6. EMP — DETAILED MODULE BREAKDOWN

> **URL:** `digikraftsocial.com/emp/login`  
> **Who uses it:** Every employee of DigiKraft Social  
> **Purpose:** Self-service — employees apna data dekh sakte hain, requests submit kar sakte hain  
> **Auth:** Employee ID + password (credentials HR creates during onboarding)  
> **Theme:** Blue/Indigo — `#2563eb`

---

### Module 1: Employee Dashboard

**URL:** `/emp/dashboard`  
**Description:** Employee ka personal home screen. Personalized greeting, today's attendance, leave balance, upcoming paydays, recent announcements.

| Widget | Description |
|---|---|
| **Welcome Banner** | "Good Morning, Rahul! 👋" with date + time |
| **Today's Status** | Checked In / Not Checked In yet |
| **Check In/Out Button** | One-click punch in/punch out |
| **Leave Balance** | EL: 8 | SL: 12 | CL: 5 remaining |
| **Next Payday** | "Your salary will be credited in 5 days" |
| **Announcements** | Latest 3 company announcements |
| **Pending Actions** | Leave requests awaiting approval, regularization pending |
| **My Team** | Quick view of teammates + manager |

---

### Module 2: Attendance

**URL:** `/emp/dashboard/attendance`  

#### Sub-Module 2.1 — Punch In / Punch Out

| Feature | Description |
|---|---|
| **Check In Button** | Big green button — records check-in time |
| **Check Out Button** | Appears after check-in |
| **Location Capture** | Optional: record GPS location (WFH vs office) |
| **Today's Log** | Shows today's check-in/check-out times |
| **Work Hours** | Running timer of hours worked today |
| **Monthly Stats** | Present days, absent days, late count this month |

#### Sub-Module 2.2 — My Attendance History

| Feature | Description |
|---|---|
| **Monthly Calendar** | Color-coded calendar — green=P, red=A, yellow=L, grey=WE |
| **List View** | Table of all attendance records |
| **Filter** | By month, by status |
| **Download** | Download my attendance report PDF |

#### Sub-Module 2.3 — Regularization Request

When employee forgot to check-in/out:

| Field | Description |
|---|---|
| Date | Which date to regularize |
| Correct Check-in | Actual time employee came |
| Correct Check-out | Actual time employee left |
| Reason | Why forgot to check-in (power cut, mobile lost, etc.) |
| Supporting Proof | Optional file upload |
| Status | Pending / Approved / Rejected (shown after submission) |

---

### Module 3: Leave Management

**URL:** `/emp/dashboard/leaves`  

#### Sub-Module 3.1 — Apply Leave

Big form at top:

| Field | Description |
|---|---|
| Leave Type | Dropdown: EL, SL, CL, ML, PL, BL, LWP |
| From Date | Calendar picker |
| To Date | Calendar picker |
| Days | Auto-calculated (excluding weekends + holidays) |
| Session | Full Day / First Half / Second Half |
| Reason | Text area |
| Attachment | Optional — medical certificate for SL, etc. |
| Notify | Auto-notifies reporting manager |

#### Sub-Module 3.2 — My Leave Requests

Table showing all leave requests:

| Column | Description |
|---|---|
| Type | EL, SL, CL, etc. |
| Dates | From - To |
| Days | Count |
| Status | Pending 🟡, Approved ✅, Rejected ❌, Cancelled |
| Applied On | Date |
| Actions | Cancel (only if pending) |

#### Sub-Module 3.3 — Leave Balance Dashboard

Visual display:

```
EL  ████████░░  8 / 12 remaining
SL  ██████████  12 / 12 remaining
CL  ████░░░░░░  5 / 8 remaining
OL  ██░░░░░░░░  2 / 2 remaining
```

- Annual balance, used, remaining
- Leave lapse date (end of year)
- Option to apply leave from balance card directly

#### Sub-Module 3.4 — Leave Calendar

Team calendar — see when teammates/manager are on leave:
- Helps plan own leave without clashing
- Color-coded by person or leave type
- Read-only view (can't edit team leaves)

---

### Module 4: My Profile

**URL:** `/emp/dashboard/profile`  

Employee apna profile dekh sakta hai (most fields are read-only, set by HR):

#### Tab 1: Personal Details (Read Only)
- Name, Employee ID, Department, Designation
- Date of Joining, Employment Type
- Reporting Manager

#### Tab 2: Contact Info (Editable by Employee)
- Personal Phone number
- Personal Email
- Emergency Contact name + phone
- Current Address

#### Tab 3: Bank Details (Read Only)
- Bank Name, Account Number, IFSC
- *(Only HR can edit this)*

#### Tab 4: Change Password
- Current Password field
- New Password field
- Confirm New Password

---

### Module 5: Salary & Payroll

**URL:** `/emp/dashboard/salary`  

#### Sub-Module 5.1 — Salary Slips

| Feature | Description |
|---|---|
| **Slip List** | All months showing salary slips |
| **View Slip** | Opens formatted PDF salary slip |
| **Download** | Download PDF |
| **CTC Breakup** | Visual breakdown of gross, deductions, net |

#### Sub-Module 5.2 — CTC Breakup

Visual table:

| Component | Monthly | Annual |
|---|---|---|
| **EARNINGS** | | |
| Basic Salary | ₹20,000 | ₹2,40,000 |
| HRA | ₹8,000 | ₹96,000 |
| Conveyance | ₹1,600 | ₹19,200 |
| Medical | ₹1,250 | ₹15,000 |
| Special Allowance | ₹4,150 | ₹49,800 |
| **Gross Salary** | **₹35,000** | **₹4,20,000** |
| **DEDUCTIONS** | | |
| PF (Employee) | ₹2,400 | ₹28,800 |
| ESI | ₹262 | ₹3,150 |
| Professional Tax | ₹200 | ₹2,400 |
| **Total Deductions** | **₹2,862** | **₹34,350** |
| **NET SALARY** | **₹32,138** | **₹3,85,650** |

---

### Module 6: Documents

**URL:** `/emp/dashboard/documents`  

| Document | Who uploads | Employee can download? |
|---|---|---|
| Offer Letter | HR | ✅ Yes |
| Appointment Letter | HR | ✅ Yes |
| Increment Letter | HR | ✅ Yes |
| Experience Letter | HR (at exit) | ✅ Yes |
| Form 16 | HR/Finance | ✅ Yes |
| Relieving Letter | HR | ✅ Yes |
| ID Card | HR | ✅ Yes |

---

### Module 7: Company Information

**URL:** `/emp/dashboard/company`  

#### Sub-Module 7.1 — Team Directory

| Feature | Description |
|---|---|
| **All Employees List** | Name, Designation, Department, Email, Phone |
| **Department Filter** | Filter by department |
| **Search** | Find any colleague |
| **Profile Card** | Click to see colleague's limited profile |
| **Org Chart** | Visual hierarchy (optional) |

#### Sub-Module 7.2 — Announcements

- All company announcements visible to employee
- Unread notifications highlighted
- Older announcements in archive

#### Sub-Module 7.3 — Company Policies

- All HR-shared policy documents visible here
- Download policies as PDF
- "I have read & understood" acknowledgment option

#### Sub-Module 7.4 — Holidays

- Full year holiday list
- Optional holidays (employee can mark which OL they take)
- Upcoming holidays highlighted

---

### Module 8: Performance (Employee View)

**URL:** `/emp/dashboard/performance`  

#### Sub-Module 8.1 — My KPIs

- View KPIs set for current quarter
- Progress indicator per KPI
- Self-update progress (optional)

#### Sub-Module 8.2 — Self-Assessment Form

- During appraisal cycle, fill own self-assessment
- Rating yourself on each KPI
- Comments / achievements
- Submit to manager for review

#### Sub-Module 8.3 — My Reviews History

- Past appraisal results
- Manager feedback
- Rating history
- Download appraisal letters

---

### Module 9: Notifications (EMP)

**URL:** `/emp/dashboard/notifications`  

| Notification Type | Trigger |
|---|---|
| Leave Approved/Rejected | When manager approves/rejects leave request |
| Attendance Regularization | When HR approves/rejects |
| Salary Credited | When payroll is processed |
| New Announcement | Company-wide announcements |
| Upcoming Holiday | Reminder 1 day before holiday |
| Birthday/Anniversary | Own + colleagues' birthdays |
| Document Available | New document added to profile |
| Performance Review Due | Reminder to complete self-assessment |

---

## 7. DATABASE COLLECTIONS PLAN

### HRM Collections (backend/models/hrm/)

```
hrm_users           → HR portal staff (hr_admin, hr_manager, dept_manager)
hrm_employees       → All company employees (also used by EMP portal)
hrm_departments     → Departments (Design, SEO, Dev, etc.)
hrm_designations    → Job titles (SEO Analyst, Designer, etc.)
hrm_attendance      → Daily check-in/out records
hrm_leave_types     → EL, SL, CL, ML definitions
hrm_leaves          → Individual leave requests
hrm_payroll_runs    → Monthly payroll processing records
hrm_salary_slips    → Generated salary slips per employee per month
hrm_performance_reviews  → Review records
hrm_kpis            → KPI goals per employee
hrm_job_openings    → Recruitment job postings
hrm_applicants      → Job applicants
hrm_announcements   → Company-wide announcements
hrm_policies        → Policy documents
hrm_settings        → Singleton settings document
```

### EMP-specific sub-collections (shared with HRM but EMP-specific records)

```
hrm_emp_attendance_log     → Employee self-punch records
hrm_emp_regularizations    → Regularization requests from employees
hrm_emp_leave_requests     → Leave applications (can also be in hrm_leaves)
hrm_emp_documents          → Employee uploaded documents
hrm_emp_notifications      → Per-employee notification feed
```

---

### Key Employee Model (hrm_employees)

```javascript
{
  _id:              UUID,          // DKS-EMP-001 format
  employee_id:      String,        // Display ID
  full_name:        String,        // Required
  personal_email:   String,        // Personal email
  work_email:       String,        // auto-generated (name@digikraftsocial.com)
  password:         String,        // bcrypt hashed — for EMP portal login
  phone:            String,        // Personal mobile
  
  department:       ref hrm_departments,
  designation:      ref hrm_designations,
  reporting_manager: ref hrm_employees,    // Self-referential
  
  date_of_joining:  Date,
  employment_type:  Enum[full_time, part_time, intern, freelancer, contract],
  status:           Enum[active, probation, notice_period, resigned, terminated],
  
  // Personal
  date_of_birth:    Date,
  gender:           Enum[male, female, other],
  blood_group:      String,
  aadhaar_number:   String,
  pan_number:       String,
  
  // Addresses
  current_address:  String,
  permanent_address: String,
  
  // Emergency
  emergency_contact_name:  String,
  emergency_contact_phone: String,
  
  // Bank (for salary)
  bank_name:        String,
  account_number:   String,
  ifsc_code:        String,
  upi_id:           String,
  
  // Compliance
  pf_number:        String,
  esi_number:       String,
  uan_number:       String,
  
  // Salary
  current_ctc:      Number,        // Annual CTC
  current_basic:    Number,
  
  // Profile
  profile_image:    String,        // Upload path
  
  // EMP Portal login
  is_active:        Boolean,       // false = account disabled
  last_login:       Date,
  
  // Leave balances (embedded)
  leave_balance: {
    el: Number,    // Earned Leave
    sl: Number,    // Sick Leave
    cl: Number,    // Casual Leave
    ol: Number,    // Optional Leave
  },
  
  created_at, updated_at
}
```

---

## 8. BACKEND API ENDPOINTS PLAN

### HRM Routes (`/api/hrm/*`)

```
POST /api/hrm/auth/login          → HR portal login
POST /api/hrm/auth/register       → New HR user register
GET  /api/hrm/auth/me             → Get current HR user
POST /api/hrm/auth/me/change-password

GET  /api/hrm/dashboard/stats     → HRM dashboard stats

GET    /api/hrm/employees         → List all employees
POST   /api/hrm/employees         → Create employee
GET    /api/hrm/employees/:id     → Get single employee
PATCH  /api/hrm/employees/:id     → Update employee
DELETE /api/hrm/employees/:id     → Deactivate employee

GET  /api/hrm/departments         → List departments
POST /api/hrm/departments         → Create department
PATCH/DELETE /api/hrm/departments/:id

GET  /api/hrm/designations        → List designations
POST /api/hrm/designations        → Create designation

GET    /api/hrm/attendance              → Get attendance (date filter)
POST   /api/hrm/attendance             → Manual attendance entry
GET    /api/hrm/attendance/monthly     → Monthly report
PATCH  /api/hrm/attendance/:id         → Update/regularize

GET   /api/hrm/regularizations         → Pending regularization requests
PATCH /api/hrm/regularizations/:id    → Approve/Reject

GET    /api/hrm/leaves                 → All leave requests
PATCH  /api/hrm/leaves/:id            → Approve/Reject leave
GET    /api/hrm/leaves/balance/:empId → Employee leave balance
POST   /api/hrm/leaves/types          → Create leave type

POST   /api/hrm/payroll/run           → Process payroll for month
GET    /api/hrm/payroll/history       → Past payroll runs
GET    /api/hrm/payroll/slips         → All salary slips
GET    /api/hrm/payroll/slips/:empId  → Employee's slips

GET  /api/hrm/announcements           → List announcements
POST /api/hrm/announcements           → Create announcement

GET  /api/hrm/settings                → Get HRM settings
PUT  /api/hrm/settings                → Update HRM settings
```

### EMP Routes (`/api/emp/*`)

```
POST /api/emp/auth/login               → Employee portal login
GET  /api/emp/auth/me                  → Get current employee profile
POST /api/emp/auth/me/change-password  → Change password

GET  /api/emp/dashboard                → Personal dashboard data

POST /api/emp/attendance/checkin       → Employee self check-in
POST /api/emp/attendance/checkout      → Employee self check-out
GET  /api/emp/attendance/today         → Today's status
GET  /api/emp/attendance/history       → My attendance history
POST /api/emp/attendance/regularize    → Submit regularization request

POST /api/emp/leaves                   → Apply for leave
GET  /api/emp/leaves                   → My leave requests
PATCH /api/emp/leaves/:id/cancel       → Cancel pending leave
GET  /api/emp/leaves/balance           → My leave balance

GET  /api/emp/salary/slips             → My salary slips
GET  /api/emp/salary/slips/:id         → View specific slip (PDF)
GET  /api/emp/salary/ctc               → My CTC breakup

GET  /api/emp/documents                → My documents list
GET  /api/emp/profile                  → Full profile
PATCH /api/emp/profile                 → Update editable fields

GET  /api/emp/announcements            → Company announcements
GET  /api/emp/policies                 → Company policies
GET  /api/emp/holidays                 → Holiday calendar
GET  /api/emp/directory                → All employees directory

GET  /api/emp/notifications            → My notifications
PATCH /api/emp/notifications/read-all  → Mark all read

POST /api/emp/performance/self-assessment  → Submit self-assessment
GET  /api/emp/performance/reviews      → My past reviews
GET  /api/emp/performance/kpis         → My KPIs
```

---

## 9. FRONTEND FILE STRUCTURE PLAN

### HRM Portal (`website/app/hrm/`)

```
website/app/hrm/
├── layout.js                        → Root layout (imports hrm.css)
├── hrm.css                          → Purple theme CSS
├── login/
│   └── page.js                      → /hrm/login
├── components/
│   └── layout/
│       ├── HrmSidebar.js            → Purple sidebar with all HRM nav items
│       └── HrmHeader.js             → Header with notifications + user menu
└── dashboard/
    ├── layout.js                    → Auth guard + sidebar+header shell
    ├── page.js                      → HRM Dashboard
    ├── employees/
    │   ├── page.js                  → Employee list
    │   └── [id]/
    │       └── page.js              → Employee detail (all tabs)
    ├── departments/
    │   └── page.js                  → Departments + Designations
    ├── attendance/
    │   ├── page.js                  → Daily attendance
    │   ├── monthly/page.js          → Monthly report
    │   ├── regularizations/page.js  → Regularization requests
    │   └── holidays/page.js         → Holidays + Shifts
    ├── leaves/
    │   ├── page.js                  → Leave requests
    │   ├── balance/page.js          → Leave balances
    │   ├── types/page.js            → Leave types config
    │   └── calendar/page.js         → Leave calendar
    ├── payroll/
    │   ├── page.js                  → Payroll dashboard
    │   ├── run/page.js              → Run payroll wizard
    │   ├── slips/page.js            → Salary slips
    │   ├── structure/page.js        → Salary structure
    │   └── history/page.js          → Payroll history
    ├── performance/
    │   ├── page.js                  → Performance reviews
    │   ├── kpis/page.js             → KPI management
    │   └── appraisals/page.js       → Appraisal management
    ├── recruitment/
    │   ├── page.js                  → Job openings
    │   ├── applicants/page.js       → ATS - Applicant tracker
    │   └── interviews/page.js       → Interview scheduling
    ├── announcements/
    │   └── page.js                  → Company announcements
    ├── calendar/
    │   └── page.js                  → Company calendar + policies
    ├── pending-users/
    │   └── page.js                  → New HR user approval
    ├── notifications/
    │   └── page.js                  → HRM notifications
    └── settings/
        └── page.js                  → HRM settings
```

### EMP Portal (`website/app/emp/`)

```
website/app/emp/
├── layout.js                        → Root layout (imports emp.css)
├── emp.css                          → Blue/Indigo theme CSS
├── login/
│   └── page.js                      → /emp/login
├── components/
│   └── layout/
│       ├── EmpSidebar.js            → Blue sidebar with all EMP nav items
│       └── EmpHeader.js             → Header with notifications + punch in/out
└── dashboard/
    ├── layout.js                    → Auth guard (uses emp_token)
    ├── page.js                      → Employee Dashboard
    ├── attendance/
    │   ├── page.js                  → My attendance + punch in/out
    │   └── regularize/page.js       → Regularization request
    ├── leaves/
    │   ├── page.js                  → Apply leave + my requests
    │   ├── balance/page.js          → My leave balance
    │   └── calendar/page.js         → Team leave calendar
    ├── salary/
    │   ├── page.js                  → Salary slips + CTC breakup
    │   └── [id]/page.js             → View/download single slip
    ├── profile/
    │   └── page.js                  → My profile (personal + bank + password)
    ├── documents/
    │   └── page.js                  → My documents
    ├── company/
    │   ├── page.js                  → Team directory
    │   ├── announcements/page.js    → Company announcements
    │   ├── policies/page.js         → Company policies
    │   └── holidays/page.js         → Holiday calendar
    ├── performance/
    │   ├── page.js                  → My KPIs + self-assessment
    │   └── reviews/page.js          → My review history
    └── notifications/
        └── page.js                  → My notifications
```

---

## 10. ROLES & PERMISSIONS MATRIX

### HRM Portal Roles

| Permission | hr_admin | hr_manager | dept_manager |
|---|---|---|---|
| View all employees | ✅ | ✅ | ✅ (own dept) |
| Add/edit employee | ✅ | ✅ | ❌ |
| Delete/deactivate employee | ✅ | ❌ | ❌ |
| View attendance | ✅ | ✅ | ✅ (own dept) |
| Edit/mark attendance | ✅ | ✅ | ✅ (own dept) |
| Approve regularization | ✅ | ✅ | ✅ (own dept) |
| Approve leaves | ✅ | ✅ | ✅ (own dept) |
| Manage leave types | ✅ | ❌ | ❌ |
| View payroll | ✅ | ✅ | ❌ |
| Run payroll | ✅ | ✅ | ❌ |
| Manage departments | ✅ | ❌ | ❌ |
| Manage designations | ✅ | ❌ | ❌ |
| Recruitment | ✅ | ✅ | ❌ |
| Performance reviews | ✅ | ✅ | ✅ (own dept) |
| Announcements | ✅ | ✅ | ❌ |
| HRM Settings | ✅ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ |

### EMP Portal (All employees have same base access — only own data)

| Permission | Employee |
|---|---|
| View own profile | ✅ |
| Edit personal contact info | ✅ |
| Change password | ✅ |
| Punch in/out | ✅ |
| View own attendance | ✅ |
| Request regularization | ✅ |
| Apply leave | ✅ |
| Cancel own pending leave | ✅ |
| View leave balance | ✅ |
| View own salary slips | ✅ |
| Download salary slips | ✅ |
| View own documents | ✅ |
| View company directory | ✅ |
| View announcements | ✅ |
| View company policies | ✅ |
| View holiday calendar | ✅ |
| Submit self-assessment | ✅ |
| View own KPIs | ✅ |
| View other employees' salary | ❌ |
| Edit bank details | ❌ (HR only) |
| Edit designation/department | ❌ (HR only) |
| Approve leaves | ❌ |

---

## 11. IMPLEMENTATION ROADMAP

### Phase 1 — Foundation (1-2 weeks)
```
✅ Step 1: Backend HRM models
   - HrmUser.js (HR portal users)
   - HrmEmployee.js (employees)
   - HrmDepartment.js
   - HrmDesignation.js

✅ Step 2: Backend HRM auth
   - hrmAuth.js middleware
   - hrmAuthController.js
   - hrmAuthRoutes.js
   - Mount at /api/hrm/* in server.js

✅ Step 3: Frontend HRM skeleton
   - website/app/hrm/login/page.js
   - website/app/hrm/dashboard/layout.js
   - HrmSidebar.js + HrmHeader.js
   - utils/hrmApi.js

✅ Step 4: Add HRM card to portals/page.js
```

### Phase 2 — Employee Management (1 week)
```
✅ Step 5: HrmEmployee model full fields
✅ Step 6: Employee CRUD API
✅ Step 7: Employee list page
✅ Step 8: Employee detail page (all 7 tabs)
```

### Phase 3 — Attendance (1 week)
```
✅ Step 9: HrmAttendance model
✅ Step 10: Attendance API
✅ Step 11: Daily attendance page
✅ Step 12: Monthly report page
✅ Step 13: Regularization requests
```

### Phase 4 — Leave Management (1 week)
```
✅ Step 14: HrmLeave + HrmLeaveType models
✅ Step 15: Leave API
✅ Step 16: Leave requests page
✅ Step 17: Leave balance page
```

### Phase 5 — EMP Portal Foundation (1 week)
```
✅ Step 18: EmpAuth — employees login via work_email + password
           (credential from hrm_employees model — same collection)
✅ Step 19: empAuth.js middleware
✅ Step 20: emp portal login page
✅ Step 21: EMP dashboard
✅ Step 22: Punch in/out feature
✅ Step 23: My attendance + leave apply
```

### Phase 6 — Payroll (2 weeks — complex)
```
✅ Step 24: HrmPayrollRun model
✅ Step 25: HrmSalarySlip model
✅ Step 26: Payroll run wizard (6 steps)
✅ Step 27: Salary slip PDF generation
✅ Step 28: EMP salary slip view
```

### Phase 7 — Performance + Recruitment (1-2 weeks)
```
✅ Step 29: Performance review + KPI models
✅ Step 30: Appraisal management
✅ Step 31: Employee self-assessment from EMP
✅ Step 32: Recruitment ATS (Applicant Tracker)
✅ Step 33: Offer letter generator
```

### Phase 8 — Polish & Integration (1 week)
```
✅ Step 34: Announcements + Company Policies
✅ Step 35: HRM → CRM integration (client + project linked to employee)
✅ Step 36: Notifications system (HRM + EMP)
✅ Step 37: Mobile responsiveness
✅ Step 38: PDF exports (salary slips, offer letters, reports)
```

---

## QUICK REFERENCE CARD

```
┌─────────────────────────────────────────────────────────────────────────┐
│                DIGIKRAFT SOCIAL — 4 PORTALS QUICK REF                  │
├───────────┬──────────────┬──────────────┬────────────┬──────────────────┤
│           │ CMS          │ CRM          │ HRM        │ EMP              │
├───────────┼──────────────┼──────────────┼────────────┼──────────────────┤
│ URL       │ /admin/login │ /crm/login   │ /hrm/login │ /emp/login       │
│ API       │ /api/*       │ /api/crm/*   │ /api/hrm/* │ /api/emp/*       │
│ Users     │ users        │ crm_users    │ hrm_users  │ hrm_employees    │
│ Token key │ token        │ crm_token    │ hrm_token  │ emp_token        │
│ Theme     │ Green        │ Green        │ Purple     │ Blue/Indigo      │
│ Color     │ #22c55e      │ #22c55e      │ #7c3aed    │ #2563eb          │
├───────────┼──────────────┼──────────────┼────────────┼──────────────────┤
│ Purpose   │ Website      │ Client/      │ HR Admin   │ Employee         │
│           │ Content Mgmt │ Billing/CRM  │ Team Mgmt  │ Self-Service     │
├───────────┼──────────────┼──────────────┼────────────┼──────────────────┤
│ Modules   │ Blog, Pages  │ Clients      │ Employees  │ Attendance       │
│           │ Media, SEO   │ Projects     │ Attendance │ Leave Apply      │
│           │ Slides       │ Proposals    │ Leaves     │ Salary Slips     │
│           │ Enquiries    │ Quotations   │ Payroll    │ My Documents     │
│           │ Social Media │ Invoices     │ Perf. Mgmt │ My Profile       │
│           │              │ Payments     │ Recruitment│ Team Directory   │
│           │              │ Portfolio    │ Announcements│ Policies       │
└───────────┴──────────────┴──────────────┴────────────┴──────────────────┘
```

---

## KEY TECHNICAL NOTES FOR IMPLEMENTATION

### 1. Same Server, Same Database
HRM aur EMP dono existing backend server ka hi use karenge. Server.js mein sirf 2 lines add hongi:
```javascript
app.use("/api/hrm/*", require("./routes/hrm/*"));
app.use("/api/emp/*", require("./routes/emp/*"));
```

### 2. Employee Dual Role — HRM vs EMP
`hrm_employees` ek hi collection hai. Is collection ke documents do portals use karte hain:
- HRM portal: HR staff is collection ko manage karta hai (CRUD)
- EMP portal: Har employee is collection mein apna document use karta hai (limited read + some write)

Iska matlab hai `empAuth.js` middleware bhi `HrmEmployee` model ko hi use karega — `is_active: true` check karega.

### 3. Salary Slip PDF
Same `html2pdf.js` library use karein jo invoice PDF mein use ho rahi hai. `downloadPdf.js` utility reuse hogi.

### 4. Attendance Check-in/out
EMP portal mein ek big "CHECK IN" button hoga. Ye `POST /api/emp/attendance/checkin` call karega jo current timestamp record karega. Check-in ke baad button "CHECK OUT" mein badal jaayega.

### 5. Leave Application Flow
```
Employee (EMP) → applies leave → hrm_leaves collection mein save →
HR/Manager (HRM) → sees in pending leaves → Approve/Reject →
Employee (EMP) → sees updated status in my leaves
```

### 6. Payroll Complexity
Payroll sabse complex module hai. Pehle simple version build karo:
- Manual salary entry per employee
- Auto deductions (PF 12%, ESI 0.75%, PT ₹200)
- Net pay calculation
- PDF slip generation

Advanced features baad mein:
- Auto LWP deduction from attendance
- TDS calculation
- Arrears, bonus handling

---

*Document prepared by: DigiKraft Social Technical Team*  
*Convert to Word: Open in Google Docs → File → Download as Word (.docx)*  
*Or use: pandoc DIGIKRAFT-SOCIAL-PORTALS-PLANNING.md -o planning.docx*

---

---

# ══════════════════════════════════════════════════════════════════════════
# ADDENDUM — 3 NEW MAJOR SECTIONS (Added: October 2026)
# 1. HRM — Salary Management (Full Depth)
# 2. EMP — Salary & Payslip (Full Depth)
# 3. CRM → HRM + EMP Cross-Portal Login Access
# ══════════════════════════════════════════════════════════════════════════

---

## SECTION A — HRM: SALARY MANAGEMENT (FULL DEPTH)

> **Module Number:** 6A (Expanded version of Payroll Module 6)  
> **URL Base:** `/hrm/dashboard/salary`  
> **Access:** hr_admin (full), hr_manager (view + run), dept_manager (view own team only)  
> **Description:** DigiKraft Social ke har employee ki salary ka complete lifecycle manage karna — structure define karna, monthly process karna, slips generate karna, revisions track karna, compliance reports banana.

---

### A1. Salary Dashboard (HRM)

**URL:** `/hrm/dashboard/salary`

HRM Salary ka home screen. Current month ka overview aur quick actions.

| Widget / Card | Data Shown | Description |
|---|---|---|
| **Current Month Status** | October 2026 — PENDING / PROCESSED / PAID | Ek click se payroll ki current state |
| **Total Gross Payout** | ₹4,85,000 | Sab employees ki gross salary sum |
| **Total Net Payout** | ₹4,32,000 | Deductions ke baad actual transfer amount |
| **Total Deductions** | ₹53,000 | PF + ESI + PT + TDS total |
| **Employees on Payroll** | 14 / 14 processed | Kitne active employees hain vs kitne process hue |
| **PF Contribution** | ₹24,000 (emp) + ₹24,000 (employer) | Provident fund breakup |
| **ESI Contribution** | ₹3,640 (emp) + ₹15,730 (employer) | ESI breakup |
| **Pending Salary Revisions** | 2 pending | Revision requests awaiting approval |
| **Quick Actions** | Run Payroll, View Slips, Download Sheet, Upload Bank File | Shortcut buttons |

---

### A2. Salary Structure Management

**URL:** `/hrm/dashboard/salary/structure`

Har employee ki salary ka **template** define karna. Structure mein fixed components aur variable components hote hain.

#### A2.1 — Global Salary Components

HR admin yahan sab components define karta hai jo sab employees ke liye available rahenge:

**Earning Components (Credit to Employee):**

| Component Code | Component Name | Type | Calculation | Taxable? |
|---|---|---|---|---|
| BASIC | Basic Salary | Fixed | Manual Entry | Yes |
| HRA | House Rent Allowance | Fixed % | 40% of Basic (metro) / 50% (non-metro) | Partially |
| CONV | Conveyance Allowance | Fixed | ₹1,600/month | No (upto limit) |
| MED | Medical Allowance | Fixed | ₹1,250/month | No (upto limit) |
| SPEC | Special Allowance | Fixed | CTC - all others | Yes |
| OT | Overtime | Variable | Hourly rate × overtime hours | Yes |
| ARR | Arrears | Variable | Manual entry | Yes |
| BONUS | Performance Bonus | Variable | Manual entry / % of basic | Yes |
| LTA | Leave Travel Allowance | Annual | 1 month basic / year | No (upto limit) |
| CHILD | Children Education Allowance | Fixed | ₹100/child/month (max 2) | No (upto limit) |

**Deduction Components (Debit from Employee):**

| Component Code | Component Name | Type | Calculation | Mandatory? |
|---|---|---|---|---|
| PF_EMP | Provident Fund (Employee) | Fixed % | 12% of Basic | Yes (if basic > threshold) |
| ESI_EMP | ESI (Employee) | Fixed % | 0.75% of Gross (if gross ≤ ₹21,000) | Yes (if eligible) |
| PT | Professional Tax | State Fixed | ₹200/month (CG), slab-based | Yes |
| TDS | Income Tax (TDS) | Variable | As per IT slab + Form 12BB | Yes |
| LOAN_EMI | Loan/Advance EMI | Variable | Manual entry per employee | No |
| LWP_DED | Leave Without Pay | Calculated | (Gross/Working Days) × LWP Days | Auto |
| UNIFORM | Uniform Deduction | Fixed | Optional, manual | No |

**Employer Contributions (Not deducted from employee — company expense):**

| Component | Calculation | Description |
|---|---|---|
| PF_ER | 12% of Basic | Employer PF contribution (EPF + EPS) |
| ESI_ER | 3.25% of Gross | Employer ESI contribution |
| GRATUITY | 4.81% of Basic | Gratuity provision (15/26 × basic) |
| BONUS_ER | 8.33% of Basic | Statutory bonus (min ₹7,000) |

#### A2.2 — Employee-wise Salary Structure

**URL:** `/hrm/dashboard/salary/structure/[empId]`

Har employee ko individual salary assign karna:

| Field | Value Example | Description |
|---|---|---|
| Employee | Rahul Sharma (DKS-EMP-005) | Select employee |
| Effective From | 01 April 2026 | When this structure applies |
| Annual CTC | ₹4,20,000 | Total cost to company per year |
| Monthly Gross | ₹35,000 | Monthly before deductions |
| Monthly Net (Approx) | ₹32,138 | After standard deductions |

Component-wise entry:

```
EARNINGS                    MONTHLY        ANNUAL
─────────────────────────────────────────────────
Basic Salary                ₹20,000        ₹2,40,000
HRA (40% of Basic)          ₹8,000         ₹96,000
Conveyance Allowance        ₹1,600         ₹19,200
Medical Allowance           ₹1,250         ₹15,000
Special Allowance           ₹4,150         ₹49,800
─────────────────────────────────────────────────
GROSS SALARY                ₹35,000        ₹4,20,000

DEDUCTIONS
─────────────────────────────────────────────────
PF (Employee - 12% of Basic)₹2,400         ₹28,800
ESI (0.75% of Gross)         ₹262           ₹3,150
Professional Tax             ₹200           ₹2,400
TDS (estimated)              ₹0             ₹0 (if below taxable)
─────────────────────────────────────────────────
TOTAL DEDUCTIONS             ₹2,862         ₹34,350

NET SALARY                  ₹32,138        ₹3,85,650
─────────────────────────────────────────────────

EMPLOYER CONTRIBUTIONS (not from employee)
PF Employer (12% of Basic)  ₹2,400
ESI Employer (3.25% of Gross)₹1,137
─────────────────────────────────────────────────
TOTAL CTC (Gross + Employer) ₹38,537/month = ₹4,62,444/year
```

---

### A3. Salary Revision Management

**URL:** `/hrm/dashboard/salary/revisions`

Employee ki salary badhaane ya ghatane ka track record.

#### A3.1 — Revision List

| Column | Description |
|---|---|
| Employee | Name + ID |
| Previous CTC | Before revision |
| New CTC | After revision |
| Increment % | Auto-calculated |
| Effective Date | When new salary starts |
| Reason | Performance / Appraisal / Promotion / Market Correction |
| Revised By | HR name |
| Status | Pending / Approved / Rejected |
| Actions | View, Approve, Reject, Generate Letter |

#### A3.2 — Initiate Salary Revision

Form fields:
- Select Employee
- Revision Type: Increment / Promotion / Demotion / Correction
- Previous CTC (auto-filled)
- New CTC
- New Basic, HRA, allowances (auto-split by formula, editable)
- Effective Date
- Reason / Remarks
- Attach Supporting Document (appraisal form, etc.)
- Generate Increment Letter — checkbox

#### A3.3 — Revision History per Employee

Timeline view showing all past revisions:
```
April 2026  CTC: ₹3,00,000 → ₹4,20,000  (+40%)  Appraisal
Oct 2025    CTC: ₹2,80,000 → ₹3,00,000  (+7%)   Market Correction
April 2025  CTC: ₹2,40,000 → ₹2,80,000  (+17%)  Promotion
April 2024  Joining CTC: ₹2,40,000
```

---

### A4. Monthly Payroll Processing

**URL:** `/hrm/dashboard/salary/payroll`

Ek guided 6-step wizard jo har month payroll process karta hai.

#### Step 1 — Select Pay Period

```
┌─────────────────────────────────────────┐
│ Pay Period: October 2026                │
│ Working Days: 27                        │
│ Holidays: 4 (Gandhi Jayanti + Diwali)   │
│ Departments: [All ▼] or select specific │
│                                         │
│ [Next → Review Employees]               │
└─────────────────────────────────────────┘
```

#### Step 2 — Review Employee Attendance Data

Table showing each employee's attendance data for the month:

| Employee | Present | LWP | CL | EL | SL | Working Days | LWP Deduction |
|---|---|---|---|---|---|---|---|
| Rahul Sharma | 25 | 0 | 2 | 0 | 0 | 27 | ₹0 |
| Priya Singh | 22 | 3 | 1 | 1 | 0 | 27 | ₹3,888 (3×₹1,296) |
| Amit Kumar | 26 | 0 | 0 | 1 | 0 | 27 | ₹0 |

- HR can edit any row manually
- LWP deduction auto-calculated: (Gross ÷ Working Days) × LWP Days
- Cells highlighted in red if LWP > 0

#### Step 3 — Salary Calculation Preview

Full salary table with all components:

| Employee | Basic | HRA | Conv | Med | Spec | OT | Gross | PF | ESI | PT | TDS | LWP | Net |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Rahul Sharma | 20,000 | 8,000 | 1,600 | 1,250 | 4,150 | 0 | 35,000 | 2,400 | 262 | 200 | 0 | 0 | 32,138 |
| Priya Singh | 18,000 | 7,200 | 1,600 | 1,250 | 3,950 | 0 | 32,000 | 2,160 | 240 | 200 | 0 | 3,888 | 25,512 |

- Edit any individual cell
- Add one-time payments: Bonus, Arrears button per row
- Total row at bottom

#### Step 4 — Add Extras & Deductions (One-time)

| Employee | Type | Amount | Description |
|---|---|---|---|
| Rahul Sharma | Bonus | ₹5,000 | Diwali Bonus |
| Priya Singh | Loan Deduction | -₹2,000 | Salary Advance EMI |
| Amit Kumar | Arrear | ₹1,500 | September pending |

#### Step 5 — Payroll Summary & Finalize

```
┌────────────────────────────────────────────────┐
│          PAYROLL SUMMARY — OCTOBER 2026        │
│                                                │
│  Total Employees        : 14                  │
│  Total Gross Payout     : ₹4,85,000           │
│  Total Deductions       : ₹53,000             │
│  Total Net Payout       : ₹4,32,000           │
│                                               │
│  PF (Employee)          : ₹27,600            │
│  PF (Employer)          : ₹27,600            │
│  ESI (Employee)         : ₹3,640             │
│  ESI (Employer)         : ₹15,730            │
│  Professional Tax       : ₹2,800             │
│                                               │
│  [← Back] [Download Preview] [✓ FINALIZE]    │
└───────────────────────────────────────────────┘
```

After finalize:
- Payroll marked as "Processed"
- Salary slips auto-generated for all employees
- EMP portal mein slips visible ho jaate hain immediately
- HR gets notification

#### Step 6 — Bank Transfer File

| Feature | Description |
|---|---|
| **Generate Bank File** | Download CSV/XLSX in bank's bulk transfer format |
| **Format Support** | HDFC NetBanking CSV, ICICI CSV, standard NEFT format |
| **File Contents** | Employee Name, Account No, IFSC, Amount, Remarks |
| **Upload to Bank** | HR manually uploads file to netbanking portal |
| **Mark as Paid** | After bank transfer, HR marks payroll as "Paid" |

---

### A5. Salary Slips (HRM Admin View)

**URL:** `/hrm/dashboard/salary/slips`

HR ki side se salary slips manage karna.

#### A5.1 — Slip List View

| Filter | Options |
|---|---|
| Month | Any month dropdown |
| Year | 2024, 2025, 2026 |
| Department | Design, SEO, Dev, etc. |
| Employee | Search by name or ID |
| Status | Generated / Sent / Downloaded |

Table columns:
| Employee | Department | Month | Gross | Net | Status | Actions |
|---|---|---|---|---|---|---|
| Rahul Sharma | SEO | Oct 2026 | ₹40,000 | ₹37,138 | Generated | View, Download, Email |
| Priya Singh | Design | Oct 2026 | ₹32,000 | ₹25,512 | Sent | View, Download, Re-send |

#### A5.2 — Salary Slip Format (PDF)

```
╔══════════════════════════════════════════════════════════╗
║   [DigiKraft Logo]        SALARY SLIP                   ║
║   270/1, Swami Vivekanand Ward, Raipur                  ║
║   GSTIN: 22AARFD5166H1ZB                                ║
╠══════════════════════════════════════════════════════════╣
║  Employee: Rahul Sharma        EMP ID: DKS-EMP-005      ║
║  Dept: SEO & Content           Desig: Sr. SEO Analyst   ║
║  DOJ: 15 April 2024            UAN: 101234567890        ║
║  Pay Period: October 2026      Working Days: 27         ║
╠═══════════════════════╦══════════════════════════════════╣
║  EARNINGS             ║  DEDUCTIONS                     ║
╠═══════════════════════╬══════════════════════════════════╣
║  Basic Salary  20,000 ║  PF (Employee)        2,400     ║
║  HRA            8,000 ║  ESI                    262     ║
║  Conveyance     1,600 ║  Professional Tax       200     ║
║  Medical        1,250 ║  TDS                      0     ║
║  Special All.   4,150 ║  LWP Deduction            0     ║
║  Diwali Bonus   5,000 ║  Loan EMI                 0     ║
╠═══════════════════════╬══════════════════════════════════╣
║  GROSS SALARY  40,000 ║  TOTAL DEDUCTIONS     2,862     ║
╠═══════════════════════╩══════════════════════════════════╣
║                                                         ║
║       NET SALARY PAYABLE:  ₹37,138                     ║
║       (Thirty Seven Thousand One Hundred Thirty Eight)  ║
║                                                         ║
╠═════════════════════════════════════════════════════════╣
║  Bank: HDFC  Acc: XXXX XXXX 9505  IFSC: HDFC0002706    ║
╠═════════════════════════════════════════════════════════╣
║  PF No: DL/CPM/1234567   ESI No: 1234567890             ║
╠═════════════════════════════════════════════════════════╣
║  This is a computer generated salary slip.              ║
║  Authorized Signatory: _______________                  ║
╚═════════════════════════════════════════════════════════╝
```

#### A5.3 — Bulk Actions

| Action | Description |
|---|---|
| **Email All Slips** | Send salary slips to all employees via email (one click) |
| **Download All as ZIP** | Download all slips as a ZIP file |
| **Download Summary Sheet** | Excel file with all employees' net salaries |
| **Download PF Register** | Monthly PF contribution register for EPFO filing |
| **Download ESI Register** | Monthly ESI contribution register for ESIC filing |
| **Download PT Register** | Professional Tax register for state filing |

---

### A6. Salary Advance / Loan Management

**URL:** `/hrm/dashboard/salary/advances`

Employees ko salary advance ya company loan manage karna.

#### A6.1 — Advance Requests

| Column | Description |
|---|---|
| Employee | Name + ID |
| Request Date | When requested |
| Amount Requested | ₹10,000 |
| Reason | Medical Emergency / Personal |
| Repayment Period | 2 months (₹5,000/month EMI) |
| Status | Pending / Approved / Rejected / Repaid |
| Actions | Approve, Reject, View Repayment Schedule |

#### A6.2 — Loan Tracker

Per employee loan tracker:
- Total loan amount
- EMI per month (auto-deducted in payroll)
- Months remaining
- Outstanding balance
- Payment history

---

### A7. Compliance & Statutory Reports (HRM Salary)

**URL:** `/hrm/dashboard/salary/compliance`

**A7.1 — PF (Provident Fund) Reports**

| Report | Description | Download Format |
|---|---|---|
| Monthly ECR | Electronic Challan cum Return for EPFO portal | Text/Excel |
| PF Summary | Month-wise PF deduction per employee | Excel |
| Annual PF Statement | Full year PF contribution | PDF/Excel |
| Form 3A | Individual PF account statement | PDF |
| Form 6A | Annual PF statement for all employees | PDF |

**A7.2 — ESI Reports**

| Report | Description |
|---|---|
| Monthly ESI Challan | For ESIC portal submission |
| ESI Contribution Register | Month-wise ESI per employee |
| Form 7 | Employee-wise ESI register |

**A7.3 — Professional Tax**

| Report | Description |
|---|---|
| Monthly PT Challan | State Govt PT payment |
| PT Deduction Register | Employee-wise PT record |

**A7.4 — Income Tax (TDS)**

| Report | Description |
|---|---|
| Form 24Q | Quarterly TDS return for salary |
| Form 16 | Annual TDS certificate per employee |
| TDS Register | Month-wise TDS deduction |

**A7.5 — Annual Salary Reports**

| Report | Description |
|---|---|
| Salary Register | Full year salary register all employees |
| CTC Summary | All employees CTC breakup annual |
| Increment Report | All salary revisions in a year |
| Headcount Report | Joinings + exits per month |

---

### A8. Salary Settings (HRM)

**URL:** `/hrm/dashboard/salary/settings`

| Setting | Default | Description |
|---|---|---|
| PF Applicable From CTC | ₹15,000 basic | Below this, PF not mandatory |
| ESI Applicable Till Gross | ₹21,000 | Above this, ESI not applicable |
| Professional Tax (CG) | ₹200/month | State-specific, configurable |
| Working Days | 26 | Standard working days per month |
| Overtime Rate | 2× hourly | OT calculation rate |
| Salary Day | 1st of next month | When salary gets credited |
| Grace Period For LWP | 0 days | After how many LWP days deduction starts |
| PF Wage Ceiling | ₹15,000 | PF calculated on max ₹15,000 basic |
| HRA % (Metro) | 50% | HRA % for metro cities |
| HRA % (Non-Metro) | 40% | HRA % for non-metro (Raipur) |
| Gratuity % | 4.81% | Provision % of basic |

---

## SECTION B — EMP: SALARY & PAYSLIP (FULL DEPTH)

> **Module Number:** 5A (Expanded version of EMP Module 5)  
> **URL Base:** `/emp/dashboard/salary`  
> **Access:** Only the logged-in employee (can see only their own data)  
> **Description:** Employee apni poori salary history dekh sakta hai, slips download kar sakta hai, CTC samajh sakta hai, tax deductions dekh sakta hai, advance request kar sakta hai.

---

### B1. Salary Dashboard (EMP — Employee View)

**URL:** `/emp/dashboard/salary`

Employee ka personal salary home screen.

```
┌──────────────────────────────────────────────────────────┐
│  💰 My Salary                                           │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │ Current CTC │  │ Monthly Net │  │ Next Payday     │ │
│  │             │  │             │  │                 │ │
│  │ ₹4,20,000   │  │ ₹32,138     │  │ 1 Nov 2026      │ │
│  │ Per Annum   │  │ Take Home   │  │ (8 days away)   │ │
│  └─────────────┘  └─────────────┘  └─────────────────┘ │
│                                                          │
│  Latest Slip: October 2026 — ₹37,138  [View]  [PDF⬇]  │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Salary Trend (Last 6 months)                       │ │
│  │  Bar chart showing monthly net salary               │ │
│  │  May Jun Jul Aug Sep Oct                             │ │
│  │  ██  ██  ██  ██  ██  ████ (Oct higher = bonus)     │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

### B2. My Salary Slips

**URL:** `/emp/dashboard/salary/slips`

Har month ki salary slip list.

#### B2.1 — Slip List

```
YEAR: 2026
─────────────────────────────────────────────────────────
Month       Gross       Deductions  Net         Actions
─────────────────────────────────────────────────────────
Oct 2026    ₹40,000     ₹2,862      ₹37,138     👁 View  ⬇ PDF
Sep 2026    ₹35,000     ₹2,862      ₹32,138     👁 View  ⬇ PDF
Aug 2026    ₹35,000     ₹2,862      ₹32,138     👁 View  ⬇ PDF
Jul 2026    ₹35,000     ₹5,862      ₹29,138     👁 View  ⬇ PDF  ⚠️ LWP
Jun 2026    ₹35,000     ₹2,862      ₹32,138     👁 View  ⬇ PDF
May 2026    ₹35,000     ₹2,862      ₹32,138     👁 View  ⬇ PDF
─────────────────────────────────────────────────────────
YEAR: 2025
─────────────────────────────────────────────────────────
[Load More...]
```

⚠️ icon indicates LWP deduction — employee can hover to see reason

#### B2.2 — View Salary Slip (Detailed)

Pop-up or full page showing the salary slip exactly as the PDF format (same as Section A5.2 above), with:
- All earnings listed
- All deductions listed
- One-time items (bonus, arrear, LWP) highlighted separately
- Net pay bold
- Download button at top

#### B2.3 — Download Salary Slip (PDF)

- Uses `html2pdf.js` (same as CRM invoices)
- File name: `DKS-EMP-005-Oct-2026-Salary-Slip.pdf`
- Company header with logo
- Employee details
- Earnings/Deductions table
- Net pay
- "Computer Generated Salary Slip" footer

---

### B3. My CTC Breakup

**URL:** `/emp/dashboard/salary/ctc`

Employee apni complete CTC structure dekh sakta hai.

#### B3.1 — Visual CTC Breakup

```
ANNUAL CTC: ₹4,20,000

TAKE HOME SALARY
════════════════════════════════════════════
EARNINGS                    MONTHLY   ANNUAL
────────────────────────────────────────────
Basic Salary                ₹20,000   ₹2,40,000
HRA                          ₹8,000   ₹96,000
Conveyance Allowance         ₹1,600   ₹19,200
Medical Allowance            ₹1,250   ₹15,000
Special Allowance            ₹4,150   ₹49,800
────────────────────────────────────────────
GROSS SALARY                ₹35,000   ₹4,20,000

DEDUCTIONS                  MONTHLY   ANNUAL
────────────────────────────────────────────
PF (Your contribution 12%)   ₹2,400   ₹28,800
ESI (Your contribution 0.75%)  ₹262   ₹3,150
Professional Tax               ₹200   ₹2,400
TDS / Income Tax                 ₹0       ₹0
────────────────────────────────────────────
TOTAL DEDUCTIONS             ₹2,862   ₹34,350

NET TAKE HOME               ₹32,138   ₹3,85,650

COMPANY ALSO PAYS (Not from your salary)
────────────────────────────────────────────
PF (Employer 12%)            ₹2,400   ₹28,800
ESI (Employer 3.25%)         ₹1,137   ₹13,650
Gratuity Provision (4.81%)     ₹962   ₹11,538
────────────────────────────────────────────
TOTAL COMPANY COST          ₹39,499   ₹4,73,988
════════════════════════════════════════════
```

- Pie chart showing earnings distribution
- Bar chart comparing gross vs net vs deductions
- **"Why is X deducted?"** — hover tooltip explaining each deduction

#### B3.2 — Tax Calculator (Estimated TDS)

Simple tool for employee to estimate yearly tax:

| Input | Example |
|---|---|
| Gross Annual Income | ₹4,20,000 (auto-filled) |
| HRA Exemption | ₹96,000 (auto-calculated) |
| LTA Claimed | ₹20,000 (enter manually) |
| 80C Investments | ₹1,50,000 (PF + ELSS + LIC) |
| 80D (Medical Insurance) | ₹25,000 |
| Std Deduction | ₹50,000 (flat deduction) |

Output:
- Taxable Income
- Estimated Tax (Old regime vs New regime comparison)
- Recommended regime
- Estimated Monthly TDS

---

### B4. My Salary History & Increments

**URL:** `/emp/dashboard/salary/history`

Employee apni salary journey dekh sakta hai.

#### B4.1 — Salary Revision Timeline

Visual timeline:

```
APRIL 2026 ────────────────────────────────────── CURRENT
│
├── 01 Apr 2026 ▲ Increment (+40%)
│   CTC: ₹3,00,000 → ₹4,20,000
│   Reason: Annual Appraisal (Rating: 4.5/5)
│   [📄 Download Increment Letter]
│
├── 01 Oct 2025 ▲ Market Correction (+7%)
│   CTC: ₹2,80,000 → ₹3,00,000
│   Reason: Market correction
│   [📄 Download Revision Letter]
│
├── 01 Apr 2025 ▲ Promotion + Increment (+17%)
│   CTC: ₹2,40,000 → ₹2,80,000
│   Reason: Promoted to Sr. SEO Analyst
│   [📄 Download Letter]
│
└── 15 Apr 2024 ★ Joining
    CTC: ₹2,40,000
    [📄 Download Offer Letter]
```

#### B4.2 — Documents Related to Salary

| Document | Date | Actions |
|---|---|---|
| Offer Letter | 10 Apr 2024 | View, Download |
| Appointment Letter | 15 Apr 2024 | View, Download |
| Increment Letter — Apr 2025 | 31 Mar 2025 | View, Download |
| Increment Letter — Apr 2026 | 31 Mar 2026 | View, Download |
| Form 16 — FY 2024-25 | 31 May 2025 | View, Download |
| Form 16 — FY 2025-26 | 31 May 2026 | View, Download |

---

### B5. Salary Advance Request (EMP)

**URL:** `/emp/dashboard/salary/advance`

Employee apni zaroorat ke hisaab se salary advance ya company loan request kar sakta hai.

#### B5.1 — Apply for Advance

```
┌─────────────────────────────────────────────────────┐
│  Request Salary Advance                             │
│                                                     │
│  Amount Needed: [₹ _______________]                │
│  Reason: [Medical / Education / Personal / Other ▼] │
│  Details: [Text area for explanation]               │
│  Requested Repayment: [2 / 3 / 4 / 6 months ▼]    │
│  Monthly EMI (auto): ₹5,000 for 2 months           │
│  Supporting Document: [📎 Attach]                  │
│                                                     │
│  [Submit Request]                                   │
└─────────────────────────────────────────────────────┘
```

Eligibility rules (configurable by HR):
- Minimum 6 months in company
- Maximum advance = 2 months net salary
- Maximum 1 active advance at a time

#### B5.2 — My Advance Status

| Request | Amount | Status | EMI | Remaining | Actions |
|---|---|---|---|---|---|
| Oct 2026 | ₹10,000 | Approved | ₹5,000 × 2 | ₹5,000 | View |
| Jul 2025 | ₹5,000 | Repaid | ₹2,500 × 2 | ₹0 | View |

---

### B6. Annual Tax Declaration (Form 12BB — EMP)

**URL:** `/emp/dashboard/salary/tax`

Employee apne tax-saving investments declare karta hai. HR isko TDS calculation mein use karta hai.

#### B6.1 — Investment Declaration Form

```
FORM 12BB — Employee Investment Declaration FY 2026-27
═══════════════════════════════════════════════════════

SECTION 80C (Max ₹1,50,000):
─────────────────────────────
Life Insurance Premium        [₹ _______]  (LIC, term, ULIP)
EPF (Employee PF)             [auto-filled] ₹28,800
ELSS / Mutual Fund            [₹ _______]
PPF                           [₹ _______]
5-Year FD                     [₹ _______]
Children Tuition Fee          [₹ _______]
Home Loan Principal           [₹ _______]
80C Total                     [₹ _______] (max ₹1,50,000)

SECTION 80D (Health Insurance):
────────────────────────────────
Self + Family Insurance       [₹ _______] (max ₹25,000)
Parents' Insurance            [₹ _______] (max ₹25,000 / ₹50,000 if senior)
80D Total                     [₹ _______]

HOUSE RENT ALLOWANCE:
─────────────────────
Actual Rent Paid/month        [₹ _______]
Landlord Name                 [___________]
Landlord PAN                  [___________]

HOME LOAN (Section 24):
────────────────────────
Home Loan Interest            [₹ _______] (max ₹2,00,000)

OTHER DEDUCTIONS:
─────────────────
80E (Education Loan Interest) [₹ _______]
80TTA (Savings Interest)      [₹ _______] (max ₹10,000)
NPS (80CCD)                   [₹ _______] (max ₹50,000 extra)

[Save Declaration]  [Submit to HR]
═══════════════════════════════════════════════════════
```

After submission:
- HR gets notification
- TDS recalculated based on declared investments
- Employee gets revised TDS estimate

---

## SECTION C — CRM → HRM + EMP CROSS-PORTAL LOGIN ACCESS

> **What this means:** CRM portal use karte waqt owner/manager ko directly HRM portal aur EMP portal access karne ki facility. Ek click mein CRM se HRM ya EMP portal khul jaye — alag se URL yaad karne ki zaroorat nahi.

---

### C1. Why This Makes Sense

DigiKraft Social mein ek owner ya manager typically **3 portals** use karta hai:

```
CRM → Clients manage karta hai, invoices banata hai, proposals bhejta hai
HRM → Apni team ka payroll process karta hai, leaves approve karta hai
EMP → Apna khud ka attendance check karta hai, salary slip dekhta hai
```

Alag alag tabs mein teeno portals open karna inconvenient hai. CRM mein ek "Portal Switcher" section hoga jisse directly doosre portals access ho sakein.

---

### C2. Implementation — CRM Sidebar mein Portal Access

**Location:** CRM Sidebar ke bottom mein — existing Settings link ke neeche

**CrmSidebar.js mein addition:**

```
Current CRM Sidebar:
├── Dashboard
├── Clients
├── Services
├── Projects
├── Proposals
├── Quotations
├── Invoices
├── Portfolio
├── Payments
├── Pending Users
├── Enquiries
├── History
├── Notifications
├── Settings
│
└── ── Other Portals ──          ← NEW SECTION
    ├── 🟣 HRM Portal →          ← Opens /hrm/login in new tab
    └── 🔵 EMP Portal →          ← Opens /emp/login in new tab
```

Visual design:
- Sidebar ke bottom mein `──── Other Portals ────` divider
- HRM link: purple badge icon + "HRM Portal" text + external link icon
- EMP link: blue badge icon + "EMP Portal" text + external link icon
- Role-based: Only `owner` and `manager` roles dekhenge ye links

---

### C3. CRM Settings Page — Portal Links Tab

**URL:** `/crm/dashboard/settings` mein ek naya tab: **"Other Portals"**

**Tab content:**

```
┌─────────────────────────────────────────────────────────┐
│  🟣 HRM Portal (Human Resource Management)             │
│                                                         │
│  URL: digikraftsocial.com/hrm/login                    │
│  Purpose: Manage team attendance, payroll, leaves       │
│                                                         │
│  [🔗 Open HRM Portal →]                               │
│                                                         │
│  Quick Stats (if HRM is built):                        │
│  • Total Employees: 14                                 │
│  • Present Today: 12                                   │
│  • Pending Leaves: 3                                   │
│  • Payroll Status: October — PENDING                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🔵 EMP Portal (Employee Self-Service)                  │
│                                                         │
│  URL: digikraftsocial.com/emp/login                    │
│  Purpose: Employee attendance, leave, salary slips      │
│                                                         │
│  [🔗 Open EMP Portal →]                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🟢 CMS Portal (Website Admin)                         │
│                                                         │
│  URL: digikraftsocial.com/admin/login                  │
│  Purpose: Blog, pages, media, SEO                       │
│                                                         │
│  [🔗 Open CMS Portal →]                               │
└─────────────────────────────────────────────────────────┘
```

---

### C4. CRM Dashboard — Portal Quick Access Widget

**URL:** `/crm/dashboard` (home page) mein ek widget

Position: Dashboard page ke bottom right corner mein ya sidebar ke bottom mein

```
┌────────────────────────────────────┐
│  🚀 Quick Portal Access            │
│                                    │
│  [🟣 HRM]  [🔵 EMP]  [🟢 CMS]    │
│                                    │
│  Click to open in new tab          │
└────────────────────────────────────┘
```

---

### C5. Technical Implementation Details

#### C5.1 — CrmSidebar.js Changes

Existing `navItems` array ke baad ek new section add karna:

```javascript
// ── Other Portals section (owner + manager only) ─────────────
const portalLinks = [
  {
    id:    "hrm-portal",
    label: "HRM Portal",
    href:  "https://digikraftsocial.com/hrm/login",
    icon:  Users,          // lucide-react icon
    color: "#7c3aed",      // purple
    bg:    "#ede9fe",
    roles: ["owner", "manager"],
    external: true,        // opens in new tab
  },
  {
    id:    "emp-portal",
    label: "EMP Portal",
    href:  "https://digikraftsocial.com/emp/login",
    icon:  UserCircle,
    color: "#2563eb",      // blue
    bg:    "#dbeafe",
    roles: ["owner", "manager", "accountant"],
    external: true,
  },
];
```

Render in sidebar (below Settings link):
```jsx
{/* ── Other Portals ── */}
<div style={{ borderTop: "1px solid #f1f5f9", margin: "8px 10px 0", paddingTop: 8 }}>
  <p style={{ fontSize: 9, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
              letterSpacing: ".1em", padding: "0 8px 4px", margin: 0 }}>
    Other Portals
  </p>
  {visiblePortalLinks.map(p => (
    <a key={p.id} href={p.href} target="_blank" rel="noreferrer"
       style={{ display: "flex", alignItems: "center", gap: 9,
                padding: "8px 11px", borderRadius: 8, textDecoration: "none",
                color: p.color, fontSize: 13, fontWeight: 500,
                transition: "background .15s" }}
       onMouseEnter={e => e.currentTarget.style.background = p.bg}
       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <p.icon size={15} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{p.label}</span>
      <span style={{ fontSize: 10 }}>↗</span>
    </a>
  ))}
</div>
```

#### C5.2 — Portals Page Update

`website/app/portals/page.js` ko update karna — 4 cards instead of 2:

```jsx
// Existing: CMS + CRM
// Add: HRM + EMP

<PortalCard
  href="/hrm/login"
  title="HRM Portal"
  description="Manage team, attendance, payroll, leaves and performance"
  btnLabel="Login to HRM →"
  btnBg="#7c3aed"
  iconColor="#7c3aed"
  iconBg="#ede9fe"
  icon={<UsersIcon />}
/>

<PortalCard
  href="/emp/login"
  title="Employee Portal"
  description="View your attendance, salary slips, apply leaves"
  btnLabel="Employee Login →"
  btnBg="#2563eb"
  iconColor="#2563eb"
  iconBg="#dbeafe"
  icon={<UserCircleIcon />}
/>
```

Grid: `gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))"` — 4 cards wrap automatically on mobile

#### C5.3 — CMS Asidebar.js Update

CMS portal ke Asidebar.js mein bhi "Other Portals" section add karna (superadmin ke liye):

```
CMS Sidebar bottom:
├── CRM Portal →    (already added — green button)
├── HRM Portal →    (new — purple)
└── EMP Portal →    (new — blue)
```

---

### C6. Cross-Portal Navigation Flow

```
USER JOURNEY 1 (Owner):
─────────────────────────────────────────────────────────────
CRM Login → CRM Dashboard → Client ka invoice banaya
→ Sidebar mein "HRM Portal →" click kiya
→ HRM Portal new tab mein khul gaya
→ HRM Dashboard → Payroll run kiya
→ HRM Sidebar mein salary slips download kiye
─────────────────────────────────────────────────────────────

USER JOURNEY 2 (HR Manager):
─────────────────────────────────────────────────────────────
HRM Login → HRM Dashboard → Employee leave approve kiya
→ (HRM mein CRM access nahi hota — alag portal)
─────────────────────────────────────────────────────────────

USER JOURNEY 3 (Employee):
─────────────────────────────────────────────────────────────
EMP Login → EMP Dashboard → Salary slip download ki
→ Leave apply ki
→ Attendance check ki
→ (EMP mein CRM/HRM access nahi hota)
─────────────────────────────────────────────────────────────

USER JOURNEY 4 (Accountant):
─────────────────────────────────────────────────────────────
CRM Login → Invoices/Payments manage kiye
→ Sidebar "HRM Portal" click → HRM mein salary compliance
  reports download kiye (PF register, ESI register)
─────────────────────────────────────────────────────────────
```

---

### C7. Updated Quick Reference Card (5 Portals Overview)

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│              DIGIKRAFT SOCIAL — ALL PORTALS UPDATED QUICK REF                   │
├────────────┬──────────────┬──────────────┬──────────────┬───────────────────────┤
│            │ CMS          │ CRM          │ HRM          │ EMP                   │
├────────────┼──────────────┼──────────────┼──────────────┼───────────────────────┤
│ URL        │/admin/login  │/crm/login    │/hrm/login    │/emp/login             │
│ API        │/api/*        │/api/crm/*    │/api/hrm/*    │/api/emp/*             │
│ Users DB   │users         │crm_users     │hrm_users     │hrm_employees          │
│ Token Key  │token         │crm_token     │hrm_token     │emp_token              │
│ Theme      │Green         │Green         │Purple        │Blue/Indigo            │
│ Color      │#22c55e       │#22c55e       │#7c3aed       │#2563eb                │
├────────────┼──────────────┼──────────────┼──────────────┼───────────────────────┤
│ Salary     │ ❌ No        │ ❌ No        │ ✅ FULL      │ ✅ VIEW ONLY          │
│ Module     │              │              │ (HR Admin)   │ (Own slips only)      │
├────────────┼──────────────┼──────────────┼──────────────┼───────────────────────┤
│ Salary     │ —            │ —            │ Structure,   │ View slips,           │
│ Features   │              │              │ Run payroll, │ CTC breakup,          │
│            │              │              │ Slips (all), │ Tax calc,             │
│            │              │              │ Revisions,   │ Advance request,      │
│            │              │              │ Compliance,  │ Increment history,    │
│            │              │              │ Bank file,   │ Form 16 download,     │
│            │              │              │ Advances,    │ Form 12BB submit      │
│            │              │              │ PF/ESI/PT    │                       │
├────────────┼──────────────┼──────────────┼──────────────┼───────────────────────┤
│ Access     │ CRM→HRM ✅   │ CRM→HRM ✅   │ Standalone   │ Standalone            │
│ from CRM   │ CRM→EMP ✅   │ CRM→EMP ✅   │ (no CRM      │ (no CRM               │
│            │              │              │  access)     │  access)              │
└────────────┴──────────────┴──────────────┴──────────────┴───────────────────────┘

WHERE TO ACCESS HRM/EMP FROM CRM:
  1. CRM Sidebar → Bottom → "Other Portals" section → HRM/EMP links (new tab)
  2. CRM Dashboard → "Quick Portal Access" widget → 3 portal buttons
  3. CRM Settings → "Other Portals" tab → Portal cards with quick stats
  4. /portals page → All 4 portal cards visible

SALARY COMPARISON (HRM vs EMP):
  HRM (HR can see/edit ALL employees' salaries):
    • Set salary structure
    • Run monthly payroll
    • Generate & send all slips
    • Process revisions/increments
    • Download compliance reports
    • Manage advances
    
  EMP (Employee can see ONLY their own salary):
    • View own slips (read only)
    • Download own slip PDF
    • See CTC breakup
    • Estimate tax
    • Submit Form 12BB
    • Request advance
    • See increment history
```

---

*Document Version: 2.0*  
*Last Updated: October 2026*  
*Added in v2.0: Full Salary Modules (HRM + EMP), CRM Cross-Portal Access*  
*Convert to Word: Open in Google Docs → File → Download as Word (.docx)*
