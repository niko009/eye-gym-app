#!/usr/bin/env python3
"""
Generate multiple Romanian TTS variants for each phrase to allow manual quality selection.

Produces audio/<id>.ro.variant-<n>.wav files (keeps existing files untouched).
Tries to use any voice that mentions 'ro' or 'roman', otherwise uses up to two available voices.
Variants change speech rate (slower/normal/faster) to offer choices.
"""
from __future__ import annotations
import json
import os
import subprocess
import sys
import time


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHRASES = os.path.join(ROOT, 'exercises', 'phrases.json')
AUDIO = os.path.join(ROOT, 'audio')


def ensure_pyttsx3():
    try:
        import pyttsx3
    except Exception:
        print('Installing pyttsx3...')
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pyttsx3'])


def safe_name(s: str) -> str:
    return ''.join(c if c.isalnum() else '_' for c in s)[:40]


def main():
    ensure_pyttsx3()
    import pyttsx3

    if not os.path.exists(PHRASES):
        print('phrases.json not found at', PHRASES)
        sys.exit(2)
    os.makedirs(AUDIO, exist_ok=True)

    with open(PHRASES, 'r', encoding='utf-8') as f:
        phrases = json.load(f)

    engine = pyttsx3.init()
    voices = engine.getProperty('voices')
    print('Found voices:', len(voices))
    for i, v in enumerate(voices[:10]):
        print(i, getattr(v, 'id', ''), getattr(v, 'name', ''), getattr(v, 'languages', ''))

    # find romanian-like voices
    ro_candidates = []
    for v in voices:
        info = ' '.join([str(getattr(v, 'id', '')), str(getattr(v, 'name', '')), str(getattr(v, 'languages', ''))]).lower()
        if 'ro' in info or 'roman' in info:
            ro_candidates.append(v)

    # fallback: take up to 2 voices
    if not ro_candidates:
        ro_candidates = voices[:2]

    print('Using', len(ro_candidates), 'voice(s) for Romanian variants')

    # variant rates multipliers
    rate_factors = [0.9, 1.0, 1.1]

    for p in phrases:
        pid = p.get('id')
        if not pid:
            continue
        text = None
        t = p.get('text')
        if isinstance(t, dict):
            text = t.get('ro') or t.get('en')
        elif isinstance(t, str):
            text = t
        if not text:
            print('Skipping', pid, '— no text.ro')
            continue

        for vi, v in enumerate(ro_candidates):
            voice_name = safe_name(getattr(v, 'name', getattr(v, 'id', f'voice{vi}')))
            # base engine per voice to avoid state cross-talk
            eng = pyttsx3.init()
            try:
                eng.setProperty('voice', v.id)
            except Exception:
                try:
                    eng.setProperty('voice', getattr(v, 'name', v.id))
                except Exception:
                    pass
            try:
                base_rate = eng.getProperty('rate')
            except Exception:
                base_rate = 160

            for ri, f in enumerate(rate_factors, start=1):
                rate = max(80, int(base_rate * f))
                eng.setProperty('rate', rate)
                out_name = f"{pid}.ro.variant-{voice_name}.r{rate}.wav"
                out_path = os.path.join(AUDIO, out_name)
                print('Generating', out_name)
                try:
                    eng.save_to_file(text, out_path)
                    eng.runAndWait()
                except Exception as e:
                    print('Error generating', out_name, e)

            try:
                eng.stop()
            except Exception:
                pass

    print('Done: generated Romanian variant files in', AUDIO)


if __name__ == '__main__':
    main()
