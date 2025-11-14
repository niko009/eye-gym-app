import json
import sys
from pathlib import Path

files = [
    Path('index.html'),
    Path('exercises') / 'free.json',
    Path('exercises') / 'premium.json',
    Path('exercises') / 'phrases.json',
]
root = Path(__file__).parent.parent
ok = True
for f in files:
    p = root / f
    try:
        if p.suffix == '.html':
            # skip parsing html
            print(f"{p.name}: SKIP (html)")
            continue
        with p.open('r', encoding='utf-8') as fh:
            json.load(fh)
        print(f"{p.name}: OK")
    except Exception as e:
        print(f"{p.name}: ERROR: {e}")
        ok = False

sys.exit(0 if ok else 2)
