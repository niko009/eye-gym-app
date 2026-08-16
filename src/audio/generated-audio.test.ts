import {existsSync, readFileSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {EXERCISES} from '../data';
import type {AudioManifest} from './packs';

const manifest = JSON.parse(readFileSync(resolve('public/audio/manifest.json'), 'utf8')) as AudioManifest;

describe('generated offline audio packs', () => {
  it.each([
    ['ru', 'ru-RU-SvetlanaNeural'],
    ['ro', 'ro-RO-AlinaNeural'],
    ['en', 'en-US-JennyNeural'],
  ] as const)('contains every exercise and cue for %s', (language, voice) => {
    const pack = manifest.packs[language];
    expect(pack.voice).toBe(voice);
    expect(pack.rate).toBe('+12%');
    expect(pack.pitch).toBe('-2Hz');
    expect(pack.exercises.map((entry) => entry.id)).toEqual(EXERCISES.map((exercise) => exercise.id));
    expect(pack.cues.map((entry) => entry.id)).toEqual(['rest', 'finished']);
    for (const entry of [...pack.exercises, ...pack.cues]) {
      const file = resolve('public', entry.file.replace(/^\//, '').replace(/^audio\//, 'audio/'));
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size).toBeGreaterThan(1_000);
    }
  });

  it('keeps every exercise narration shorter than its timer', () => {
    for (const pack of Object.values(manifest.packs)) {
      for (const entry of pack.exercises) expect(entry.durationSeconds).toBeLessThan(entry.exerciseDurationSeconds!);
    }
  });
});
