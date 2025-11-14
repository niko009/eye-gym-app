#!/usr/bin/env python3
"""
inject_audio.py

Usage:
  python scripts/inject_audio.py --file exercises/free.json --exercise-id 20-20-20-rule --step 1 --lang en --data-file tmp_free_en.base64.txt

This script reads the base64 file (just base64 text, no data: prefix), constructs a data URI (audio/ogg or audio/mpeg as requested), and inserts it into the specified exercise step's audio_base64 field.
It also sets has_audio=true for that exercise.
"""
import argparse, json
from pathlib import Path

def load_base64(path):
    return Path(path).read_text(encoding='utf-8').strip()

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--file', required=True)
    p.add_argument('--exercise-id', required=True)
    p.add_argument('--step', required=True, type=int)
    p.add_argument('--lang', required=True)
    p.add_argument('--data-file', required=True)
    p.add_argument('--mime', default='audio/opus')
    args = p.parse_args()

    data_path = Path(args.file)
    if not data_path.exists():
        print('File not found:', data_path)
        return

    doc = json.loads(data_path.read_text(encoding='utf-8'))

    b64 = load_base64(args.data_file)
    data_uri = f"data:{args.mime};base64,{b64}"

    updated = False
    for ex in doc:
        if ex.get('id') == args.exercise_id:
            # find step
            for step in ex.get('steps', []):
                if step.get('step_num') == args.step:
                    step['audio_base64'] = data_uri
                    updated = True
                    break
            ex['has_audio'] = True
            break

    if not updated:
        print('Warning: exercise or step not found; updated has_audio flag if exercise matched')

    backup = data_path.with_suffix(data_path.suffix + '.bak')
    backup.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding='utf-8')
    data_path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Injected audio into', args.file)

if __name__ == '__main__':
    main()
