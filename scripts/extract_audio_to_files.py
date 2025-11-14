#!/usr/bin/env python3
"""
Extract base64-embedded audio entries from exercises/phrases.json into separate files under audio/ and
update the manifest to reference relative file paths instead of data URIs.

Usage: python scripts/extract_audio_to_files.py

Backups:
 - phrases.json -> phrases.json.orig.bak
"""
import base64
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
PHRASES = ROOT / 'exercises' / 'phrases.json'
OUT_DIR = ROOT / 'audio'

DATA_URI_RE = re.compile(r'^data:audio/[^;]+;base64,')

def main():
    if not PHRASES.exists():
        print('phrases.json not found at', PHRASES)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)

    text = PHRASES.read_text(encoding='utf-8')
    # backup original
    bak = PHRASES.with_suffix('.orig.bak')
    bak.write_text(text, encoding='utf-8')
    print('Backup wrote to', bak.name)

    phrases = json.loads(text)
    changed = False

    for p in phrases:
        if not isinstance(p, dict):
            continue
        pid = p.get('id')
        if not pid:
            continue
        audio = p.get('audio')
        if not isinstance(audio, dict):
            continue
        for loc, val in list(audio.items()):
            if isinstance(val, str) and DATA_URI_RE.match(val):
                prefix = f'data:audio/'
                # decode
                b64 = DATA_URI_RE.sub('', val)
                try:
                    raw = base64.b64decode(b64)
                except Exception as e:
                    print(f'Failed to decode {pid}.{loc}:', e)
                    continue
                # choose filename
                safe_pid = pid.replace(' ', '_')
                filename = f'{safe_pid}.{loc}.wav'
                outpath = OUT_DIR / filename
                outpath.write_bytes(raw)
                # update manifest to relative path
                p['audio'][loc] = str(Path('audio') / filename)
                changed = True
                print(f'Wrote {outpath} ({len(raw)} bytes)')

    if changed:
        PHRASES.write_text(json.dumps(phrases, ensure_ascii=False, indent=2), encoding='utf-8')
        print('Updated phrases.json to reference audio files.')
    else:
        print('No embedded audio found to extract.')

    return 0

if __name__ == '__main__':
    raise SystemExit(main())
