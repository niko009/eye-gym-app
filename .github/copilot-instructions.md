# Eye Gym Development Guidelines

Last updated: 2026-08-16

## Active Technologies

- Frontend: React 19, TypeScript, Vite, Tailwind CSS and `vite-plugin-pwa`.
- Backend and reminder worker: Node.js, TypeScript, Express and PostgreSQL.
- Delivery channels: regular website, installable PWA and Telegram Mini App from one codebase.
- Authentication: independent Google OAuth and Telegram identities verified by the API.
- Production: Docker Compose with Caddy, PostgreSQL, migrations and automatic backups.

## Project Structure

```text
src/                  React client and browser/Telegram adapters
server/src/http.ts    API entry point
server/src/worker.ts  Web Push and Telegram reminder worker
server/src/db/        PostgreSQL access and migrations
deploy/               Caddy, web image and backup configuration
docs/                 Product and architecture documentation
```

## Commands

```text
npm run lint
npm run build
cd server && npm run lint
cd server && npm run build
```

## Required Project Rules

- Read `docs/WEB_PWA_SPEC.md`, `docs/ARCHITECTURE.md` and
  `.specify/memory/constitution.md` before planning a feature.
- Preserve normal browser/PWA behavior when adding Telegram-specific behavior.
- Keep Google and Telegram users separate; do not match or merge them automatically.
- Validate Telegram `initData` and Google OAuth server-side before establishing identity.
- Never expose provider credentials or the Telegram bot token to the browser.
- Keep workout synchronization idempotent and count only completed workouts.
- Externalize user-facing strings for Russian, Romanian and English.
- Update product and architecture documentation when behavior or trust boundaries change.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
