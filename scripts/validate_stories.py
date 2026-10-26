"""Validate story group files against docs/STORY_SCHEMA.md. Usage: validate_stories.py [files...]"""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CODES = set(re.findall(r"code:'(ID_\w+)'", (ROOT / 'src/content.ts').read_text()))
LANGS = ('en', 'id', 'ja')
SECTIONS = ('clothing', 'food', 'art')


def localized(value, where, errors, limit=None):
    if not isinstance(value, dict) or any(not isinstance(value.get(k), str) or not value[k].strip() for k in LANGS):
        errors.append(f'{where}: needs non-empty en/id/ja')
        return
    if not re.search(r'[\u3040-\u30ff\u4e00-\u9fff]', value['ja']):
        errors.append(f'{where}: ja has no Japanese characters')
    if limit and any(len(value[k]) > limit for k in LANGS):
        errors.append(f'{where}: longer than {limit} chars')


def url(value, where, errors):
    if not isinstance(value, str) or not value.startswith('https://') or 'google.' in value and '/search' in value:
        errors.append(f'{where}: needs an https source page (not a search page)')


def check(path):
    errors = []
    data = json.loads(path.read_text())
    provinces = data.get('provinces') or []
    if not provinces or any(p not in CODES for p in provinces):
        errors.append(f'provinces invalid: {provinces}')
    if path.stem != '+'.join(provinces):
        errors.append(f'file name must be {"+".join(provinces)}.json')
    if len(provinces) > 1 and not str(data.get('mergeReason', '')).strip():
        errors.append('mergeReason required for merged group')
    def owner(item, where):
        if item.get('province') not in provinces:
            errors.append(f'{where}: province must be one of {provinces}')
    for section in SECTIONS:
        items = data.get('sections', {}).get(section, [])
        if len(items) != 3:
            errors.append(f'{section}: exactly 3 items required, got {len(items)}')
        for i, item in enumerate(items):
            w = f'{section}[{i}]'
            owner(item, w); localized(item.get('name'), w + '.name', errors); localized(item.get('note'), w + '.note', errors, 140); url(item.get('source'), w + '.source', errors)
            image = item.get('image')
            if image:
                for key in ('id', 'path', 'title', 'artist', 'license', 'source', 'changes'):
                    if not str(image.get(key) or '').strip():
                        errors.append(f'{w}.image.{key} missing')
                url(image.get('source'), w + '.image.source', errors)
                if image.get('path') != f"/assets/img/{image.get('id')}.webp" or not (ROOT / 'public' / str(image.get('path', '')).lstrip('/')).is_file():
                    errors.append(f'{w}.image: file public{image.get("path")} missing or path != /assets/img/<id>.webp')
    for key, n in (('landmarks', 3), ('facts', 3)):
        items = data.get(key, [])
        if len(items) != n:
            errors.append(f'{key}: exactly {n} required, got {len(items)}')
        for i, item in enumerate(items):
            w = f'{key}[{i}]'; owner(item, w)
            if key == 'landmarks':
                localized(item.get('name'), w + '.name', errors)
                if not re.fullmatch(r'[\w-]{11}', str(item.get('video', ''))) or not item.get('videoTitle') or not item.get('videoAuthor'):
                    errors.append(f'{w}: video id/title/author required')
            else:
                localized(item.get('text'), w + '.text', errors, 220); url(item.get('source'), w + '.source', errors)
    videos = [l.get('video') for l in data.get('landmarks', [])]
    if len(set(videos)) != len(videos):
        errors.append('duplicate landmark videos')
    return errors


files = [Path(a) for a in sys.argv[1:]] or sorted((ROOT / 'src/stories').glob('*.json'))
bad = 0
for f in files:
    errs = check(f)
    print(('OK  ' if not errs else 'FAIL'), f.name)
    for e in errs:
        print('   -', e)
    bad += bool(errs)
seen = {}
for f in files:
    for p in json.loads(f.read_text()).get('provinces', []):
        if p in seen:
            print(f'FAIL duplicate province {p} in {seen[p]} and {f.name}'); bad += 1
        seen[p] = f.name
sys.exit(1 if bad else 0)
