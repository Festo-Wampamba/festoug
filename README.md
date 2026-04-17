<div align="center">

# FestoUG

**Full-Stack Developer Portfolio, Digital Storefront & Services Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-7C3AED?logo=auth0&logoColor=white)](https://authjs.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-D22128?logo=apache&logoColor=white)](LICENSE)

A production-grade personal platform combining a developer portfolio, digital product store, services showcase, and full admin CMS — built and deployed for real clients worldwide.

[Live Site](http://festoug.com) · [Report Bug](https://github.com/Festo-Wampamba/festoug/issues) · [Request Feature](https://github.com/Festo-Wampamba/festoug/issues)

</div>

---

## ✨ Features

### Portfolio & Presence
- **About** — Personal introduction, skills overview, and client testimonials
- **Resume** — Education, work experience, and animated skill bars
- **Portfolio** — Filterable project gallery with rich detail pages
- **Blog** — Database-driven posts with Tiptap rich-text editor and server-side pagination
- **Contact** — Server-side EmailJS integration (API keys never exposed to the browser)

### Services
- **Services & Expertise** — Web development, server administration, web server management, network engineering, and IT infrastructure — no pricing lists, inquiry-driven
- **Get Started** — Project scoping form for new client inquiries

### Digital Store
- **Product Catalog** — Digital products with image uploads, rich descriptions, and slug-based URLs
- **LemonSqueezy Checkout** — Hosted payment flow with webhook order fulfillment
- **License Key Delivery** — Automatic license generation and customer delivery post-purchase
- **Customer Dashboard** — Order history, license management, and subscription overview

### Admin Dashboard
- **Overview** — Revenue, orders, product, and customer stats at a glance
- **Products CMS** — Create, edit, and manage digital products with Tiptap editor and screenshot uploads
- **Orders & Licenses** — Full order lifecycle and license key management
- **Blog CMS** — Write and publish posts with rich-text editing
- **Portfolio CMS** — Manage portfolio projects from the admin panel
- **Testimonials** — Approve and manage client testimonials
- **Reviews** — Moderate customer product reviews
- **Customers** — View and manage customer accounts
- **Inquiries** — Track and respond to client contact form submissions

### Platform
- **Authentication** — Email/password, GitHub OAuth, and Google OAuth via Auth.js v5
- **Role-Based Access Control** — `ADMIN` and `CUSTOMER` roles enforced at the proxy and data-access layers
- **Database** — PostgreSQL with Drizzle ORM, type-safe schema, and migration tooling
- **Notifications** — Admin-to-user notification system
- **LemonSqueezy Sync** — Product sync from LS store to local DB

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://typescriptlang.org/) (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **Rich Text** | [Tiptap](https://tiptap.dev/) (blog & product descriptions) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) |
| **Auth** | [Auth.js v5](https://authjs.dev/) (JWT sessions, OAuth, credentials) |
| **Payments** | [LemonSqueezy](https://www.lemonsqueezy.com/) (checkout + webhooks) |
| **Email** | [EmailJS](https://www.emailjs.com/) (server-side via Server Actions) |
| **Package Manager** | [pnpm](https://pnpm.io/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
festoug/
├── drizzle/                    # Auto-generated SQL migrations
├── docs/                       # Design specs and implementation plans
├── public/                     # Static assets (images, resume PDF)
├── src/
│   ├── app/
│   │   ├── (main)/             # Public-facing pages
│   │   │   ├── about/          # About / landing
│   │   │   ├── blog/           # Blog listing & post pages
│   │   │   ├── contact/        # Contact form
│   │   │   ├── get-started/    # Client inquiry / scoping form
│   │   │   ├── portfolio/      # Project gallery
│   │   │   ├── resume/         # Resume page
│   │   │   ├── services/       # Services & expertise
│   │   │   ├── store/          # Digital product store
│   │   │   └── dashboard/      # Customer dashboard (orders, licenses)
│   │   ├── admin/              # Admin dashboard (CMS + management)
│   │   ├── api/                # API routes (auth, webhooks, admin)
│   │   └── layout.tsx          # Root layout
│   ├── components/
│   │   ├── admin/              # Admin-specific UI components
│   │   ├── layout/             # Sidebar, Navbar, Footer
│   │   ├── marketing/          # Service cards, testimonials, skill bars
│   │   └── ui/                 # Shared UI primitives
│   ├── lib/
│   │   ├── auth.ts             # Auth.js configuration
│   │   └── db/                 # Drizzle client, schema, migrations
│   └── middleware.ts           # Next.js RBAC route guard
├── drizzle.config.ts
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **PostgreSQL** database (e.g., [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or local)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Festo-Wampamba/festoug.git
cd festoug

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials (see Environment Variables below)

# 4. Generate and apply database migrations
pnpm db:generate
pnpm db:migrate

# 5. Seed the database with initial data
pnpm db:seed

# 6. Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -hex 32`) | ✅ |
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret | Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional |
| `EMAILJS_SERVICE_ID` | EmailJS service identifier | Optional |
| `EMAILJS_TEMPLATE_ID` | EmailJS template identifier | Optional |
| `EMAILJS_USER_ID` | EmailJS public key | Optional |
| `EMAILJS_PRIVATE_KEY` | EmailJS private key | Optional |
| `LEMONSQUEEZY_API_KEY` | LemonSqueezy API key | Optional |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | LemonSqueezy webhook signing secret | Optional |
| `NEXT_PUBLIC_APP_URL` | Application URL (default: `http://localhost:3000`) | Optional |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with Turbopack |
| `pnpm build` | Create production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle SQL migrations |
| `pnpm db:migrate` | Apply migrations to PostgreSQL |
| `pnpm db:push` | Push schema changes directly (dev only) |
| `pnpm db:studio` | Open Drizzle Studio (visual DB browser) |
| `pnpm db:seed` | Seed database with initial data |

---

## 🗺️ Roadmap

- [x] Phase 1 — Foundation: portfolio, blog, resume, contact
- [x] Phase 2 — Authentication & RBAC (Auth.js v5, OAuth, role guards)
- [x] Phase 3 — Digital store, LemonSqueezy checkout & license delivery
- [x] Phase 4 — Admin dashboard & full CMS (products, blog, portfolio, testimonials)
- [x] Phase 5 — Services & expertise page (web dev, server admin, networking)
- [x] Phase 6 — Social proof (testimonials, reviews, customer notifications)
- [ ] Phase 7 — Docker & CI/CD deployment pipeline

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **Apache License 2.0** — see the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

**Festo Wampamba**

- 🌐 Website: [festoug.com](http://festoug.com)
- 📧 Email: [festotechug@gmail.com](mailto:festotechug@gmail.com)
- 💼 LinkedIn: [Festo Wampamba](https://www.linkedin.com/in/festo-wampamba/)
- 🐙 GitHub: [@Festo-Wampamba](https://github.com/Festo-Wampamba)

---

<div align="center">

**Built and designed by [Festo UG](http://festoug.com) · Kampala, Uganda 🇺🇬**

</div>
