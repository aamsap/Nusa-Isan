import { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import ProvinceMap from './ProvinceMap';
import { cultures, cultureByCode, selectionFor, type Culture, type Language, type Region } from './content';
import { initialLanguage, languages, regionsLocalized, t } from './i18n';
import { culturalTerm } from './culturalTranslations';
import { storyExtras } from './storyExtras';
import { groupByProvince, sectionKinds, storyGroups, storyImages, type SectionKind, type StoryGroup } from './stories';
import mediaRecords from './media.json';
import videoRecords from './videos.json';
import './styles.css';

type Media = typeof mediaRecords[number];
const mediaById = Object.fromEntries(mediaRecords.map(item => [item.id, item])) as Record<string, Media>;
const usedImageCount = new Set(storyGroups.flatMap(group => storyImages(group).map(image => image.id))).size;
const regions = [...new Set(cultures.map(item => item.region))];
function BookMark({ color = '#8ed462' }: { color?: string }) {
  return <span className="icon-dot" style={{backgroundColor: color}} aria-hidden="true" />;
}
function PaperIslands() {
  return <svg className="hero-art" viewBox="0 0 390 260" fill="none" aria-hidden="true">
    <circle className="hero-sun" cx="300" cy="70" r="49" fill="#f5e211"/><path d="M24 142c30-51 69-56 102-20 23 25 41 27 67 8 32-24 58-16 77 8 22 27 59 30 100 9v65H24z" fill="#8ed462" stroke="#2c2e2a" strokeWidth="3" strokeLinejoin="round"/>
    <path d="M67 161c-17-32-22-70 4-80 24-9 39 15 31 36 23-12 36 2 28 21-8 23-43 31-63 23z" fill="#ff705d" stroke="#2c2e2a" strokeWidth="3"/>
    <path d="M279 175c-7-35 6-75 32-76 25-1 34 23 22 42 24-8 34 10 22 27-15 20-48 22-76 7z" fill="#2ba0ff" stroke="#2c2e2a" strokeWidth="3"/>
    <path d="M34 202c34-6 52-5 88 0m37 8c43-8 73-8 112-3m33 4c21-4 39-4 57 0" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round"/>
    <path d="M183 133l24 46 33-46z" fill="#fff" stroke="#2c2e2a" strokeWidth="3"/><path d="M210 132V79" stroke="#2c2e2a" strokeWidth="3"/><path d="M212 84l29 43h-29z" fill="#f5e211" stroke="#2c2e2a" strokeWidth="3"/><path d="M177 185h72l-12 12h-51z" fill="#2c2e2a"/>
    <path className="hero-spark" d="M128 88l10-10m128 21 9-15M48 53l18 8" stroke="#2c2e2a" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}

function Credit({ image, language }: { image: Media; language: Language }) {
  const copy = t(language);
  return <p className="image-credit"><a href={image.source} target="_blank" rel="noreferrer">{copy.originalImage}: {image.title}</a><span> {copy.imageCredit}: {image.artist} · </span><a href={image.licenseUrl} target="_blank" rel="noreferrer">{image.license}</a><span> · {copy.imageChange}</span></p>;
}
function GroupStory({ group, language }: { group: StoryGroup; language: Language }) {
  const copy = t(language);
  const merged = group.provinces.length > 1;
  const tag = (code: string) => merged ? <span className="item-province">{cultureByCode[code]?.province}</span> : null;
  const titles: Record<SectionKind, string> = {clothing: copy.clothing, food: copy.food, art: copy.art};
  const markers: Record<SectionKind, string> = {clothing: '#8ed462', food: '#ff705d', art: '#2ba0ff'};
  return <article className="province-story">
    <div className="story-heading"><span className="story-province-tag">{merged ? copy.mergedTag : copy.province}</span><h3>{group.provinces.map(code => cultureByCode[code]?.province).join(' · ')}</h3><p>{group.provinces.map(code => culturalTerm(cultureByCode[code], 'community', language)).join(' · ')}</p></div>
    {sectionKinds.map(kind => <section className="item-section" key={kind}>
      <div className="item-section-head"><span className="detail-marker" style={{backgroundColor: markers[kind]}} aria-hidden="true"/><h4>{titles[kind]}</h4></div>
      <ol className="item-grid">{group.sections[kind].map((item, index) => <li className="item-card" key={`${item.province}-${item.name.en}`} style={{'--i': index} as React.CSSProperties}>
        {item.image ? <figure className="item-photo"><img loading="lazy" src={item.image.path} alt={item.name[language]} /><figcaption className="image-credit"><a href={item.image.source} target="_blank" rel="noreferrer">{copy.originalImage} ↗</a><span> · {item.image.artist}</span><span> · {item.image.licenseUrl ? <a href={item.image.licenseUrl} target="_blank" rel="noreferrer">{item.image.license}</a> : copy.licenseUnverified}</span><span> · {copy.imageChange}</span></figcaption></figure>
          : <div className="item-photo item-photo-empty" aria-hidden="true"><span>{['✳', '✶', '✦'][index % 3]}</span></div>}
        <div className="item-text">{tag(item.province)}<strong>{item.name[language]}</strong><p>{item.note[language]}</p><div className="item-links"><a className="item-source" href={item.source} target="_blank" rel="noreferrer">{copy.source} ↗</a>{item.image && <a className="item-photo-source" href={item.image.source} target="_blank" rel="noreferrer">{copy.photoSource} ↗</a>}</div></div>
      </li>)}</ol>
    </section>)}
    <section className="fact-block"><span className="section-kicker">{copy.fact}</span><ol className="facts-list">{group.facts.map(fact => <li key={fact.text.en}>{tag(fact.province)}<p>{fact.text[language]}</p><a href={fact.source} target="_blank" rel="noreferrer">{copy.source} ↗</a></li>)}</ol></section>
    <section className="place-block"><span className="section-kicker">{copy.landmark}</span><div className="landmark-list" data-count={group.landmarks.length}>
      {group.landmarks.map(item => <div className="landmark-item" key={item.video}>
        <div className="place-heading"><div>{tag(item.province)}<h4>{item.name[language]}</h4></div><span className="place-mark" aria-hidden="true">▶</span></div>
        <div className="video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${item.video}?rel=0`} title={`${item.name[language]} · ${item.videoTitle}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
        <a className="video-credit" href={`https://www.youtube.com/watch?v=${item.video}`} target="_blank" rel="noreferrer">{copy.videoBy}: {item.videoTitle} · {item.videoAuthor} ↗</a>
      </div>)}
    </div></section>
  </article>;
}
function ProvinceStory({ culture, language }: { culture: Culture; language: Language }) {
  const copy = t(language);
  const videos = videoRecords as Record<string, {title:string;author:string;source:string}>;
  const extras = storyExtras[culture.code];
  const landmarks = [{label: culturalTerm(culture, 'landmark', language), video: culture.video}, ...(extras?.landmarks ?? []).map(item => ({label: item.label[language], video: item.video}))];
  const category = culture.image?.includes('food') ? 'food' : culture.image?.match(/dance|art/) ? 'art' : 'clothing';
  const details: {key: SectionKind; title: string; value: string; marker: string}[] = [
    {key:'clothing',title:copy.clothing,value:culturalTerm(culture, 'clothing', language),marker:'#8ed462'},
    {key:'food',title:copy.food,value:culture.food,marker:'#ff705d'},
    {key:'art',title:copy.art,value:culturalTerm(culture, 'art', language),marker:'#2ba0ff'}
  ];
  const mediaSlots: {id: string; kind: SectionKind}[] = [];
  if (culture.image) mediaSlots.push({id: culture.image, kind: category});
  for (const section of details) {
    const primaryImage = extras?.primaryImages?.[section.key];
    if (primaryImage) mediaSlots.push({id: primaryImage, kind: section.key});
    for (const example of extras?.additional?.[section.key] ?? []) if (example.image) mediaSlots.push({id: example.image, kind: section.key});
  }
  const gallery = mediaSlots.filter((slot, index) => mediaSlots.findIndex(other => other.id === slot.id) === index && mediaById[slot.id]);
  return <article className="province-story">
    <div className="story-heading"><span className="story-province-tag">{copy.province}</span><h3>{culture.province}</h3><p>{copy.community} {culturalTerm(culture, 'community', language)}</p></div>
    {gallery.length > 0 && <div className="story-gallery" data-count={Math.min(gallery.length, 3)} aria-label={copy.gallery}>
      {gallery.map(slot => { const image = mediaById[slot.id]; return <figure className="gallery-photo" key={slot.id}><img loading="lazy" src={image.path} alt={image.title.replace(/\.[^.]+$/, '').replaceAll('_',' ')} /><figcaption><span className="gallery-topic">{details.find(item => item.key === slot.kind)?.title}</span><Credit image={image} language={language}/></figcaption></figure>; })}
    </div>}
    <div className="story-grid">
      {details.map(section => <section className="detail-card" key={section.key}>
        <span className="detail-marker" style={{backgroundColor:section.marker}} aria-hidden="true"/><h4>{section.title}</h4>
        <ul className="examples"><li><strong>{section.value}</strong></li>{(extras?.additional?.[section.key] ?? []).map(example => <li key={example.label.en}><strong>{example.label[language]}</strong><a className="example-source" href={example.source} target="_blank" rel="noreferrer" title={copy.reference} aria-label={`${copy.reference}: ${example.label[language]}`}>↗</a></li>)}</ul>
      </section>)}
    </div>
    <section className="fact-block"><span className="section-kicker">{copy.fact}</span><ol className="facts-list"><li><p>{culture.fact[language]}</p></li>{(extras?.facts ?? []).map(item => <li key={item.label.en}><p>{item.label[language]}</p><a href={item.source} target="_blank" rel="noreferrer" aria-label={`${copy.reference}: ${item.label[language]}`}>{copy.reference} ↗</a></li>)}</ol></section>
    <section className="place-block"><span className="section-kicker">{copy.landmark}</span><div className="landmark-list" data-count={Math.min(landmarks.length, 3)}>
      {landmarks.map(item => { const video = item.video ? videos[item.video] : null; return <div className="landmark-item" key={item.video ?? item.label}>
        <div className="place-heading"><h4>{item.label}</h4><span className="place-mark" aria-hidden="true">▶</span></div>
        {video ? <div className="video-wrap"><iframe src={`https://www.youtube-nocookie.com/embed/${item.video}?rel=0`} title={`${item.label} · ${video.title}`} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
        : <div className="video-pending"><p>{copy.videoFallback}</p><a target="_blank" rel="noreferrer" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.label + ' Indonesia')}`}>{copy.moreVideo} <span aria-hidden="true">↗</span></a></div>}
        {video && <a className="video-credit" href={video.source} target="_blank" rel="noreferrer">{copy.videoBy}: {video.title} · {video.author} ↗</a>}
      </div>; })}
    </div></section>
    <a className="story-source" href={culture.source} target="_blank" rel="noreferrer">{copy.reference} ↗</a>
  </article>;
}
function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | 'all'>('all');
  const [query, setQuery] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const mapCard = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const copy = t(language);
  const selectedGroup = selectedCode ? groupByProvince[selectedCode] : undefined;
  const selected = selectedCode ? selectionFor(selectedCode).map(code => cultureByCode[code]).filter(Boolean) : [];
  const visible = useMemo(() => cultures.filter(item => (region === 'all' || item.region === region) && `${item.province} ${item.community}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [region, query]);
  const changeLanguage = (value: Language) => { setLanguage(value); try { localStorage.setItem('culture-atlas-language', value); } catch { /* storage may be disabled */ } };
  const openStory = (code: string) => { origin.current = document.activeElement as HTMLElement; setSelectedCode(code); };
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (selectedCode && !node.open) {
      node.showModal();
      closeButton.current?.focus();
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(node, {opacity: 0, y: 22, scale: .98}, {opacity: 1, y: 0, scale: 1, duration: .48, ease: 'power3.out'});
    } else if (!selectedCode && node.open) node.close();
    return () => { gsap.killTweensOf(node); };
  }, [selectedCode]);
  useEffect(() => {
    const sync = () => setIsFullscreen(document.fullscreenElement === mapCard.current);
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);
  useEffect(() => {
    if (!hero.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const context = gsap.context(() => {
      gsap.from(['.hero-intro', '.hero h1', '.hero-cta'], {y: 26, opacity: 0, duration: .8, ease: 'power3.out', stagger: .13});
      gsap.from('.hero-art', {y: 35, opacity: 0, rotation: -6, duration: 1, delay: .2, ease: 'back.out(1.3)'});
    }, hero);
    return () => context.revert();
  }, []);
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement === mapCard.current) await document.exitFullscreen();
      else if (mapCard.current?.requestFullscreen) await mapCard.current.requestFullscreen();
      else throw new Error('Fullscreen API unavailable');
      setFullscreenError(false);
    } catch { setFullscreenError(true); }
  };
  useEffect(() => { document.documentElement.lang = language; document.title = `${copy.brand} · Indonesia`; }, [language, copy.brand]);
  const closeStory = () => { dialog.current?.close(); setSelectedCode(null); origin.current?.focus(); };
  return <>
    <div className="site-shell">
      <header className="nav-shell"><nav className="top-nav" aria-label="Primary navigation"><a className="brand" href="#top"><span className="brand-icon">✳</span><span>{copy.brand}</span></a><div className="nav-actions"><a href="#atlas" className="nav-link">{copy.explore}</a><a href="#about" className="nav-link about-link">{copy.about}</a><label className="language-selector"><span className="sr-only">{copy.language}</span><span aria-hidden="true">◎</span><select value={language} onChange={event => changeLanguage(event.target.value as Language)} aria-label={copy.language}>{languages.map(option => <option value={option.code} key={option.code}>{option.name}</option>)}</select></label></div></nav></header>
      <main id="top">
        <section className="hero" ref={hero}><div className="hero-copy"><p className="hero-intro">{copy.intro}</p><h1>{copy.headline}</h1><a className="hero-cta" href="#atlas">{copy.start}<BookMark color="#2ba0ff" /></a></div><PaperIslands /></section>
        <section className="atlas-section" id="atlas"><div className="atlas-head"><div><p className="eyebrow"><span className="eyebrow-line"/>{copy.provinces} · {copy.regions}</p><h2>{copy.mapTitle}</h2><p>{copy.mapHint}</p></div><div className="compass" aria-hidden="true"><span>N</span><i>✳</i></div></div>
          <div className="map-card" ref={mapCard}>
            <div className="map-topline"><div className="map-watermark">INDONESIA <span>✳</span> NUSANTARA</div><div className="map-controls"><a className="map-tool map-creator" href="https://github.com/aamsap" target="_blank" rel="noreferrer" aria-label={copy.creator} title={copy.creator}><img src="/assets/icons/github.svg" alt="" /></a><button type="button" className="map-tool fullscreen-tool" onClick={toggleFullscreen} aria-label={isFullscreen ? copy.exitFullscreen : copy.fullscreen} title={isFullscreen ? copy.exitFullscreen : copy.fullscreen} aria-pressed={isFullscreen}><span aria-hidden="true">{isFullscreen ? '⤡' : '⛶'}</span><span className="fullscreen-label">{isFullscreen ? copy.exitFullscreen : copy.fullscreen}</span></button></div></div>
            <div className="map-decor" aria-hidden="true"><span className="sea-flower">✳</span><span className="sea-sun">✶</span><span className="sea-wave wave-one">〰</span><span className="sea-wave wave-two">〰</span><span className="sea-dots">✦ ✦ ✦</span></div>
            <ProvinceMap onSelect={openStory} onHover={setHoveredCode} selectedHover={hoveredCode} loadingText={copy.mapLoading} errorText={copy.mapError} />
            <div className="map-bottom"><span className="map-instruction"><BookMark /> {copy.mapHint}</span><span className="map-scale">95° E <span>· · · · · · · · · · · · ·</span> 141° E</span></div>{fullscreenError && <p className="fullscreen-error" role="alert">{copy.fullscreenError}</p>}
          </div>
          <div className="browse-head"><div><h3>{copy.search}</h3><p>{copy.disclaimer}</p></div><div className="browse-input"><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.search}/><span aria-hidden="true">⌕</span></div></div>
          <div className="region-tabs" role="group" aria-label={copy.area}><button type="button" className={region==='all' ? 'active' : ''} onClick={() => setRegion('all')}>{copy.all}</button>{regions.map(item => <button type="button" key={item} className={region===item ? 'active' : ''} onClick={() => setRegion(item)}>{regionsLocalized[language][item]}</button>)}</div>
          <div className="province-list">{visible.map(item => <button type="button" className="province-button" key={item.code} onClick={() => openStory(item.code)}><span className="province-color" aria-hidden="true"/><span>{item.province}</span>{selectionFor(item.code).length > 1 && <span className="linked-icon" title={copy.mergedTag} aria-label={copy.mergedTag}>⤴</span>}<span className="province-arrow" aria-hidden="true">↗</span></button>)}{visible.length===0 && <p className="no-results">{copy.noResults}</p>}</div>
        </section>
      </main>
    </div>
    <footer id="about"><div className="footer-inner"><div><span className="footer-asterisk">✳</span><h2>{copy.footerTitle}</h2><p>{copy.footerText}</p></div><div className="footer-details"><details><summary>{copy.sources}</summary><p>{copy.mapCredit} <a href="https://github.com/ahsa29/kpu-osm-boundaries-2026/blob/main/DATA_LICENSE.md" target="_blank" rel="noreferrer">ODbL / data source ↗</a></p><p><a href="https://ich.unesco.org/en/state/indonesia-ID" target="_blank" rel="noreferrer">UNESCO heritage of Indonesia ↗</a></p><p>{copy.photoCount.replace('{n}', String(usedImageCount))}</p><p>Selected location videos are embedded from YouTube and credited at their source.</p></details><a className="footer-creator" href="https://github.com/aamsap" target="_blank" rel="noreferrer"><img src="/assets/icons/github.svg" alt="" />{copy.creator} ↗</a><span>© {new Date().getFullYear()} {copy.brand}</span></div></div></footer>
    <dialog className="story-dialog" ref={dialog} onClose={() => {setSelectedCode(null); origin.current?.focus();}} onClick={event => {if (event.target === dialog.current) closeStory();}} aria-label={selected.map(item => item.province).join(' & ')}><div className="dialog-body"><div className="dialog-top"><span className="dialog-brand"><BookMark /> {copy.brand}</span><div className="dialog-controls"><label className="dialog-language"><span className="sr-only">{copy.language}</span><select value={language} onChange={event => changeLanguage(event.target.value as Language)} aria-label={copy.language}>{languages.map(option => <option value={option.code} key={option.code}>{option.name}</option>)}</select></label><button type="button" ref={closeButton} className="dialog-close" onClick={closeStory} aria-label={copy.close}>× <span>{copy.close}</span></button></div></div><div className="dialog-intro"><span className="section-kicker">{selected.length>1 ? copy.mergedTag : copy.area + ' · ' + regionsLocalized[language][selected[0]?.region ?? 'Sumatra']}</span><h2>{selected.map(item => item.province).join(' & ')}</h2>{selected.length>1 && <p>{copy.mergedNote}</p>}</div>{selectedGroup ? <GroupStory group={selectedGroup} language={language}/> : selected.map(item => <ProvinceStory culture={item} language={language} key={item.code}/>)}</div></dialog>
  </>;
}

createRoot(document.getElementById('root')!).render(<App />);
