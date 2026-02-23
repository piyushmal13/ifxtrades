# Overlay Smoke Tests

Minimal automated harness for activation/deactivation of `feature/ui_overlay_v1`.

## Run

From repo root:

```powershell
node --test ui-overlay/tests/smoke-overlay.test.cjs
```

## What it validates

1. Overlay remains inactive when `feature/ui_overlay_v1` is false.
2. Overlay activates and marks root/body when `feature/ui_overlay_v1` is true.

The harness uses Node built-ins (`node:test`, `vm`) with a lightweight DOM stub, so no extra dependencies are required.

