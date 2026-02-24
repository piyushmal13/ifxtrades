# Font Assets

Place licensed font files here before production rollout:

- `InterVariable.woff2` (or approved Inter variable family file)
- `TiemposHeadline-Regular.woff2` (or approved GT Sectra/Tiempos equivalent)

The overlay uses `font-display: swap` and includes fallback stacks, so it remains functional without these files.

For legal/compliance:

1. Verify enterprise webfont licensing permits CDN distribution.
2. Prefer self-hosting under controlled IFX CDN domain.
3. Set long-lived cache headers with immutable versioned paths.

