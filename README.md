# IRIS Studio Website

Production website for **IRIS Studio** — photography, media and printing services.

## Stack

- React 19 + TypeScript
- Vite
- Supabase (database, auth and storage)
- React Router
- Framer Motion
- GitHub Actions for CI
- Vercel for deployment

## Development

```bash
npm ci
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

The CI workflow runs both lint and build on pushes and pull requests targeting `main`.

## Environment

Create `.env` from `.env.example` and provide the public Supabase URL and publishable/anon browser key. Never place a Supabase service-role/secret key in the frontend environment.

## Supabase migrations

Database migrations live in `supabase/migrations/` and are the canonical migration history for the project. The old root-level `supabase-migration*.sql` files were historical/manual snapshots and are intentionally not part of the active migration workflow.

## Project structure

- `src/pages/` — public and admin routes
- `src/components/` — shared UI and premium experiences
- `src/styles/` — global and feature styles
- `src/lib/` — Supabase, calendar and utility logic
- `src/repositories/` — data-access helpers
- `supabase/migrations/` — database migrations
- `public/` — static public assets
