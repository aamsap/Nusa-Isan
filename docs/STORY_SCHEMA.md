# Story group files (`src/stories/*.json`)

One file per modal. A modal covers one province, or a merged group of neighbouring
provinces when one province cannot reach three items in every section on its own.

File name: province codes joined with `+`, e.g. `ID_AC.json`, `ID_RI+ID_KR.json`.

```jsonc
{
  "provinces": ["ID_RI", "ID_KR"],          // 1+ codes; merged groups must be geographic neighbours
  "mergeReason": "Kepulauan Riau has fewer than three verifiable foods", // required when provinces.length > 1
  "sections": {
    "clothing": [Item, Item, Item],         // exactly 3 per section for the whole modal
    "food":     [Item, Item, Item],
    "art":      [Item, Item, Item]          // dance, music, craft, tradition
  },
  "landmarks": [Landmark, Landmark, Landmark],
  "facts":     [Fact, Fact, Fact]
}
```

```jsonc
Item = {
  "province": "ID_RI",                       // which province this item belongs to
  "name": {"en": "...", "id": "...", "ja": "..."},
  "note": {"en": "...", "id": "...", "ja": "..."},   // one short sentence, <= 140 chars each
  "source": "https://...",                   // page that supports the claim (not a search page)
  "image": {                                 // optional; null if no trustworthy matching picture
    "id": "riau-food-asam-pedas",            // lowercase-kebab, unique, also the file name
    "path": "/assets/img/riau-food-asam-pedas.webp",
    "title": "Title of the picture or post",
    "artist": "Photographer, account or site name",
    "license": "CC BY-SA 4.0 | Unverified (see source)",
    "licenseUrl": "https://... or null",
    "source": "https://... original post / file page where the picture was published",
    "changes": "Resized and converted to WebP"
  }
}
Landmark = {
  "province": "ID_RI",
  "name": {"en": "...", "id": "...", "ja": "..."},
  "video": "YouTubeID11",                    // must show THIS place; verified via oEmbed
  "videoTitle": "exact oEmbed title",
  "videoAuthor": "exact oEmbed author_name"
}
Fact = {
  "province": "ID_RI",
  "text": {"en": "...", "id": "...", "ja": "..."},
  "source": "https://..."
}
```

Validate with `python3 scripts/validate_stories.py src/stories/<file>.json`.
