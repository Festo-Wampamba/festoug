# Project TODO Tracker

## Phase 2: Database & Auth (Completed ✅)
- [x] Configure PostgreSQL and Drizzle ORM
- [x] Create comprehensive Database Schema
- [x] Seed JSON data to PostgreSQL
- [x] Configure Auth.js v5 (Google, GitHub, Credentials)
- [x] Build `/auth/signin` User Interface
- [x] Build `/auth/signup` User Interface
- [x] Secure API Route `/api/auth/register`
- [x] Implement Route Protection (`proxy.ts`)

---

## Phase 3: Digital Storehouse & Customer Dashboard (In Progress 🚧)

### 1. Setup & Design
- [x] Create `development` branch
- [x] Draft `PHASE_3_DESIGN.md` UI/UX specification
- [x] Setup `TODO.md` tracking file

### 2. Professional Services Portal (`/services` or `/hire-me`)
- [x] Create `ServiceCard` UI Component (Grid layout)
- [x] Create `PricingCard` UI Component (3-tier plans)
- [x] Build `/services/page.tsx` (Hero, Service Grid, Pricing Table)
- [x] Integrate Portfolio/Project Gallery carousel for proof of work

### 3. Checkout & Onboarding Flow
- [x] Implement Lemon Squeezy integration for Retainers / Fixed Projects
- [x] Build custom "Get Started" onboarding/scoping form
- [x] Configure specialized webhooks for service payments

### 4. Customer Dashboard Layout (`/dashboard`)
- [x] Create private layout for `/dashboard` with Sidebar/Tabs
- [x] Ensure middleware strictly blocks non-authenticated users

### 5. Dashboard Pages
- [x] Build `/dashboard/page.tsx` (Overview & Stats)
- [x] Build `/dashboard/purchases` (Order History & Downloads)
- [x] Build `/dashboard/licenses` (License Key management)
- [x] Build `/dashboard/settings` (Profile update form)

### 6. Payment Webhooks & Fulfillment
- [x] Create webhook handler `/api/webhooks/lemonsqueezy`
- [x] On successful payment: Insert `Order` and `License` records in DB
- [ ] Send confirmation email to customer (via EmailJS / Resend)

### 7. Digital Products Catalog (`/store`)
- [x] Build `/store` product catalog page showing available items
- [x] Build `/store/[slug]` detailed product sales page
- [x] Implement `/api/checkout` to generate dynamic hosted Lemon Squeezy templates
- [x] Add variant ID mapping to PostgreSQL products schema

### 8. Deferred UI Polish & Integration (To-Do Later)
- [ ] Finish creating all variant IDs in Lemon Squeezy dashboard and add them to the `.env.local`
- [ ] Fix Login/Signup UI design formatting and responsiveness on smaller screens
- [ ] Adjust the Customer Dashboard profile and layout for mobile responsiveness

---

## Phase 4: Admin Dashboard & Blog CMS (Upcoming 📝)
- [ ] Build `/admin` RBAC protected layout
- [ ] Product CRUD interface
- [ ] Orders management interface
- [ ] Tiptap Rich Text Editor for Blog Posts
- [ ] Blog CRUD interface
