import express from 'express';
import request from 'supertest';
import {describe, expect, it} from 'vitest';
import {createRateLimit} from './rate-limit.js';

describe('authentication rate limiter', () => {
  it('returns 429 after the configured number of attempts', async () => {
    const app = express();
    app.get('/', createRateLimit(2, 60_000), (_request, response) => response.json({ok: true}));

    expect((await request(app).get('/')).status).toBe(200);
    expect((await request(app).get('/')).status).toBe(200);
    const limited = await request(app).get('/');
    expect(limited.status).toBe(429);
    expect(limited.headers['retry-after']).toBeTruthy();
  });
});
