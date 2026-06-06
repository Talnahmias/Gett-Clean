# CleanersApp — Product Plan

> Book a trusted cleaner in minutes — on-demand or scheduled — with live job status like a ride.

## 1. Product positioning

| Dimension | Gett (taxi) | CleanersApp |
|-----------|-------------|-------------|
| Demand | "I need a ride now" | "I need a cleaner now / at 2pm Tuesday" |
| Supply | Drivers online | Cleaners online + scheduled slots |
| Unit of work | Trip A → B | Job at address, duration + service type |
| Trust | Driver rating, plate number | Background check, insurance, in-home access |
| Pricing | Distance + time | Flat packages, hourly, or room-based |

## 2. User roles (MVP)

| Role | Primary goals | MVP status |
|------|---------------|------------|
| **Customer** | Book, track, pay, rate, rebook | ✅ Implemented |
| **Cleaner** | Go online, accept/decline offers, navigate, checklist, earn | ✅ Implemented |
| **Ops / Admin** | Verify cleaners, monitor jobs, coverage | ✅ Minimal admin |
| Business | Offices, Airbnb, recurring | 🔜 Later |

## 3. Core journeys

### Customer — Book now
1. Open app → estimated wait / nearest cleaner ETA
2. Pick service, rooms, address → upfront price
3. Confirm → offer sent to nearest verified cleaner
4. Live status: **Assigned → En route → Arrived → In progress → Completed**
5. Pay (card on file) → rate + tip → rebook

### Customer — Schedule
1. Same flow with date/time picker
2. Cleaner assigned at booking or closer to slot (MVP: assigned when cleaner accepts open request)

### Cleaner
1. Toggle **Online / Offline** (verified only)
2. Incoming offer with **60s accept/decline timeout**
3. Advance status + complete **checklist** before finishing
4. Earnings dashboard

### Admin (MVP)
1. Verify pending cleaners (background + insurance)
2. Suspend cleaners
3. View active jobs and recent bookings

## 4. Implementation map

| Feature | Route / API |
|---------|-------------|
| Availability ETA | `GET /api/availability` |
| Book on-demand / scheduled | `POST /api/bookings` |
| Live tracking | `/track/[id]` |
| Offer accept/decline | `PATCH /api/bookings/[id]` |
| Cleaner jobs | `GET /api/cleaners/jobs` |
| Admin ops | `/admin`, `GET /api/admin` |

## 5. Next iterations

- Real auth (customer / cleaner / admin)
- Maps integration (Google/Mapbox)
- Stripe payments
- Push notifications for offers
- Business accounts & recurring cleans
- Dispute resolution workflow
