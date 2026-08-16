import type {RequestHandler} from 'express';

interface Bucket {count: number; resetAt: number}

export function createRateLimit(maxRequests: number, windowMs: number): RequestHandler {
  const buckets = new Map<string, Bucket>();
  return (request, response, next) => {
    const now = Date.now();
    const key = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now ? {count: 0, resetAt: now + windowMs} : current;
    bucket.count += 1;
    buckets.set(key, bucket);

    if (buckets.size > 10_000) {
      for (const [candidate, value] of buckets) if (value.resetAt <= now) buckets.delete(candidate);
    }
    response.setHeader('RateLimit-Limit', String(maxRequests));
    response.setHeader('RateLimit-Remaining', String(Math.max(0, maxRequests - bucket.count)));
    response.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count <= maxRequests) return next();
    response.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)));
    response.status(429).json({error: 'rate_limited'});
  };
}
