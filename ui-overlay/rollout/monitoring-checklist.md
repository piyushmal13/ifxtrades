# Monitoring Checklist

## Visual QA

- Pixel pass on top funnels (home, login/signup, dashboard, webinars, algos).
- Browser matrix: Chrome, Edge, Safari, Firefox (latest stable).
- Mobile matrix: iOS Safari, Android Chrome.

## Performance Targets

- Lighthouse Performance >= 85.
- Lighthouse Accessibility >= 95.
- Performance drop versus baseline <= 5 points.
- FCP delta <= +150ms.
- LCP delta <= +200ms.
- CLS unchanged or improved.

## UX Metrics

- Primary CTA click-through rate.
- Signup conversion rate.
- Hero bounce rate.
- Form completion/validation error rate.

## Accessibility Validation

- Automated `axe` pass on key pages.
- Keyboard-only flow validation:
  - Modal open/close/focus trap.
  - Form labels and error messaging.
  - Table sortable headers focus states.
- Manual screen reader spot-check:
  - NVDA/JAWS (Windows), VoiceOver (macOS/iOS).

## Operational Health

- JS error rate (window/global handlers).
- Resource load failures for overlay assets (CDN 4xx/5xx).
- Rollback trigger if any critical checkout/auth regression is detected.

