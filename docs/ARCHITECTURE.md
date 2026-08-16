# Eye Gym Web/PWA and Telegram Mini App architecture

## Runtime

```text
Browser/PWA --------\
                     -> Caddy -> web
Telegram Mini App --/          -> api -> PostgreSQL
                                     -> Google OAuth
                                     -> Telegram initData validation
                                     -> Web Push providers

worker -----------------------------> PostgreSQL
worker -----------------------------> Web Push providers
worker -----------------------------> Telegram Bot API
backup -----------------------------> PostgreSQL volume -> backup volume
```

The browser is offline-first. Workout history is written locally first with a client-generated UUID. Authenticated clients enqueue the same immutable event for server synchronization, allowing the API to use the UUID as an idempotency key.

The Telegram Mini App is a delivery mode of the same React application. Shared code owns exercises, workout state, localization, local history and API synchronization. A thin runtime adapter owns Telegram-specific lifecycle, theme, viewport, safe-area, navigation and haptic behavior. When the Telegram SDK is absent, the application continues in browser/PWA mode.

## Identity model

- Guest, Google and Telegram are distinct identity states.
- Google OAuth creates or resumes a user identified by the verified Google subject.
- Telegram login creates or resumes a user identified by the verified Telegram user ID.
- A Google identity and a Telegram identity always represent separate `users` rows in v1, even when they belong to the same person or share profile information.
- Automatic matching by email, display name or phone number is forbidden.
- Account linking, merging and shared history between providers are out of scope for v1.
- Local guest history may be imported idempotently into the provider account selected at first login. It must never be copied automatically into both providers.

The persistence model should represent an authentication identity as `(provider, provider_subject)` with a uniqueness constraint. Provider-specific profile fields are optional metadata and are not identity keys.

## Telegram trust boundary

- The browser sends the original `Telegram.WebApp.initData` string to the API.
- The API validates its signature with `TELEGRAM_BOT_TOKEN`, checks `auth_date` freshness and only then reads the Telegram user ID.
- `initDataUnsafe`, URL parameters and client-provided Telegram user objects are never trusted for authentication.
- After successful validation, the API issues the same opaque Secure, HttpOnly, SameSite session cookie used by the web channel.
- The bot token is available only to the API and reminder worker.

## Channel-specific capabilities

| Capability | Browser/PWA | Telegram Mini App |
|---|---|---|
| Installation | PWA manifest and install prompt | Opened through the bot or direct Mini App link |
| Identity | Guest or Google OAuth | Guest before verification, then Telegram identity |
| Theme/navigation | Application UI and browser conventions | Telegram theme, safe areas, viewport, Back Button and haptics |
| Offline | Service worker, cached shell and audio | Best-effort WebView cache; no installability guarantee |
| Reminders | Web Push | Messages from the project bot |
| Analytics | GA4 after consent | Disabled unless separately consented and supported by policy |

## Boundaries

- `src/`: React client and PWA.
- `src/hooks` or a dedicated platform adapter: browser and Telegram runtime integration.
- `server/src/http`: API entry point and request handlers.
- `server/src/worker`: reminder scheduler entry point.
- `server/src/db`: migrations and PostgreSQL access.
- `deploy/`: Caddy and production configuration.
- `docs/`: product and operational documentation.

## Portability

Persistent state is limited to named PostgreSQL and backup volumes. Images are immutable and tagged with the Git commit SHA. Environment-specific values stay in server-side `.env` and GitHub Environment Secrets.

## Security decisions

- Google OAuth and Telegram authentication terminate at the API.
- The browser receives an opaque secure session cookie, not provider tokens.
- Telegram `initData` is validated server-side before any Telegram identity is accepted.
- All user-owned rows include `user_id` and are filtered by the authenticated session.
- Guest push subscriptions use random installation IDs and contain no email or name.
- Telegram chat identifiers are used only for opted-in bot delivery and are never inferred from unverified client data.
- Analytics is disabled until consent is stored locally.
