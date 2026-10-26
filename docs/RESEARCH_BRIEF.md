# Research brief: Indonesian cultural atlas, 3 items per section

Project: /home/aam_jarvis/Projects/indonesian-cultures-interactive-maps (React/Vite, local event app for a cultural event in Japan).
Each province modal must show EXACTLY 3 items in each of: clothing, food, art (dance/music/craft/tradition), landmarks (YouTube video each), facts.

## What you produce
For every province in your batch, write `src/stories/<CODES>.json` following `docs/STORY_SCHEMA.md` exactly,
then run `python3 scripts/validate_stories.py src/stories/<file>.json` until it prints OK.

## Merge rule
If a province cannot reach 3 well-sourced items in ANY section, merge it with ONE geographically neighbouring
province (land border or nearest across a strait) from your batch into ONE file, e.g. `ID_RI+ID_KR.json`.
The merged modal still needs exactly 3 per section in total, each item tagged with its own `province`.
Prefer mixing items from both provinces. Set `mergeReason` (English, one sentence, what was missing).
Do NOT merge provinces that can stand alone. Never merge across batches.

## Starting material (reuse it)
- `docs/seed/<CODE>.json`: the current primary clothing/food/art/landmark, the current photo with its
  credit (`primary_image`, already at /assets/img/<id>.webp; reuse its exact metadata), the current verified
  YouTube video (`existing_video`: id/title/author), current fact (en/id/ja) and source.
- `src/storyExtras.ts`: extra items already researched for ID_JK, ID_JB, ID_YO, ID_BA (reuse names/sources/images; their
  image metadata is in `src/media.json` by id).
- `src/culturalTranslations.ts`: existing ID/JA names of the primary items.
Keep the existing primary item as item #1 of its section unless it is wrong.

## Sources and images (the owner's explicit decision)
- Each item needs a `source`: a real page that names the item for that province (official tourism sites such as
  indonesia.travel, provincial/kabupaten government sites, kemdikbud warisanbudaya.kemdikbud.go.id, UNESCO,
  Wikipedia, reputable news). Not a search-results page. Open it and confirm it mentions the item.
- Images: the owner allows ANY web image as long as the original post is linked. Prefer Wikimedia Commons
  (record its real license), but news/tourism/blog images are fine: set `license` to "Unverified (see source)",
  `licenseUrl` null, `artist` to the photographer or site name, `source` to the page where the photo was published.
- Download with: `PATH=$PATH:/home/aam_jarvis/.hermes/tools/ffmpeg-9.0.1-linux-x64/bin python3 scripts/save_image.py <id> <direct-image-url> [referer-page]`
  This writes `public/assets/img/<id>.webp`. Image ids: `<province-slug>-<section>-<item-slug>`, lowercase-kebab.
- An image must clearly show THAT item (look at it with vision_analyze on the saved webp before keeping it).
  Wrong or generic image -> delete only that file you created and set `"image": null`. Text-only items are acceptable.
  Aim for a photo on most items.

## Videos
3 landmarks per modal, each a different real place in that province, each with a YouTube video that actually
shows that place. Verify every ID with `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json`
and copy `title` and `author_name` exactly into videoTitle/videoAuthor. Reuse `existing_video` as landmark #1.
Find candidate videos via web_search (e.g. `site:youtube.com <place> <province>`).

## Text
- name/note/text in en, id, ja. Japanese must be natural Japanese (katakana for proper names), not romaji.
- note: one short descriptive sentence (<=140 chars per language). Facts <=220 chars, each with its own source.
- Be accurate and modest: say "in <community/area>" rather than claiming a whole province.

## Safety (strict)
- Only create/modify: `src/stories/<your files>.json` and `public/assets/img/<ids you created>.webp`.
- Do not edit any other file. Do not delete anything except image files you yourself created in this task.
  No rm -rf, no moving directories, no git, no npm installs.

## Final answer
Return: files written, merged groups with reason, count of items with images vs null, any item whose source
you could not open/confirm, and the validator output.
