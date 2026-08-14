# Eye Gym architecture

## Runtime

```text
Browser/PWA -> Caddy -> web
                   -> api -> PostgreSQL
                         -> Web Push providers
                         -> Google OAuth

worker -----------------> PostgreSQL
worker -----------------> Web Push providers
backup -----------------> PostgreSQL volume -> backup volume
```

The browser is offline-first. Workout history is written locally first with a client-generated UUID. Authenticated clients enqueue the same immutable event for server synchronization, allowing the API to use the UUID as an idempotency key.

## Boundaries

- `src/`: React client and PWA.
- `server/src/http`: API entry point and request handlers.
- `server/src/worker`: reminder scheduler entry point.
- `server/src/db`: migrations and PostgreSQL access.
- `deploy/`: Caddy and production configuration.
- `docs/`: product and operational documentation.

## Portability

Persistent state is limited to named PostgreSQL and backup volumes. Images are immutable and tagged with the Git commit SHA. Environment-specific values stay in server-side `.env` and GitHub Environment Secrets.

## Security decisions

- Google OAuth terminates at the API.
- The browser receives an opaque secure session cookie, not provider tokens.
- All user-owned rows include `user_id` and are filtered by the authenticated session.
- Guest push subscriptions use random installation IDs and contain no email or name.
- Analytics is disabled until consent is stored locally.
