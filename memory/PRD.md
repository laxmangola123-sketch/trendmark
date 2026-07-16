# TrendTracker Pro — Product Requirements

## Original problem statements
1. (v1) Fix duplicate-signup error, add membership + credits + email + admin panel + 7-day trial + skip button.
2. (v2, current) Route plan clicks to external payment gateway (penmarksolutions.net/plan.php), hide admin from nav, add landing sections (How it works, Why choose us, FAQ, Disclaimer, social, support contact, stocks ticker), give admin CRUD over plans + stocks + user activation, add 4 plans ($79/$149/$199/$299) with per-plan WhatsApp groups, and add KYC (US-style: full name, DOB, address, passport + PDF upload).

## Architecture
- **Backend:** FastAPI + Motor (MongoDB async) + Passlib bcrypt + python-jose JWT.
- **Frontend:** React 18 (CRA) + React Router + Tailwind + Framer Motion + Sonner + Lucide.
- **Data model (Mongo collections):** `users`, `plans`, `stocks`, `memberships` (payments), `kyc`, `email_logs`.
- **File storage:** KYC PDFs under `/app/backend/uploads/kyc/`, served at `/uploads/kyc/*`.
- **Auth:** JWT bearer (30-day TTL) in localStorage.

## User personas
1. **Visitor** — sees landing (hero, ticker, how-it-works, why-us, FAQ, disclaimer, contact, social).
2. **Trial user** — signs up, gets 7-day access + 0 credits, can start KYC.
3. **Paying member** — clicks a plan → external payment page opens → admin approves → membership + credits + WhatsApp URL are activated.
4. **Admin** — hidden URL; can CRUD plans + stocks, approve/reject payments + KYC, activate/deactivate accounts, view all emails.

## What has been implemented (2026-01-11 v2)
- 4 seeded membership plans: `starter` $79, `growth` $149 (popular), `premium` $199, `ultimate` $299. Each has `whatsapp_url`.
- 8 seeded stocks (AAPL, MSFT, NVDA, TSLA, AMZN, META, GOOGL, SPY) editable by admin, shown on landing marquee.
- Async purchase: `POST /api/membership/purchase` creates `pending` payment + returns external_payment_url; `PATCH /api/admin/payments/{id}/approve` activates.
- KYC endpoints: `POST /api/kyc/submit` (multipart PDF), `GET /api/kyc/me`, admin list + status change.
- Admin can toggle `is_active` on any non-admin user; deactivated users cannot log in.
- Admin can CRUD `/api/admin/plans` and `/api/admin/stocks`.
- Landing page: Hero, StocksTicker, Features, How-it-works (4 steps), Why choose us, FAQ (6 items), Disclaimer, Footer with social + support (+1 (609) 629-1212 / info@trftechnologies.com / Princeton NJ 08540).
- Navbar no longer surfaces Admin. Admin logs in via `/login` → auto-redirect to `/admin`.
- Dashboard: shows WhatsApp group card for members, KYC banner, expired banner, credit/trial/membership stats.
- Testing agent iteration_2.json: **18/18 backend tests passed, all frontend flows verified.**

## Prioritized backlog
### P0 (done)
- [x] External payment URL open-in-new-tab
- [x] Async admin-approved payment
- [x] 4-plan tier with WhatsApp groups
- [x] KYC form + PDF upload + admin review
- [x] User activate/deactivate
- [x] Admin CRUD for plans + stocks
- [x] Landing sections + footer with support contact + social
- [x] Hidden admin nav

### P1 (next)
- [ ] Real payment webhook from penmarksolutions.net (currently manual admin approve)
- [ ] Real email provider (SendGrid/Resend) instead of MOCK
- [ ] Split `server.py` into routers/ modules (auth.py, admin.py, kyc.py) — file is ~650 lines
- [ ] Server-side PDF size cap on KYC upload

### P2 (future)
- [ ] Cron for daily credit decrement (currently lazy on `/api/auth/me`)
- [ ] KYC OCR extraction from passport PDF
- [ ] Multi-language landing
- [ ] Real-time stock feed (Alpha Vantage / Finnhub)

## Next tasks
1. Ask user for real WhatsApp invite URLs → replace placeholders in DB via admin.
2. Once penmarksolutions.net exposes a return URL / webhook, wire auto-approval.
3. Optional: ship SendGrid to deliver real confirmation emails.

## MOCKED / NOT REAL
- **Email sending** — logged to `db.email_logs`, no real SMTP.
- **Payment settlement** — external URL opens in a new tab; **admin must manually approve** in Admin → Payments before membership activates.
