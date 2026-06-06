# AGENTS.md

Guidance for AI agents working in the Gett-Clean repository.

## Product

**Gett Clean** is a Gett-style on-demand cleaning platform. Customers book cleaners; cleaners accept jobs and update status through a pipeline (searching → assigned → en route → in progress → completed).

## Development commands

| Action | Command |
|--------|---------|
| Install | `npm install` |
| DB setup | `npm run db:push && npm run db:seed` |
| Dev server | `npm run dev` (http://localhost:3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Production | `npm run start` |

Copy `.env.example` to `.env` if missing. Default `DATABASE_URL` is `file:./dev.db` (SQLite under `prisma/`).

## Services

| Service | Required? | How to start |
|---------|-----------|--------------|
| Next.js dev server | Yes | `npm run dev` |
| SQLite (via Prisma) | Yes | Created by `npm run db:push` |

No Docker or external services required for local development.

## Key routes

- `/` — landing
- `/book` — customer booking flow
- `/track/[id]` — live booking tracker
- `/cleaner` — cleaner dashboard
- `/api/bookings`, `/api/cleaners` — REST API

## Cursor Cloud specific instructions

- **Update script**: `npm install` then `npm run db:push` (schema sync; seed is manual via `npm run db:seed`).
- **First run**: After install, run `npm run db:seed` once if the cleaners table is empty.
- **Port**: Dev server listens on **3000**.
- **Dual-tab demo**: Customer flow on `/book`; cleaner actions on `/cleaner` — use two browser tabs to simulate both sides.
- **Hot reload**: Prisma client regenerates on `postinstall`; after schema changes run `npm run db:push`.
