# Implementation Plan: Eye Gym Web App

**Branch**: `001-eye-gym-web-app` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-eye-gym-web-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Telegram Web App that helps users reduce digital eye strain through guided eye exercises. The app provides instant access to 10+ free exercises and 3-5 premium exercises unlockable via donation codes. Key features include step-by-step exercise guidance with optional voice instructions, opt-in daily reminders via @EyeGymBot, automatic language detection (EN/RU/RO), and zero-dependency vanilla JavaScript implementation. The technical approach prioritizes bundle size (≤120 KB gzipped), client-side-only data storage (localStorage), and strict privacy (no telemetry/analytics). All UI uses the Telegram WebApp SDK for native theming and navigation, with premium unlocks via external donation links and user-entered codes.

## Technical Context

**Language/Version**: Vanilla JavaScript ES6 modules (no transpilation required), targeting modern mobile browsers (Chrome 90+, Safari 14+, Telegram WebView)  
**Primary Dependencies**: Telegram WebApp SDK v7+ (loaded from https://telegram.org/js/telegram-web-app.js — only external script allowed)  
**Storage**: Client-side localStorage only (no backend, no database, no cookies, no IndexedDB)  
**Testing**: Manual testing in Telegram WebView + local Python HTTP server (`python -m http.server 8000`) for development; no automated test framework required for MVP  
**Target Platform**: Telegram WebView (iOS 12+, Android 5+) accessed via @EyeGymBot
**Project Type**: Web application (static files only, no build step, no backend)  
**Performance Goals**: 
  - Load time: ≤3 seconds on 3G connection
  - Exercise session start: ≤5 seconds from app launch
  - Bundle size: ≤120 KB gzipped (total JS + CSS + HTML)
  - Audio files: ≤8 KB per exercise (WebM/MP3)
**Constraints**: 
  - Zero external runtime dependencies (no npm packages, no frameworks)
  - No backend server (all logic client-side)
  - No build tools (files served as-is, no Webpack/Vite/etc.)
  - Offline-capable after first load (all assets inline or bundled)
  - CSP-compliant: `default-src 'self'; script-src 'self' https://telegram.org; style-src 'self' 'unsafe-inline'`
**Scale/Scope**: 
  - ~15 exercises total (10 free + 5 premium)
  - 3 languages (EN/RU/RO) with ~100 UI strings each
  - Single-page app: index.html + modules (~10 JS files)
  - Expected user base: 1k–10k MAU (no backend to scale)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

This project follows the Eye Gym constitution. Before Phase 0 research may proceed,
the following checks MUST be performed and documented in the plan:

- Telegram-Native UX: confirm design relies on Telegram WebApp SDK and no custom chrome.
- Privacy by Design: confirm no telemetry, analytics, or third-party scripts are required.
- Multilingual Compliance: confirm support plan for English, Russian, Romanian, and
  that strings will be externalized.
- Monetization Boundaries: confirm any premium flow uses external links (`openLink()`)
  and premium codes are entered by the user.
- Reliability & Simplicity: confirm intended bundle strategy can meet ≤120 KB gzipped and
  that no external runtime dependencies are required.
- User Autonomy: confirm opt-in design for reminders and other opt-in features with
  clear user-facing explanations.
- Transparency: confirm a Privacy Policy link will be provided in the Web App footer.

Document results under "Constitution Check" in the plan with pass/fail and any waivers.

### Constitution Check Results (Pre-Phase 0)

- ✅ **Telegram-Native UX**: Design uses Telegram WebApp SDK v7+ for theming (`setBackgroundColor()`, `setHeaderColor()`), alerts (`showAlert()`, `showConfirm()`), and navigation (`openLink()`). No custom navigation bars or persistent chrome.
- ✅ **Privacy by Design**: No telemetry, analytics, or third-party scripts except Telegram SDK (required). All user data stored in `localStorage`; no external servers. CSP enforces script-src restrictions.
- ✅ **Multilingual Compliance**: Three languages supported (EN/RU/RO). Strings externalized in `locales/*.json`, loaded inline in index.html. Auto-detection via `WebApp.initDataUnsafe.user.language_code` with English fallback.
- ✅ **Monetization Boundaries**: Premium unlocks via user-entered codes only. Donation flow uses `openLink()` to external URLs (Boosty/GitHub Sponsors). No in-app payments or Telegram Payments API.
- ✅ **Reliability & Simplicity**: Vanilla JS (no frameworks), zero npm dependencies, no build step. Target bundle: ≤120 KB gzipped. All assets inline (SVG) or base64 (audio ≤8 KB per file).
- ✅ **User Autonomy**: Reminders opt-in via Settings toggle. Clear messaging: "Reminders are sent by @EyeGymBot — you can disable anytime." Premium is optional; free exercises fully functional.
- ✅ **Transparency**: Privacy Policy accessible via footer link (`privacy.html`). Statement: "Eye Gym Web App stores your progress and settings only on this device. We do not track, log, or share your activity."

**Gate Status**: ✅ PASSED — All constitution principles satisfied. No waivers required.

---

### Constitution Check Results (Post-Phase 1 Design)

**Re-evaluation after research, data modeling, and contract design:**

- ✅ **Telegram-Native UX**: Confirmed in `research.md` and `quickstart.md`. All SDK methods documented in `contracts/telegram-bot-api.md`. No custom chrome or navigation.
- ✅ **Privacy by Design**: Confirmed in `data-model.md` (localStorage only) and CSP configuration in `research.md`. Zero external data transmission except bot communication via `sendData()`.
- ✅ **Multilingual Compliance**: Confirmed in `data-model.md` (localized Exercise entities with EN/RU/RO keys) and locale loading strategy in `research.md` (inline JSON in index.html).
- ✅ **Monetization Boundaries**: Confirmed in `contracts/telegram-bot-api.md` (premium unlock via user-entered codes, external payment via `openLink()`). No in-app payments.
- ✅ **Reliability & Simplicity**: Confirmed in `research.md` (vanilla JS, zero build step, ≤120 KB bundle validated in bundle size breakdown). All dependencies eliminated except Telegram SDK.
- ✅ **User Autonomy**: Confirmed in `contracts/telegram-bot-api.md` (reminders opt-in with clear messaging) and `data-model.md` (UserPreferences stores explicit opt-in flags).
- ✅ **Transparency**: Confirmed in `quickstart.md` (privacy.html accessible via footer link) and `data-model.md` (no PII stored in localStorage).

**Final Gate Status**: ✅ PASSED — Design phase complete. All artifacts align with constitution. Ready for Phase 2 (task generation via `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/001-eye-gym-web-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── telegram-bot-api.md  # WebApp.sendData() payload schemas
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

This is a static web application with no backend. All files served as-is (no build step).

```text
index.html               # Single-page app entry point, includes inline locale JSON
privacy.html             # Static privacy policy page

js/
├── app.js               # App initialization, SDK setup, routing
├── i18n.js              # Locale loader and string resolver
├── storage.js           # localStorage wrapper (preferences, premium status)
├── exercises.js         # Exercise list renderer, filter (free/premium)
├── session.js           # Exercise session controller (steps, timer, audio)
├── settings.js          # Settings screen logic (reminders, voice, premium code)
└── telegram.js          # WebApp SDK wrapper (sendData, openLink, theme)

css/
├── main.css             # Base styles, Telegram theme variables
├── exercises.css        # Exercise list and card styles
└── session.css          # Full-screen session view styles

locales/
├── en.json              # English UI strings (embedded inline in index.html)
├── ru.json              # Russian UI strings (embedded inline in index.html)
└── ro.json              # Romanian UI strings (embedded inline in index.html)

exercises/
├── free.json            # 10+ free exercises (id, title, duration, steps, audio flag)
└── premium.json         # 3-5 premium exercises (same schema)

audio/
├── step-001.webm        # Audio guidance for exercise steps (≤8 KB each)
├── step-002.webm
└── ...

assets/
└── icons/               # Inline SVG icons (no external images)

.specify/                # Project governance (already exists)
specs/                   # Feature specs and plans (already exists)
```

**Structure Decision**: Selected static web application structure. No backend, no tests directory (manual QA in Telegram WebView). All assets self-contained and served from repository root. Deployment target: GitHub Pages or similar static host.

## Complexity Tracking

No violations of constitution principles. Complexity is intentionally minimal:
- Zero backend infrastructure (client-side only)
- Zero build tooling (files served as-is)
- Zero third-party dependencies (except required Telegram SDK)
- Single-page app with ~10 JS modules, ~1500 lines total estimated

This simplicity aligns with the "Reliability & Simplicity" principle and ensures the ≤120 KB bundle target is achievable.

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
