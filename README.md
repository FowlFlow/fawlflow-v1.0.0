# FawlFlow

A mobile-first farm management app for a chicken farm's two operations: **feed** (raw materials, recipes, production, sales, pricing, profit) and **eggs** (cages, daily collection, sales). Single-user, built to run for free on Vercel + Neon.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Database | Postgres (Neon in production) |
| ORM | Prisma 7 (driver adapter: `@prisma/adapter-pg`) |
| Auth | Auth.js v5, Credentials provider, bcrypt-hashed password |
| UI | Tailwind v4 + shadcn/ui (on `@base-ui/react`) |
| Charts | Recharts |

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables** — copy `.env.example` to `.env` and fill in real values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a Postgres connection string (a local Postgres for dev, or your Neon connection string).
   - `AUTH_SECRET` — generate with `npx auth secret`.

3. **Apply the database schema**

   ```bash
   npx prisma migrate dev
   ```

4. **Seed an initial user** (creates the one login this app uses, and prints a recovery code — save it, it's shown only once):

   ```bash
   npx prisma db seed
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/(app)/` — the authenticated app: `feed/*` (materials, purchases, recipes, production, sales, prices, reports), `eggs/*` (cages, log, sales, reports), `contacts/`, `settings/`.
- `src/app/login`, `src/app/forgot-password` — auth screens, outside the authenticated layout.
- `src/lib/` — Prisma client, stock/profit calculation helpers.
- `prisma/schema.prisma` — data model. Stock and profit are always derived by summing ledger tables at read time, never stored as mutable counters.

## Branching & deployment

This repo uses two long-lived branches, matching Vercel's default "every branch gets a deployment" behavior:

- **`main`** — production. Every push here deploys to the live production URL.
- **`develop`** — day-to-day work. Every push here deploys to its own stable Vercel preview URL, so you can try changes for real before they go live.

Day to day: commit to `develop`. When `develop` is in a good state, open a PR into `main` (or fast-forward merge) to ship it. Every PR also gets its own one-off preview URL from Vercel automatically.

### First-time Vercel setup (manual, one-time)

1. In the [Vercel dashboard](https://vercel.com/new), import this GitHub repo.
2. In **Storage → Connect Database**, add a Neon Postgres database — this sets `DATABASE_URL` (and a pooled/direct pair) automatically.
3. Add the `AUTH_SECRET` environment variable (same value you generated locally, or a fresh one).
4. Set the **Production Branch** to `main` in Project Settings → Git (this is Vercel's default, so only needed if it was changed).
5. Deploy. From here, every `git push` to `main` auto-deploys to production; every other branch (including `develop`) gets its own preview URL.

## CI

`.github/workflows/ci.yml` runs on every push and pull request against `main` and `develop`: install, lint, type-check, and a production build (using a placeholder database URL — the build never needs a reachable database, only a syntactically valid connection string).
