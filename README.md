# CleanersApp

**Book a trusted cleaner in minutes** — on-demand or scheduled — with live job status like a ride.

A Gett-style two-sided marketplace: customers request cleaning jobs; vetted cleaners accept, perform, and get paid.

## Features

### Customer
- **Book now** or **Schedule** with upfront pricing (packages + room count)
- Live ETA and status tracker: Assigned → En route → Arrived → In progress → Completed
- Pay with card on file, rate + tip, rebook

### Cleaner
- Go online/offline (verified cleaners only)
- Incoming job offers with **60-second accept/decline**
- Status updates + completion checklist
- Earnings dashboard

### Admin (MVP)
- Verify pending cleaners (background check + insurance)
- Suspend cleaners, monitor active jobs

## Tech stack

Next.js 15 · TypeScript · Tailwind CSS 4 · Prisma · SQLite

## Getting started

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo flow

1. **Customer** — `/book` → Book now → confirm → track on `/track/[id]`
2. **Cleaner** — `/cleaner` → accept offer → advance through statuses → complete checklist
3. **Admin** — `/admin` → verify Rina Katz (pending cleaner)

See [docs/PRODUCT.md](docs/PRODUCT.md) for the full product plan.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Sync schema |
| `npm run db:seed` | Seed cleaners (5 verified + 1 pending) |

## License

MIT
