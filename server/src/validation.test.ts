import {describe, expect, it} from 'vitest';
import {timeZoneSchema} from './validation.js';

describe('timeZoneSchema', () => {
  it.each(['UTC', 'Europe/Chisinau', 'America/New_York'])('accepts %s', (value) => {
    expect(timeZoneSchema.parse(value)).toBe(value);
  });

  it('rejects unknown database time zones', () => {
    expect(() => timeZoneSchema.parse('Mars/Olympus_Mons')).toThrow();
  });
});
