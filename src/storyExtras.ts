import type { Language } from './content';

export type SectionKind = 'clothing' | 'food' | 'art';
export type StoryExample = { label: Record<Language, string>; image?: string; source: string };
export type LandmarkExample = { label: Record<Language, string>; video: string };
export type StoryExtras = {
  primaryImages?: Partial<Record<SectionKind, string>>;
  additional?: Partial<Record<SectionKind, StoryExample[]>>;
  facts?: StoryExample[];
  landmarks?: LandmarkExample[];
};

const travel = 'https://www.indonesia.travel';
const unesco = 'https://ich.unesco.org';
const name = (en: string, id: string, ja: string): Record<Language, string> => ({ en, id, ja });

// Each additional example is an example from a locality or community, never a claim to represent an entire province.
// Media IDs resolve to Wikimedia Commons File pages and individual licenses in media.json.
export const storyExtras: Record<string, StoryExtras> = {
  ID_AC: {
    primaryImages: { food: 'aceh-food' },
  },
  ID_JK: {
    primaryImages: { clothing: 'jakarta-clothing', art: 'jakarta-art' },
    additional: {
      clothing: [{ label: name('Baju sadariah', 'Baju sadariah', 'バジュ・サダリア'), source: `${travel}/gb/en/travel-ideas/culture/baju-sadariah` }],
      food: [{ label: name('Soto Betawi', 'Soto Betawi', 'ソト・ブタウィ'), source: `${travel}/id/en/travel-ideas/gastronomy/soto-betawi` }],
      art: [{ label: name('Gambang kromong', 'Gambang kromong', 'ガンバン・クロモン'), source: `${travel}/gb/en/travel-ideas/culture/gambang-kromong` }],
    },
  },
  ID_JB: {
    additional: {
      food: [{ label: name('Batagor Bandung', 'Batagor Bandung', 'バタゴール・バンドン'), image: 'west-java-food-batagor', source: `${travel}/sa/en/travel-ideas/gastronomy/dont-miss-these-5-must-try-street-foods-in-bandung` }],
      art: [{ label: name('Angklung', 'Angklung', 'アンクルン'), image: 'west-java-art-angklung', source: `${unesco}/en/RL/indonesian-angklung-00393` }],
    },
  },
  ID_YO: {
    additional: {
      food: [{ label: name('Bakpia Pathok', 'Bakpia Pathok', 'バクピア・パトック'), image: 'yogyakarta-food-bakpia', source: `${travel}/gb/en/travel-ideas/adventure/15-amazing-experience-s-you-can-get-in-yogyakarta` }],
      art: [{ label: name('Wayang kulit', 'Wayang kulit', 'ワヤン・クリッ'), image: 'yogyakarta-art-wayang', source: `${unesco}/en/RL/wayang-puppet-theatre-00063` }],
    },
  },
  ID_BA: {
    facts: [
      { label: name('Legong dance is accompanied by gamelan music.', 'Tari Legong diiringi musik gamelan.', 'レゴン舞踊はガムランの伴奏に合わせて踊られます。'), source: `${travel}/gb/en/travel-ideas/culture/legong-dance-the-exquisite-classical-dance-of-bali` },
      { label: name('Barong and Rangda embody the struggle between good and evil in Balinese dance.', 'Barong dan Rangda melambangkan pertarungan kebaikan dan kejahatan dalam tarian Bali.', 'バロンとランダは、バリ舞踊の中で善と悪の戦いを象徴します。'), source: `${travel}/id/id/travel-ideas/culture/barong` },
    ],
    landmarks: [{ label: name('Uluwatu Temple', 'Pura Uluwatu', 'ウルワツ寺院'), video: 'ZSn3Z-CN2jM' }],
    additional: {
      clothing: [
        { label: name('Udeng headcloth', 'Udeng', 'ウデン（頭布）'), source: `${travel}/id/id/travel-ideas/culture/udeng` },
        { label: name('Endek woven cloth', 'Kain endek', 'エンデック織物'), source: `${travel}/us/en/travel-ideas/culture/tenun-endek/` },
      ],
      food: [
        { label: name('Sate lilit', 'Sate lilit', 'サテ・リリット'), image: 'bali-food-lilit', source: `${travel}/gb/en/travel-ideas/gastronomy/sate-lilit-balis-uniquely-flavorful-satay` },
        { label: name('Nasi jinggo', 'Nasi jinggo', 'ナシ・ジンゴ'), source: `${travel}/us-en/travel-ideas/gastronomy/year-end-tropical-bills-discover-buleleng-bali-hidden-northern-gem` },
      ],
      art: [
        { label: name('Legong dance', 'Tari Legong', 'レゴン舞踊'), image: 'bali-art-legong', source: `${travel}/gb/en/travel-ideas/culture/legong-dance-the-exquisite-classical-dance-of-bali` },
        { label: name('Barong dance', 'Tari Barong', 'バロン舞踊'), source: `${travel}/id/id/travel-ideas/culture/barong` },
      ],
    },
  },
};
