import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { cultures, selectionFor } from './content';
import { storyGroups, sectionKinds } from './stories';
import videos from './videos.json';
import { languageFor } from './i18n';
import { culturalTerm, missingTranslations } from './culturalTranslations';

const map = JSON.parse(readFileSync(new URL('../public/data/indonesia.geojson', import.meta.url), 'utf8')) as {features: {properties: {code: string}}[]};

describe('cultural atlas coverage', () => {
  it('matches each of the 38 geographic provinces exactly once', () => {
    expect(cultures).toHaveLength(38);
    expect(new Set(cultures.map(item => item.code)).size).toBe(38);
    expect(cultures.map(item => item.code).sort()).toEqual(map.features.map(item => item.properties.code).sort());
  });
  it('includes all five sections and a translated fact on each province', () => {
    for (const item of cultures) {
      for (const field of ['clothing','food','art','landmark','source'] as const) expect(item[field].length).toBeGreaterThan(2);
      for (const language of ['en','id','ja'] as const) expect(item.fact[language].length).toBeGreaterThan(8);
    }
  });
  it('covers every province in exactly one story modal; merged modals are reciprocal', () => {
    const covered = storyGroups.flatMap(group => group.provinces);
    expect(covered.sort()).toEqual(cultures.map(item => item.code).sort());
    for (const group of storyGroups) for (const code of group.provinces) expect(selectionFor(code)).toEqual(group.provinces);
    for (const group of storyGroups.filter(group => group.provinces.length > 1)) expect(group.mergeReason?.length).toBeGreaterThan(10);
  });
  it('fills every section with exactly three sourced, localized items', () => {
    expect(storyGroups.length).toBeGreaterThan(0);
    const videosSeen = new Set<string>();
    for (const group of storyGroups) {
      const lists = [...sectionKinds.map(kind => group.sections[kind]), group.landmarks, group.facts];
      for (const list of lists) expect(list).toHaveLength(3);
      for (const kind of sectionKinds) for (const item of group.sections[kind]) {
        expect(group.provinces).toContain(item.province);
        for (const language of ['en', 'id', 'ja'] as const) { expect(item.name[language].length).toBeGreaterThan(1); expect(item.note[language].length).toBeGreaterThan(5); }
        expect(item.source).toMatch(/^https:\/\//);
        if (item.image) {
          expect(item.image.path).toBe(`/assets/img/${item.image.id}.webp`);
          expect(existsSync(new URL(`../public${item.image.path}`, import.meta.url))).toBe(true);
          expect(item.image.source).toMatch(/^https:\/\//);
          expect(item.image.artist).toBeTruthy();
        }
      }
      for (const fact of group.facts) {
        expect(group.provinces).toContain(fact.province);
        expect(fact.source).toMatch(/^https:\/\//);
        for (const language of ['en', 'id', 'ja'] as const) expect(fact.text[language].length).toBeGreaterThan(5);
      }
      for (const landmark of group.landmarks) {
        expect(group.provinces).toContain(landmark.province);
        for (const language of ['en', 'id', 'ja'] as const) expect(landmark.name[language].length).toBeGreaterThan(1);
        expect(landmark.video).toMatch(/^[A-Za-z0-9_-]{11}$/);
        expect(landmark.videoTitle && landmark.videoAuthor).toBeTruthy();
        expect(videosSeen.has(landmark.video)).toBe(false); videosSeen.add(landmark.video);
      }
    }
  });
  it('picks Japan or Indonesia by time zone, then honours saved language', () => {
    expect(languageFor('Asia/Tokyo', null)).toBe('ja');
    for (const zone of ['Asia/Jakarta','Asia/Makassar','Asia/Jayapura','Asia/Pontianak']) expect(languageFor(zone, null)).toBe('id');
    expect(languageFor('Europe/Paris', null)).toBe('en');
    expect(languageFor('Asia/Tokyo', 'en')).toBe('en');
  });
  it('covers all province-specific cultural labels in both translated languages', () => {
    expect(missingTranslations(cultures.map(item => item.code))).toEqual([]);
    for (const item of cultures) for (const language of ['id','ja'] as const) {
      for (const field of ['community','clothing','art','landmark'] as const) expect(culturalTerm(item, field, language).length).toBeGreaterThan(2);
    }
  });
  it('uses a credited, place-specific YouTube video ID for every province', () => {
    expect(cultures.every(item => Boolean(item.video))).toBe(true);
    expect(new Set(cultures.map(item => item.video)).size).toBe(38);
    for (const item of cultures) {
      expect(item.video).toMatch(/^[A-Za-z0-9_-]{11}$/);
      const record = (videos as Record<string,{title:string;author:string;source:string}>)[item.video!];
      expect(record?.author).toBeTruthy();
      expect(record?.source).toBe(`https://www.youtube.com/watch?v=${item.video}`);
    }
  });
});
