# Tasks: Eye Gym Web App

**Input**: Design documents from `/specs/001-eye-gym-web-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are NOT required for this MVP (manual QA in Telegram WebView per quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Static web app**: All files at repository root (no src/ directory)
- **JS modules**: `js/*.js`
- **CSS**: `css/*.css`
- **Locales**: `locales/*.json` (embedded inline in index.html)
- **Exercises**: `exercises/free.json`, `exercises/premium.json`
- **Audio**: `audio/*.webm`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project directory structure (index.html, js/, css/, locales/, exercises/, audio/, assets/icons/)
- [X] T002 Create `index.html` with basic HTML5 boilerplate, CSP meta tag, and Telegram SDK script tag
- [X] T003 [P] Create `privacy.html` with static privacy policy text per FR-017
- [X] T004 [P] Create `locales/en.json` with placeholder UI strings structure (~100 keys)
- [X] T005 [P] Create `locales/ru.json` with placeholder UI strings structure (~100 keys)
- [X] T006 [P] Create `locales/ro.json` with placeholder UI strings structure (~100 keys)
- [X] T007 [P] Create `.gitignore` to exclude development artifacts (if any)
- [X] T008 [P] Create `README.md` with project overview and link to quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Create `js/telegram.js` with Telegram WebApp SDK wrapper (ready(), expand(), theme methods, mock for desktop testing)
- [X] T010 [P] Create `js/storage.js` with localStorage wrapper (get/set for UserPreferences schema from data-model.md)
- [X] T011 [P] Create `js/i18n.js` with locale loader (parse inline JSON from index.html, detect language from WebApp.initDataUnsafe)
- [X] T012 Create `js/app.js` with app initialization (call WebApp.ready(), expand(), load locale, setup routing)
- [X] T013 Embed `locales/en.json`, `locales/ru.json`, `locales/ro.json` as inline `<script type="application/json">` in index.html
- [X] T014 [P] Create `css/main.css` with base styles, CSS variables for Telegram theme colors, reset styles
- [X] T015 Test foundation locally via `python -m http.server 8000` per quickstart.md (verify SDK mock, locale detection, localStorage)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Instant Exercise Access (Priority: P1) 🎯 MVP

**Goal**: Display exercise list within 5 seconds of app launch, distinguish free vs premium, enable launching exercise sessions

**Independent Test**: Open Web App from Telegram, verify exercise list loads ≤5 seconds with ≥10 free exercises visible, tap free exercise to launch session

### Implementation for User Story 1

- [X] T016 [P] [US1] Create `exercises/free.json` with 10 free exercises (schema per data-model.md: id, title.en/ru/ro, duration_sec, difficulty, steps, is_premium=false)
- [X] T017 [P] [US1] Create `exercises/premium.json` with 5 premium exercises (schema per data-model.md: is_premium=true, lock icon flag)
- [X] T018 [US1] Create `js/exercises.js` with exercise list loader (fetch free.json, filter premium if not unlocked, render cards)
- [X] T019 [US1] Create `css/exercises.css` with exercise card styles (title, duration, difficulty badge, premium lock icon)
- [X] T020 [US1] Update `index.html` to include exercise list container div (`<div id="exercise-list"></div>`)
- [X] T021 [US1] Update `js/app.js` to call exercises.js on launch (render exercise list as default view)
- [X] T022 [US1] Implement exercise card click handler in `js/exercises.js` (if free: launch session; if premium: show unlock message per FR-020)
- [X] T023 [US1] Add localized UI strings to `locales/*.json` for exercise list (e.g., "Free Exercises", "Premium Exercises", "Unlock premium exercises by entering a code in Settings ⚙️")
- [ ] T024 [US1] Test US1 acceptance scenarios 1-3 in Telegram WebView per quickstart.md

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (exercise list loads, free exercises clickable, premium exercises show unlock message)

---

## Phase 4: User Story 2 - Guided Exercise Session (Priority: P1) 🎯 MVP

**Goal**: Full-screen, step-by-step exercise session with timer, progress indicators, Pause/Skip/Done controls, optional voice guidance

**Independent Test**: Launch any free exercise, verify full-screen session with step instructions, progress bar, timer, controls work (Pause, Skip, Done)

### Implementation for User Story 2

- [X] T025 [P] [US2] Create `js/session.js` with session controller (load exercise steps, timer logic, step navigation, audio playback)
- [X] T026 [P] [US2] Create `css/session.css` with full-screen session styles (large text, progress bar, step counter, control buttons)
- [X] T027 [US2] Update `index.html` to include session screen container div (`<div id="session-screen" style="display:none"></div>`)
- [X] T028 [US2] Implement session initialization in `js/session.js` (receive exercise ID, load steps from exercises.json, display first step)
- [X] T029 [US2] Implement timer logic in `js/session.js` (countdown per step duration_sec, update progress bar, auto-advance to next step)
- [X] T030 [US2] Implement Pause/Resume button in `js/session.js` (stop timer, show "Paused — tap Resume to continue" per acceptance scenario 3)
- [X] T031 [US2] Implement Skip button in `js/session.js` (advance to next step immediately per acceptance scenario 4)
- [X] T032 [US2] Implement Done/completion flow in `js/session.js` (show "✅ Done!" message, "Repeat" and "Back to list" buttons per FR-006)
- [X] T033 [US2] Implement voice guidance in `js/session.js` (check storage.js for voice_guidance_enabled, play audio_base64 if available per FR-005)
- [X] T034 [US2] Update `js/storage.js` to track completed exercises (add exercise ID to completed_exercises[] array per data-model.md)
- [X] T035 [US2] Add localized UI strings to `locales/*.json` for session screen (e.g., "Pause", "Resume", "Skip", "Done", "Step X of Y", "✅ Done!", "Repeat", "Back to list")
- [ ] T036 [US2] Test US2 acceptance scenarios 1-6 in Telegram WebView per quickstart.md

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (MVP loop complete: list → exercise → complete → back to list)

---

## Phase 5: User Story 3 - Daily Reminder Opt-In (Priority: P2)

**Goal**: Settings screen with reminders toggle, interval selector, send preferences to bot via WebApp.sendData()

**Independent Test**: Navigate to Settings, toggle reminders ON, select interval, verify sendData() payload sent to bot (use desktop mock to see alert)

### Implementation for User Story 3

- [ ] T037 [P] [US3] Create `js/settings.js` with Settings screen logic (render settings UI, handle toggle changes, call WebApp.sendData())
- [ ] T038 [US3] Update `index.html` to include settings screen container div (`<div id="settings-screen" style="display:none"></div>`) and Settings icon button
- [ ] T039 [US3] Implement reminders toggle in `js/settings.js` (show/hide interval dropdown when toggled, update storage.js)
- [ ] T040 [US3] Implement interval selector in `js/settings.js` (dropdown with "Every 2 hours", "Every 4 hours", "Every 6 hours" per FR-007)
- [ ] T041 [US3] Implement enable reminders flow in `js/settings.js` (call `WebApp.sendData(JSON.stringify({action: "enable_reminders", interval: "4h"}))` per contracts/telegram-bot-api.md)
- [ ] T042 [US3] Implement disable reminders flow in `js/settings.js` (call `WebApp.sendData(JSON.stringify({action: "disable_reminders"}))` per contracts/telegram-bot-api.md)
- [ ] T043 [US3] Add localized UI strings to `locales/*.json` for reminders (e.g., "Enable reminders", "Every 2 hours", "Every 4 hours", "Every 6 hours", "Reminders are sent by @EyeGymBot — you can disable anytime")
- [ ] T044 [US3] Test US3 acceptance scenarios 1-4 in Telegram WebView (verify sendData() payloads sent, test with real bot if available)

**Checkpoint**: Reminders settings functional; bot integration ready (Web App side complete; bot must implement scheduling per contracts/telegram-bot-api.md)

---

## Phase 6: User Story 4 - Premium Unlock via Code (Priority: P2)

**Goal**: Premium code input modal, validation (6 chars, trim/uppercase), sendData() to bot, unlock premium exercises in localStorage

**Independent Test**: Tap "Enter Premium Code" in Settings, input valid 6-char code, verify premium exercises unlock, test invalid code shows error

### Implementation for User Story 4

- [ ] T045 [P] [US4] Implement "Enter Premium Code" button in `js/settings.js` (open modal with input field and "Unlock" button per FR-011)
- [ ] T046 [US4] Implement premium code validation in `js/settings.js` (trim whitespace, uppercase, check length === 6, alphanumeric regex per FR-019)
- [ ] T047 [US4] Implement premium unlock flow in `js/settings.js` (call `WebApp.sendData(JSON.stringify({action: "unlock_premium", code: "EY3G7M"}))` per contracts/telegram-bot-api.md)
- [ ] T048 [US4] Update `js/storage.js` to set `is_premium = true` after successful unlock (localStorage persistence per FR-014)
- [ ] T049 [US4] Update `js/exercises.js` to reload exercise list after premium unlock (show previously locked exercises without lock icon)
- [ ] T050 [US4] Implement error handling in `js/settings.js` (show "Code not found. Check spelling or get one at t.me/EyeGymBot" for invalid code per FR-013)
- [ ] T051 [US4] Add localized UI strings to `locales/*.json` for premium unlock (e.g., "Enter Premium Code", "6-character code", "Unlock", "Premium unlocked! 🎉", "Code not found")
- [ ] T052 [US4] Test US4 acceptance scenarios 1-4 in Telegram WebView (test valid and invalid codes, verify persistence across app restarts)

**Checkpoint**: Premium unlock functional; monetization flow complete (Web App side; bot must validate codes per contracts/telegram-bot-api.md)

---

## Phase 7: User Story 5 - Automatic Language Selection (Priority: P3)

**Goal**: Auto-detect user's Telegram language (EN/RU/RO), load appropriate locale, fallback to English for unsupported languages

**Independent Test**: Change Telegram language to RU, reopen Web App, verify all UI text in Russian; test RO and unsupported language (e.g., ES → EN)

### Implementation for User Story 5

- [ ] T053 [US5] Update `js/i18n.js` to detect language from `WebApp.initDataUnsafe.user.language_code` (per FR-015)
- [ ] T054 [US5] Implement language fallback logic in `js/i18n.js` (if detected language not in [en, ru, ro], default to 'en')
- [ ] T055 [US5] Translate all UI strings in `locales/en.json` to Russian in `locales/ru.json` (~100 strings per data-model.md)
- [ ] T056 [US5] Translate all UI strings in `locales/en.json` to Romanian in `locales/ro.json` (~100 strings per data-model.md)
- [ ] T057 [US5] Update `exercises/free.json` to include localized `title` and `description` fields with EN/RU/RO keys (10 exercises × 3 languages)
- [ ] T058 [US5] Update `exercises/premium.json` to include localized `title` and `description` fields with EN/RU/RO keys (5 exercises × 3 languages)
- [ ] T059 [US5] Update `js/exercises.js` to render localized exercise titles/descriptions using i18n.js
- [ ] T060 [US5] Update `js/session.js` to display localized step instructions from exercise.steps[].instruction.en/ru/ro
- [ ] T061 [US5] Test US5 acceptance scenarios 1-4 in Telegram WebView (test all three languages + fallback)

**Checkpoint**: All user stories 1-5 should now work independently in all three languages

---

## Phase 8: User Story 6 - Privacy Policy Access (Priority: P3)

**Goal**: Link to privacy.html in Settings footer, opens in Telegram in-app browser with required privacy statement

**Independent Test**: Navigate to Settings, tap "Privacy Policy" link, verify privacy.html opens in Telegram browser with correct text

### Implementation for User Story 6

- [ ] T062 [US6] Update `privacy.html` with full privacy policy text (include statement: "Eye Gym Web App stores your progress and settings only on this device. We do not track, log, or share your activity." per FR-017)
- [ ] T063 [US6] Add "Privacy Policy" link in `js/settings.js` footer (call `WebApp.openLink('privacy.html')` per contracts/telegram-bot-api.md)
- [ ] T064 [US6] Add localized UI strings to `locales/*.json` for privacy policy link (e.g., "Privacy Policy")
- [ ] T065 [US6] Test US6 acceptance scenarios 1-2 in Telegram WebView (verify link opens privacy.html in Telegram browser)

**Checkpoint**: All 6 user stories should now be independently functional

---

## Phase 9: Audio Assets & Voice Guidance

**Purpose**: Add voice guidance audio files for exercise steps (optional enhancement, can be done in parallel with other phases)

- [ ] T066 [P] Generate audio files for free exercises (TTS for EN/RU/RO, ≤8 KB per step, WebM or MP3 format per research.md)
- [ ] T067 [P] Generate audio files for premium exercises (TTS for EN/RU/RO, ≤8 KB per step)
- [ ] T068 [P] Convert audio files to base64 and embed in `exercises/free.json` (update `audio_base64` field per data-model.md)
- [ ] T069 [P] Convert audio files to base64 and embed in `exercises/premium.json`
- [ ] T070 Implement voice guidance toggle in `js/settings.js` (global on/off switch, update storage.js per FR-007)
- [ ] T071 Update `js/session.js` to respect voice guidance setting (check storage before playing audio per FR-005)
- [ ] T072 Add localized UI strings to `locales/*.json` for voice guidance (e.g., "Voice guidance", "On", "Off")
- [ ] T073 Test voice guidance in Telegram WebView (verify audio plays on each step, toggle works)

**Checkpoint**: Voice guidance complete and testable

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T074 [P] Apply Telegram theme colors in `css/main.css` (read `WebApp.themeParams.bg_color`, `text_color`, etc., set CSS variables per research.md)
- [ ] T075 [P] Implement CSP enforcement in `index.html` meta tag (per research.md: `default-src 'self'; script-src 'self' https://telegram.org; style-src 'self' 'unsafe-inline'`)
- [ ] T076 [P] Add inline SVG icons to `assets/icons/` for UI elements (settings gear, lock icon, play/pause, etc.)
- [ ] T077 [P] Update all UI to use inline SVG icons instead of text symbols (e.g., ⚙️ → SVG gear icon)
- [ ] T078 Optimize bundle size (minify JSON if needed, compress audio, validate total ≤120 KB gzipped per quickstart.md)
- [ ] T079 Run bundle size validation per quickstart.md (`tar -czf bundle.tar.gz ...`, verify ≤120 KB)
- [ ] T080 [P] Add error handling for edge cases (offline premium unlock per edge cases in spec.md, bot blocked warning for reminders)
- [ ] T081 [P] Improve mobile UX (touch-friendly button sizes, responsive layout, test on iOS and Android per quickstart.md)
- [ ] T082 Run constitution compliance checklist (verify all 7 principles satisfied per constitution.md)
- [ ] T083 Run final manual QA per quickstart.md testing checklist (all user stories, all languages, all edge cases)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3 → US4 → US5 → US6)
- **Audio Assets (Phase 9)**: Can proceed in parallel with user stories (depends only on Foundational + US2 session.js)
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on Foundational (Phase 2) - Integrates with US1 (exercise list launches session)
- **User Story 3 (P2)**: Depends on Foundational (Phase 2) - No dependencies on other stories (Settings is independent)
- **User Story 4 (P2)**: Depends on Foundational (Phase 2) + US1 (premium unlock affects exercise list)
- **User Story 5 (P3)**: Depends on Foundational (Phase 2) + US1 + US2 (localization affects all UI)
- **User Story 6 (P3)**: Depends on Foundational (Phase 2) + US3 (privacy link in Settings)

### Within Each User Story

- Models/data before services
- Services before UI
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T008)
- All Foundational tasks marked [P] can run in parallel (T010, T011, T014)
- Once Foundational phase completes:
  - US1 tasks T016-T017 can run in parallel (free.json and premium.json)
  - US2 tasks T025-T026 can run in parallel (session.js and session.css)
  - US3 task T037 can run in parallel with other stories
  - US4 task T045 can run in parallel with other stories
  - US5 tasks T055-T058 can run in parallel (translations)
  - Audio tasks T066-T069 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch models for User Story 1 together:
Task T016: "Create exercises/free.json with 10 free exercises"
Task T017: "Create exercises/premium.json with 5 premium exercises"

# Then proceed with implementation (sequential):
Task T018: "Create js/exercises.js with exercise list loader"
Task T019: "Create css/exercises.css with card styles"
# ... etc.
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Instant Exercise Access)
4. Complete Phase 4: User Story 2 (Guided Exercise Session)
5. **STOP and VALIDATE**: Test US1 + US2 independently (MVP loop: list → exercise → complete)
6. Deploy to GitHub Pages per quickstart.md, test in Telegram mobile app

**This is the minimum viable product: users can discover and complete free exercises.**

### Incremental Delivery (Add P2 Features)

1. MVP deployed and validated ✅
2. Add User Story 3: Daily Reminder Opt-In → Test independently → Deploy
3. Add User Story 4: Premium Unlock via Code → Test independently → Deploy
4. Each story adds value without breaking previous stories

### Full Feature Set (Add P3 Infrastructure)

1. US1-US4 deployed and validated ✅
2. Add User Story 5: Automatic Language Selection → Test independently → Deploy
3. Add User Story 6: Privacy Policy Access → Test independently → Deploy
4. Add Phase 9: Audio Assets & Voice Guidance → Test independently → Deploy
5. Complete Phase 10: Polish & Cross-Cutting Concerns

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T015)
2. Once Foundational is done:
   - Developer A: User Story 1 + 2 (MVP loop) [T016-T036]
   - Developer B: User Story 3 (Reminders) [T037-T044]
   - Developer C: User Story 4 (Premium unlock) [T045-T052]
   - Developer D: Audio assets (parallel) [T066-T073]
3. After MVP validated, add US5 + US6 + Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No automated tests (manual QA in Telegram WebView per quickstart.md)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Bundle Size Tracking

**Target**: ≤120 KB (gzipped)

**Current Estimate** (from data-model.md and research.md):
- JS/CSS/HTML: ~80 KB raw → ~35 KB gzipped
- Locales (inline): ~10 KB raw → ~4 KB gzipped
- Exercise JSON: ~12 KB raw → ~5 KB gzipped
- Audio (base64): ~200 KB raw → ~76 KB gzipped
- **Total**: ~302 KB raw → **~120 KB gzipped** ✅

**Monitor**: Run bundle size check after T078-T079 (Phase 10) to confirm within target.

---

## Constitution Compliance Checklist

Before marking complete, verify all 7 principles satisfied:

- [ ] ✅ Telegram-Native UX (WebApp SDK for theming, alerts, navigation)
- [ ] ✅ Privacy by Design (no telemetry, localStorage only, CSP enforced)
- [ ] ✅ Multilingual Compliance (EN/RU/RO, externalized strings)
- [ ] ✅ Monetization Boundaries (external payment links, user-entered codes)
- [ ] ✅ Reliability & Simplicity (vanilla JS, zero build, ≤120 KB)
- [ ] ✅ User Autonomy (reminders opt-in, clear messaging)
- [ ] ✅ Transparency (privacy policy accessible, clear statement)

Run full compliance check at T082 (Phase 10).

---

## Total Task Count: 83 tasks

**Breakdown by Phase**:
- Phase 1 (Setup): 8 tasks
- Phase 2 (Foundational): 7 tasks (BLOCKING)
- Phase 3 (US1 - P1): 9 tasks 🎯 MVP
- Phase 4 (US2 - P1): 12 tasks 🎯 MVP
- Phase 5 (US3 - P2): 8 tasks
- Phase 6 (US4 - P2): 8 tasks
- Phase 7 (US5 - P3): 9 tasks
- Phase 8 (US6 - P3): 4 tasks
- Phase 9 (Audio): 8 tasks
- Phase 10 (Polish): 10 tasks

**Parallel Opportunities**: 35 tasks marked [P] (42% parallelizable)

**MVP Scope**: 36 tasks (Setup + Foundational + US1 + US2) = ~43% of total work

**Suggested First Milestone**: Complete through T036 (MVP loop), deploy to GitHub Pages, validate in Telegram mobile app.
