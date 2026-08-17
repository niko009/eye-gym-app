# Implementation status

Last reviewed: 2026-08-16.

## Completed

- Shared responsive React client for browser, installable PWA and Telegram Mini App.
- Six Android-compatible complexes, sixteen exercises, frozen random session plans, rest phases, pause/back/skip/exit and completed-only history.
- Complete RU/RO/EN UI and workout content, light/dark/system themes, reduced-motion handling and locally bundled Nunito.
- IndexedDB offline history, statistics, streaks, calendar, charts and retry-safe workout synchronization.
- Independent Google and Telegram identities. Telegram authentication validates the original signed `initData` and age on the server; identities are never matched by email or profile data.
- Server settings synchronization with first-login guest migration and initialized-account protection against default-value overwrite.
- Secure opaque cookie sessions, same-origin mutation checks, authentication rate limiting and redacted auth payload logging.
- Multiple daily reminders, IANA time zones, VAPID Web Push, Telegram bot delivery and native Telegram write-access consent.
- Persistent 20–20–20 screen-break timer with configurable cadence, background-safe absolute deadlines, full-screen distance prompts, snooze, notifications and a daily break count.
- Child-friendly RU/RO/EN learning section with original illustrations explaining basic eye anatomy, screen-related discomfort and calm screen breaks, linked to NEI and AAO-reviewed sources.
- PWA app shell, update prompt, custom install guidance including iOS Safari, offline browser validation and production PNG/SVG icons.
- Versioned neural RU/RO/EN audio packs for all sixteen exercises plus rest/completion cues, automatic selected-language download, optional pack controls and generated-duration validation.
- Opt-in GA4, independent consent per profile, multilingual privacy policy and medical disclaimer.
- Docker Compose services, healthchecks, migrations, daily backups, restore instructions, CI tests/builds and image rollback on failed deployment.

## Automated verification

- Frontend: TypeScript, production Vite/PWA build and 26 Vitest tests.
- Backend: TypeScript build and 8 Vitest tests.
- Browser: mobile/desktop UI walkthrough plus successful reload with the browser network disabled after Service Worker installation.
- Infrastructure: `docker compose config --quiet` and zero known npm audit vulnerabilities in frontend and backend dependency trees.

## External acceptance inputs still required

- Google OAuth credentials, Telegram bot token and username, BotFather Mini App/menu configuration and GA4 Measurement ID.
- A production-like Linux run of migrations, API/database integration, backup restore and real Web Push/Telegram delivery. The current Windows machine validates Compose syntax, but its Docker engine was unavailable for the runtime drill.

Do not mark v1 accepted until every external item above has been supplied and the corresponding checks in `docs/OPERATIONS.md` pass.
