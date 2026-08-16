import {z} from 'zod';

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en', {timeZone: value}).format();
    return true;
  } catch {
    return false;
  }
}

export const timeZoneSchema = z.string().min(1).max(128).refine(isTimeZone, 'Invalid IANA time zone');
