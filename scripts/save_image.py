"""Download one web image and store it as /assets/img/<id>.webp.
Usage: save_image.py <id> <direct-image-url> [referer]
Prints JSON with width/height/bytes. Refuses tiny/placeholder images (<300px wide)."""
import json, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'public/assets/img'
DEST.mkdir(parents=True, exist_ok=True)
image_id, url = sys.argv[1], sys.argv[2]
referer = sys.argv[3] if len(sys.argv) > 3 else None
if not all(c.isalnum() or c == '-' for c in image_id):
    raise SystemExit('id must be lowercase-kebab')
headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36 AvaCultureAtlas/0.2'}
if referer:
    headers['Referer'] = referer
import re
m = re.match(r'https://upload\.wikimedia\.org/wikipedia/commons/thumb/\w/\w\w/([^/]+)/', url)
if m:  # Commons rejects arbitrary thumb widths; use the sanctioned FilePath redirect instead
    url = f'https://commons.wikimedia.org/wiki/Special:FilePath/{m[1]}?width=960'
raw = DEST / f'{image_id}.source'
raw.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=40).read())
out = DEST / f'{image_id}.webp'
try:
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(raw), '-frames:v', '1', '-vf', 'scale=min(900\\,iw):-2', '-quality', '78', str(out)], check=True)
finally:
    raw.unlink(missing_ok=True)
probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', str(out)], capture_output=True, text=True)
stream = json.loads(probe.stdout or '{}').get('streams', [{}])[0]
if stream.get('width', 0) < 300:
    out.unlink(missing_ok=True)
    raise SystemExit(f'rejected: too small {stream}')
print(json.dumps({'id': image_id, 'path': f'/assets/img/{image_id}.webp', **stream, 'bytes': out.stat().st_size}))
