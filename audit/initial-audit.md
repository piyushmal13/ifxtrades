## Initial Web Audit – IFXTrades

Date: 2026-02-23  
Scope: Next.js app in `app/` (marketing, webinars, algos, dashboard, admin, API routes). No live environment or browser runtime was available during this pass; findings are based on static code/config review.

---

## Summary by Severity

- **Critical**
  - _None identified in this fast static pass._ Several items below warrant follow‑up but do not appear immediately exploitable without additional context (live environment, infra, or DB contents).

- **High**
  - **Broken primary navigation links**
    - **Issue**: `Navbar` links reference routes that do not exist:
      - `/products`, `/about`, `/test-strategy`, `/blogs` in `app/navbar.tsx` have no corresponding `app/**/page.tsx` implementations, so they will 404.
    - **Impact**: Users are pushed into 404s from the top nav; hurts trust, UX, and SEO crawl paths.
    - **Recommendation**: Either (a) create matching routes and content for these paths, or (b) remove/rename the links to match existing routes (`/algos`, `/blog`, etc.).
    - **Evidence**: `navLinks` in `Navbar` vs. existing routes from `app/`.

  - **Public-facing external links missing `rel="noopener noreferrer"`**
    - **Issue**: Several `Link` components use `target="_blank"` without `rel="noopener noreferrer"` in `app/webinars/[slug]/page.tsx` (Google Calendar, promo video URLs, speaker LinkedIn links, sponsor links).
    - **Impact**: Opens the door to `window.opener`–based tab‑nabbing if any linked external page is compromised.
    - **Recommendation**: For all external links with `target="_blank"`, add `rel="noopener noreferrer"` (or at least `rel="noopener"`). Consider centralizing an `ExternalLink` component.
    - **Evidence**: `<Link href={googleCalendarLink} target="_blank" ...>`, `<Link href={item.speakerLinkedin} target="_blank" ...>`, `<Link href={sponsor.linkUrl} target="_blank" ...>` without `rel`.

  - **Environment file committed inside the app tree**
    - **Issue**: `.env.local` is committed under a route group: `app/(public)/webinars/.env.local` containing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    - **Impact**: While Supabase anon keys are intended to be public in the browser, checking in an `.env.local` file and placing it inside `app/`:
      - Encourages a pattern where non‑public env vars might later be committed.
      - Increases risk of accidentally exposing secrets if this pattern is copied for admin/back‑office configs.
    - **Recommendation**:
      - Remove `.env.local` from the repo and add it to `.gitignore`.
      - Store shared non‑secret config in code (e.g. `lib/supabase.ts`) and keep per‑env secrets in untracked env files at project root.
      - Ensure no other env files are committed anywhere under `app/` or `lib/`.
    - **Evidence**: `app/(public)/webinars/.env.local`.

- **Medium**
  - **Runtime console noise and potential unhandled API failures**
    - **Issue**: `components/MarketSnapshot.tsx` fetches `/api/market` on an interval and logs errors via `console.error(err)` without any user‑visible fallback or retry backoff.
    - **Impact**:
      - Repeated failures (network, API, or rate limiting) will spam the browser console, cluttering diagnostics and possibly suggesting instability to power users.
      - No visible state change means users simply see a missing widget with no explanation.
    - **Recommendation**:
      - Replace `console.error` with structured logging gated by `NODE_ENV` (e.g. log only in development) and/or surface a “Market data unavailable” fallback in the UI.
      - Consider exponential backoff or stopping polling after repeated failures.
    - **Evidence**: `MarketSnapshot` `useEffect` with `console.error(err)` and hard‑coded 5‑minute interval.

  - **HTTPS coverage – local vs production**
    - **Issue**:
      - Local development is configured with `next dev` (`package.json`), which by default serves over HTTP on `localhost` (no HTTPS).
      - The SEO metadata uses `SITE_URL = "https://www.ifxtrades.com"` in `app/layout.tsx`, indicating the primary production domain runs on HTTPS.
    - **Impact**:
      - **Local**: No immediate security issue (trusted localhost), but any tests relying on secure cookies or strict `SameSite=None; Secure` behavior might not match production.
      - **Production**: Assuming `https://www.ifxtrades.com` is correctly configured with a valid TLS cert, HTTPS coverage in production is good.
    - **Recommendation**:
      - Keep production strictly on HTTPS and ensure HTTP→HTTPS redirection at the edge (load balancer/CDN).
      - If you need to test secure‑cookie behavior locally, consider a local TLS proxy or `next dev` behind a HTTPS‑terminating reverse proxy.
    - **Evidence**: `scripts.dev = "next dev"` in `package.json`, `SITE_URL = "https://www.ifxtrades.com"` in `app/layout.tsx`.

  - **External content/image URLs depend entirely on DB correctness**
    - **Issue**: Core visuals and sponsor logos are driven by URLs from Supabase tables (e.g. `webinar.heroImageUrl`, `item.speakerImageUrl`, `sponsor.logoUrl`), rendered via plain `<img>` tags.
    - **Impact**:
      - Any malformed or dead URLs in the DB will manifest as broken images in production.
      - Because there is no image fallback or error boundary, the page will show broken icons that hurt perceived quality.
    - **Recommendation**:
      - Add safe fallbacks (e.g. placeholder image or initials) for webinar/sponsor images when the URL fails to load.
      - Optionally switch to `next/image` for better optimization and error handling.
    - **Evidence**: `app/webinars/[slug]/page.tsx` usage of `heroImageUrl`, `speakerImageUrl`, and `sponsor.logoUrl`.

- **Low**
  - **Missing routes for linked sections in other components**
    - **Issue**:
      - The homepage (`app/page.tsx`) and footer link to `/reviews`, `/university`, `/algos`, `/blog`, etc. Those routes do exist, but the navbar inconsistently links to `/blogs` (plural) instead of `/blog` in one place, which is inconsistent and likely a typo.
    - **Impact**: Minor UX/SEO inconsistency; users may discover different content paths via navbar vs. footer.
    - **Recommendation**: Normalize slugs (`/blog` vs `/blogs`) and centralize the navigation model so the same set of routes is reused in navbar and footer.
    - **Evidence**: `Navbar` vs. `HomePage` footer and `app/blog/page.tsx`.

  - **Static JSON‑LD via `dangerouslySetInnerHTML`**
    - **Issue**: Multiple pages inject JSON‑LD using `dangerouslySetInnerHTML` (`app/layout.tsx`, `app/webinars/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`, etc.).
    - **Impact**: Low risk because values appear to be generated server‑side from controlled data and passed through `JSON.stringify`, but the pattern deserves a note.
    - **Recommendation**: Keep JSON‑LD generation server‑side using typed helpers (as already done in `lib/seo`) and ensure no untrusted raw HTML is ever passed into `dangerouslySetInnerHTML` without sanitization.
    - **Evidence**: `organizationJsonLd`, `websiteJsonLd`, `eventJsonLd` usage.

  - **Minor logging/debug ergonomics**
    - **Issue**: There is at least one direct `console.error` in production code and minimal structured logging.
    - **Impact**: Makes production debugging noisy and less structured when issues occur.
    - **Recommendation**: Introduce a small logging helper that no‑ops in production or funnels logs to a central service; replace raw `console.*` usage in shipped components.

---

## Checklist Items from Request

### HTTPS (Local & Preview/Production)

- **Local dev (`npm run dev`)**:
  - Serves over HTTP on `http://localhost:3000` by default.
  - **Status**: **Not HTTPS**. Acceptable for local development, but not representative of production cookie/security behavior.
- **Primary production/preview URL**:
  - `SITE_URL` is set to `https://www.ifxtrades.com` in root layout metadata, implying HTTPS in production.
  - No explicit preview URL (e.g. Vercel) is referenced in the codebase.
  - **Status**: **Configured for HTTPS** at the application level; actual certificate/redirect behavior must be confirmed in hosting/infra (outside this repo).

### Broken Links, Missing Images, Console Errors

Based on static inspection of the codebase (without live runtime):

- **Broken / mismatched links**
  - High: `Navbar` routes to `/products`, `/about`, `/test-strategy`, `/blogs` with no corresponding `app/**/page.tsx` implementations.
  - Low: Inconsistent use of `/blog` vs `/blogs` across navigation/footer components.

- **Missing / fragile images**
  - Dependent on DB values:
    - Webinar hero images, speaker avatars, and sponsor logos rely entirely on URLs from Supabase (`webinar.heroImageUrl`, `item.speakerImageUrl`, `sponsor.logoUrl`).
    - There is limited defensive UI for broken images. Home/marketing surfaces do not appear to reference non‑existent local assets.

- **Console errors**
  - `MarketSnapshot` will emit `console.error(err)` for any `/api/market` failure.
  - Other components generally avoid console usage. No obvious large‑scale `console.log` debug code is present.

### Lighthouse (Chrome DevTools)

- **Status**: **Not run in this automated pass**.
  - The current environment does not provide direct access to Chrome DevTools Lighthouse against a running instance.
  - **Action item** (manual):
    - Run Lighthouse in Chrome DevTools against:
      - `https://www.ifxtrades.com/` (production).
      - Key flows: `/webinars`, `/algos`, `/login`, `/dashboard`.
    - Export reports (JSON/HTML) and attach them under `audit/lighthouse/` for future comparison.
  - **Likely focus areas based on code**:
    - Performance: repeated polling in `MarketSnapshot`, non‑optimized `<img>` usage for hero/sponsor images, potential layout shift from dynamically fetched content.
    - SEO: structured data and metadata are set up well (`lib/seo`), but broken nav links and any 404s will harm crawl quality.
    - Accessibility: the design uses semantic headings and text; a11y issues (color contrast, focus outlines, etc.) must be verified in the running UI.

### OWASP Top 10 – Quick Static Checklist

This is a **static code‑level quick scan**; it does **not** replace a full penetration test, dependency audit, or infra review.

- **A01: Broken Access Control**
  - **Observation**: Admin API routes (e.g. `app/api/admin/*`) consistently call `requireAdminApi` and use role checks; dashboard pages call `requireUser`/`requireAdmin`.
  - **Risk**: Medium – no obvious direct access control bypass in code, but:
    - No rate limiting or IP throttling is visible for login, registration, or admin APIs.
    - Authorization is tightly coupled to Supabase roles; misconfigured roles or JWT policies at the DB level could still cause issues.
  - **Action**:
    - Add rate limiting (e.g. edge middleware) around auth and high‑sensitivity admin endpoints.
    - Review Supabase RLS policies and roles for the relevant tables (`webinars`, `algo_licenses`, `payments`, etc.).

- **A02: Cryptographic Failures**
  - **Observation**: TLS termination and HSTS are handled outside this repo. Stripe webhook secrets and Supabase service keys are expected to come from env vars (not visible here).
  - **Risk**: Medium – depends entirely on deployment configuration.
  - **Action**:
    - Enforce HTTPS with HSTS in production.
    - Ensure all secrets (Stripe keys, Supabase service keys, webhook secrets) are **not** committed and live only in secure env config.

- **A03: Injection**
  - **Observation**:
    - Database access is done through Supabase client libraries using parameterized queries.
    - Input to admin APIs is validated via Zod schemas in `lib/validation/admin`.
    - JSON‑LD uses `JSON.stringify` and appears to be built from controlled values.
  - **Risk**: Low from a code‑injection standpoint; untrusted external URLs (sponsor links, promo URLs) are still rendered, which is more of an open‑redirect/tab‑nabbing concern than classic injection.
  - **Action**:
    - Continue validating all request bodies with schemas.
    - Consider whitelisting or at least validating URL format for sponsor/promo/LinkedIn links.

- **A04: Insecure Design**
  - **Observation**:
    - Webinar registration endpoint enforces payment, seat capacity, and deadlines at the server level.
    - Stripe webhook handler verifies signatures and validates payload shape.
  - **Risk**: Medium – no systemic flaws visible, but there is no explicit rate limiting or anomaly detection.
  - **Action**:
    - Document business invariants (e.g. seat capacity rules) and add monitoring around them.

- **A05: Security Misconfiguration**
  - **Observation**:
    - `.env.local` is committed inside the app tree.
    - No CORS customizations are present (Next.js defaults).
  - **Risk**: High for configuration drift if this pattern spreads; current anon key itself is intended to be public but the practice is unsafe.
  - **Action**:
    - Remove committed env files, rely on deployment secrets, and lock down CORS/headers at the edge as appropriate.

- **A06: Vulnerable and Outdated Components**
  - **Observation**:
    - Core stack: Next 16, React 18, Tailwind 3, Supabase JS 2.x, Zod 3.x.
    - No automated dependency scan results are present in the repo.
  - **Risk**: Unknown – must be assessed via `npm audit` or a SCA tool.
  - **Action**:
    - Run `npm audit` and/or integrate Dependabot/Snyk/GitHub Advanced Security.

- **A07: Identification and Authentication Failures**
  - **Observation**:
    - Auth is centralized through Supabase (`lib/auth`, `lib/auth-provider`).
    - Protected pages and admin APIs rely on `requireUser` / `requireAdminApi`.
  - **Risk**: Medium – depends on Supabase configuration, JWT expiry, and refresh handling not visible here.
  - **Action**:
    - Verify session expiry, refresh, and revocation behavior in Supabase.
    - Confirm MFA and strong password policies at the identity provider.

- **A08: Software and Data Integrity Failures**
  - **Observation**:
    - Stripe webhooks verify signatures.
    - No dynamic plugin loading or unsigned remote code execution patterns are evident.
  - **Risk**: Low in application code; CI/CD and infra remain out of scope here.

- **A09: Security Logging and Monitoring Failures**
  - **Observation**:
    - Admin mutations call `logAdminAction`, which is a good audit trail for admin changes.
    - Frontend logging is minimal and mostly unsanitized `console.error`.
  - **Risk**: Medium – admin activity is somewhat tracked, but there is no clear story for security event logging or alerting.
  - **Action**:
    - Ensure `logAdminAction` writes to a durable store with retention.
    - Add server‑side logging for auth failures, payment anomalies, and repeated 4xx/5xx responses from critical endpoints.

- **A10: Server-Side Request Forgery (SSRF)**
  - **Observation**:
    - No obvious server‑side HTTP clients are used against arbitrary user‑supplied URLs.
  - **Risk**: Low from the code examined.

---

## Next Steps (Suggested)

- **Fix high‑impact UX/security items first**:
  - Correct or remove broken navbar links.
  - Add `rel="noopener noreferrer"` to all `target="_blank"` links.
  - Remove `.env.local` from the repo and harden env/secret handling.
- **Then address medium/low issues**:
  - Improve error handling and fallbacks for `/api/market` and image loads.
  - Normalize navigation slugs and improve logging practices.
- **Follow up with live testing**:
  - Run Lighthouse and an authenticated OWASP‑aligned scan against staging/production.
  - Validate that HTTPS, HSTS, and cookie settings match your security posture goals.

