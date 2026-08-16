import {createHmac} from 'node:crypto';
import {describe, expect, it} from 'vitest';
import {validateTelegramInitData} from './telegram.js';

const botToken = 'test-bot-token-that-is-not-a-secret';
const now = 1_787_000_000;

function signedInitData(overrides: Record<string, string> = {}): string {
  const parameters = new URLSearchParams({
    auth_date: String(now - 10),
    query_id: 'AAHdF6IQAAAAAN0XohDhrOrc',
    user: JSON.stringify({id: 12345, first_name: 'Mihai', language_code: 'ro'}),
    ...overrides,
  });
  const dataCheckString = [...parameters.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  parameters.set('hash', createHmac('sha256', secret).update(dataCheckString).digest('hex'));
  return parameters.toString();
}

describe('Telegram initData validation', () => {
  it('accepts a fresh payload with a valid signature', () => {
    expect(validateTelegramInitData(signedInitData(), botToken, 3600, now)).toMatchObject({id: 12345, first_name: 'Mihai'});
  });

  it('rejects client-side tampering', () => {
    const data = new URLSearchParams(signedInitData());
    data.set('user', JSON.stringify({id: 999, first_name: 'Attacker'}));
    expect(() => validateTelegramInitData(data.toString(), botToken, 3600, now)).toThrow('signature');
  });

  it('rejects an expired signed payload', () => {
    expect(() => validateTelegramInitData(signedInitData({auth_date: String(now - 7200)}), botToken, 3600, now)).toThrow('expired');
  });
});
