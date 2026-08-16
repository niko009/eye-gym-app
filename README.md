# Eye Gym Web/PWA and Telegram Mini App

Offline-first application for guided eye relaxation workouts. The same React application runs as a regular website, an installable PWA and a Telegram Mini App. The production stack is self-hosted and portable between Linux servers.

## Local frontend

```bash
npm ci
npm run dev
```

Run frontend verification with `npm run lint && npm test && npm run build`.

## Offline voice packs

The repository contains versioned RU/RO/EN neural MP3 packs in `public/audio/v1`. The selected language downloads automatically; the other packs can be downloaded from Settings. Generation is reproducible:

```bash
python -m venv .venv-audio
.venv-audio/Scripts/pip install -r scripts/requirements-audio.txt  # Windows
.venv-audio/Scripts/python scripts/generate_audio.py
```

The approved settings are stored in both the generator and `public/audio/manifest.json`: Edge TTS 7.2.7, `+12%` rate, `-2Hz` pitch and `+0%` volume. Voices are Svetlana Neural (RU), Alina Neural (RO) and Jenny Neural (EN). `ffprobe` is required for duration validation.

## Local API

```bash
cd server
npm ci
DATABASE_URL=postgresql://eyegym:password@localhost:5432/eyegym \
SESSION_SECRET=replace-with-at-least-32-characters \
npm run dev
```

Run API verification with `npm run lint && npm test && npm run build` from `server/`.

## Docker production stack

1. Copy `.env.example` to `.env` and replace every secret.
2. Point the domain to the server.
3. Start the stack:

```bash
docker compose --profile tools run --rm migrate
docker compose up -d --wait --wait-timeout 120
```

The stack contains Caddy, the web client, API, reminder worker, PostgreSQL and automatic database backups.

## Telegram Mini App

The Telegram client is another delivery channel for this project, not a separate application or legacy codebase. It uses the same frontend, API, database, workout engine and localized content as the browser/PWA channel.

- Configure the production HTTPS URL as a Mini App in BotFather and expose it through the bot menu or a direct Mini App link.
- Provide `TELEGRAM_BOT_TOKEN` to the API and worker. The token must never be exposed to the browser.
- The client detects `window.Telegram.WebApp`; outside Telegram it keeps normal browser/PWA behavior.
- The API validates the signed `Telegram.WebApp.initData` and its age before creating a session.
- Telegram and Google identities create separate users. Accounts and workout histories are not linked or merged in v1.
- Browser reminders use Web Push. Telegram reminders are delivered by the project bot after an explicit opt-in.

Product requirements are in [`docs/WEB_PWA_SPEC.md`](docs/WEB_PWA_SPEC.md). Architecture decisions are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
The current comparison with similar break and eye-relaxation products is in [`docs/COMPETITOR_REVIEW.md`](docs/COMPETITOR_REVIEW.md).
Production setup, backup, restore, rollback and Telegram verification are documented in [`docs/OPERATIONS.md`](docs/OPERATIONS.md).
The current implementation and remaining production inputs are tracked in [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md).
