# Eye Gym Web/PWA

Offline-first web application for guided eye relaxation workouts. The production stack is self-hosted and portable between Linux servers.

## Local frontend

```bash
npm ci
npm run dev
```

## Local API

```bash
cd server
npm ci
DATABASE_URL=postgresql://eyegym:password@localhost:5432/eyegym \
SESSION_SECRET=replace-with-at-least-32-characters \
npm run dev
```

## Docker production stack

1. Copy `.env.example` to `.env` and replace every secret.
2. Point the domain to the server.
3. Start the stack:

```bash
docker compose --profile tools run --rm migrate
docker compose up -d --wait --wait-timeout 120
```

The stack contains Caddy, the web client, API, reminder worker, PostgreSQL and automatic database backups.

Product requirements are in [`docs/WEB_PWA_SPEC.md`](docs/WEB_PWA_SPEC.md). Architecture decisions are in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
