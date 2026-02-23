# IFXTrades UI Overlay v1

Non-destructive front-end upgrade package for IFXTrades with premium visual system, motion polish, and accessibility improvements.

- Branch: `feat/ui-overlay`
- Feature flag: `feature/ui_overlay_v1`
- Scope rule: no backend logic changes, no required edits to core app files

## Package Overview

This package is designed as an attachable overlay layer:

1. `tokens.json` and `tokens.css` define design tokens.
2. `overlay.css` applies scoped UI overrides under `.ifx-ui-overlay`.
3. `overlay.js` enables optional microinteractions and accessibility helpers.
4. `storybook/` provides preview stories.
5. `figma-export/` documents frame names, breakpoints, and export intent.
6. `deploy/` provides CDN/reverse-proxy injection snippets.
7. `rollout/` provides a 7-day rollout and monitoring checklist.
8. `tests/` provides minimal automated smoke checks.

## File Tree

See `ZIP_STRUCTURE.txt`.

## Feature Flag Contract

Overlay only activates when `feature/ui_overlay_v1` resolves to `true`.

Supported flag inputs (first match wins):

1. Query parameter: `?feature_ui_overlay_v1=1|true|on`
2. Global object: `window.__IFX_FEATURE_FLAGS__["feature/ui_overlay_v1"] = true`
3. Dataset attribute: `data-feature-ui-overlay-v1="true"` on `<html>` or `<body>`
4. Local storage key: `ifx.flag.feature/ui_overlay_v1`

## Install (CDN Injection)

1. Upload `tokens.css`, `overlay.css`, `overlay.js`, and `assets/` to CDN path, for example:
   - `https://cdn.ifxtrades.com/ui-overlay/v1/tokens.css`
   - `https://cdn.ifxtrades.com/ui-overlay/v1/overlay.css`
   - `https://cdn.ifxtrades.com/ui-overlay/v1/overlay.js`
2. Inject the snippet from `deploy/cdn-injection.html` into `<head>`.
3. Ensure runtime flag resolver sets `feature/ui_overlay_v1`.

The CDN template includes inline critical CSS (`#ifx-overlay-critical`) to reduce above-the-fold flash before full overlay styles load.

## Install (Reverse Proxy Include)

1. Use `deploy/nginx-snippet.conf` as template.
2. Gate injection by cookie/header/edge flag evaluation.
3. Inject links/scripts right before `</head>`.

Tailored host mapping in supplied snippets:

1. Production: `www.ifxtrades.com`, `ifxtrades.com`
2. Staging/Preview: `ifxtrades-shp4.vercel.app`, `*-ifxtrades-shp4.vercel.app`

## Rollback

1. Set `feature/ui_overlay_v1` to `false` globally.
2. Purge CDN/proxy cache for HTML.
3. Remove/disable injected `<link>` and `<script>` tags.
4. Validate no `.ifx-ui-overlay` class is present on `<html>` or `<body>`.

Rollback is immediate and requires no source rollback if your injection is externalized.

## Accessibility Notes

- WCAG 2.1 AA color contrast tokens included.
- Keyboard-visible focus ring (`2px`) with high contrast.
- Modal helper includes focus trap and Escape close.
- Form helper wiring supports `aria-describedby` and validation states.

## Performance Budgets

- CSS target: `< 50 KB` gzipped (`tokens.css + overlay.css`)
- JS target: `< 30 KB` gzipped (`overlay.js`)
- Lighthouse target: Performance >= 85, Accessibility >= 95
- Overlay should not reduce Lighthouse Performance by more than 5 points

Use `scripts/check-size.ps1` for quick gzip checks.

## Storybook

See `storybook/README.md` for local run instructions and story list.

## Smoke Tests

Run:

```powershell
node --test ui-overlay/tests/smoke-overlay.test.cjs
```

Coverage:

1. `feature/ui_overlay_v1 = false` => overlay does not attach.
2. `feature/ui_overlay_v1 = true` => overlay attaches `.ifx-ui-overlay` on root/body.

## Packaging

From repo root:

```powershell
Compress-Archive -Path ui-overlay\* -DestinationPath ui-overlay-v1.zip -Force
```

## Test IDs

Overlay emits stable hooks for automation:

- `data-testid="ifx-overlay-toast"`
- `data-testid="ifx-overlay-modal"`
- `data-testid="ifx-overlay-hero"`
