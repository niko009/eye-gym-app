#!/usr/bin/env python3
"""
Regenerate Romanian TTS audio files for phrases in exercises/phrases.json.

Behavior:
- Loads `exercises/phrases.json` (expects a list of phrase objects with `id`, `text.ro`).
- For each phrase, generates `audio/<id>.ro.wav` using pyttsx3.
- If an existing file exists, moves it to `<file>.bak.<timestamp>`.
- Tries to pick a voice that looks like Romanian; otherwise uses the default voice.

This script will pip-install pyttsx3 if it is missing.
"""
from __future__ import annotations
import json
import os
import sys
import time
import shutil
import subprocess


def ensure_pyttsx3() -> None:
    try:
        import pyttsx3  # noqa: F401
    except Exception:
        print("pyttsx3 not found, installing via pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pyttsx3"])


def choose_ro_voice(engine):
    voices = engine.getProperty('voices')
    candidates = []
    for v in voices:
        # voice object fields vary; try id and name and languages
        info = ' '.join([str(getattr(v, 'id', '')), str(getattr(v, 'name', '')), str(getattr(v, 'languages', ''))]).lower()
        if 'ro' in info or 'roman' in info:
            candidates.append(v)
    if candidates:
        # return the first candidate's id
        print(f"Found Romanian-like voice: {getattr(candidates[0], 'name', candidates[0].id)}")
        return candidates[0].id
    # nothing obvious found
    print("No Romanian-specific voice found; using default voice.")
    return None


def main():
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    phrases_path = os.path.join(root, 'exercises', 'phrases.json')
    audio_dir = os.path.join(root, 'audio')
    if not os.path.exists(phrases_path):
        print(f"Could not find {phrases_path}")
        sys.exit(2)
    os.makedirs(audio_dir, exist_ok=True)

    ensure_pyttsx3()
    import pyttsx3

    with open(phrases_path, 'r', encoding='utf-8') as f:
        phrases = json.load(f)

    engine = pyttsx3.init()
    # tuning: calm voice: slower rate
    try:
        rate = engine.getProperty('rate')
        engine.setProperty('rate', max(120, int(rate * 0.9)))
    except Exception:
        pass

    ro_voice = choose_ro_voice(engine)
    if ro_voice:
        try:
            engine.setProperty('voice', ro_voice)
        except Exception:
            print(f"Failed to set voice {ro_voice}, continuing with default.")

    for p in phrases:
        pid = p.get('id')
        if not pid:
            continue
        text = None
        t = p.get('text', {})
        if isinstance(t, dict):
            text = t.get('ro') or t.get('en')
        elif isinstance(t, str):
            text = t
        if not text:
            print(f"Skipping {pid}: no text.ro available")
            continue

        out_path = os.path.join(audio_dir, f"{pid}.ro.wav")
        if os.path.exists(out_path):
            bak = out_path + f".bak.{int(time.time())}"
            print(f"Backing up existing {out_path} -> {bak}")
            shutil.move(out_path, bak)

        print(f"Synthesizing '{pid}' (ro) -> {out_path}")
        try:
            engine.save_to_file(text, out_path)
            engine.runAndWait()
        except Exception as e:
            print(f"Error generating {out_path}: {e}")

    print("Done. Regenerated Romanian audio files in audio/ (backups for overwritten files created).")


if __name__ == '__main__':
    main()
