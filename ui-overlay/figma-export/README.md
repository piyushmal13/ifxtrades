# Figma Export Notes

This folder documents frame naming and export mapping for the UI overlay handoff.

## Frame Naming Convention

- `IFX Overlay / Desktop / Hero + CTA`
- `IFX Overlay / Desktop / Dashboard Cards + Table`
- `IFX Overlay / Tablet / Forms + Modal`
- `IFX Overlay / Mobile / Landing + Toast`
- `IFX Overlay / Token Sheet / Light + Dark`

## Export Requirements

1. Desktop/tablet/mobile frame PNG exports at `2x`.
2. SVG exports for iconography and motif shapes.
3. Typography references:
   - UI: Inter Variable
   - Display: Tiempos or GT Sectra equivalent
4. Include token references in layer descriptions:
   - e.g. `--ifx-color-accent`, `--ifx-radius-md`, `--ifx-motion-fast`

## Handoff Checklist

1. Verify text contrast against background meets WCAG AA.
2. Verify button states shown for default/hover/active/disabled/focus.
3. Include modal open/close states with focus order callouts.
4. Include table sorting affordance states (`none`, `ascending`, `descending`).

