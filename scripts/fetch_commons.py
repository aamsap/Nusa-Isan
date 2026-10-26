"""Fetch manually reviewed Wikimedia Commons files and save explicit attribution metadata."""
import json
import subprocess
import urllib.parse
import urllib.request
from pathlib import Path
from html import unescape
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / 'public/assets/img'
ASSET_DIR.mkdir(parents=True, exist_ok=True)
TARGETS = {
    'aceh-dance': 'Saman Dance, Aceh Indonesia.jpg',
    'north-sumatra-textile': 'Weaving ulos cloth.jpg',
    'west-sumatra-food': 'Beef Rendang..JPG',
    'south-sumatra-food': 'Pempek Palembang.jpg',
    'lampung-textile': "Woman's Ceremonial Skirt (Tapis) MET DP145517.jpg",
    'west-java-dance': 'Jaipong indonesian culture.jpg',
    'central-java-art': 'Wayang Kulit, Central Java cropped.jpg',
    'yogyakarta-food': 'Gudeg Ayam.jpg',
    'bali-dance': 'Kecak Dance Bali.jpg',
    'east-nusa-textile': 'Tenun Ikat Kodi, SBD, NTT.jpg',
    'west-kalimantan-textile': 'Kain Samping Songket Lelaki.jpg',
    'south-sulawesi-culture': 'Tongkonan traditionnal Toraja house.jpg',
    'papua-textile': 'Membuat noken.jpg',
    'south-papua-art': 'Asmat Carving.jpg',
    'jakarta-food': 'Kerak telor Betawi.jpg',
    'banten-dance': 'Debus, The Ancient Martial Art and Culture of Banten.jpg',
    'east-java-food': 'Rawon Setan.jpg',
    'west-nusa-dance': 'Peresean Traditional Sport of Sasak Tribe.jpg',
    'south-kalimantan-food': 'Soto Banjar 1.jpg',
    'north-sulawesi-food': 'Tinutuan bubur Manado.JPG',
    'gorontalo-food': 'Binte Biluhuta.jpg',
    'central-sulawesi-food': 'Sup Kaledo.jpg',
    'maluku-dance': 'Cakalele - Maluku.jpg',
    'jambi-textile': 'Batik-jambi.jpg',
    'bengkulu-food': 'Pendap from Bengkulu - IMG 20220210 181317 298.jpg',
    'bangka-food': 'Lempah kuning.JPG',
    'central-kalimantan-textile': 'Baju Sangkarut.jpg',
    'east-kalimantan-dance': 'Tari Hudoq.jpg',
    'south-sulawesi-food': 'Coto Makassar dish.JPG',
    'north-maluku-food': 'Gohu Ikan in Ternate.jpg',
    'west-papua-dance': 'Tari Tumbu Tanah (1).jpg',
    'central-papua-art': 'Pengukiran patung Mbitoro.jpg',
    'aceh-food': 'Mie Aceh with beef.jpg',
    'bali-food-lilit': 'Sate Lilit.jpg',
    'bali-art-legong': 'Legong Dance Bali Indonesia.jpg',
    'jakarta-clothing': 'Kebaya Encim Betawi 20240622 121405.jpg',
    'jakarta-art': 'Ondel Ondel Betawi.jpg',
    'west-java-food-batagor': 'Batagor Bandung.jpg',
    'west-java-art-angklung': 'Pertunjukan Angklung di Saung Angklung Udjo.jpg',
    'yogyakarta-food-bakpia': 'Bakpia pathuk.jpg',
    'yogyakarta-art-wayang': 'Yogyakarta Indonesia Handcrafting-of-Wayang-kulit-01.jpg',
}
HEADERS = {'User-Agent': 'AvaCultureAtlas/0.1 (educational cultural atlas; info@ilhamsaputra.site)'}

def plain(value):
    return unescape(re.sub(r'<[^>]+>', '', value or '')).strip()

requested = set(sys.argv[1:])
unknown = requested - TARGETS.keys()
if unknown:
    raise SystemExit(f'Unknown image IDs: {sorted(unknown)}')
metadata_path = ROOT / 'src/media.json'
out = [{**item, 'path': '/assets/img/' + item['id'] + '.webp'} for item in json.loads(metadata_path.read_text())] if requested and metadata_path.exists() else []
out = [item for item in out if item['id'] not in requested]
for slug, filename in TARGETS.items():
    if requested and slug not in requested:
        continue
    title = 'File:' + filename
    query = urllib.parse.urlencode({'action': 'query', 'titles': title, 'prop': 'imageinfo', 'iiprop': 'url|extmetadata', 'iiurlwidth': 900, 'format': 'json'})
    url = 'https://commons.wikimedia.org/w/api.php?' + query
    req = urllib.request.Request(url, headers=HEADERS)
    obj = json.load(urllib.request.urlopen(req, timeout=25))
    page = next(iter(obj['query']['pages'].values()))
    if 'missing' in page:
        print('MISSING', title)
        continue
    info = page['imageinfo'][0]
    meta = info['extmetadata']
    license_name = plain(meta.get('LicenseShortName', {}).get('value', ''))
    if not any(s in license_name for s in ('CC BY', 'CC0', 'Public domain', 'PD-')):
        print('SKIP LICENSE', title, license_name)
        continue
    image_url = info.get('thumburl', info['url'])
    raw = ASSET_DIR / (slug + '.source')
    req = urllib.request.Request(image_url, headers=HEADERS)
    raw.write_bytes(urllib.request.urlopen(req, timeout=35).read())
    destination = ASSET_DIR / (slug + '.webp')
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(raw), '-vf', 'scale=min(900\\,iw):-1', '-quality', '78', str(destination)], check=True)
    raw.unlink()
    item = {'id': slug, 'path': '/assets/img/' + slug + '.webp', 'title': filename, 'artist': plain(meta.get('Artist', {}).get('value', 'Unknown')), 'license': license_name, 'licenseUrl': plain(meta.get('LicenseUrl', {}).get('value', '')) or info['descriptionurl'], 'source': info['descriptionurl'], 'changes': 'Resized and converted to WebP'}
    out.append(item)
    print(slug, license_name, destination.stat().st_size)
(ROOT / 'src/media.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n')
print('Saved', len(out), 'image records')
