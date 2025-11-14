#!/usr/bin/env python3
"""
Compute gzipped sizes for core app files and report totals.

Checks: index.html, all js/*.js, css/*.css, locales/*.json, exercises/*.json
Prints per-file gzipped size and a total. Exits with 0.
"""
from __future__ import annotations
import gzip
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

patterns = [
    ROOT / 'index.html',
    ROOT / 'js',
    ROOT / 'css',
    ROOT / 'locales',
    ROOT / 'exercises',
]


def gather_files():
    files = []
    # index.html
    p = ROOT / 'index.html'
    if p.exists():
        files.append(p)

    # js
    for f in (ROOT / 'js').glob('**/*.js'):
        if f.is_file():
            files.append(f)

    # css
    for f in (ROOT / 'css').glob('**/*.css'):
        if f.is_file():
            files.append(f)

    # locales json
    for f in (ROOT / 'locales').glob('**/*.json'):
        if f.is_file():
            files.append(f)

    # exercises json
    for f in (ROOT / 'exercises').glob('**/*.json'):
        if f.is_file():
            files.append(f)

    return sorted(files)


def gzipped_size(path: Path) -> int:
    b = path.read_bytes()
    return len(gzip.compress(b))


def main():
    files = gather_files()
    out = []
    total = 0
    for f in files:
        try:
            size = gzipped_size(f)
        except Exception as e:
            size = str(e)
        out.append((str(f.relative_to(ROOT)), size))
        if isinstance(size, int):
            total += size

    report = {
        'files': [{ 'path': p, 'gzipped_bytes': s } for p, s in out],
        'total_gzipped_bytes': total,
        'limit_bytes': 120 * 1024,
        'distance_bytes': max(0, (120 * 1024) - total),
    }

    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
#!/usr/bin/env python3
"""
compute_gzip_sizes.py

Print gzipped sizes for index.html and exercises JSON files.

Usage: python scripts/compute_gzip_sizes.py
"""
import gzip
from pathlib import Path

files = [Path('index.html')] + list(Path('exercises').glob('*.json'))
total = 0
for f in files:
    if not f.exists():
        continue
    data = f.read_bytes()
    gz = gzip.compress(data)
    size = len(gz)
    total += size
    print(f'{f}: gzipped {size} bytes')
print('TOTAL gzipped bytes (these files):', total)
