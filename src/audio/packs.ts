import type {Language} from '../types';

export interface AudioEntry {id: string; file: string; durationSeconds: number; exerciseDurationSeconds?: number; text: string}
export interface AudioPack {
  voice: string;
  rate: string;
  pitch: string;
  volume: string;
  exercises: AudioEntry[];
  cues: AudioEntry[];
}
export interface AudioManifest {
  version: number;
  provider: string;
  generatorVersion: string;
  packs: Record<Language, AudioPack>;
}

const CACHE_NAME = 'eye-gym-audio-v1';
let manifestPromise: Promise<AudioManifest> | null = null;

export function loadAudioManifest(): Promise<AudioManifest> {
  manifestPromise ??= fetch('/audio/manifest.json').then((response) => {
    if (!response.ok) throw new Error('Audio manifest is unavailable');
    return response.json() as Promise<AudioManifest>;
  }).catch((error) => {
    manifestPromise = null;
    throw error;
  });
  return manifestPromise;
}

function files(pack: AudioPack): string[] {
  return [...pack.exercises, ...pack.cues].map((entry) => entry.file);
}

export async function isAudioPackDownloaded(language: Language): Promise<boolean> {
  if (!('caches' in window)) return false;
  const manifest = await loadAudioManifest();
  const cache = await caches.open(CACHE_NAME);
  const matches = await Promise.all(files(manifest.packs[language]).map((file) => cache.match(file)));
  return matches.every(Boolean);
}

export async function downloadAudioPack(language: Language, onProgress?: (completed: number, total: number) => void): Promise<void> {
  if (!('caches' in window)) throw new Error('Cache Storage is unavailable');
  const manifest = await loadAudioManifest();
  const packFiles = files(manifest.packs[language]);
  const cache = await caches.open(CACHE_NAME);
  let completed = 0;
  for (const file of packFiles) {
    if (!await cache.match(file)) {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Unable to download ${file}`);
      await cache.put(file, response);
    }
    completed += 1;
    onProgress?.(completed, packFiles.length);
  }
}

export async function ensureAudioPack(language: Language): Promise<void> {
  if (!await isAudioPackDownloaded(language)) await downloadAudioPack(language);
}
