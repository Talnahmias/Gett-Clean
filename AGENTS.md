# AGENTS.md

Guidance for AI agents working in the CleanersApp (Gett-Clean) repository.

## Product

**CleanersApp** is a Gett-style on-demand cleaning marketplace. See [docs/PRODUCT.md](docs/PRODUCT.md) for positioning, journeys, and roadmap.

**MVP roles:** Customer, Cleaner, Admin.

## Development commands

| Action | Command |
|--------|---------|
| Install | `npm install` |
| DB setup | `npm run db:push && npm run db:seed` |
| Dev server | `npm run dev` → http://localhost:3000 |
| Lint | `npm run lint` |
| Build | `npm run build` |

## Key routes

| Route | Purpose |
|-------|---------|
| `/` | Landing + availability ETA |
| `/book?mode=now\|schedule` | Customer booking |
| `/track/[id]` | Live tracker, pay, rate |
| `/cleaner` | Cleaner offers, checklist, earnings |
| `/admin` | Verify/suspend cleaners, job monitor |

## Booking status flow

`SEARCHING` → `OFFERED` (60s timeout) → `ASSIGNED` → `EN_ROUTE` → `ARRIVED` → `IN_PROGRESS` → `COMPLETED`

## Cursor Cloud specific instructions

- **Update script**: `npm install` then `npm run db:push`
- **Seed**: Run `npm run db:seed` after schema changes (5 verified + 1 pending cleaner)
- **Dual-tab demo**: `/book` + `/cleaner` for offer accept flow
- **Admin demo**: `/admin` to verify pending cleaner Rina Katz before she can go online
