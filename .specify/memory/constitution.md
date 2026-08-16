# Eye Gym Web/PWA and Telegram Mini App Constitution

## Core Principles

### I. One Product, Multiple Channels

Eye Gym MUST remain one product and one maintained codebase delivered as a regular website,
an installable PWA and a Telegram Mini App. Exercises, workout behavior, localization,
statistics rules and server contracts MUST be shared. Channel-specific behavior MUST stay in
small platform adapters. The application MUST continue to work in a normal browser when the
Telegram SDK is unavailable.

### II. Verified and Separate Identities

Guest, Google and Telegram are distinct identity states. Google identities MUST be accepted
only after server-side OAuth verification. Telegram identities MUST be accepted only after
the API validates the original `Telegram.WebApp.initData` signature and `auth_date` with the
bot token. Client-provided profile data and `initDataUnsafe` MUST NOT establish identity.

Google and Telegram identities MUST create separate users in v1. Accounts, settings and
workout histories MUST NOT be automatically linked, matched or merged by email, name, phone
or other profile data. Account linking requires a future explicit product specification.

### III. Offline-First and Idempotent Data

Core workouts MUST remain usable without registration. In browser/PWA mode, workout events
MUST be persisted locally before synchronization and identified by client-generated UUIDs.
Only completed workouts count toward statistics. Retried synchronization and guest-history
imports MUST be idempotent. A guest event MUST NOT be imported automatically into both a
Google and a Telegram profile.

Telegram WebView caching is best-effort and MUST NOT be described as equivalent to an
installed PWA. Channel limitations must be communicated honestly.

### IV. Privacy, Security and Consent

Secrets, Google credentials and the Telegram bot token MUST remain server-side. Authenticated
data access MUST be scoped by `user_id`, sessions MUST use opaque Secure, HttpOnly cookies,
and provider tokens MUST NOT be sent to the browser. Analytics MUST remain disabled until
valid consent is recorded and MUST NOT include provider subjects, Telegram IDs or workout
content that identifies a user. Reminders and messaging MUST be opt-in and revocable.

### V. Localization, Accessibility and Product Safety

User-facing functionality MUST support Russian, Romanian and English, with Russian as the
default unless platform requirements provide a better explicit choice. New strings MUST be
externalized and translated across all supported languages before release. Interfaces MUST
target WCAG 2.1 AA and remain mobile-first with desktop support. Product copy MUST present Eye
Gym as relaxation exercises and MUST NOT make medical treatment or vision-improvement claims.

### VI. Portable and Observable Operations

Production MUST remain self-hosted and portable through Docker Compose. Persistent business
state MUST stay in PostgreSQL and documented backup volumes. Environment-specific values MUST
come from server-side environment configuration. API, web, database and deployment paths MUST
have health checks or equivalent verification. Migrations, backup/restore and rollback paths
MUST be considered for every data or deployment change.

### VII. Incremental, Testable Delivery

Features MUST be specified as independently testable user outcomes and implemented in small
increments. Changes MUST preserve browser/PWA and Telegram behavior unless the specification
explicitly scopes a feature to one channel. Security-sensitive authentication and sync logic
MUST have automated tests. Every implementation MUST be checked against its specification,
architecture decisions and acceptance criteria before completion.

## Development Constraints

- Frontend: React, TypeScript and Vite; PWA behavior is provided through the service worker.
- Backend and worker: Node.js and TypeScript with PostgreSQL.
- Telegram integration: official Telegram Web App SDK in the client and Telegram Bot API from
  server-side code only.
- Authentication identities use a unique `(provider, provider_subject)` key. Provider profile
  fields are metadata, not cross-provider identity keys.
- Browser reminders use Web Push; Telegram reminders use bot messages after explicit opt-in.
- The browser/PWA channel uses Google OAuth; the Telegram channel uses verified `initData`.
- Application images MUST be immutable and environment secrets MUST never enter Git, frontend
  bundles, public configuration endpoints or logs.
- Current product behavior and exclusions are defined by `docs/WEB_PWA_SPEC.md`; runtime
  boundaries and trust decisions are defined by `docs/ARCHITECTURE.md`.

## Development Workflow and Quality Gates

1. Write or update a feature specification describing user value, channel scope, acceptance
   scenarios, edge cases and measurable success criteria.
2. Clarify decisions that materially affect identity, privacy, synchronization, offline
   behavior or the user journey before technical planning.
3. Create an implementation plan covering frontend, API, persistence, migrations, worker,
   tests and deployment impact as applicable.
4. Re-check all seven principles before and after design. Any violation requires an explicit,
   time-bounded waiver approved through governance.
5. Generate dependency-ordered tasks grouped into independently testable user stories.
6. Before implementation, run the read-only consistency analysis across specification, plan
   and tasks. Resolve all critical constitution conflicts.
7. During implementation, run relevant lint, type checks, tests and production builds. Verify
   both normal-browser and Telegram modes for shared UI changes.
8. Update `docs/WEB_PWA_SPEC.md` and `docs/ARCHITECTURE.md` whenever a change alters product
   behavior, identity rules, trust boundaries or deployment architecture.

## Governance

This constitution is the controlling rule set for feature specifications, plans and tasks.
Amendments require a documented rationale, migration impact and review. Versioning follows
semantic versioning: MAJOR for incompatible governance changes, MINOR for new or materially
expanded principles, and PATCH for clarifications that do not change obligations.

**Version**: 2.0.0 | **Ratified**: 2025-11-12 | **Last Amended**: 2026-08-16
