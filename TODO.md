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

### 2. Store Catalog (`/store`)
- [ ] Create `ProductCard` UI Component
- [ ] Create `/store/page.tsx` (Grid, Filters, Search)
- [ ] Fetch products from PostgreSQL (Drizzle)

### 3. Product Detail Page (`/store/[slug]`)
- [ ] Create `/store/[slug]/page.tsx` layout (Gallery, Specs)
- [ ] Implement Lemon Squeezy integration utility wrapper
- [ ] Create Checkout/Buy Now Button Component

### 4. Customer Dashboard Layout (`/dashboard`)
- [ ] Create private layout for `/dashboard` with Sidebar/Tabs
- [ ] Ensure middleware strictly blocks non-authenticated users

### 5. Dashboard Pages
- [ ] Build `/dashboard/page.tsx` (Overview & Stats)
- [ ] Build `/dashboard/purchases` (Order History & Downloads)
- [ ] Build `/dashboard/licenses` (License Key management)
- [ ] Build `/dashboard/settings` (Profile update form)

### 6. Payment Webhooks & Fulfillment
- [ ] Create webhook handler `/api/webhooks/lemonsqueezy`
- [ ] On successful payment: Insert `Order` and `License` records in DB
- [ ] Send confirmation email to customer (via EmailJS / Resend)

---

## Phase 4: Admin Dashboard & Blog CMS (Upcoming 📝)
- [ ] Build `/admin` RBAC protected layout
- [ ] Product CRUD interface
- [ ] Orders management interface
- [ ] Tiptap Rich Text Editor for Blog Posts
- [ ] Blog CRUD interface
