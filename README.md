<div align="center">

# FestoUG

**Premium Developer Portfolio & Digital Storefront**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.44-C5F74F?logo=drizzle&logoColor=black)](https://orm.drizzle.team/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5-7C3AED?logo=auth0&logoColor=white)](https://authjs.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-D22128?logo=apache&logoColor=white)](LICENSE)

A high-end, dynamic developer portfolio that doubles as a full-scale digital storefront — built to sell software, scripts, and digital services globally and locally.

[Live Site](https://festoug.vercel.app) · [Report Bug](https://github.com/Festo-Wampamba/festoug/issues) · [Request Feature](https://github.com/Festo-Wampamba/festoug/issues)

</div>

---

## ✨ Features

### Portfolio
- **About** — Personal introduction, services overview, and client testimonials
- **Resume** — Education, work experience, and animated skill bars
- **Portfolio** — Filterable project gallery with modal previews
- **Blog** — Database-driven posts with server-side pagination
- **Contact** — Server-side EmailJS integration (API keys never exposed to the browser)

### Platform
- **Authentication** — Email/password, GitHub OAuth, and Google OAuth via Auth.js v5
- **Role-Based Access Control** — `ADMIN` and `CUSTOMER` roles enforced at the proxy and data-access layers
- **Database** — PostgreSQL with Drizzle ORM, type-safe schema, and migration tooling
- **Digital Store** _(coming soon)_ — Product catalog, checkout, and license key delivery
- **Admin Dashboard** _(coming soon)_ — Product/order/user management and blog CMS
- **AI Assistant** _(coming soon)_ — Context-aware chatbot powered by Google Gemini 2.5 Flash

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://typescriptlang.org/) (strict mode) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) |
| **Auth** | [Auth.js v5](https://authjs.dev/) (JWT sessions, OAuth, credentials) |
| **Email** | [EmailJS](https://www.emailjs.com/) (server-side via Server Actions) |
| **Package Manager** | [pnpm](https://pnpm.io/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 Project Structure

```
festoug/
├── drizzle/                    # Auto-generated SQL migrations
├── public/                     # Static assets (images, resume PDF)
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Public pages (resume, portfolio, contact)
│   │   ├── api/                # API routes (auth, registration)
│   │   ├── auth/               # Sign-in & sign-up pages
│   │   ├── blog/               # Blog listing
│   │   └── page.tsx            # Landing / About page
│   ├── components/
│   │   ├── blog/               # Blog card components
│   │   ├── layout/             # Sidebar, Navbar
│   │   └── marketing/          # Service cards, testimonials, skill bars
│   ├── lib/
│   │   ├── auth.ts             # Auth.js configuration
│   │   └── db/                 # Drizzle client, schema, seed script
│   └── proxy.ts                # Next.js 16 RBAC route guard
├── drizzle.config.ts           # Drizzle Kit configuration
├── tailwind.config.ts          # Tailwind theme
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

Create a `.env.local` file in the project root with the following variables:

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

- [x] Phase 1 — Foundation & component migration
- [x] Phase 2 — Database, authentication, and RBAC
- [ ] Phase 3 — Digital store & customer dashboard
- [ ] Phase 4 — Admin dashboard & blog CMS
- [ ] Phase 5 — AI assistant chatbot (Gemini 2.5 Flash)
- [ ] Phase 6 — Social proof & developer features
- [ ] Phase 7 — Docker & CI/CD deployment

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

**Festo Muwanguzi**

- 🌐 Website: [festoug.vercel.app](https://festoug.vercel.app)
- 📧 Email: [festotechug@gmail.com](mailto:festotechug@gmail.com)
- 💼 LinkedIn: [Festo Wampamba](https://www.linkedin.com/in/festo-wampamba/)
- 🐙 GitHub: [@Festo-Wampamba](https://github.com/Festo-Wampamba)

---

<div align="center">

**Built with ❤️ in Kampala, Uganda 🇺🇬**

</div>
