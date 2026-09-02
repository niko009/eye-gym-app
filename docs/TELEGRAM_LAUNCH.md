# Telegram Mini App launch

Eye Gym already contains Telegram Mini App detection, signed `initData` authentication and Telegram reminder delivery. Launching it in Telegram is primarily an external configuration task.

## Production values

- Web App URL: `https://eye-gym.bacus.dev`
- Required secret: `TELEGRAM_BOT_TOKEN`
- Token storage: production `.env` on the Bacus server only; never Git, browser code, screenshots or logs.

## One-time configuration

1. Add the bot token to the server-side `.env`:

```env
TELEGRAM_BOT_TOKEN=<BotFather token>
```

2. Ensure the production URL is present as either:

```env
APP_DOMAIN=eye-gym.bacus.dev
```

or:

```env
APP_ORIGIN=https://eye-gym.bacus.dev
```

3. From the checked-out Eye Gym repository run:

```bash
npm run telegram:configure
```

The helper:

- calls Telegram `getMe` to verify the token;
- configures the private-chat menu button through `setChatMenuButton`;
- points the button to `https://eye-gym.bacus.dev`;
- never prints or stores the token.

4. Restart the production `api` and `worker` services so the same bot token is available to Telegram authentication/reminder delivery.

## Acceptance test

1. Open the bot in Telegram Android/iOS/Desktop.
2. Open **Eye Gym** from the bot menu button.
3. Confirm it opens inside Telegram, not an external browser.
4. Confirm the Telegram account is recognized automatically from signed Mini App `initData`.
5. Complete one workout.
6. Enable one Telegram reminder and approve Telegram write access if prompted.
7. Confirm the reminder arrives from the bot.
8. Disable the reminder and confirm future delivery stops.

## BotFather

The menu button does not need to be configured manually in BotFather when `npm run telegram:configure` succeeds; the script uses the official Bot API. BotFather remains the place where the bot itself and its token are managed.

## Troubleshooting

### `TELEGRAM_BOT_TOKEN is required`
The production `.env` does not contain the bot token or the command is not being run from the repository root.

### `getMe failed: Unauthorized`
The token is invalid/revoked. Generate or retrieve the current token in BotFather and update the server-side `.env`.

### Mini App opens but login fails
Verify that `api` was restarted with the same `TELEGRAM_BOT_TOKEN`, the page is opened from Telegram, and server time is correct. `TELEGRAM_INIT_DATA_MAX_AGE_SECONDS` defaults to 3600.

### Reminders do not arrive
Confirm the `worker` has the token, the user approved Telegram write access, and the reminder worker is healthy.
