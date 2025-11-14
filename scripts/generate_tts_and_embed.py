#!/usr/bin/env python3
"""
Generate calm TTS WAV files (en/ru/ro) for two phrases and embed them into exercises/phrases.json as data:audio/wav;base64,...

Requires: pyttsx3 (install via pip)

This script will:
 - read exercises/phrases.json
 - for each target phrase id (close_eyes_and_rest, hold_pen_arm_length) and each locale (en, ru, ro):
     - synthesize a short calm voice WAV using pyttsx3
     - base64-encode the WAV and set phrases[id]['audio'][lang] = data:audio/wav;base64,...
 - back up the original phrases.json to phrases.json.bak
 - write the modified phrases.json

Run: python scripts/generate_tts_and_embed.py
"""
import base64
import json
import os
import sys
from pathlib import Path
import tempfile

TARGET_IDS = ["close_eyes_and_rest", "hold_pen_arm_length"]
LOCALES = ["en", "ru", "ro"]

ROOT = Path(__file__).resolve().parents[1]
PHRASES_PATH = ROOT / 'exercises' / 'phrases.json'


def choose_voice_for_locale(engine, locale_code):
    # Try to pick a voice whose languages contain the locale code (loose match)
    voices = engine.getProperty('voices')
    lc = locale_code.lower()
    for v in voices:
        try:
            langs = getattr(v, 'languages', None)
            if langs:
                # languages may be list of bytes or strings
                for L in langs:
                    s = L.decode('utf-8') if isinstance(L, (bytes, bytearray)) else str(L)
                    if lc in s.lower():
                        return v.id
        except Exception:
            continue
    # fallback: for 'ru' prefer any voice with 'r' in name; otherwise return first
    for v in voices:
        if lc in (v.name or '').lower():
            return v.id
    return voices[0].id if voices else None


def synthesize_to_wav(engine, text, out_path, voice_id=None, rate=140, volume=1.0):
    # Configure engine
    if voice_id:
        try:
            engine.setProperty('voice', voice_id)
        except Exception:
            pass
    try:
        engine.setProperty('rate', rate)
    except Exception:
        pass
    try:
        engine.setProperty('volume', volume)
    except Exception:
        pass

    # Use save_to_file and runAndWait to produce file
    engine.save_to_file(text, str(out_path))
    engine.runAndWait()


def main():
    try:
        import pyttsx3
    except Exception as e:
        print('pyttsx3 is required. Install with: pip install pyttsx3', file=sys.stderr)
        sys.exit(2)

    if not PHRASES_PATH.exists():
        print('phrases.json not found at', PHRASES_PATH)
        sys.exit(1)

    with PHRASES_PATH.open('r', encoding='utf-8') as fh:
        phrases = json.load(fh)

    # map by id
    pid_map = {p['id']: p for p in phrases if isinstance(p, dict) and 'id' in p}

    engine = pyttsx3.init()

    # make a copy of engine voices listing once
    voices = engine.getProperty('voices')
    print('Found voices:', len(voices))

    updated = False

    for pid in TARGET_IDS:
        if pid not in pid_map:
            print(f'Warning: phrase id {pid} not found in phrases.json; skipping')
            continue
        p = pid_map[pid]
        # ensure audio field exists
        if 'audio' not in p or not isinstance(p['audio'], dict):
            p['audio'] = {}

        for loc in LOCALES:
            text = ''
            try:
                text = p.get('text', {}).get(loc) or p.get('text', {}).get('en') or ''
            except Exception:
                text = ''
            if not text:
                print(f'No text for {pid}.{loc}; skipping')
                continue

            # choose voice
            voice_id = choose_voice_for_locale(engine, loc)
            # create temp wav path
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
                wav_path = Path(tmp.name)

            print(f'Synthesizing {pid} [{loc}] -> {wav_path.name} (voice={voice_id})')
            # set slightly slower rate for calm voice
            try:
                synthesize_to_wav(engine, text, wav_path, voice_id=voice_id, rate=140, volume=1.0)
            except Exception as e:
                print('Synthesis failed for', pid, loc, e)
                if wav_path.exists():
                    wav_path.unlink()
                continue

            # read wav and base64 encode
            try:
                b = wav_path.read_bytes()
                b64 = base64.b64encode(b).decode('ascii')
                data_uri = 'data:audio/wav;base64,' + b64
                p['audio'][loc] = data_uri
                updated = True
                print(f'Embedded {pid}.{loc}: {len(b)} bytes -> {len(b64)} base64 chars')
            finally:
                try:
                    wav_path.unlink()
                except Exception:
                    pass

    if updated:
        bak = PHRASES_PATH.with_suffix('.json.bak')
        PHRASES_PATH.rename(bak)
        with PHRASES_PATH.open('w', encoding='utf-8') as fh:
            json.dump(phrases, fh, ensure_ascii=False, indent=2)
        print('Updated phrases.json written (original moved to', bak.name + ')')
    else:
        print('No updates applied')


if __name__ == '__main__':
    main()
