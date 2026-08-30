# Bacus Network integration

Status: pilot implementation
Created: 2026-08-30

Eye Gym participates in the Bacus Network ecosystem defined centrally in `niko009/bacus.dev/docs/features/BACUS_NETWORK.md`.

## Pilot behavior

- Source product: `eye-gym`.
- Persistent maker link: `https://bacus.dev/`.
- Primary sibling recommendation: Motion Play (`https://motion-play.bacus.dev/`).
- Placement: compact non-blocking card below the main app content; hidden during an active workout.
- Existing Eye Gym analytics must be reused for `bacus_promo_impression`, `bacus_promo_click`, and `bacus_home_click` and therefore remains subject to the app's analytics-consent behavior.
- The integration must not affect workout flow, PWA behavior, offline storage, authentication, Telegram mode, or medical notices.
- Desktop/mobile and keyboard accessibility are required.

Update this file whenever the Bacus Network placement, target, or behavior changes.