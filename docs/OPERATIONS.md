# Eye Gym operations

## First production launch

1. Install Docker Engine with the Compose plugin on a Linux host.
2. Copy `.env.example` to `.env`, fill every required value and point `APP_DOMAIN` DNS to the host. On the Bacus production runner, the deploy workflow creates the initial server-only `.env` with random database and session secrets when it is missing. Google, Telegram and Web Push stay disabled until their credentials are added to that file.
3. Run `docker compose --profile tools run --rm migrate`.
4. Run `docker compose up -d --wait --wait-timeout 120`.
5. Verify `https://<APP_DOMAIN>/api/health`, browser installation and the Telegram bot menu launch.

Google OAuth must use `https://<APP_DOMAIN>/api/v1/auth/google/callback` as an authorized redirect URI. In BotFather, set the same HTTPS origin as the Mini App URL and menu button. Never place either provider secret in a `VITE_` variable.

## Backups

The `backup` service writes one PostgreSQL custom-format dump immediately after startup and then every 24 hours. Dumps live in the named `postgres_backups` volume and are retained for `BACKUP_RETENTION_DAYS` (14 by default). The deployment workflow also creates `deploy/backups/pre-deploy-<SHA>.dump` before every migration.

List automatic backups:

```bash
docker compose exec backup ls -lh /backups
```

Copy one out of the volume:

```bash
docker compose cp backup:/backups/eye-gym-YYYYMMDDTHHMMSSZ.dump ./eye-gym.dump
```

## Restore drill

Restoration replaces the current database. Stop application writers, make an additional dump, copy the chosen dump into PostgreSQL and restore it:

```bash
docker compose stop api worker
docker compose exec -T postgres pg_dump -U eyegym -d eyegym -Fc > before-restore.dump
docker compose cp eye-gym.dump postgres:/tmp/eye-gym.dump
docker compose exec -T postgres pg_restore -U eyegym -d eyegym --clean --if-exists --no-owner /tmp/eye-gym.dump
docker compose --profile tools run --rm migrate
docker compose start api worker
curl --fail https://YOUR_DOMAIN/api/health
```

Use the configured `POSTGRES_USER` and `POSTGRES_DB` if they differ from defaults. Perform a restore drill on a non-production host before the first public launch and after material schema changes.

## Rollback

The deployment workflow stores the last healthy web/API image names in `.deployed-images`. If migration, startup or the public health check fails, it restarts those images automatically. Database migrations must remain forward-compatible with the previous application image. For a schema/data rollback, use the matching pre-deploy dump and the restore procedure above.

## Telegram verification

- Open the app from the bot menu on Telegram Android, iOS and Desktop.
- Confirm theme and viewport changes, Back Button behavior and automatic verified login.
- Enable a reminder and approve the native write-access dialog.
- Confirm the bot message arrives, then disable the reminder and confirm delivery stops.

## Secret rotation

Update `.env` or the corresponding GitHub Environment secret, restart the affected services, and invalidate old credentials at Google or BotFather. Rotating `SESSION_SECRET` intentionally signs out every user. Rotating the bot token also requires updating BotFather-integrated services and restarting both `api` and `worker`.
