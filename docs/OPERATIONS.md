# IFXTrades Operations Runbook

## 1) Production prerequisites
- Rotate all exposed Supabase/Stripe/TwelveData keys before go-live.
- Configure `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `NEXT_PUBLIC_SITE_URL`.
- Apply DB hardening SQL: `app/webinars/20260222_security_and_ops_hardening.sql`.

## 2) Monitoring baseline
- Track API error rates for:
  - `app/api/checkout/algo/route.ts`
  - `app/api/checkout/webinar/route.ts`
  - `app/api/webhooks/stripe/route.ts`
  - `app/api/webinars/[id]/register/route.ts`
- Alert when:
  - 5xx rate > 2% for 5 minutes.
  - Stripe webhook failures > 1 event in 5 minutes.
  - Admin mutation failures > 0 for 10 minutes.
- Keep structured logs for `admin_audit_logs`, checkout requests, and webhook event IDs.

## 3) Backup strategy
- Enable daily automated Supabase backups.
- Keep point-in-time recovery enabled.
- Export weekly CSV snapshots for:
  - `payments`
  - `algo_licenses`
  - `webinar_registrations`
  - `blog_posts`
  - `webinars`
- Test restore monthly in staging from a backup snapshot.

## 4) Security checklist
- Ensure every admin user has an explicit `profiles.role = 'admin'`.
- Remove all admin role assignment by email fallback (done in code).
- Enforce RLS policies on admin-sensitive tables.
- Review `admin_audit_logs` weekly for suspicious mutations.

## 5) Deployment verification
- Run `npm run verify`.
- Validate paid webinar flow end-to-end:
  1. Create paid webinar from admin.
  2. Start checkout from webinar detail.
  3. Confirm webhook inserts `payments` and `webinar_registrations`.
- Validate algo purchase flow end-to-end:
  1. Start checkout from algo detail.
  2. Confirm webhook inserts `payments` and `algo_licenses`.

