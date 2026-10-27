import type { Language } from './content';

// Display names per language; Indonesian keeps the official name used as the modal title.
const names: Record<string, { en: string; ja: string }> = {
  ID_AC: { en: 'Aceh', ja: 'アチェ州' },
  ID_SU: { en: 'North Sumatra', ja: '北スマトラ州' },
  ID_SB: { en: 'West Sumatra', ja: '西スマトラ州' },
  ID_RI: { en: 'Riau', ja: 'リアウ州' },
  ID_KR: { en: 'Riau Islands', ja: 'リアウ諸島州' },
  ID_JA: { en: 'Jambi', ja: 'ジャンビ州' },
  ID_SS: { en: 'South Sumatra', ja: '南スマトラ州' },
  ID_BE: { en: 'Bengkulu', ja: 'ブンクル州' },
  ID_BB: { en: 'Bangka Belitung Islands', ja: 'バンカ・ブリトゥン諸島州' },
  ID_LA: { en: 'Lampung', ja: 'ランプン州' },
  ID_BT: { en: 'Banten', ja: 'バンテン州' },
  ID_JK: { en: 'Special Capital Region of Jakarta', ja: 'ジャカルタ特別州' },
  ID_JB: { en: 'West Java', ja: '西ジャワ州' },
  ID_JT: { en: 'Central Java', ja: '中部ジャワ州' },
  ID_YO: { en: 'Special Region of Yogyakarta', ja: 'ジョグジャカルタ特別州' },
  ID_JI: { en: 'East Java', ja: '東ジャワ州' },
  ID_BA: { en: 'Bali', ja: 'バリ州' },
  ID_NB: { en: 'West Nusa Tenggara', ja: '西ヌサトゥンガラ州' },
  ID_NT: { en: 'East Nusa Tenggara', ja: '東ヌサトゥンガラ州' },
  ID_KB: { en: 'West Kalimantan', ja: '西カリマンタン州' },
  ID_KT: { en: 'Central Kalimantan', ja: '中部カリマンタン州' },
  ID_KS: { en: 'South Kalimantan', ja: '南カリマンタン州' },
  ID_KI: { en: 'East Kalimantan', ja: '東カリマンタン州' },
  ID_KU: { en: 'North Kalimantan', ja: '北カリマンタン州' },
  ID_SA: { en: 'North Sulawesi', ja: '北スラウェシ州' },
  ID_GO: { en: 'Gorontalo', ja: 'ゴロンタロ州' },
  ID_ST: { en: 'Central Sulawesi', ja: '中部スラウェシ州' },
  ID_SR: { en: 'West Sulawesi', ja: '西スラウェシ州' },
  ID_SN: { en: 'South Sulawesi', ja: '南スラウェシ州' },
  ID_SG: { en: 'Southeast Sulawesi', ja: '東南スラウェシ州' },
  ID_MA: { en: 'Maluku', ja: 'マルク州' },
  ID_MU: { en: 'North Maluku', ja: '北マルク州' },
  ID_PA: { en: 'Papua', ja: 'パプア州' },
  ID_PB: { en: 'West Papua', ja: '西パプア州' },
  ID_PD: { en: 'Southwest Papua', ja: '南西パプア州' },
  ID_PT: { en: 'Central Papua', ja: '中部パプア州' },
  ID_PE: { en: 'Highland Papua', ja: '山岳パプア州' },
  ID_PS: { en: 'South Papua', ja: '南パプア州' },
};

/** Translated province name, or null when it would just repeat the original title. */
export function translatedProvince(code: string, original: string, language: Language): string | null {
  if (language === 'id') return null;
  const value = names[code]?.[language];
  return value && value.toLocaleLowerCase() !== original.toLocaleLowerCase() ? value : null;
}
