# Product requirements: Indonesian Cultures Interactive Maps

## Goal and audience

Create a friendly, interactive introduction to Indonesian cultures for visitors at an event in Japan. Users can explore an Indonesia map, discover province-specific practices, and watch a relevant landmark film when available. The visual direction follows Aam’s supplied **MindMarket** cream-paper, Inter, pill-navigation, green-accent, paper-cut editorial reference.

## Success criteria

- All 38 provinces are clickable geographic regions and available in a text list.
- All 38 provinces open one of 35 modal stories. Each has exactly three clothing, food, arts/traditions, landmark and fact entries. Three sparse neighbour pairs share a modal with both province names and per-item province labels.
- English, Indonesian, and Japanese selection persists; first visit uses Tokyo/Indonesian browser time zones or English otherwise.
- Web-sourced images carry file-level creator, source, license and transformation credit; the landmark area contains no photographs and only embeds a video when it actually matches the place.
- Each of the five sections requires exactly three localized entries. Photos are optional and retain original-post links and credits. Each landmark has its own credited YouTube embed, stacked one per row on every viewport.
- A map fullscreen control, decorative layers, and restrained motion add event-friendly spectacle while respecting reduced-motion settings. The map and footer identify the creator through links to `github.com/aamsap`.
- Usable on desktop and mobile, with a keyboard-accessible province list as an alternative to the WebGL map.

## In scope / out of scope

In: 38-region GeoJSON map, Three.js interaction, GSAP animation, searchable list, responsive modal, language switch, cultural facts, curated media credits, tests, source documentation.

Out: ticketing, authentication, user tracking, automatically guessed province photos or footage, offline video playback, unapproved public deployment.

## Milestones

| Milestone | Status | Evidence |
|---|---|---|
| Local scaffold and design direction | Complete | React/TS/Vite, cream-paper editorial system |
| All provinces and three sparse neighbour groups | Complete | 38 geometries matched to 35 saved stories; exact coverage and reciprocal group tests |
| Trilingual interface, persistent choice, map/modal interaction | Complete | Running local browser checks and typecheck |
| Credited imagery and location video curation | Complete for first pass | 49 local credited photos; 105 matching YouTube titles/uploaders independently rechecked by oEmbed |
| Expert cultural/translation review and on-device accessibility testing | Pending | Required before event exhibition |
| Publishing | Pending approval | Local-first decision; no external publication |

## Decisions

| Topic | Decision |
|---|---|
| Scope | Keep all 38 provinces individually selectable; merge only sparse neighbours into a named shared modal. Current pairs: PA+PE, PB+PD, PT+PS. |
| Language | Saved selection first; browser time zone Japan -> Japanese, Indonesia -> Indonesian, otherwise English. Manual switch always available. |
| Network | Online-only is acceptable; videos may require visitor connectivity. |
| Stack | React + TypeScript + Vite, Three.js interactive map, GSAP action animations. |
| Repo | Local first. No private GitHub repo yet. |
| Deployment | This prototype is previewed locally on Jarvis and, while the temporary loopback-only reverse SSH tunnel runs, on Ironheart at `127.0.0.1:5178`. No public atlas route or deployment exists. Any future deployment requires desk approval for the exact version and target. |

## Open decisions / risks

1. **Event date and display hardware** are unspecified. Recommend testing on the actual kiosk/phone, particularly WebGL support and narrow-screen map tapping.
2. **Video playback:** all 105 selected films passed oEmbed metadata lookup, but actual playback must be rechecked on event hardware and network; embedding permissions can change.
3. **Cultural and Japanese copy review:** material currently gives an example, not a definitive portrait of a province. Request review from local practitioners and a native Japanese editor before public presentation.
4. **ODbL redistribution:** the adapted OSM boundary dataset is credited, but confirm database share-alike obligations before public release.

## Checklist

- [x] Build local project under `Projects/indonesian-cultures-interactive-maps`.
- [x] Render current 38 boundaries with interactive selection and accessible list.
- [x] Localize interface and facts in three languages with persisted manual switch.
- [x] Provide exactly three entries in each of five sections per modal; show both names and item ownership for merged neighbours.
- [x] Record individual Commons image provenance and license.
- [x] Curate three landmark videos per modal (105/105 oEmbed titles/uploaders independently rechecked).
- [ ] Have cultural examples and Japanese translations reviewed before event use.
- [ ] Test on the actual event device and screen size.
- [ ] Seek Aam’s approval before creating a repository or deploying.
