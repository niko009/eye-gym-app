import json
from pathlib import Path
p = Path('exercises')
texts = set()
total = 0
for f in p.glob('*.json'):
    data = json.loads(f.read_text(encoding='utf-8'))
    for ex in data:
        steps = ex.get('steps', [])
        total += len(steps)
        for step in steps:
            instr = step.get('instruction', {}).get('en', '').strip()
            if instr:
                texts.add(instr)
print('total_steps=', total)
print('unique_en_instructions=', len(texts))
# list them (optional)
for t in sorted(texts):
    print('-', t)
