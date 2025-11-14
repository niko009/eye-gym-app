#!/usr/bin/env python3
"""
Generate slower Romanian TTS variants for each phrase.

Creates files named audio/<id>.ro.slow.r<rate>.wav using local pyttsx3 voices.
Rates chosen are intentionally low to produce slow, clear speech.
"""
from __future__ import annotations
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHRASES = os.path.join(ROOT, 'exercises', 'phrases.json')
AUDIO = os.path.join(ROOT, 'audio')


def ensure_pyttsx3():
    try:
        import pyttsx3
    except Exception:
        print('Installing pyttsx3...')
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pyttsx3'])


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
    # prefer any voice that mentions 'ro' or 'roman'
    ro_candidates = []
    for v in voices:
        info = ' '.join([str(getattr(v, 'id', '')), str(getattr(v, 'name', '')), str(getattr(v, 'languages', ''))]).lower()
        if 'ro' in info or 'roman' in info:
            ro_candidates.append(v)
    if not ro_candidates:
        # fallback to first available voice or two
        ro_candidates = voices[:1]

    print('Using', len(ro_candidates), 'voice(s) for slow variants')

    # intentionally slow absolute rates (pyttsx3 default ~200)
    slow_rates = [100, 120, 140]

    for p in phrases:
        pid = p.get('id')
        if not pid:
            continue
        t = p.get('text', {})
        text = None
        if isinstance(t, dict):
            text = t.get('ro') or t.get('en')
        elif isinstance(t, str):
            text = t
        if not text:
            print('Skipping', pid, '- no text')
            continue

        for vi, v in enumerate(ro_candidates):
            # create a dedicated engine per voice to avoid state issues
            eng = pyttsx3.init()
            try:
                eng.setProperty('voice', v.id)
            except Exception:
                pass
            base_name = getattr(v, 'name', getattr(v, 'id', f'voice{vi}')).replace(' ', '_')
            for rate in slow_rates:
                try:
                    eng.setProperty('rate', int(rate))
                except Exception:
                    pass
                out_name = f"{pid}.ro.slow.{base_name}.r{rate}.wav"
                out_path = os.path.join(AUDIO, out_name)
                print('Generating', out_name)
                try:
                    eng.save_to_file(text, out_path)
                    eng.runAndWait()
                except Exception as e:
                    print('Error:', e)
            try:
                eng.stop()
            except Exception:
                pass

    print('Done: slow Romanian variants generated in', AUDIO)


if __name__ == '__main__':
    main()
