# Phase 3: UI/UX Design Specification

## Overview
Phase 3 introduces the **Digital Storehouse** and the **Customer Dashboard**. The design must feel high-end, premium, and seamless, matching the existing "smoky-black" dark theme with "jet" borders and "orange-yellow" accents.

## 1. Professional Services & Pricing (`/services` or `/hire-me`)

Instead of a generic "Digital Store" that explicitly sells software, the UI will be positioned as a **Premium Agency / Freelance Service Portal**. This portrays you as a high-end professional offering specialized services, with standard packages and custom development options.

### Layout Structure
- **Global Header**: Existing Navbar via `layout.tsx`.
- **Hero Section**: 
  - Title: "Professional Services & Solutions"
  - Subtitle: "Elevating businesses through high-end web development, digital marketing, and bespoke software architecture."
  - CTA: "Hire Me" or "View Pricing"
  
### Services Grid (The "Storefront")
- Inspired by the screenshot, a clean grid of high-end service cards.
- **Service Card Design**:
  - Dark `bg-eerie-black-1` background with a subtle glowing border on hover (e.g., violet or blue glow).
  - Prominent Title (e.g., "Web Development", "UI/UX Product Design").
  - Icon or Badge representing the service.
  - Bulleted list of what's included (e.g., Performance & Load Time, Reusable Components, Responsiveness).
  - Short descriptive paragraph below the bullets.
  
### Project Portfolios (Proof of Work)
- A carousel or grid showcasing past work related to the services, linking specific live previews.
- Dark theme cards with 16:9 thumbnails and descriptive overlays.

### Pricing Plans (The Checkout Point)
- A clean, 3-tier pricing table for structured development or retainer services (e.g., "Lite", "Premium", "Pro").
- **Pricing Card Design**:
  - Plan Name and target audience ("Perfect Choice for individual").
  - Price (e.g., "$999.00 / Project" or Monthly retainer).
  - **"Get Started Now"** primary button (This links to the Lemon Squeezy checkout or a detailed project scoping form).
  - Feature checklist (✔ included vs ✘ excluded).

### Checkout Flow Customization
- Instead of "Add to Cart", the flow is "Get Started" -> "Project Scoping" -> "Deposit Payment" (handled via Lemon Squeezy subscription or one-off invoice).

---

## 2. Customer Dashboard (`/dashboard`)

A private, secure portal for customers to manage their purchases, active licenses, and profile settings.

### Layout Structure
- **Sidebar Navigation**:
  - `Overview` (Dashboard Home)
  - `Purchases / Downloads`
  - `License Keys`
  - `Settings / Profile`
- **Main Content Area**:
  - Greeting: "Welcome back, {Name}"
  - **Stats Row**:
    - Total Purchases (Number)
    - Active Licenses (Number)
  - **Recent Purchases Table**:
    - Columns: Date, Product, Order ID, Amount, Status.
    - Action column: "Download" button.

### Purchases & Downloads
- A clean list/grid view of owned products.
- Each item contains a **Downloadable Asset link** (delivered post-purchase).
- If update available, show a "New Version" badge.

### Licenses Page
- Table of purchased license keys.
- Columns: Product, License Key, Expiry Date, Status (Active/Expired).
- Action: "Copy Key" button.

### Auth UI (Completed in Phase 2 ✅)
- Matches the app's dark aesthetic.
- Glassmorphism input fields.
- Providers: GitHub, Google, Credentials.

---

## Typography & Colors
- **Font**: Geist / Poppins (Inherited).
- **Backgrounds**: `bg-smoky-black` (`#101010`)
- **Cards/Containers**: `bg-eerie-black-1` (`#1c1c1c`)
- **Borders**: `border-jet` (`#2b2b2b`)
- **Accents (Buttons, Links)**: `text-orange-yellow-crayola` (`#ffb53f`), `bg-orange-yellow-crayola/10` for soft backgrounds.
