# Phase 3: UI/UX Design Specification

## Overview
Phase 3 introduces the **Digital Storehouse** and the **Customer Dashboard**. The design must feel high-end, premium, and seamless, matching the existing "smoky-black" dark theme with "jet" borders and "orange-yellow" accents.

## 1. Digital Store (`/store`)

The storefront is where users will browse, search, and purchase digital software, scripts, and services.

### Layout Structure
- **Global Header**: Existing Navbar.
- **Hero Section**: 
  - Title: "Digital Storehouse"
  - Subtitle: "Premium software, scripts, and digital services crafted for scale."
  - Search Bar: Centered, large input field with an icon.
- **Filters/Categories Sidebar (Left or Top-Tabs)**:
  - All Products
  - Scripts
  - UI Kits
  - E-Commerce
  - Consulting
- **Product Grid (Main Content)**:
  - Responsive Grid (1 column on mobile, 2 on tablet, 3 on desktop).
  - **Product Card**:
    - **Thumbnail**: 16:9 high-quality image of the digital product.
    - **Badges**: "Bestseller", category tag (e.g., "Script").
    - **Title & Excerpt**: Truncated to 2 lines.
    - **Price**: Bold, orange-yellow accent.
    - **Call to Action**: "Add to Cart" or "Buy Now" ghost button that turns solid on hover.

### Product Detail Page (`/store/[slug]`)
- **Breadcrumbs**: `Store > Category > Product Name`
- **Two-Column Layout (Desktop)**:
  - **Left**: Product Image Gallery (Main image + smaller thumbnails below).
  - **Right**: 
    - Title, Price, Status.
    - "Buy Now" primary checkout button (Lemon Squeezy integration).
    - Features list (bullet points).
    - Specifications/Requirements tab.
- **Bottom Section**: Rich text description of the product, customer reviews.

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
