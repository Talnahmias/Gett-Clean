# Gett Clean

On-demand professional cleaning — a **Gett-style** experience for booking cleaners instead of taxi drivers.

Book trusted cleaners in minutes, track their arrival and job progress in real time, and manage jobs from the cleaner side.

## Features

- **Customer app** — pick a service (standard, deep, move-out, office), choose an address, and request a cleaner
- **Live tracking** — status pipeline: searching → assigned → en route → in progress → completed
- **Cleaner app** — go online/offline, accept incoming requests, advance job status
- **Auto-matching** — nearest online cleaner is assigned when you book
- **Gett-inspired UI** — dark header, yellow & green accents, mobile-first layout

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) + SQLite

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install & run

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo flow

1. **Book a clean** — go to `/book`, pick a service and address, tap **Request cleaner**
2. **Track** — you are redirected to `/track/[id]` with live status updates
3. **Cleaner side** — open `/cleaner` in another tab, select a cleaner, advance the job through statuses

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Apply Prisma schema to SQLite |
| `npm run db:seed` | Seed sample cleaners |

## Project structure

```
src/
  app/           # Pages & API routes
  components/    # UI components
  lib/           # Prisma client, booking logic, constants
prisma/
  schema.prisma  # Database schema
  seed.ts        # Sample data
```

## License

MIT
