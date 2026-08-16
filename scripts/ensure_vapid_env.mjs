import {generateKeyPairSync} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';

const path = process.argv[2];
if (!path) throw new Error('Usage: node ensure_vapid_env.mjs ENV_FILE');

const source = readFileSync(path, 'utf8');
const values = Object.fromEntries(source.split(/\r?\n/).filter(Boolean).map((line) => {
  const index = line.indexOf('=');
  return index < 0 ? [line, ''] : [line.slice(0, index), line.slice(index + 1)];
}));

if (values.VAPID_PUBLIC_KEY && values.VAPID_PRIVATE_KEY) {
  process.stdout.write('VAPID keys already configured\n');
  process.exit(0);
}

const {privateKey, publicKey} = generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
const privateJwk = privateKey.export({format: 'jwk'});
const publicJwk = publicKey.export({format: 'jwk'});
if (!privateJwk.d || !publicJwk.x || !publicJwk.y) throw new Error('Unable to export VAPID key pair');

const publicBytes = Buffer.concat([
  Buffer.from([4]),
  Buffer.from(publicJwk.x, 'base64url'),
  Buffer.from(publicJwk.y, 'base64url'),
]);
const replacements = {
  VAPID_PUBLIC_KEY: publicBytes.toString('base64url'),
  VAPID_PRIVATE_KEY: privateJwk.d,
};
const updated = source.replace(/^(VAPID_PUBLIC_KEY|VAPID_PRIVATE_KEY)=.*$/gm, (_, name) => `${name}=${replacements[name]}`);
writeFileSync(path, updated, {encoding: 'utf8', mode: 0o600});
process.stdout.write('VAPID keys generated\n');
