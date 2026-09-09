"""Crop authored family atlases and validate local WebP card-art delivery.

Generated source atlases are retained outside public/. Cropping/encoding only;
no tinting, compositing, procedural substitutes or artificial duplicate hashes.
"""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
jobs = ROOT.parent / 'duel-art-jobs'
registry = ([json.loads(path.read_text()) for path in sorted(jobs.glob('*.json'))]
            if jobs.exists() else json.loads((ROOT / 'scripts/duel-art-generated.json').read_text()))
manifests = {'veto-h': {}, 'gett-oh': {}}
previous = {}
accepted_batch = {card['id']: batch['key'] for batch in registry for card in batch['cards']}
for theme in manifests:
    cached = ROOT / 'public/games' / theme / 'assets/art-manifest.json'
    previous[theme] = json.loads(cached.read_text())['cards'] if cached.exists() else {}
for batch in registry:
    if not batch.get('path'):
        continue
    source_path = Path(batch['path'])
    if not source_path.is_absolute():
        source_path = ROOT.parent / source_path
    with Image.open(source_path) as source:
        source.load()
        for index, card in enumerate(batch['cards']):
            if accepted_batch[card['id']] != batch['key']:
                continue
            destination = ROOT / 'public/games' / batch['theme'] / 'assets/cards' / f"{card['id']}.webp"
            cached = previous[batch['theme']].get(card['id'])
            if (cached and cached.get('batch') == batch['key'] and cached.get('cell') == index
                    and destination.exists()
                    and hashlib.sha256(destination.read_bytes()).hexdigest() == cached.get('sha256')):
                manifests[batch['theme']][card['id']] = cached
                continue
            column, row = index % 4, index // 4
            if batch.get('single'):
                cell = source.copy()
            else:
                left, right = round(column * source.width / 4), round((column + 1) * source.width / 4)
                top, bottom = round(row * source.height / 3), round((row + 1) * source.height / 3)
                # Two pixels inside each boundary exclude generated panel seams.
                cell = source.crop((left+2, top+2, right-2, bottom-2))
            cell = ImageOps.fit(cell.convert('RGB'), (400, 300), Image.Resampling.LANCZOS)
            destination.parent.mkdir(parents=True, exist_ok=True)
            cell.save(destination, 'WEBP', quality=85, method=6)
            data = destination.read_bytes()
            with Image.open(destination) as verified:
                verified.load()
                assert verified.size == (400, 300)
            manifests[batch['theme']][card['id']] = {
                'path': f"/games/{batch['theme']}/assets/cards/{card['id']}.webp",
                'width': 400, 'height': 300, 'bytes': len(data),
                'sha256': hashlib.sha256(data).hexdigest(), 'batch': batch['key'],
                'cell': index, 'sourceName': card['name']
            }
for theme, cards in manifests.items():
    hashes = [card['sha256'] for card in cards.values()]
    assert len(hashes) == len(set(hashes)), f'{theme}: duplicate art'
    sizes = sorted(card['bytes'] for card in cards.values())
    summary = {'coverage': len(cards), 'totalBytes': sum(sizes),
               'averageBytes': round(sum(sizes) / len(sizes)) if sizes else 0,
               'p95Bytes': sizes[min(len(sizes)-1, int(len(sizes)*.95))] if sizes else 0,
               'maxBytes': max(sizes, default=0), 'duplicateHashes': 0, 'dimensions': [400,300]}
    target = ROOT / 'public/games' / theme / 'assets/art-manifest.json'
    target.write_text(json.dumps({'summary': summary, 'cards': cards}, ensure_ascii=False, indent=2)+'\n')
    print(theme, json.dumps(summary))

# Portable provenance: original atlases stay in generated_images/, outside the
# shipping graph. Only optimized individual WebPs are served to players.
provenance = []
for batch in registry:
    source_path = Path(batch['path'])
    if not source_path.is_absolute():
        source_path = ROOT.parent / source_path
    row = {key: batch[key] for key in ['key','theme','prompt','single','reason'] if key in batch}
    row['path'] = 'generated_images/' + source_path.name
    row['sourceSha256'] = hashlib.sha256(source_path.read_bytes()).hexdigest()
    row['cards'] = [{'id': card['id'], 'name': card['name']} for card in batch['cards']]
    provenance.append(row)
(ROOT / 'scripts/duel-art-generated.json').write_text(json.dumps(provenance, ensure_ascii=False, indent=2)+'\n')
