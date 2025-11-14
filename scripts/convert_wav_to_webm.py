#!/usr/bin/env python3
"""
Transcode WAV files in `audio/` to Opus-in-WebM and update `exercises/phrases.json`.

Behavior:
- Finds `audio/*.wav` (excluding backups like `.bak.`) and transcodes to `audio/<id>.webm` using ffmpeg (libopus, 48kbit)
- Leaves original WAV files in place as backups/reserves
- Backs up `exercises/phrases.json` to `exercises/phrases.json.bak.<timestamp>` then replaces any `.wav` paths with `.webm`
- Prints before/after sizes and a summary
"""
from __future__ import annotations
import json
import os
import shutil
import subprocess
import sys
import time


ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO_DIR = os.path.join(ROOT, 'audio')
PHRASES_PATH = os.path.join(ROOT, 'exercises', 'phrases.json')


def list_wav_files():
    if not os.path.isdir(AUDIO_DIR):
        return []
    files = []
    for f in os.listdir(AUDIO_DIR):
        lf = f.lower()
        if lf.endswith('.wav') and '.bak.' not in lf:
            files.append(os.path.join(AUDIO_DIR, f))
    return sorted(files)


def transcode(in_path, out_path):
    cmd = [
        'ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
        '-i', in_path,
        '-c:a', 'libopus', '-b:a', '48k',
        out_path
    ]
    print('Running:', ' '.join(cmd))
    subprocess.check_call(cmd)


def backup_phrases():
    ts = int(time.time())
    bak = PHRASES_PATH + f'.bak.{ts}'
    shutil.copy2(PHRASES_PATH, bak)
    print('Backed up phrases.json ->', bak)
    return bak


def update_phrases_json():
    with open(PHRASES_PATH, 'r', encoding='utf-8') as f:
        phrases = json.load(f)

    changed = False
    for p in phrases:
        aud = p.get('audio')
        if not isinstance(aud, dict):
            continue
        for lang, path in list(aud.items()):
            if isinstance(path, str) and path.lower().endswith('.wav'):
                newp = path[:-4] + '.webm'
                aud[lang] = newp
                changed = True

    if changed:
        with open(PHRASES_PATH, 'w', encoding='utf-8') as f:
            json.dump(phrases, f, ensure_ascii=False, indent=2)
        print('Updated', PHRASES_PATH)
    else:
        print('No .wav entries found in', PHRASES_PATH)


def print_sizes(files):
    for f in files:
        if os.path.exists(f):
            print(os.path.basename(f), os.path.getsize(f))


def main():
    wavs = list_wav_files()
    if not wavs:
        print('No WAV files found in', AUDIO_DIR)
        return

    print('Found WAV files:')
    print_sizes(wavs)

    # Transcode each wav to webm
    created = []
    for w in wavs:
        base = os.path.splitext(os.path.basename(w))[0]
        out = os.path.join(AUDIO_DIR, base + '.webm')
        try:
            transcode(w, out)
            created.append(out)
        except subprocess.CalledProcessError as e:
            print('ffmpeg failed for', w, '->', e)
            sys.exit(1)

    print('\nCreated WebM files:')
    print_sizes(created)

    # Backup and update phrases.json
    backup_phrases()
    update_phrases_json()

    print('\nDone. WAV files left in place as reserves. Manifest updated to .webm paths.')


if __name__ == '__main__':
    main()
