const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const rawOrigin = (process.env.APP_ORIGIN || process.env.APP_DOMAIN || 'https://eye-gym.bacus.dev').trim();

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is required. Keep it only in the server environment; never commit it.');
  process.exit(1);
}

const origin = rawOrigin.startsWith('http://') || rawOrigin.startsWith('https://')
  ? rawOrigin
  : `https://${rawOrigin}`;

let webAppUrl;
try {
  const parsed = new URL(origin);
  if (parsed.protocol !== 'https:') {
    throw new Error('Telegram Mini Apps require an HTTPS production URL.');
  }
  parsed.pathname = parsed.pathname.replace(/\/$/, '') || '/';
  parsed.search = '';
  parsed.hash = '';
  webAppUrl = parsed.toString().replace(/\/$/, '');
} catch (error) {
  console.error(`Invalid APP_ORIGIN/APP_DOMAIN: ${error.message}`);
  process.exit(1);
}

async function telegram(method, payload) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    const description = body?.description || `${response.status} ${response.statusText}`;
    throw new Error(`${method} failed: ${description}`);
  }

  return body.result;
}

try {
  const bot = await telegram('getMe');
  console.log(`Bot verified: @${bot.username ?? bot.id}`);

  await telegram('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: 'Eye Gym',
      web_app: { url: webAppUrl },
    },
  });

  console.log(`Telegram menu button configured: Eye Gym -> ${webAppUrl}`);
  console.log('Next: restart Eye Gym api + worker with the same TELEGRAM_BOT_TOKEN, then open the bot in Telegram and test the menu button.');
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
