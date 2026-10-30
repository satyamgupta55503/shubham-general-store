# DigiKraft Social — Complete Internal System Documentation

---

| **Document Version** | 6.0 |
|---|---|
| **Last Updated** | October 2026 |
| **Project Name** | DigiKraft Social — Portal System |
| **Prepared By** | Development Team |
| **Status** | Production Ready |
| **Confidentiality** | Internal Use Only |

---

## Table of Contents

| Section | Title |
|---|---|
| **1** | System Overview & Architecture |
| **2** | Technology Stack |
| **3** | Four Portals — Summary & Comparison |
| **4** | Login Credentials & Access URLs |
| **5** | CMS Portal — Website Administration |
| **6** | CRM Portal — Client & Business Management |
| **7** | HRM Portal — Human Resource Management |
| **8** | EMP Portal — Employee Self-Service |
| **9** | Task Management System |
| **10** | Attendance & Check-In / Check-Out System |
| **11** | Leave Management |
| **12** | Payroll & Salary Processing |
| **13** | Holiday Calendar |
| **14** | Announcements & Notice Board |
| **15** | Reports & Analytics |
| **16** | Employee Onboarding Tracker |
| **17** | Team Directory |
| **18** | Adding a New Employee — Complete Flow |
| **19** | Roles & Permissions Matrix |
| **20** | Security Architecture |
| **21** | Server Setup & Environment |
| **22** | Troubleshooting Guide |
| **23** | Version History |

---

## 1. System Overview & Architecture

### What This System Is

DigiKraft Social has built a **complete, custom-developed internal business platform** consisting of four independent portals — all running on a single backend server and sharing one MongoDB database.

Each portal has its own:
- Login page and authentication system
- JWT token with a portal-specific secret key
- Dedicated database collections
- Role-based access control

This means a staff member logged into the CRM cannot accidentally or maliciously access HRM data, and vice versa.

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                 digikraftsocial.com  (Next.js 14 Frontend)            │
│                         Running on Port 3000                          │
│                                                                      │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│   │   CMS    │    │   CRM    │    │   HRM    │    │   EMP    │      │
│   │ Website  │    │  Client  │    │  Human   │    │Employee  │      │
│   │  Admin   │    │   Mgmt   │    │Resource  │    │  Self    │      │
│   │          │    │          │    │   Mgmt   │    │ Service  │      │
│   │ /admin/  │    │ /crm/    │    │ /hrm/    │    │ /emp/    │      │
│   │  login   │    │  login   │    │  login   │    │  login   │      │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│             Node.js + Express Backend  (Port 5000)                    │
│                                                                      │
│   /api/*          →  CMS routes                                      │
│   /api/crm/*      →  CRM routes                                      │
│   /api/hrm/*      →  HRM routes                                      │
│   /api/emp/*      →  EMP routes                                      │
│                                                                      │
│   Security Layer: Helmet · Mongo-Sanitize · HPP · Rate Limit         │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│               MongoDB Atlas  (Cloud Database)                         │
│                    Database: dks-website                              │
│                                                                      │
│   CMS:  users                                                        │
│   CRM:  crm_users · crm_clients · crm_projects · crm_invoices …     │
│   HRM:  hrm_users · hrm_employees · hrm_attendance · hrm_payrolls … │
│   EMP:  (shares hrm_employees, hrm_attendance, hrm_leaves, etc.)    │
└──────────────────────────────────────────────────────────────────────┘
```

### Portal Chooser Page

There is a single landing page at `/portals` that displays all four portal cards. Any team member can visit this page and click their portal — no need to remember individual URLs.

---

## 2. Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | Next.js 14 | React-based, server-side rendering, App Router |
| **Backend Framework** | Node.js + Express 5 | RESTful API, async/await throughout |
| **Database** | MongoDB Atlas | Cloud-hosted, replica set, SSL-encrypted connection |
| **Authentication** | JSON Web Tokens (JWT) | 4 separate secrets — one per portal |
| **Password Security** | bcryptjs | 12 salt rounds — stronger than industry standard (10) |
| **HTTP Security** | Helmet.js | Sets 11 security-related HTTP response headers |
| **Injection Prevention** | express-mongo-sanitize | Strips MongoDB operators from all user inputs |
| **Request Security** | HPP (HTTP Param Pollution) | Prevents query parameter injection |
| **Rate Limiting** | express-rate-limit | 10 login attempts per 15 minutes per IP |
| **PDF Generation** | html2pdf.js | Client-side, no server dependency, direct download |
| **Styling** | Custom CSS (no Tailwind) | Purple theme (HRM), Blue theme (EMP), Green theme (CRM/CMS) |
| **State Management** | React useState / useCallback | Per-page, no global store needed |

---

## 3. Four Portals — Summary & Comparison

| Feature | CMS | CRM | HRM | EMP |
|---|---|---|---|---|
| **Full Name** | Content Management System | Client Relationship Management | Human Resource Management | Employee Self-Service |
| **Who Uses It** | Content editors, website managers | Sales team, account managers, executives | HR Admin, HR Manager, Dept Managers | All company employees |
| **Login URL** | `/admin/login` | `/crm/login` | `/hrm/login` | `/emp/login` |
| **DB Collection** | `users` | `crm_users` | `hrm_users` | `hrm_employees` |
| **JWT Secret** | `JWT_SECRET` | `JWT_CRM_SECRET` | `JWT_HRM_SECRET` | `JWT_EMP_SECRET` |
| **Token Expiry** | 7 days | 8 hours | 8 hours | 12 hours |
| **Session Storage** | `localStorage: token` | `localStorage: crm_token` | `localStorage: hrm_token` | `localStorage: emp_token` |
| **UI Theme** | Green | Green | Purple `#7c3aed` | Blue `#2563eb` |
| **Brute-Force Lockout** | ❌ | ✅ | ✅ | ✅ |
| **Portal Token Isolation** | ❌ | ✅ | ✅ | ✅ |
| **Approval Required** | ❌ | ✅ | ✅ | N/A |

---

## 4. Login Credentials & Access URLs

> All portals are accessible from the **Portal Chooser** page: `http://localhost:3000/portals`

---

### CMS Portal

| Field | Value |
|---|---|
| **Local URL** | `http://localhost:3000/admin/login` |
| **Production URL** | `https://digikraftsocial.com/admin/login` |
| **Email** | `srdani12@gmail.com` |
| **Password** | `digikraftsocial@2026` |
| **Role** | `superadmin` — Full website control |

---

### CRM Portal

| Field | Value |
|---|---|
| **Local URL** | `http://localhost:3000/crm/login` |
| **Production URL** | `https://digikraftsocial.com/crm/login` |
| **Email** | `admin@digikraftsocial.com` |
| **Password** | `Dks@Admin2024` |
| **Role** | `owner` — Full CRM access |

---

### HRM Portal

| Account | Email | Password | Role |
|---|---|---|---|
| HR Admin | `hradmin@digikraftsocial.com` | `HRM@Admin2024` | `hr_admin` — Full access |
| HR Manager | `hrmanager@digikraftsocial.com` | `HRM@Manager2024` | `hr_manager` — Most access |

**Local URL:** `http://localhost:3000/hrm/login`
**Production URL:** `https://digikraftsocial.com/hrm/login`

---

### EMP Portal

| Field | Value |
|---|---|
| **Local URL** | `http://localhost:3000/emp/login` |
| **Production URL** | `https://digikraftsocial.com/emp/login` |
| **Work Email** | `rahul@digikraftsocial.com` |
| **Password** | `EMP@Rahul2024` |
| **Employee ID** | `DKS-EMP-001` |
| **Name** | Rahul Sharma |

---

## 5. CMS Portal — Website Administration

### Purpose
The CMS portal is used to manage all content displayed on the public DigiKraft Social website — including blog posts, project portfolio, homepage sections, services descriptions, and SEO settings.

### Modules

| Module | What You Can Do |
|---|---|
| **Dashboard** | View site stats and recent activity |
| **Blog Posts** | Create, edit, publish, unpublish articles |
| **Projects** | Add and manage portfolio projects with images |
| **Homepage** | Edit hero banner, services section, features, testimonials |
| **About Page** | Update team information and company story |
| **Services** | Manage service offerings displayed on website |
| **SEO Settings** | Set meta titles, descriptions, keywords for each page |
| **Enquiries** | View and manage contact form submissions |
| **Users** | Add/remove CMS staff, assign roles |
| **Settings** | Site-wide configuration |

### CMS User Roles

| Role | Access Level |
|---|---|
| `superadmin` | Complete control — all modules + user management |
| `admin` | Blog, projects, homepage — cannot manage users |
| `author` | Blog posts only |
| `user` | Dashboard view only |

---

## 6. CRM Portal — Client & Business Management

### Purpose
The CRM portal is the central hub for managing DigiKraft Social's business operations — from first client contact through project delivery and final payment collection.

### Modules

| Module | What You Can Do |
|---|---|
| **Dashboard** | Revenue overview, pending invoices, project pipeline, recent activity |
| **Clients** | Manage client profiles — contact info, company details, notes |
| **Client Detail Page** | 4-tab deep view: Projects · Proposals · Quotations · Invoices |
| **Services** | Maintain the service catalogue used in proposals/quotations |
| **Projects** | Create and track active/completed projects per client |
| **Proposals** | Build detailed proposals, add line items, download as PDF |
| **Quotations** | Generate price quotations with GST, PDF download, duplicate option |
| **Invoices** | Create and send professional invoices, mark as paid, PDF download |
| **Payments** | Record and track payment receipts against invoices |
| **Portfolio** | Manage company work portfolio displayed in CRM |
| **Enquiries** | View and respond to new business inquiries |
| **Pending Users** | Review and approve new CRM staff registration requests |
| **History** | Complete audit trail — every action logged with timestamp and actor |
| **Notifications** | In-app system alerts for important events |
| **Settings** | Brand theme, bank details, GST settings, document numbering |

### PDF Generation

All Proposals, Quotations, and Invoices can be downloaded as professional PDFs with one click — no browser print dialog appears. The PDF includes the company letterhead, GST details, line items table, totals, and bank details.

### CRM Role Permissions

| Module | `owner` | `manager` | `accountant` | `executive` |
|---|:---:|:---:|:---:|:---:|
| Clients | ✅ | ✅ | ❌ | ✅ |
| Services | ✅ | ✅ | ❌ | ❌ |
| Projects | ✅ | ✅ | ❌ | ✅ |
| Proposals | ✅ | ✅ | ❌ | ✅ |
| Quotations | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ✅ | ❌ |
| Payments | ✅ | ✅ | ✅ | ❌ |
| Portfolio | ✅ | ✅ | ❌ | ❌ |
| Enquiries | ✅ | ✅ | ❌ | ✅ |
| Pending Users | ✅ | ✅ | ❌ | ❌ |
| History | ✅ | ✅ | ❌ | ❌ |
| Settings | ✅ | ✅ | ❌ | ❌ |

### New CRM Staff Registration Process

| Step | Who | Action |
|---|---|---|
| 1 | New staff | Visits `/crm/login` → clicks Register → fills name, email, password |
| 2 | System | Creates account with `is_active: false` (pending state) |
| 3 | Owner / Manager | Goes to **Pending Users** → reviews request |
| 4 | Owner / Manager | Approves → assigns role (owner / manager / accountant / executive) → selects page access |
| 5 | New staff | Can now log in and access assigned modules |

---

## 7. HRM Portal — Human Resource Management

### Purpose
The HRM portal gives the HR team complete control over employee management — from hiring through daily operations (attendance, leaves, tasks, payroll) to reporting and offboarding.

### Modules

| Module | What You Can Do |
|---|---|
| **Dashboard** | Live snapshot — attendance rate, total headcount, pending leaves, payroll status |
| **Employees** | Full employee profiles, add new employees, search and filter |
| **Employee Detail** | 5-tab deep view (described below) |
| **Departments** | Create departments, assign Heads of Department (HOD) |
| **Designations** | Manage designation levels and map to departments |
| **Attendance** | View daily attendance for all employees, approve regularization requests |
| **Leaves** | Review and approve/reject leave requests, configure leave types |
| **Holidays** | Manage yearly holiday calendar, import India presets |
| **Task Log** | View employee daily task submissions, assign tasks with deadlines |
| **Payroll** | Process monthly payroll, generate salary slips, mark as paid |
| **Onboarding** | Track 5-step onboarding checklist for every new joiner |
| **Announcements** | Publish company-wide messages with scheduling and priority |
| **Reports** | Headcount, attendance summary, leave utilisation, payroll cost analytics |
| **Pending Users** | Approve/reject new HRM staff registrations *(hr_admin only)* |
| **History** | Full audit log of all HR actions — supports single delete and clear all |
| **Notifications** | System-generated event alerts |
| **Settings** | Company info, working hours policy, payroll configuration *(hr_admin only)* |

### Employee Detail Page — 5 Tabs

| Tab | Who Can See | Contents |
|---|---|---|
| **Overview** | All HRM roles | Employment type, department, designation, join date, contact details, emergency contact, salary summary card |
| **Personal** | All HRM roles | Date of birth, gender, blood group, current address, permanent address |
| **Salary & Bank** | `hr_admin` + `hr_manager` | Annual CTC, monthly basic, gross estimate, net estimate, bank name, account number (masked), IFSC, PF number, ESI number, UAN number |
| **Attendance** | All HRM roles | Monthly attendance records filterable by month and year |
| **Leaves** | All HRM roles | Complete leave request history with status |

### HRM Role Comparison

| Feature | `hr_admin` | `hr_manager` | `dept_manager` |
|---|:---:|:---:|:---:|
| View all employees | ✅ | ✅ | Own dept only |
| Add new employee | ✅ | ✅ | ❌ |
| Edit employee profile | ✅ | ✅ | ❌ |
| View Salary & Bank details | ✅ | ✅ | ❌ |
| Edit Salary & Bank details | ✅ | ✅ | ❌ |
| Reset employee EMP password | ✅ | ❌ | ❌ |
| Deactivate / offboard employee | ✅ | ❌ | ❌ |
| View daily attendance | ✅ | ✅ | Own dept only |
| Approve regularization requests | ✅ | ✅ | Own dept only |
| Approve / Reject leave requests | ✅ | ✅ | Own dept only |
| Process monthly payroll | ✅ | ✅ | ❌ |
| View salary slips | ✅ | ✅ | ❌ |
| Assign tasks to employees | ✅ | ✅ | ❌ |
| View employee task logs | ✅ | ✅ | Own dept only |
| Manage departments & designations | ✅ | ❌ | ❌ |
| Manage holiday calendar | ✅ | ✅ | View only |
| Create announcements | ✅ | ✅ | ❌ |
| View all reports | ✅ | ✅ | ❌ |
| Manage onboarding checklists | ✅ | ✅ | ❌ |
| Delete history records | ✅ | ❌ | ❌ |
| Approve / Reject HRM users | ✅ | ❌ | ❌ |
| Configure HRM Settings | ✅ | ❌ | ❌ |
| View history & audit trail | ✅ | ✅ | ❌ |

### New HRM Staff Registration Process

| Step | Who | Action |
|---|---|---|
| 1 | New HR staff | Visits `/hrm/login` → registers with name, email, password |
| 2 | System | Account created with `is_active: false` |
| 3 | HR Admin | Goes to **Pending Users** → reviews the request |
| 4 | HR Admin | Approves → assigns role → selects page access permissions |
| 5 | New HR staff | Can now log in to HRM portal |

---

## 8. EMP Portal — Employee Self-Service

### Purpose
The EMP portal is the digital workspace for every DigiKraft Social employee. They use it to clock in and out, log their daily work, apply for leaves, download salary slips, read company announcements, and connect with colleagues.

### Modules

| Module | What the Employee Can Do |
|---|---|
| **Dashboard** | See check-in/out button, today's status, leave balance, last salary amount |
| **Attendance** | View monthly attendance history, submit regularization requests for missed punches |
| **My Tasks** | Log daily work tasks (with time tracking) + view and respond to HR-assigned tasks |
| **My Leaves** | Apply for leave, track request status, view leave balance per type, cancel pending |
| **Holidays** | View the company holiday calendar for the year |
| **Salary** | View all monthly salary slips, download as PDF, view detailed CTC breakup |
| **Announcements** | Read company-wide messages from HR, with unread badge on sidebar |
| **Team Directory** | Browse all active colleagues by department, view contact details |
| **My Profile** | Update personal contact info, emergency contact, view bank details (read-only), change password |
| **Notifications** | System notifications — leave approved/rejected, salary slip generated, etc. |

### Employee First Login Process

When HR adds a new employee, the system auto-generates a temporary password in the format `firstname@year` (example: `rahul@2026`). HR shares this securely.

| Step | Action |
|---|---|
| 1 | HR creates employee profile in HRM portal |
| 2 | System generates Employee ID (e.g. `DKS-EMP-001`) and temp password |
| 3 | HR shares work email + temp password with the employee |
| 4 | Employee logs in at `/emp/login` |
| 5 | Employee navigates to **My Profile → Change Password** and sets a new password |

---

## 9. Task Management System

### Overview

The task system serves two distinct purposes that work together:

| Type | Who Creates | Who Sees | Purpose |
|---|---|---|---|
| **Daily Log Task** | Employee (self) | Employee + HR team (read-only view) | Track personal work done each day |
| **HR-Assigned Task** | HR Admin or HR Manager | Employee (takes action) + HR (kanban board) | Assign work with deadlines and follow up |

---

### HRM Portal — Task Management (`/hrm/dashboard/tasks`)

The HRM portal has three tabs within the Task Log module.

#### Tab 1 — Daily Log View

HR can view every employee's self-submitted daily tasks for any date.

| Feature | Description |
|---|---|
| Date Picker | Select any past or present date |
| Department Filter | Narrow down to a specific department |
| Employee Search | Search by name or Employee ID |
| Expandable Rows | Click any employee card to expand and see their full task list |
| Team Summary Strip | Shows total employees, how many submitted, total hours logged, completion % |
| Per-Employee Stats | Tasks count, Done count, Hours worked, Progress bar |

#### Tab 2 — Assign Task

HR can assign a task to one employee or multiple employees simultaneously.

| Field | Description |
|---|---|
| Employee Selector | Single employee dropdown OR multi-checkbox bulk selection |
| Task Title | What needs to be done |
| Description | Detailed instructions, references, expected output |
| Category | Design · Development · Meeting · Research · Review · Client · Admin · Other |
| Priority | 🟢 Low · 🟡 Medium · 🟠 High · 🔴 Urgent |
| Task Date | Date the task is for |
| Due Date | Hard deadline — system auto-flags overdue tasks |
| Project Name | Associate task with a project |
| Estimated Hours | Time estimate set by HR |

#### Tab 3 — Assigned Tasks (Kanban Board)

A visual project board with four columns.

| Column | Meaning |
|---|---|
| **To Do** | Task assigned, not started yet |
| **In Progress** | Employee is actively working |
| **Blocked** | Employee has flagged a blocker |
| **Done** | Completed |

Each task card on the board shows:
- Employee name and department
- Priority badge (with colour coding)
- Overdue warning ⚠️ if deadline has passed
- Due date, estimated hours, project name
- Comment count and comment thread button
- Edit and Delete buttons

**Available Filters:** Status · Priority · Specific Employee · Overdue Only toggle

---

### EMP Portal — My Tasks (`/emp/dashboard/tasks`)

The EMP portal task section has two distinct areas.

#### Area 1 — My Daily Log

| Feature | Description |
|---|---|
| Add Task | Fill title, category, start time, end time → duration auto-calculated and displayed |
| Priority | Low · Medium · High · Urgent |
| Status | To Do · In Progress · Done · Blocked |
| Project Name | Optional — link task to a client project |
| Notes | Additional details, links, blockers |
| Status Toggle | Click the status icon to cycle: To Do → In Progress → Done |
| Today View | See all tasks for selected date with summary: total, done, hours |
| History View | Last 7 / 14 / 30 days — grouped by date with progress bars |

#### Area 2 — HR Assigned Tasks

| Feature | Description |
|---|---|
| Active Tab | Shows all pending, in-progress, and blocked HR-assigned tasks |
| Overdue Alert | Red alert banner appears when any task has passed its deadline |
| Status Buttons | One-click buttons to update status — no form, just tap the state |
| Comment Thread | Two-way messaging between employee and HR (real-time on both portals) |
| Completed Tab | View all finished HR-assigned tasks as history |

### Task Flow — End to End

```
Step 1: HR creates task in HRM → Assign Task tab
         → Assigns to employee(s) with due date and instructions

Step 2: Employee opens EMP portal → My Tasks → HR Assigned
         → New task appears with "To Do" status

Step 3: Employee starts work → clicks "In Progress"
         → HR sees status change on Kanban board in real time

Step 4: Employee completes work → clicks "Done"
         → Adds comment: "Task done. File attached in Drive."

Step 5: HR sees "Done" on Kanban → opens comment thread
         → Reviews and responds: "Good work! Approved."

Step 6: HR can mark as approved internally via the Edit modal
```

---

## 10. Attendance & Check-In / Check-Out System

### How It Works

The Check-In / Check-Out button lives on the **EMP Dashboard**. Employees simply tap it when they arrive and when they leave. The system records the time and automatically assigns an attendance status.

### Dashboard Button States

| Situation | What Employee Sees |
|---|---|
| Not checked in yet today | Large **🟢 Check In** button (green) |
| Checked in, not checked out | **🟥 Check Out** button (red) + "Checked in at HH:MM AM" |
| Checked out for the day | **✅ Day Complete — X.Xh worked** message (no button) |

### Automatic Status Assignment

| Check-In Time | Status Given |
|---|---|
| Before 9:45 AM | `present` — on time |
| 9:45 AM to 10:00 AM | `late` — grace period exceeded |
| After 10:00 AM | `late` |
| Any time, but total work < 4.5h | Overrides to `half_day` at check-out |

### All Attendance Status Values

| Status | What It Means |
|---|---|
| `present` | Arrived on time, worked 4.5 hours or more |
| `late` | Checked in after 9:45 AM |
| `half_day` | Worked less than 4.5 hours |
| `absent` | No check-in recorded for the day |
| `on_leave` | Approved leave was active for this day |
| `wfh` | Work from home — marked by HR |
| `holiday` | Company holiday |
| `weekly_off` | Saturday or Sunday |

### HR View — Attendance Dashboard (HRM Portal)

HR can view attendance for any date using the date picker. Each employee row shows:
- Check-in time · Check-out time · Work hours · Status badge

The **Regularizations** tab shows all pending correction requests from employees.

### Regularization Process (Missed Check-In/Out)

If an employee forgot to check in or check out, they submit a regularization request.

| Step | Who | Action |
|---|---|---|
| 1 | Employee | Goes to Attendance → clicks **Request Regularization** |
| 2 | Employee | Selects the date, enters actual check-in time, actual check-out time, and reason |
| 3 | System | Request saved with `pending` status |
| 4 | HR | HRM → Attendance → Regularizations tab → reviews request |
| 5a | HR approves | Attendance record automatically updated to reflect the corrected times |
| 5b | HR rejects | Employee receives notification with rejection note |

---

## 11. Leave Management

### Leave Types Available

| Code | Full Name | Annual Quota |
|---|---|---|
| **EL** | Earned Leave | 12 days per year |
| **SL** | Sick Leave | 12 days per year |
| **CL** | Casual Leave | 8 days per year |
| **OL** | Optional Leave | 2 days per year |

### Leave Application Process

| Step | Portal | What Happens |
|---|---|---|
| 1 | EMP | Employee → My Leaves → Apply → selects leave type, from date, to date, session (full/half day), reason |
| 2 | Backend | System checks leave balance — if insufficient, request is rejected immediately |
| 3 | Backend | If balance is sufficient → leave request created with `pending` status |
| 4 | EMP | Employee sees request in "My Requests" tab with **Pending** badge |
| 5 | HRM | HR → Leaves page → Pending tab → sees all pending requests |
| 6a | HR Approves | Status changes to `approved` → leave balance is deducted → employee receives notification |
| 6b | HR Rejects | Status changes to `rejected` → rejection reason is recorded → employee receives notification |

> An employee may cancel a **pending** leave request before HR has reviewed it.

---

## 12. Payroll & Salary Processing

### How Salary is Calculated

The system uses a standard Indian payroll structure. All components are automatically calculated based on the employee's CTC (Cost to Company) and basic salary set by HR.

| Salary Component | Calculation |
|---|---|
| Basic Salary | Fixed by HR per employee |
| HRA (House Rent Allowance) | 40% of Basic Salary |
| Conveyance Allowance | ₹1,600 per month (fixed) |
| Medical Allowance | ₹1,250 per month (fixed) |
| Special Allowance | CTC ÷ 12 − Basic − HRA − Conveyance − Medical |
| **Gross Salary** | Basic + HRA + Conveyance + Medical + Special |
| PF Deduction (Employee) | 12% of Basic Salary (capped at ₹15,000 basic ceiling) |
| ESI Deduction | 0.75% of Gross (only applied if Gross ≤ ₹21,000) |
| Professional Tax | ₹200 per month (fixed) |
| LWP Deduction | (Gross ÷ Working Days in Month) × LWP Days |
| **Net Salary (Take Home)** | Gross − PF − ESI − Professional Tax − LWP Deduction |

### Monthly Payroll Processing Steps

| Step | Location | Action |
|---|---|---|
| 1 | HRM Portal | Navigate to **Payroll → Run Payroll Preview** |
| 2 | HRM Portal | System pulls attendance data for the month and calculates salary for every active employee |
| 3 | HRM Portal | HR reviews the preview table — checks gross, deductions, LWP, and net for each employee |
| 4 | HRM Portal | Click **Process Payroll** → confirm the action (this is irreversible) |
| 5 | Backend | System generates individual salary slips for all employees and saves them |
| 6 | HRM Portal | After bank transfer, click **Mark as Paid** — status changes to `paid` |
| 7 | EMP Portal | Employee can now see the new salary slip in **Salary → Salary Slips** |

### Salary Slip Contents (PDF)

| Section | Contents |
|---|---|
| **Header** | DigiKraft Social company name, GST number, office address |
| **Employee Info** | Name, Employee ID, Department, Designation, Employment Type |
| **Period Info** | Pay period, total working days, days present, LWP days |
| **Earnings Table** | Basic, HRA, Conveyance, Medical, Special Allowance |
| **Deductions Table** | PF, ESI, Professional Tax, LWP Deduction |
| **Net Salary** | Highlighted take-home amount |
| **Bank Details** | Bank name, masked account number (last 4 digits only), IFSC |

---

## 13. Holiday Calendar

### HRM Portal (`/hrm/dashboard/holidays`)

HR manages the holiday calendar here. India national holidays can be imported in one click.

| Feature | Description |
|---|---|
| Year Selector | View and manage any year (2024–2027) |
| Import Preset | One-click import of all major Indian national holidays for the selected year |
| Add Holiday | Add any custom holiday — name, date, type, optional description |
| Edit / Delete | Full control over every holiday entry |
| Upcoming Strip | Shows the next 3 upcoming holidays with a days-remaining countdown |
| Monthly Grouping | Holidays displayed in month-wise cards for easy scanning |

### Holiday Types

| Type | Badge Colour | Examples |
|---|---|---|
| **National** | Red | Republic Day, Independence Day, Gandhi Jayanti, Diwali, Christmas |
| **Optional** | Yellow | Regional or religious festivals where attendance is optional |
| **Regional** | Blue | State-specific holidays |
| **Company** | Purple | Annual team events, office closure days, special occasions |

### EMP Portal (`/emp/dashboard/holidays`)

Employees see the same calendar in read-only mode. The **Next Holiday** card at the top shows the upcoming holiday name, date, and exact number of days remaining. Past holidays appear faded.

---

## 14. Announcements & Notice Board

### HRM Portal — Creating Announcements (`/hrm/dashboard/announcements`)

HR Admin and HR Managers can create announcements that are broadcast to all employees.

| Field | Description |
|---|---|
| **Title** | Short headline of the announcement |
| **Body** | Full message — can be multiple paragraphs |
| **Priority** | 🔴 High · 🟡 Medium · 🟢 Low — controls urgency display in EMP portal |
| **Publish At** | Schedule a future date/time to publish (leave blank to publish immediately) |
| **Expires At** | Set an expiry date after which announcement no longer shows (leave blank = never expires) |
| **Toggle Active** | Pause or unpublish any announcement at any time |

Each announcement card in HRM shows a **read receipt counter** (`👁 X read`) so HR knows how many employees have seen it.

### EMP Portal — Viewing Announcements (`/emp/dashboard/announcements`)

| Feature | How It Works |
|---|---|
| **Sidebar Badge** | Red number badge on "Announcements" in the sidebar showing unread count — refreshes every 60 seconds automatically |
| **Urgent Alert Banner** | If there is an unread High-priority announcement, a red alert banner appears at the top of the page |
| **Expand to Read** | Clicking an announcement card expands the full content and automatically marks it as read |
| **Manual Mark Read** | A "Mark as Read" button is also available for each announcement |
| **Priority Icons** | 🔴 High · 🟡 Medium · 🟢 Low — colour-coded cards |

---

## 15. Reports & Analytics

**Location:** HRM Portal → `/hrm/dashboard/reports`

The Reports module provides four analytics reports accessible from tabs. All reports support **PDF export**.

### Report 1 — Headcount Report

Provides a complete picture of the company's employee strength.

| Metric | Detail |
|---|---|
| Status breakdown | Total, Active, Probation, Notice Period, Resigned, Terminated |
| By Department | Bar chart — employee count per department |
| By Employment Type | Full-time, Part-time, Intern, Contract, Freelancer |
| Monthly Joinings | Bar chart — new hires over the last 12 months |

### Report 2 — Attendance Report

Monthly attendance summary for all employees.

| Column | Detail |
|---|---|
| Employee Name & Department | Identification |
| Present Days | Days marked present or late |
| Late Days | Days checked in after 9:45 AM |
| Absent Days | Days with no check-in |
| On Leave Days | Approved leave days |
| WFH Days | Work from home days |
| Total Hours Worked | Sum of work hours for the month |
| **Totals Row** | Aggregate across all employees |

### Report 3 — Leave Utilisation Report

Annual view of how leave entitlement is being used.

| Metric | Detail |
|---|---|
| By Leave Type | Total days used and requests count per EL / SL / CL / OL |
| Monthly Distribution | Bar chart — how leave is distributed across all 12 months |
| Total Approved | Total leave days approved in the year |

### Report 4 — Payroll Cost Report

Historical payroll spend overview.

| Metric | Detail |
|---|---|
| Total Paid (last 6 months) | Sum of all net salaries disbursed |
| Average Monthly Net | Average payout per month |
| Per-Month Table | Pay period, employees, gross, PF, ESI, net, status |
| Net Payout Trend | Bar chart showing cost trend over months |

---

## 16. Employee Onboarding Tracker

**Location:** HRM Portal → `/hrm/dashboard/onboarding`

This module helps HR track the onboarding progress of every new joiner. The system automatically shows employees who joined in the **last 90 days** and employees currently on **probation**.

### 5-Step Onboarding Checklist

| Step | Icon | Task Description |
|---|---|---|
| **1** | 📧 | **Welcome Email Sent** — Send login credentials, company welcome letter, and overview of tools |
| **2** | 📄 | **Documents Collected** — Aadhaar card, PAN card, educational certificates, experience letters, bank details |
| **3** | 💻 | **System Access Given** — Work email created, EMP portal access granted, project management tools onboarded |
| **4** | 🎓 | **Induction Completed** — HR orientation session, company policies walkthrough, team introduction done |
| **5** | 🖥️ | **Equipment Issued** — Laptop / desktop assigned, employee ID card printed, access cards issued |

Each checkbox **saves automatically** when clicked — no save button needed. A progress bar per employee shows 0% to 100% completion. The summary at the top shows how many employees are Complete, In Progress, and Not Started.

---

## 17. Team Directory

**Location:** EMP Portal → `/emp/dashboard/team`

All active and probation-status employees are displayed in a department-wise card grid. This lets employees find colleagues, get their contact details, and understand the company's organisational structure.

| Feature | Description |
|---|---|
| **Search** | Search by colleague name or work email |
| **Department Filter** | Filter the grid to a specific department |
| **Card Display** | Avatar with coloured initials, full name, designation, active/probation status badge |
| **Click Card** | Opens a popup with: work email (clickable), phone number (clickable), department, designation, date of joining |

---

## 18. Adding a New Employee — Complete Flow

This section explains the full process of adding a new team member to the system, from HRM entry to the employee's first login.

| Step | Who | Portal | Action |
|---|---|---|---|
| **1** | HR | HRM | Go to **Employees → Add Employee** |
| **2** | HR | HRM | Fill: Full Name, Work Email, Phone, Department, Designation, Employment Type, Date of Joining, Annual CTC, Monthly Basic |
| **3** | System | Backend | Auto-generates Employee ID (e.g. `DKS-EMP-005`) and temporary password (e.g. `priya@2026`) |
| **4** | HR | HRM | Notes the temporary password shown in the response — shares it with the employee securely |
| **5** | Employee | EMP | Logs in at `/emp/login` using work email + temporary password |
| **6** | Employee | EMP | Goes to **My Profile → Change Password** → sets a new strong password |
| **7** | HR | HRM | Goes to **Onboarding** → tracks and completes the 5-step checklist |
| **8** | HR | HRM | Updates employee profile with bank details, PAN, Aadhaar, PF/ESI numbers |

### Deactivating an Employee (Offboarding)

| Step | Action |
|---|---|
| 1 | HRM → Employees → Find employee → Click **Deactivate** |
| 2 | Select reason: Resigned or Terminated |
| 3 | Employee's `is_active` is set to `false` |
| 4 | Employee is immediately logged out of EMP portal — all subsequent API calls return 401 |
| 5 | All historical data (attendance, leaves, salary slips) is preserved |

---

## 19. Roles & Permissions Matrix

### CRM Portal — Module Access by Role

| Module | `owner` | `manager` | `accountant` | `executive` |
|---|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Clients | ✅ | ✅ | ❌ | ✅ |
| Services | ✅ | ✅ | ❌ | ❌ |
| Projects | ✅ | ✅ | ❌ | ✅ |
| Proposals | ✅ | ✅ | ❌ | ✅ |
| Quotations | ✅ | ✅ | ❌ | ❌ |
| Invoices | ✅ | ✅ | ✅ | ❌ |
| Payments | ✅ | ✅ | ✅ | ❌ |
| Portfolio | ✅ | ✅ | ❌ | ❌ |
| Enquiries | ✅ | ✅ | ❌ | ✅ |
| Pending Users | ✅ | ✅ | ❌ | ❌ |
| History & Settings | ✅ | ✅ | ❌ | ❌ |

### HRM Portal — Feature Access by Role

| Feature | `hr_admin` | `hr_manager` | `dept_manager` |
|---|:---:|:---:|:---:|
| View all employees | ✅ | ✅ | Own dept only |
| Add new employee | ✅ | ✅ | ❌ |
| Edit employee profile | ✅ | ✅ | ❌ |
| View & Edit Salary + Bank | ✅ | ✅ | ❌ Hidden |
| Reset employee EMP password | ✅ | ❌ | ❌ |
| Deactivate employee | ✅ | ❌ | ❌ |
| View daily attendance | ✅ | ✅ | Own dept only |
| Approve regularization | ✅ | ✅ | Own dept only |
| Approve / Reject leaves | ✅ | ✅ | Own dept only |
| Process payroll | ✅ | ✅ | ❌ |
| View salary slips | ✅ | ✅ | ❌ |
| Assign tasks | ✅ | ✅ | ❌ |
| View task logs | ✅ | ✅ | Own dept only |
| Manage departments | ✅ | ❌ | ❌ |
| Manage holiday calendar | ✅ | ✅ | View only |
| Create announcements | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ |
| Manage onboarding | ✅ | ✅ | ❌ |
| Delete history records | ✅ | ❌ | ❌ |
| Approve HRM users | ✅ | ❌ | ❌ |
| Access Settings | ✅ | ❌ | ❌ |

### EMP Portal — All Employees (Same Level)

All employees have identical permissions. They can only access and modify their own personal data — no employee can see another employee's salary, tasks, or attendance.

| Action | Permitted |
|---|---|
| Check in and check out | ✅ |
| View own monthly attendance | ✅ |
| Submit regularization request | ✅ |
| Add own daily tasks | ✅ |
| Update status on HR-assigned tasks | ✅ |
| Comment on assigned tasks with HR | ✅ |
| Apply for any leave type | ✅ |
| Cancel a pending leave | ✅ |
| View leave balance | ✅ |
| Download salary slips as PDF | ✅ |
| View CTC and monthly breakup | ✅ |
| Edit contact and emergency details | ✅ |
| Change own password | ✅ |
| View bank details (read-only) | ✅ |
| Edit bank or salary details | ❌ HR only |
| View another employee's salary | ❌ |
| Approve or reject leaves | ❌ |

---

## 20. Security Architecture

### Security Measures in Place

| Layer | Technology / Approach | What It Protects Against |
|---|---|---|
| **HTTP Security Headers** | `helmet` library | Clickjacking (X-Frame-Options), MIME sniffing, HSTS, XSS protection |
| **NoSQL Injection** | `express-mongo-sanitize` | Strips MongoDB operators (`$`, `.`) from all request bodies, query strings, and params |
| **HTTP Parameter Pollution** | `hpp` library | Duplicate query parameters that could bypass filters or crash the app |
| **Request Size Limits** | `express.json({ limit: '10kb' })` | Memory exhaustion / DoS attacks via oversized payloads |
| **HTTPS Enforcement** | Automatic 301 redirect in production | Man-in-the-middle attacks, unencrypted traffic |
| **Password Hashing** | `bcryptjs` — 12 salt rounds | Breach exposure — even if database is leaked, passwords cannot be reversed |
| **Separate JWT Secrets** | 4 × 128-character random secrets | Cross-portal token misuse — CRM tokens are useless on HRM/EMP APIs |
| **Portal Claim Validation** | `portal` field in JWT payload | Token replay attacks across portals |
| **Login Rate Limiting** | 10 requests per 15 minutes per IP | Automated credential stuffing attacks |
| **Brute-Force Lockout** | 5 failed attempts → 30-minute lock | Password guessing / brute-force (CRM, HRM, EMP) |
| **Account Approval Gate** | `is_active: false` on registration | Unauthorised staff accessing internal systems |
| **Input Validation** | Email regex, length caps, required field checks | Malformed data injection in auth endpoints |
| **Department Scope Restriction** | `dept_manager` role API filtering | Data leakage between departments |
| **Production Error Masking** | Generic 500 messages in production | Internal system information disclosure in error responses |
| **Sensitive Field Masking** | Aadhaar, full account number, PAN removed from API responses | Compliance — PII not exposed to lower-privilege users |

### Brute-Force Account Lockout Behaviour

| Login Attempt | System Response |
|---|---|
| Attempts 1–4 | `401 Invalid credentials` |
| Attempt 5 | `423 Account locked for 30 minutes` |
| After 30 minutes | Account automatically unlocks |

**Manual unlock (admin/emergency):** Open MongoDB Atlas → find the user document → set `login_attempts: 0` and `locked_until: null`.

### Portal Token Isolation — How It Works

Every JWT issued by the system contains a `portal` claim. When an API request arrives:
1. The middleware extracts the token
2. Verifies it using the **portal-specific secret** (not the shared secret)
3. Checks the `portal` claim matches the expected value
4. If either check fails → `401 Invalid portal token`

```
CRM Token used on HRM API  →  REJECTED  →  401 Invalid portal token
HRM Token used on EMP API  →  REJECTED  →  401 Invalid portal token
EMP Token used on CRM API  →  REJECTED  →  401 Invalid portal token
```

### Production Security Checklist

Before going live, the following must be completed:

| Item | Required Action |
|---|---|
| JWT Secrets | Generate 4 new cryptographically random 64-byte secrets (`node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| MongoDB Atlas | Restrict IP whitelist to production server IP only |
| NODE_ENV | Set to `production` in environment |
| CORS_ORIGIN | Set to `https://digikraftsocial.com,https://www.digikraftsocial.com` |
| SSL Certificate | Ensure HTTPS is active on the domain |
| Default Passwords | Change all credentials listed in Section 4 |
| .env File | Confirm `.env` is in `.gitignore` and NOT committed to GitHub |

---

## 21. Server Setup & Environment

### Starting the Servers

```bash
# Terminal 1 — Backend API (runs on port 5000)
cd DKS-WEBSITE_latest-deployed/backend
npm start

# Terminal 2 — Frontend (runs on port 3000)
cd DKS-WEBSITE_latest-deployed/website
npm run dev
```

Both must be running simultaneously. Visit `http://localhost:3000` after both start successfully.

### Required Environment Variables (`backend/.env`)

| Variable | Purpose | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Backend server port | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | CMS authentication signing key | 128-char hex string |
| `JWT_CRM_SECRET` | CRM portal signing key | 128-char hex string |
| `JWT_HRM_SECRET` | HRM portal signing key | 128-char hex string |
| `JWT_EMP_SECRET` | EMP portal signing key | 128-char hex string |
| `CORS_ORIGIN` | Allowed frontend origins | `https://digikraftsocial.com` |

**How to generate a JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Common MongoDB Atlas Issue

If the backend shows `MongooseServerSelectionError` on startup, your current IP address is not whitelisted in MongoDB Atlas.

**Fix:** Log into [cloud.mongodb.com](https://cloud.mongodb.com) → Project → Network Access → Add IP Address → Add Current IP Address → Confirm → Wait 2 minutes → Restart backend.

---

## 22. Troubleshooting Guide

| Symptom | Likely Cause | Solution |
|---|---|---|
| `MongooseServerSelectionError` on backend start | IP not whitelisted in Atlas | Atlas → Network Access → Add Current IP → wait 2 min |
| `Failed to download Urbanist` warning on frontend | Google Fonts blocked on network | Harmless — app works fine. Already fixed with `preload: false` |
| Login → "Account locked" | 5+ wrong password attempts | Wait 30 minutes, OR in MongoDB set `login_attempts: 0` and `locked_until: null` |
| Login → "Account pending approval" | New registration not yet approved | HRM: HR Admin → Pending Users. CRM: Owner → Pending Users |
| Login → "Invalid portal token" | Using the wrong portal's token | Clear `localStorage` in browser DevTools → log in fresh |
| Check-in button not visible | Already checked in or day complete | After check-in it becomes Check Out; after checkout it shows "Day Complete" |
| HR-assigned task not visible in EMP | Task is in completed state | Check "Completed" tab inside HR Assigned section |
| PDF not downloading | Browser pop-up blocker active | Allow pop-ups for this site in browser settings |
| `npm run dev` very slow startup | Google font timeout (resolved) | Fixed — `preload: false` added. Startup should be fast now |
| `'next' is not recognized` error | `node_modules` corrupted | Run `Remove-Item -Recurse -Force node_modules` then `npm install` |
| Page showing 404 after new feature | Route file not created or wrong path | Check the file exists in `website/app/` with correct folder structure |

---

## 23. Version History

| Version | Date | Changes Made |
|---|---|---|
| **v1.0** | August 2026 | CMS portal (existing), CRM portal built from scratch — 14 modules, RBAC, PDF download |
| **v2.0** | September 2026 | HRM portal (10 modules — employees, attendance, leaves, payroll), EMP portal (6 modules — check-in, leaves, salary) |
| **v3.0** | October 2026 | Employee detail page (5 tabs), salary slip detail page with PDF, payroll route conflict fix |
| **v4.0** | October 2026 | Task management (daily log + HR assign + Kanban), Holiday calendar, Announcements with badge, Reports (4 types), Onboarding tracker, Team directory, History delete, hr_manager salary access enabled |
| **v4.1** | October 2026 | Full security hardening — helmet, mongo-sanitize, HPP, 4 separate JWT secrets, HTTPS redirect, 10kb body limits, CRM brute-force lockout, input validation on all auth endpoints, production error masking |
| **v5.0 / 6.0** | October 2026 | Complete documentation rewrite — professional format, English, tables throughout, Word-convertible |

---

*DigiKraft Social — Internal System Documentation v6.0*
*Confidential — For internal distribution only*
*GitHub Repository: https://github.com/DIGICRAFT-INFO/digikraft_website*
*Developed by: DigiKraft Social Development Team*
