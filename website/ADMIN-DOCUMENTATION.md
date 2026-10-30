# 🚀 DigiKraft Social — Admin Panel Documentation

> **Version 3.0** | Last Updated: June 2026  
> **Platform:** Next.js 14 + Express.js + MongoDB Atlas  
> **Architecture:** Omnichannel CMS + Social Messaging Hub

---

## 📋 Table of Contents

- [🚀 DigiKraft Social — Admin Panel Documentation](#-digikraft-social--admin-panel-documentation)
  - [📋 Table of Contents](#-table-of-contents)
  - [System Overview](#system-overview)
  - [Access Credentials](#access-credentials)
  - [Role-Based Access Control](#role-based-access-control)
    - [🟣 Superadmin — Full System Authority](#-superadmin--full-system-authority)
    - [🔵 Admin — Content \& Communication Management](#-admin--content--communication-management)
    - [🟡 Author — Limited Content Creator](#-author--limited-content-creator)
  - [Superadmin Modules](#superadmin-modules)
    - [📊 Dashboard](#-dashboard)
    - [👥 User Management](#-user-management)
    - [⚙️ Integrations (API Settings)](#️-integrations-api-settings)
    - [📱 Telegram Chat (Full Inbox)](#-telegram-chat-full-inbox)
    - [📞 WhatsApp Business Chat](#-whatsapp-business-chat)
    - [💬 Facebook Full Dashboard](#-facebook-full-dashboard)
    - [📷 Instagram Full Dashboard](#-instagram-full-dashboard)
    - [📋 Activity Logs](#-activity-logs)
  - [Admin Modules](#admin-modules)
    - [📱 Social Media (Admin/Author)](#-social-media-adminauthor)
  - [Author Modules](#author-modules)
  - [Social Media Integration Hub](#social-media-integration-hub)
    - [How It Works](#how-it-works)
    - [Setup Priority (Recommended Order)](#setup-priority-recommended-order)
    - [API Limitations (Reality Check)](#api-limitations-reality-check)
  - [Activity Monitoring \& Logs](#activity-monitoring--logs)
  - [Technical Architecture](#technical-architecture)
  - [Webhook Configuration](#webhook-configuration)
  - [Security \& Authentication](#security--authentication)
  - [Frequently Asked Questions](#frequently-asked-questions)
  - [Support](#support)

---

## System Overview

DigiKraft Social Admin Panel is a comprehensive content management and social communication platform. It provides centralized control over website content, blog publishing, project portfolios, SEO analytics, customer enquiries, and multi-platform social media messaging — all from a single unified interface.

**Key Capabilities:**
- Full website content management (Homepage, About, Services, Contact)
- Blog CMS with categories and rich media
- Portfolio project management
- SEO URL submission tracking
- Omnichannel social messaging (WhatsApp, Facebook, Instagram, Telegram)
- Role-based team management with activity logging
- Real-time dashboard with weather, clock, and live statistics

---

## Access Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Super Admin | srdani12@gmail.com | digikraftsocial@2026 | Full System Control |

> ⚠️ **Security Notice:** Super Admin credentials grant unrestricted access to all system functions including user management, API key configuration, and activity monitoring. Store these credentials securely.

**Login URL:** `https://yourdomain.com/login`  
**Admin Panel:** `https://yourdomain.com/admin/dashboard`

---

## Role-Based Access Control

The system implements three distinct access tiers. Each role has precisely defined permissions ensuring operational security and workflow separation.

### 🟣 Superadmin — Full System Authority

**Description:** Complete control over every aspect of the platform. Manages infrastructure, user accounts, API integrations, and monitors all team activity.

**Sidebar Modules:**
| Module | Path | Purpose |
|--------|------|---------|
| Dashboard | `/admin/dashboard` | System overview with live stats, clock, weather |
| Homepage | `/admin/homepage` | Manage website homepage content |
| About | `/admin/about` | Manage About Us page |
| Services | `/admin/services` | Manage services section |
| Projects | `/admin/projects` | Portfolio project management |
| Blog | `/admin/blog` | Blog posts & categories |
| Contact | `/admin/contact` | Contact information |
| SEO | `/admin/seo` | SEO URL submission management |
| Enquiry | `/admin/enquiry` | Customer enquiry management |
| Telegram | `/admin/telegram` | Telegram Bot messaging (full inbox) |
| WhatsApp | `/admin/whatsapp-chat` | WhatsApp Business messaging |
| Facebook | `/admin/facebook-chat` | Facebook Page messaging & posts |
| Instagram | `/admin/instagram-chat` | Instagram DMs, posts, stories, profile |
| Activity Logs | `/admin/logs` | Monitor all team activity |
| Integrations | `/admin/whatsapp` | API credentials management |
| Users | `/admin/users` | User CRUD + profile images |

**Exclusive Capabilities:**
- Create, edit, delete any user account
- Change any user's role (including promoting to Superadmin)
- Configure social media API credentials
- Access full social messaging inboxes (send/receive)
- Monitor all team activity through logs
- Connect/disconnect platform integrations
- Clear old activity logs

---

### 🔵 Admin — Content & Communication Management

**Description:** Manages all website content and handles day-to-day communication. Cannot access user management, API configurations, or view Superadmin's social messaging data.

**Dashboard View:**
- Welcome banner with "ADMIN" role badge
- 3 Stat Cards: Total Posts, Categories, Total Projects
- Recent Blog Posts table (with edit/delete)
- Portfolio Projects table
- Blog Categories section
- ❌ No "Total Users" card
- ❌ No "Recent Registered Users" section

**Sidebar Modules:**
| Module | Path | Purpose |
|--------|------|---------|
| Dashboard | `/admin/dashboard` | Limited overview (no users data) |
| Homepage | `/admin/homepage` | Website homepage |
| About | `/admin/about` | About page |
| Services | `/admin/services` | Services |
| Projects | `/admin/projects` | Projects |
| Blog | `/admin/blog` | Blog posts |
| Contact | `/admin/contact` | Contact info |
| SEO | `/admin/seo` | SEO submissions |
| Enquiry | `/admin/enquiry` | Customer enquiries |
| Social Media | `/admin/social-connect` | Open social platforms (logged) |

**What Admin CAN do:**
- Manage all website content (create, edit, delete posts/projects/services)
- View and manage SEO submissions
- View and respond to customer enquiries
- Open social media platforms (WhatsApp, Facebook, Instagram, Telegram) in new tabs
- All social media activity is automatically logged for Superadmin to review

**What Admin CANNOT do:**
- ❌ Access User Management page
- ❌ View or modify API credentials/integrations
- ❌ Access Superadmin's social messaging inboxes
- ❌ View Activity Logs
- ❌ Change other users' roles or passwords

---

### 🟡 Author — Limited Content Creator

**Description:** Focused role for content creators. Can manage projects, write blog posts, handle contact information, and manage enquiries. Cannot access website settings or administrative functions.

**Dashboard View:**
- Welcome banner with "AUTHOR" role badge
- 2 Stat Cards only: Total Posts, Total Projects
- Recent Blog Posts table (with edit/delete)
- Portfolio Projects table
- ❌ No "Total Users" card
- ❌ No "Categories" card
- ❌ No "Recent Registered Users" section
- ❌ No "Blog Categories" section

**Sidebar Modules:**
| Module | Path | Purpose |
|--------|------|---------|
| Dashboard | `/admin/dashboard` | Minimal overview (posts + projects only) |
| Projects | `/admin/projects` | Portfolio projects |
| Blog | `/admin/blog` | Blog posts & categories |
| Contact | `/admin/contact` | Contact information |
| Enquiry | `/admin/enquiry` | Customer enquiries |
| Social Media | `/admin/social-connect` | Open social platforms (logged) |

**What Author CAN do:**
- View limited dashboard (posts + projects stats only)
- Create and manage blog posts
- Add and edit portfolio projects
- Update contact information
- View and manage enquiries
- Open social media platforms in new tabs

**What Author CANNOT do:**
- ❌ Access Homepage, About, Services, SEO modules
- ❌ Access User Management
- ❌ Access Integrations or API settings
- ❌ View Activity Logs
- ❌ Access Superadmin's messaging inboxes
- ❌ See Users or Categories stats on dashboard

---

## Superadmin Modules

### 📊 Dashboard

**Role-Based Dashboard Views:**

| Element | Superadmin | Admin | Author |
|---------|-----------|-------|--------|
| Welcome Banner + Role Badge | ✅ SUPERADMIN | ✅ ADMIN | ✅ AUTHOR |
| Live Clock + Date | ✅ | ✅ | ✅ |
| Weather Widget | ✅ | ✅ | ✅ |
| Total Posts card | ✅ | ✅ | ✅ |
| Total Users card | ✅ | ❌ | ❌ |
| Categories card | ✅ | ✅ | ❌ |
| Total Projects card | ✅ | ✅ | ✅ |
| Recent Blog Posts table | ✅ | ✅ | ✅ |
| Portfolio Projects table | ✅ | ✅ | ✅ |
| Recent Registered Users | ✅ | ❌ | ❌ |
| Blog Categories | ✅ | ✅ | ❌ |
| Add Project button | ✅ | ✅ | ✅ |
| Create Post button | ✅ | ✅ | ✅ |

**Features:**
- Welcome banner with role badge and personalized greeting
- Live digital clock (auto-updates every second)
- Current date display (full weekday + date)
- Weather widget (Raipur, India — live temperature)
- Role-specific stat cards
- Recent Blog Posts table with inline delete
- Portfolio Projects overview
- Role-filtered sidebar sections

### 👥 User Management

**Features:**
- Superadmin highlighted card at top
- Profile image upload (camera icon on avatar)
- Full CRUD: Add/Edit/Delete users
- Edit: Name, Email, Password (plain text), Role
- Role assignment: Superadmin, Admin, Author, User
- Password stored in plain text (visible in MongoDB)
- Superadmin-only access enforcement

### ⚙️ Integrations (API Settings)

**Supported Platforms:**
| Platform | Required Fields | Documentation |
|----------|----------------|---------------|
| Telegram Bot | Bot Token, Bot Username | core.telegram.org/bots |
| WhatsApp Business | Access Token, Phone Number ID, Webhook Token | developers.facebook.com/docs/whatsapp |
| Facebook Page | Page Access Token, Page ID | developers.facebook.com/docs/pages |
| Instagram Business | Access Token, Business Account ID | developers.facebook.com/docs/instagram-api |

**Features:**
- Save & Connect — stores credentials and marks platform as connected
- Verify — tests credentials against platform API in real-time
- Disconnect — removes all stored keys
- Edit — update existing credentials
- "How to get credentials" links to official documentation

### 📱 Telegram Chat (Full Inbox)

**Features:**
- Chat list with unread badges
- Real-time messaging (10-second auto-refresh)
- Send/receive text messages
- Webhook configuration interface
- Bot info display
- Delete chat history
- Message bubbles (incoming/outgoing style)

### 📞 WhatsApp Business Chat

**Features:**
- Phone number-based chat list
- Send messages via WhatsApp Cloud API
- New conversation starter
- "Open in WhatsApp" quick link
- Auto-refresh conversations
- Delete chat functionality

### 💬 Facebook Full Dashboard

**Tabs:**
- **Messenger** — Full chat inbox, send/receive messages
- **Posts** — Page posts with likes, comments, shares, images, permalinks
- **Page Info** — Page name, likes, followers, about, cover photo

### 📷 Instagram Full Dashboard

**Tabs:**
- **Messages** — DM inbox with send/receive
- **Posts** — Grid view with media, captions, likes, comments, media type
- **Stories** — Active stories preview (expires 24h)
- **Profile** — Username, bio, followers, following, posts count, profile picture

### 📋 Activity Logs

**Features:**
- All admin/author activity tracked automatically
- Filter by platform (WhatsApp, Facebook, Instagram, Telegram, System)
- Shows: User name, role, action, platform, details, timestamp
- Pagination (30 logs per page)
- "Clear 30d+" — bulk delete old logs
- Real-time refresh

---

## Admin Modules

All content management modules (Dashboard, Homepage, About, Services, Projects, Blog, Contact, SEO, Enquiry) work identically for both Superadmin and Admin roles.

### 📱 Social Media (Admin/Author)

Unlike Superadmin who has full messaging inboxes, Admin and Author see a simplified "Social Media" page with:

- **4 Platform Cards** — WhatsApp, Facebook, Instagram, Telegram
- **Click to Open** — Opens platform in a new browser tab
- **Activity Logged** — Every open action is recorded in Activity Logs
- **Note displayed** — Users are informed their activity is monitored

---

## Author Modules

Authors have access to a focused subset: Projects, Blog, Contact, Enquiry, and Social Media. These modules function identically to the Admin versions but with the reduced sidebar navigation.

---

## Social Media Integration Hub

### How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPERADMIN VIEW                            │
│  Full messaging inboxes + posts + stories + profile          │
│  [Telegram] [WhatsApp] [Facebook] [Instagram]                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 ADMIN / AUTHOR VIEW                           │
│  "Social Media" page → Open platforms in new tabs            │
│  All activity logged for Superadmin monitoring               │
└─────────────────────────────────────────────────────────────┘
```

### Setup Priority (Recommended Order)

| Priority | Platform | Setup Time | Cost | Difficulty |
|----------|----------|-----------|------|------------|
| 1️⃣ | Telegram | 5 minutes | Free | Easy |
| 2️⃣ | Facebook | 30 minutes | Free | Medium |
| 3️⃣ | Instagram | 30 minutes | Free | Medium |
| 4️⃣ | WhatsApp | 1-2 hours | Paid | Advanced |

### API Limitations (Reality Check)

| Platform | What Works | What Doesn't |
|----------|-----------|--------------|
| Telegram | Messages, bot commands, groups, channels | Voice/video calls |
| WhatsApp | Business messages, templates | Personal account, status/stories |
| Facebook | Page messages, posts, insights | Personal profile messages |
| Instagram | Business DMs, posts, stories, profile | Personal accounts, reels publishing |

---

## Activity Monitoring & Logs

The Activity Logs system provides Superadmin with complete visibility into how Admin and Author roles interact with social media platforms.

**Tracked Events:**
- Platform opened (which platform, who, when)
- Messages sent (through Superadmin's full inboxes)
- System login/logout events

**Log Entry Structure:**
| Field | Description |
|-------|-------------|
| User Name | Who performed the action |
| User Role | admin / author |
| Action | What was done |
| Platform | whatsapp / facebook / instagram / telegram / system |
| Details | Additional context |
| Timestamp | Exact date and time |
| IP Address | Request origin |

---

## Technical Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14)                       │
│                    localhost:3000                              │
├──────────────────────────────────────────────────────────────┤
│  PUBLIC ROUTES            │  ADMIN ROUTES                     │
│  /         Homepage       │  /admin/dashboard                 │
│  /about    About          │  /admin/homepage                  │
│  /blog     Blog           │  /admin/about, /services          │
│  /seo      SEO Tool       │  /admin/projects, /blog           │
│  /contact  Contact        │  /admin/seo, /enquiry             │
│  /login    Auth           │  /admin/telegram, /whatsapp-chat  │
│                           │  /admin/facebook-chat             │
│                           │  /admin/instagram-chat            │
│                           │  /admin/social-connect            │
│                           │  /admin/logs, /users              │
│                           │  /admin/whatsapp (integrations)   │
└───────────────┬───────────┴──────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express.js)                    │
│                    localhost:5000                              │
├──────────────────────────────────────────────────────────────┤
│  /api/auth              Users CRUD + Login                    │
│  /api/posts             Blog Posts                            │
│  /api/categories        Blog Categories                      │
│  /api/projects          Portfolio Projects                    │
│  /api/pages             Homepage Content                     │
│  /api/about             About Content                        │
│  /api/services-section  Services                             │
│  /api/contact-info      Contact Details                      │
│  /api/enquiry           Customer Enquiries                   │
│  /api/seo-submissions   SEO URL Submissions                  │
│  /api/integrations      Social Media API Keys                │
│  /api/telegram          Telegram Bot API                     │
│  /api/messaging         WhatsApp / Facebook / Instagram      │
│  /api/logs              Activity Logging                     │
└───────────────┬──────────────────────────────────────────────┘
                │
                ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB Atlas)                    │
├──────────────────────────────────────────────────────────────┤
│  users                socialintegrations                      │
│  posts                telegrammessages                        │
│  categories           socialmessages                          │
│  projects             activitylogs                            │
│  homepages            seosubmissions                          │
│  abouts               enquiries                              │
│  services             contacts                               │
└──────────────────────────────────────────────────────────────┘
```

---

## Webhook Configuration

For real-time message reception, configure these webhook URLs in each platform's developer portal:

| Platform | Webhook URL | Notes |
|----------|------------|-------|
| Telegram | `https://yourdomain.com/api/telegram/webhook` | Set via admin panel Settings button |
| WhatsApp | `https://yourdomain.com/api/messaging/whatsapp/webhook` | Verify token required |
| Facebook | `https://yourdomain.com/api/messaging/facebook/webhook` | Subscribe to messaging events |
| Instagram | `https://yourdomain.com/api/messaging/instagram/webhook` | Requires FB app review |

> ⚠️ **Important:** Webhooks require a publicly accessible HTTPS server. They will not function on localhost. Deploy to production before configuring webhooks.

---

## Security & Authentication

| Layer | Implementation |
|-------|---------------|
| Authentication | JWT tokens (7-day expiry) |
| Storage | localStorage (token + role) |
| Route Protection | Auth middleware on all protected endpoints |
| Role Enforcement | Frontend sidebar filtering + backend role checks |
| Webhook Security | Verify tokens for platform webhook validation |
| Password Storage | Plain text (visible in MongoDB for admin access) |
| API Transport | HTTPS in production |
| Activity Tracking | All social media actions logged with IP |

---

## Frequently Asked Questions

**Q: How do I reset a forgotten password?**  
A: Superadmin navigates to Users → clicks Edit on the user → enters new password → Save.

**Q: How do I create a new Admin account?**  
A: Superadmin → Users → + Add User → Select Role: Admin → Create.

**Q: How do I connect Telegram (fastest setup)?**  
A: Open Telegram → Search @BotFather → /newbot → copy token → Integrations → Telegram → paste → Save.

**Q: Why can't Admin see the messaging inboxes?**  
A: By design, only Superadmin has access to full messaging inboxes. Admin/Author see a simplified "Social Media" page that opens platforms in new tabs.

**Q: Can Admin's social media activity be monitored?**  
A: Yes. Every time Admin or Author opens a social platform, it's logged. Superadmin views all logs at Activity Logs page.

**Q: Why is WhatsApp showing "Not Connected"?**  
A: WhatsApp requires Business API credentials from Meta Developer Portal. It's a paid service requiring business verification.

**Q: How do I publish a blog post?**  
A: Blog → New Post tab → Write title + content → Select category → Set status to Published → Save.

**Q: Can I change my own profile picture?**  
A: Only Superadmin can change profile pictures via the Users management page (camera icon on avatar).

**Q: What happens when I deploy to production?**  
A: Update the API base URL in `website/utils/api.js` from `localhost:5000` to your production domain. Configure webhooks with the production URL.

---

## Support

**Technical Support:** info@digikraftsocial.com  
**Website:** https://digikraftsocial.com  
**Documentation Version:** 3.0
