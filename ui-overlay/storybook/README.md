# Storybook Artifacts

This directory provides component preview stories for the overlay package.

## Included Stories

- `Buttons.stories.ts`
- `Forms.stories.ts`
- `Surfaces.stories.ts`

## Optional Local Run

From repo root (without modifying app code):

```powershell
npx storybook@latest dev -p 6006 -c ui-overlay/storybook/.storybook
```

If your environment needs explicit dependencies:

```powershell
npm i -D storybook @storybook/html-vite @storybook/addon-essentials @storybook/addon-a11y
```

## Static Preview

Use `../storybook-export/index.html` for a zero-dependency preview snapshot.

