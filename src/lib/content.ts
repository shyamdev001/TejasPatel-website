import fs from 'node:fs';
import path from 'node:path';
import siteJson from '@/content/site.json';
import cmsJson from '@/content/cms.json';

export type Lang = 'en' | 'gu';
export const LANGS: Lang[] = ['en', 'gu'];
export const isLang = (v: string): v is Lang => v === 'en' || v === 'gu';

/* eslint-disable @typescript-eslint/no-explicit-any */
const site = siteJson as any;
const cms = cmsJson as any;

// Snapshot data keeps the live site's own shapes; pages pick what they need.
export const pick = (key: string, lang: Lang) => site[key][lang];
export const detail = (slug: string, lang: Lang) => site.details[slug]?.[lang];
export const DETAIL_SLUGS = Object.keys(site.details);

export const img = (p?: string | null) => (p ? encodeURI(p) : '');
const exists = (p?: string | null) => !!p && fs.existsSync(path.join(process.cwd(), 'public', p));

const ENTITIES: Record<string, string> = { amp: '&', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”' };
export const stripTags = (s?: string) =>
  String(s ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&(\w+);/g, (m, n) => ENTITIES[n] ?? m)
    .replace(/\s+/g, ' ')
    .trim();

export type Project = { slug: string; title: string; text: string; img: string };
export const projects = (lang: Lang): Project[] =>
  site.projects[lang].section2.project.map((p: any) => ({
    slug: String(p.url).replace(/^\.?\//, ''),
    title: stripTags(p.title),
    text: stripTags(p.text).replace(/^\(/, ''),
    img: img(p.img),
  }));

export type Article = { id: number; year: string; image: string; title: string; body: string };
const articles = (key: string, lang: Lang): Article[] =>
  cms[key]
    .filter((a: any) => exists(a.image))
    .map((a: any) => ({ id: a.id, year: a.year, image: a.image, title: a.title[lang] || a.title.en, body: a.body[lang] || a.body.en }));

export const press = (lang: Lang) => ({
  news: articles('news', lang),
  editorials: articles('editorials', lang),
  pressMedia: articles('pressMedia', lang),
  activity: articles('activity', lang),
  videos: cms.videos as { id: number; year: string; url: string; title: string }[],
});

export const homeGallery = (lang: Lang): { image: string; title: string }[] =>
  cms.homeGallery.filter((g: any) => exists(g.image)).map((g: any) => ({ image: g.image, title: g.title[lang] || g.title.en }));

export const gallery = (): { year: string; total: number; images: string[] }[] =>
  cms.gallery.map((g: any) => ({ ...g, images: g.images.filter((i: string) => exists(i)) })).filter((g: any) => g.images.length);

// Award photographs ship as "Award N.<hash>.png" in the live bundle, in list order.
let awardFiles: Record<number, string> | null = null;
export const awardImage = (index: number) => {
  if (!awardFiles) {
    awardFiles = {};
    const dir = path.join(process.cwd(), 'public', 'static', 'media');
    for (const f of fs.readdirSync(dir)) {
      const m = f.match(/^Award (\d+)\./);
      if (m) awardFiles[Number(m[1])] = img('/static/media/' + f);
    }
  }
  return awardFiles[index + 1] ?? '';
};
