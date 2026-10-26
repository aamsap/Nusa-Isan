# Research and media provenance

## Cultural grouping

Current group membership is defined by `src/stories/*.json`, not the old thematic pairs. Exactly three sourced examples per section are shown in 35 modals covering 38 provinces. Three neighbouring pairs share a modal because research did not establish three sufficiently local examples in a section: Papua + Papua Pegunungan, Papua Barat + Papua Barat Daya, Papua Tengah + Papua Selatan. Every merged item retains a province label and every group records its editorial merge reason. This is not a claim that neighbouring communities are culturally interchangeable.

Item-level references accompany clothing, food, art and facts in the JSON and UI. Sources include Indonesian tourism and government pages, heritage collections, journalism, academic articles and Wikipedia. Source quality is not uniform; a reachable page or an automated validator is not a community-informed accuracy review. The previous general UNESCO index and old thematic-pair references are not proof of all current examples. Japanese copy and cultural attribution still need editorial/community review before exhibition.

## Map

[Source dataset and provenance](https://github.com/ahsa29/kpu-osm-boundaries-2026) · [Pinned 2026-10-10 national GeoJSON](https://raw.githubusercontent.com/ahsa29/kpu-osm-boundaries-2026/c4d208a03a71553a1082f960ebdaa88c1d8e9389/data/2026-10-10b/MapNational.geojson) · [ODbL 1.0 data license](https://github.com/ahsa29/kpu-osm-boundaries-2026/blob/main/DATA_LICENSE.md). Adapted and simplified to 4% with shape preservation. Attribution: © OpenStreetMap contributors. This is not an official government map.

## Photos and videos

Current image objects live beside their items in `src/stories/*.json`. There are 49 distinct displayed local WebP photographs under `public/assets/img/`, with an original-post/file-page link, creator, license and conversion note. Existing Commons seed metadata remains in `src/media.json`. A source link is attribution, not reuse permission. If an image with an unverified license is added, its metadata must use `licenseUrl: null` and a visible unverified-license label; do not invent a Creative Commons license. Landmark cards use video only.

The GitHub mark under `public/assets/icons/github.svg` comes from [Primer Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg), MIT © GitHub Inc. The included license text is `public/assets/icons/LICENSE`. The creator links are to [Aam’s profile](https://github.com/aamsap), not a published repository for this project.

Each current landmark in `src/stories/*.json` records the video ID, exact title and uploader. The 105 distinct current IDs were independently checked against live YouTube oEmbed on 2026-10-26, with all title/uploader fields matching. `src/videos.json` is older seed metadata only. Players use YouTube's privacy-enhanced domain; actual footage coverage and playback availability still require review on the event device/network. Removed or restricted videos must not be silently replaced by unrelated footage. Sulawesi Tengah now uses Danau Paisupok instead of Air Terjun Saluopa.
