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
- Keep `admin_audit_logs` deployed with the hardening SQL and review it weekly for suspicious mutations.
- Configure at least one bootstrap mechanism for admin recovery:
  - `IFX_ADMIN_BOOTSTRAP_TOKEN` for one-time secure elevation via `/admin-access`.
  - or `IFX_ADMIN_BOOTSTRAP_EMAILS` (comma-separated) for explicit trusted emails.
- Enable MFA and strong password policies for all admin identities in Supabase Auth or the upstream identity provider.
- Keep production traffic strictly on HTTPS with HSTS enabled at the edge and ensure Supabase connections use `https://` URLs and TLS.

## 6) Admin data pipeline and bulk operations

- Canonical content tables:
  - Webinars and metadata: `webinars`, `webinar_agenda_items`, `webinar_faqs`, `webinar_sponsors`.
  - Courses and lessons: `university_courses`, `course_lessons`.
  - Algorithms and performance: `algorithms`, `algo_performance_snapshots`.
  - Marketing content: `blog_posts`, `reviews`.
- Admin UI routes under `/admin/**` are the only supported surface for manual create/update/delete of these entities.
- All admin mutations go through `/api/admin/**` routes, which:
  - Enforce `requireAdminApi` role checks.
  - Validate payloads with Zod schemas in `lib/validation/admin.ts`.
  - Log to `admin_audit_logs` via `logAdminAction` so changes are traceable.
- For bulk ingestion and synchronization:
  - Use Supabase imports (CSV/SQL) to load large datasets into the tables above.
  - Keep schemas aligned with the application by reusing the migrations in `app/webinars/*.sql` and `migrations/*.sql`.
  - After bulk loads, spot-check via the corresponding admin screens and public pages (`/webinars`, `/university`, `/algos`, `/reviews`).

## 5) Deployment verification
- Run `npm run verify`.
- Validate paid webinar flow end-to-end:
  1. Create paid webinar from admin.
  2. Start checkout from webinar detail.
  3. Confirm webhook inserts `payments` and `webinar_registrations`.
- Validate algo purchase flow end-to-end:
  1. Start checkout from algo detail.
  2. Confirm webhook inserts `payments` and `algo_licenses`.
