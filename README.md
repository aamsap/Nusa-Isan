# Indonesian Cultures Interactive Maps

An interactive, multilingual cultural atlas for visitors at an event in Japan. **Status:** local prototype, not published. Built with React, TypeScript, Vite, Three.js, and GSAP.

## Run locally

```bash
npm install
npm run dev       # http://127.0.0.1:5178 (or the next free port)
npm run typecheck
npm test
npm run build
```

## What is here

- A decorative WebGL map with **38 current province boundaries**, animated province reveals and hover feedback, an accessible fullscreen button (Escape exits), pointer selection, highlighted cultural links, and a searchable province list for keyboard access and small islands.
- **35 modal stories cover all 38 selectable provinces. Every modal has exactly three items in each of five sections:** clothing, food, arts/traditions, landmarks, and facts. Each item has English, Indonesian and Japanese text and an item-level source (videos link to YouTube). Sparse neighbours share one modal: Papua + Papua Pegunungan, Papua Barat + Papua Barat Daya, and Papua Tengah + Papua Selatan. Each merged title names both provinces and each item identifies its province. Other provinces, including Riau and Kepulauan Riau, now stand alone. Landmark videos are stacked **one per row**, not a three-column grid.
- English, Indonesian, and Japanese interface, province-specific cultural labels, and cultural facts. Proper food and cultural names remain in their original language. A saved choice wins; otherwise the browser time zone selects Japanese (Tokyo) or Indonesian (Jakarta, Makassar, Jayapura, Pontianak), with English as fallback. Users can change language at any time.
- **49 distinct local, credited photographs** in `public/assets/img/` and **105 credited landmark videos** (three per modal). Photos are optional, so some cards and seven modal groups remain text-only. No landmark photographs are used. Original-image links, creator, license and resizing note appear with each photo. The GitHub icon on the map and creator link in the footer point to [Aam’s profile](https://github.com/aamsap); this local project has **not** been pushed there.

## Source and licensing notes

The simplified `public/data/indonesia.geojson` is adapted from the [October 10, 2026 OSM-derived 38-province dataset](https://github.com/ahsa29/kpu-osm-boundaries-2026/tree/c4d208a03a71553a1082f960ebdaa88c1d8e9389) and retains its **ODbL 1.0** terms. © OpenStreetMap contributors. The original 9.4 MB geometry was simplified with `mapshaper -simplify 4% keep-shapes` to about 477 KB; this is a third-party map, not an official government boundary release. ODbL share-alike requirements should be reviewed before redistribution. [Dataset license](https://github.com/ahsa29/kpu-osm-boundaries-2026/blob/main/DATA_LICENSE.md).

Photos are stored as resized WebP in `public/assets/img/` and individually credited next to their use: creator, **original Commons File page**, license, and conversion note. Their metadata is in `src/media.json`; `scripts/fetch_commons.py` can regenerate the assets or selectively fetch named IDs. CC BY-SA and CC BY licenses apply per image, not to the whole site. Current modal items, sources, image credits and video metadata are in `src/stories/*.json`, loaded through `src/stories.ts`. `src/content.ts`, `src/media.json` and `src/storyExtras.ts` retain earlier seed/fallback data, not the authoritative current modal dataset. The map’s GitHub mark is from [Primer Octicons](https://github.com/primer/octicons) under the MIT license retained at `public/assets/icons/LICENSE`. YouTube videos are embeds; their rights remain with the creators.

Cultural starting references: [UNESCO intangible heritage in Indonesia](https://ich.unesco.org/en/state/indonesia-ID), [Bengkalis government on Zapin Meskom](https://prokopim.bengkaliskab.go.id/web/detailberita/17354/warisan-budaya-bengkalis,-zapin-meskom-catat-rekor-muri-tingkat-dunia), [a primary study on Zapin Penyengat](https://ejournal.yasin-alsys.org/masaliq/article/view/917), and item-level references in `src/stories/*.json`. The general UNESCO list does not substantiate every province-specific entry. Examples do not claim to exhaust a province’s cultures. Older catalogues predate Papua’s newer provinces, so district/community attribution matters. The examples and Japanese translation need local/community review before public exhibition.

## Next

- Recheck YouTube playback on the actual event network and device; oEmbed metadata is not a guarantee against future embedding or regional restrictions.
- Expand image coverage with relevant, licensed work rather than mismatched generic photos.
- Review each cultural example with relevant community or cultural institutions and have Japanese copy checked by a native speaker.
- Test accessibility and performance on actual event hardware, especially small islands and WebGL support.
- Choose a publishing destination only with Aam’s approval. No GitHub repository or deployment has been created.

## Verified local content update (2026-10-26)

- `python3 scripts/validate_stories.py`: all 35 files pass.
- `npm run typecheck`, `npm test` (7 tests), and `npm run build` pass.
- Browser DOM checks: all 38 list selections open a complete modal on desktop and in a 390px iframe viewport; all five sections have three entries, with no horizontal modal overflow and one landmark per row.
- Japanese switching tested inside an open modal. The user-requested Sulawesi Tengah landmark is **Danau Paisupok**, replacing Saluopa.
- All 105 current YouTube IDs were independently rechecked through oEmbed: exact stored title and uploader matched. This is not playback certification.
- Photo-free modal groups: Kalimantan Barat, Riau, Kepulauan Riau, Kalimantan Utara, Sulawesi Barat, Sulawesi Tenggara, and Papua + Papua Pegunungan. These keep sourced text rather than mismatched images.
- Build reports a nonfatal large-JavaScript-chunk warning. No deployment performed.
