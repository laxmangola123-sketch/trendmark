# TrendTracker Pro — Test Credentials

## Admin (auto-seeded, hidden from public nav)
- Email: `admin@tredtracker.net`
- Password: `admin@123`
- Access: Log in via `/login` → auto-redirects to `/admin`. The Admin link is NOT shown in the navbar.

## Test regular user
- Email: `john@example.com`
- Password: `secret123`
- Note: Created via `POST /api/auth/signup` during smoke tests. Already has a purchase pending/approved for the "Growth" plan.

## External payment gateway
- URL: `https://penmarksolutions.net/plan.php`
- The frontend opens this URL in a **new tab** when the user clicks any plan.
- Actual payment settlement is handled outside our app; the admin approves the pending payment in **Admin → Payments** and only then are credits + WhatsApp group activated for the user.

## Membership plans (seeded, editable in Admin → Plans)
| id | Name | Price | Credits | WhatsApp |
|----|------|-------|---------|----------|
| `starter`  | Starter  | $79  | 79  days | placeholder link (edit in admin) |
| `growth`   | Growth   | $149 | 149 days | placeholder link (edit in admin) |
| `premium`  | Premium  | $199 | 199 days | placeholder link (edit in admin) |
| `ultimate` | Ultimate | $299 | 299 days | placeholder link (edit in admin) |

## Notes
- Email sending remains **MOCKED** — every membership state change writes to `db.email_logs` (visible in Admin → Emails).
- KYC document upload accepts PDF only, stored under `/app/backend/uploads/kyc/`, served at `/uploads/kyc/{filename}`.
- Admin can activate/deactivate user accounts, approve/reject payments and KYC submissions, and CRUD plans + stocks.
