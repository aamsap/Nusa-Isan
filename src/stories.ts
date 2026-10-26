import type { Language } from './content';

export type Localized = Record<Language, string>;
export type SectionKind = 'clothing' | 'food' | 'art';
export type StoryImage = { id: string; path: string; title: string; artist: string; license: string; licenseUrl: string | null; source: string; changes: string };
export type StoryItem = { province: string; name: Localized; note: Localized; source: string; image: StoryImage | null };
export type StoryLandmark = { province: string; name: Localized; video: string; videoTitle: string; videoAuthor: string };
export type StoryFact = { province: string; text: Localized; source: string };
export type StoryGroup = {
  provinces: string[];
  mergeReason?: string;
  sections: Record<SectionKind, StoryItem[]>;
  landmarks: StoryLandmark[];
  facts: StoryFact[];
};

export const sectionKinds: SectionKind[] = ['clothing', 'food', 'art'];
const files = import.meta.glob<StoryGroup>('./stories/*.json', { eager: true, import: 'default' });
export const storyGroups: StoryGroup[] = Object.values(files);
export const groupByProvince: Record<string, StoryGroup> = Object.fromEntries(storyGroups.flatMap(group => group.provinces.map(code => [code, group])));

/** Province codes shown together in one modal (a merged neighbour group, or just the province itself). */
export function selectionFor(code: string): string[] { return groupByProvince[code]?.provinces ?? [code]; }

export function storyImages(group: StoryGroup): StoryImage[] {
  return sectionKinds.flatMap(kind => group.sections[kind].map(item => item.image)).filter((image): image is StoryImage => Boolean(image));
}
