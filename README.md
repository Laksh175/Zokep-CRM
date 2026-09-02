# 🚀 Zokep CRM - SaaS Multi-Tenant Lead Management Platform

A complete, production-ready **SaaS Lead Management CRM** built with the **MERN Stack** (MongoDB, Express.js, React, Node.js), featuring 3-tier Role-Based Access Control (**Super Admin**, **Tenant Admin**, **Staff Member**), **Razorpay Subscription Billing & Webhooks**, **Nodemailer Automated Credential Dispatch**, **Dynamic Industry Custom Form Fields**, **1-Click WhatsApp Direct Launcher**, and **Public Lead Capture Links**.

---

## 🌟 Key Architecture & Highlights

1. **3-Tier Multi-Tenant Roles**:
   - **👑 Super Admin (Platform Owner)**:
     - Real-time Recurring Revenue Dashboard (MRR, ARR, Platform Growth).
     - Tenant lifecycle management with instant **Account Suspension / Activation** (with mandatory reason log).
     - Subscription Plan Builder (Monthly / Yearly pricing, limits, features, Razorpay plan sync).
     - Expired subscription tracker & manual grace period extender (+15/30/60 days).
   - **🏢 Admin (Tenant / Business Owner)**:
     - Sales pipeline dashboard, custom status distribution, staff performance leaderboard.
     - **Custom Lead Statuses & Colors**: Tailor stages for Real Estate (*Site Visit, Token*), Manufacturing (*RFQ, Sample Sent*), or Agencies with custom HEX colors.
     - **Dynamic Form Custom Fields Builder**: Add custom fields (Text, Number, Dropdown Select, Radio, Checkbox, Date, Textarea) to match any industry.
     - **Message Templates**: Create rich WhatsApp & Email templates with placeholders like `{{lead_name}}`, `{{phone}}`, `{{company}}`, `{{staff_name}}`, `{{deal_value}}`.
     - **Staff Management**: Add sales consultants (auto-dispatches login credentials to staff via Nodemailer).
     - **Public Lead Form**: Unique shareable link (`/f/:tenantId`) and iframe embed snippet that auto-injects inquiries into CRM.
     - **Bulk CSV Import & Export**: Import leads with column auto-mapping and download CSV with custom columns.
     - **Razorpay Subscription Renewal & Upgrade**: 1-click plan renewal with Razorpay gateway.
   - **👤 Staff Member (Sales Consultant / Manager)**:
     - My workspace: Today's follow-up schedule and overdue tasks.
     - My assigned leads view (cannot change assignment; auto-assigned when staff creates lead).
     - **1-Click WhatsApp Trigger**: Generates `wa.me/` direct chat with Admin's template.
     - **1-Click Email Trigger**: Sends template-based email to lead via Nodemailer.
     - Follow-up logger & next contact date scheduler.
     - Convert qualified lead to **Customer** with revenue value tracking.

2. **💳 Razorpay Payment Gateway Integration**:
   - Order creation API (`/api/subscriptions/create-order`).
   - HMAC SHA256 signature verification (`/api/subscriptions/verify-payment`).
   - Webhook listener (`/api/subscriptions/razorpay-webhook`).
   - Interactive developer/demo simulator fallback when test keys are active.

3. **✉️ Nodemailer Email Dispatcher**:
   - Welcome email with credentials to newly registered Tenant Admins.
   - Onboarding email with credentials to newly added Staff members.
   - In-app email sender to leads using configured templates and dynamic variable substitution.

---

## 🛠️ Tech Stack

- **Frontend**: Vite, React 18, React Router v6, Lucide Icons, Canvas Confetti, Custom Glassmorphic CSS Design System.
- **Backend**: Node.js, Express.js (ES Modules), MongoDB & Mongoose.
- **Security**: JWT (JSON Web Tokens), Bcrypt.js password hashing, Role Middleware, Subscription Enforcer.
- **Integrations**: Razorpay SDK, Nodemailer, Multer, CSV-Parser, Json2csv.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI.

### 2. Backend Setup
```bash
cd backend
npm install
npm run seed     # Pre-loads Super Admin, Plans, Demo Tenants, Staff, and sample Leads
npm run dev      # Starts API server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin@zokepcrm.com` | `SuperAdmin@123` | Platform Owner, Revenue Analytics, Plans & Tenants |
| **Real Estate Admin** | `realestate.admin@example.com` | `Admin@123` | Skyline Luxury Realty (Active Growth Plan) |
| **Sales Staff** | `rohit.sales@example.com` | `Staff@123` | Consultant under Skyline Luxury Realty |
| **Expired Tenant Admin**| `expired.admin@example.com` | `Admin@123` | Apex Manufacturing (Expired Subscription Demo) |

*(You can also use the 1-click test credential buttons on the `/login` screen for instant access!)*

---

## 📡 API Endpoint Summary

### Auth & Public
- `POST /api/auth/register-admin` - Register business & activate subscription plan
- `POST /api/auth/login` - Universal login for all 3 roles
- `GET /api/auth/me` - Current user profile & subscription state
- `GET /api/public/form/:tenantId` - Get public lead form configuration & custom fields
- `POST /api/public/form/:tenantId` - Submit lead from public form

### Super Admin
- `GET /api/superadmin/analytics` - Platform revenue (MRR/ARR) & tenant metrics
- `GET /api/superadmin/admins` - List all tenants with search & subscription status
- `PUT /api/superadmin/admins/:id/toggle-status` - Activate / Suspend tenant account (with reason)
- `POST /api/superadmin/admins/:id/extend-subscription` - Grant trial/grace extension
- `GET|POST|PUT|DELETE /api/superadmin/plans` - Subscription plan builder

### Tenant Admin & Staff
- `GET /api/admin/dashboard` - Admin pipeline analytics, status breakdown, leaderboard
- `GET|POST|PUT|DELETE /api/admin/staff` - Staff management (auto-emails credentials)
- `GET /api/staff/dashboard` - Staff dashboard (today's follow-ups, overdue alerts)
- `GET|POST|PUT|DELETE /api/leads` - Lead operations (with role scoping)
- `POST /api/leads/:id/followup` - Log follow-up note & change status
- `POST /api/leads/:id/convert` - Convert lead to customer
- `POST /api/leads/bulk-upload` - Bulk CSV upload
- `GET /api/leads/export-csv` - Export filtered leads in CSV
- `GET|POST|PUT|DELETE /api/settings/statuses` - Custom lead stages & HEX colors
- `GET|POST|PUT|DELETE /api/settings/custom-fields` - Dynamic custom form fields
- `GET|POST|PUT|DELETE /api/settings/templates` - WhatsApp & Email templates
- `POST /api/settings/send-lead-email` - Nodemailer email dispatcher
- `POST /api/subscriptions/create-order` - Create Razorpay order
- `POST /api/subscriptions/verify-payment` - Verify Razorpay payment & renew plan
- `POST /api/subscriptions/razorpay-webhook` - Razorpay webhook listener
