# 7-Day Rollout Plan (`feature/ui_overlay_v1`)

## Day 1

- Finalize design tokens, typography, and dark/light color parity.
- Approve hero, CTA, button family, and type hierarchy.
- Rollout: `0%` external traffic (internal QA only).

## Day 2

- Complete button/form/component overlay styles.
- Build Storybook previews and capture visual references.
- Rollout: `0%`.

## Day 3

- Ship motion system and `overlay.js` microinteractions.
- Run keyboard/ARIA checks on auth modal and forms.
- Rollout: `0%`.

## Day 4

- Final polish for cards, data surfaces, and table states.
- Cross-browser visual QA (Chrome/Edge/Safari/Firefox latest).
- Rollout: `0%`.

## Day 5

- Performance tuning and package freeze.
- Validate gzip budgets and Lighthouse baseline deltas.
- Create PR from `feat/ui-overlay`.
- Rollout: `0%`.

## Day 6

- Staged production rollout.
  - Wave 1: `5%` for first 4 hours.
  - Wave 2: `25%` if no regressions.
- Monitor performance, error rates, conversion.

## Day 7

- Final rollout.
  - Wave 3: `50%` for 2-4 hours.
  - Wave 4: `100%` if metrics remain green.
- Publish post-rollout report and close feature flag task.

