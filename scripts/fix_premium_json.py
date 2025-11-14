import json
from pathlib import Path
p = Path(__file__).parent.parent / 'exercises' / 'premium.json'
s = p.read_text(encoding='utf-8')

decoder = json.JSONDecoder()
idx = 0
objs = []
length = len(s)
while True:
    try:
        s_strip = s[idx:].lstrip()
        if not s_strip:
            break
        # adjust idx to skip leading whitespace
        lead = len(s[idx:]) - len(s_strip)
        idx += lead
        obj, used = decoder.raw_decode(s[idx:])
        objs.append(obj)
        idx += used
    except ValueError:
        # can't decode more
        break

# If multiple top-level arrays or objects found, merge arrays where appropriate
merged = []
for o in objs:
    if isinstance(o, list):
        merged.extend(o)
    else:
        merged.append(o)

if not merged:
    print('No JSON objects found; aborting')
else:
    new_text = json.dumps(merged, ensure_ascii=False, indent=2)
    p.write_text(new_text, encoding='utf-8')
    print(f'Wrote merged premium.json with {len(merged)} items')
